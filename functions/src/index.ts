import { https } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { onSchedule } from "firebase-functions/scheduler";
import { getFirestore, Timestamp as AdminTimestamp } from "firebase-admin/firestore";


import * as admin from "firebase-admin";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import sgMail from "@sendgrid/mail";

admin.initializeApp();

// Firebase secrets
const firestore = getFirestore();

function formatAnyDate(v: any): string {
  if (!v) return "";

  if (typeof v?.toDate === "function") {
    return v.toDate().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  // JS Date
  if (v instanceof Date) {
    return v.toISOString().slice(0, 10);
  }

  // already a string
  if (typeof v === "string") {
    return v;
  }

  return String(v);
}

export const sendCheckInEmail = onDocumentUpdated(
  {
    document: "guests/{guestId}",
    region: "asia-southeast1",
    secrets: ["SENDGRID_API_KEY"],
  },
  async (event) => {
    const before = event.data?.before.data() as any;
    const after = event.data?.after.data() as any;
    if (!before || !after) return;

    const wasCheckedIn = !!before.checkedIn;
    const isCheckedIn = !!after.checkedIn;

    if (wasCheckedIn || !isCheckedIn) return;
    if (after.checkInEmailSent === true) return;

    const email = after.email;
    if (!email) return;

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) return;

    sgMail.setApiKey(apiKey);

    const name = after.name ?? "Guest";
    const roomNumber = after.roomNumber ?? "TBA";
    const checkInDate = formatAnyDate(after.checkInDate);
    const checkOutDate = formatAnyDate(after.checkOutDate);

    await sgMail.send({
      to: email,
      from: "chillrigel05@gmail.com",
      subject: `Check-in confirmed! Room ${roomNumber}`,
      text: `Hi ${name}, your check-in is confirmed. Room: ${roomNumber}. ${checkInDate ? `Check-in: ${checkInDate}.` : ""} ${checkOutDate ? `Check-out: ${checkOutDate}.` : ""}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome, ${name}</h2>
          <p>Your check-in is confirmed.</p>
          <ul>
            <li><b>Room:</b> ${roomNumber}</li>
            ${checkInDate ? `<li><b>Check-in:</b> ${checkInDate}</li>` : ""}
            ${checkOutDate ? `<li><b>Check-out:</b> ${checkOutDate}</li>` : ""}
          </ul>
          <p>If you need anything, reply to this email.</p>
        </div>
      `,
    });

    // Mark sent (prevents duplicates even if function retries)
    await event.data!.after.ref.update({
      checkInEmailSent: true,
      checkInEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
);

export const sendCheckOutEmail = onDocumentUpdated(
  {
    document: "guests/{guestId}",
    region: "asia-southeast1",
    secrets: ["SENDGRID_API_KEY"],
  },
  async (event) => {
    const before = event.data?.before.data() as any;
    const after = event.data?.after.data() as any;
    if (!before || !after) return;

    // Transition: checkedOut false -> true
    const wasCheckedOut = !!before.checkedOut;
    const isCheckedOut = !!after.checkedOut;

    if (wasCheckedOut || !isCheckedOut) return;
    if (after.checkOutEmailSent === true) return;

    const email = after.email;
    if (!email) return;

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) return;

    sgMail.setApiKey(apiKey);

    const name = after.name ?? "Guest";
    const roomNumber = after.roomNumber ?? "TBA";
    const checkOutDate = after.checkOutDate ?? "";

    const extras = Number(after.extras ?? 0);
    const deposit = Number(after.deposit ?? 0);
    const balance = Number(after.balance ?? 0);

    await sgMail.send({
      to: email,
      from: "chillrigel05@gmail.com",
      subject: `Checked out. Thank you, ${name}!`,
      text: `Thanks for staying with us. Room: ${roomNumber}. ${checkOutDate ? `Check-out: ${checkOutDate}.` : ""} Extras: ${extras}. Deposit: ${deposit}. Balance: ${balance}.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Thank you, ${name}</h2>
          <p>You've successfully checked out.</p>
          <ul>
            <li><b>Room:</b> ${roomNumber}</li>
            ${checkOutDate ? `<li><b>Check-out:</b> ${checkOutDate}</li>` : ""}
            <li><b>Extras:</b> ${extras}</li>
            <li><b>Deposit:</b> ${deposit}</li>
            <li><b>Balance:</b> ${balance}</li>
          </ul>
          <p>We'd love to host you again!</p>
        </div>
      `,
    });

    await event.data!.after.ref.update({
      checkOutEmailSent: true,
      checkOutEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
);

export const markOverdueatNoon = onSchedule(
  {
    region: "asia-southeast1",
    schedule: "0 12 * * *", // every day at noon
    timeZone: "Asia/Manila",
  },
  async (event) => {
    const now = AdminTimestamp.now();
    console.log(`markOverdueatNoon triggered at ${now.toDate().toISOString()}`);

    const guestsRef = firestore.collection("guests");
    const snapshot = await guestsRef
      .where("status", "in", ["checked-in", "due-to-check-out"])
      .where("expectedCheckOut", "<=", now)
      .get();

    console.log(`Found ${snapshot.size} guests to mark as overdue for check-out.`);

    const batch = firestore.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { status: "overdue-check-out", overdueSince: now });
    });

    await batch.commit();
    console.log(`Marked ${snapshot.size} guests as overdue for check-out.`);
  }
);


export const sendReceipt = https.onRequest(
  {
    region: "asia-southeast1",
    secrets: ["SENDGRID_API_KEY"],
    timeoutSeconds: 60,
    cors: true,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send({ success: false, error: "Only POST allowed" });
      return;
    }

    const { to, subject, html } = req.body;
    if (!to || !subject || !html) {
      res.status(400).send({ success: false, error: "Missing parameters" });
      return;
    }

    try {
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey) throw new Error("Missing SendGrid key");

      sgMail.setApiKey(apiKey);

      await sgMail.send({
        to,
        from: "chillrigel05@gmail.com", // verified sender
        subject,
        html,
      });

      res.status(200).send({ success: true });
    } catch (error) {
      console.error("SendGrid error:", error);
      res.status(500).send({ success: false, error });
    }
  }
);
