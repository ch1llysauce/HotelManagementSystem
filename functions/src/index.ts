import { https } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { onSchedule } from "firebase-functions/scheduler";
import { getFirestore, Timestamp as AdminTimestamp } from "firebase-admin/firestore";

initializeApp();

// Firebase secrets
const CLIENT_ID = defineSecret("GMAIL_CLIENT_ID");
const CLIENT_SECRET = defineSecret("GMAIL_CLIENT_SECRET");
const REFRESH_TOKEN = defineSecret("GMAIL_REFRESH_TOKEN");
const SENDER_EMAIL = "chillrigel05@gmail.com";
const firestore = getFirestore();

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
    secrets: [CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN],
    timeoutSeconds: 60,
    cors: true,
  },
  async (req, res): Promise<void> => {
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
      // Lazy-import googleapis inside the function
      const { google } = await import("googleapis");

      // Lazy-load secret values
      const clientId = (await CLIENT_ID.value()).trim();
      const clientSecret = (await CLIENT_SECRET.value()).trim();
      const refreshToken = (await REFRESH_TOKEN.value()).trim();

      console.log("clientId suffix:", clientId.slice(-32));
      console.log("clientSecret length:", clientSecret.length);

      const REDIRECT_URI = "https://developers.google.com/oauthplayground";

      const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
      oAuth2Client.setCredentials({ refresh_token: refreshToken });

      const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

      const message = [
        `From: "Hotel" <${SENDER_EMAIL}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        "Content-Type: text/html; charset=utf-8",
        "",
        html,
      ].join("\n");

      const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodedMessage },
      });

      res.status(200).send({ success: true });
    } catch (error) {
      console.error("Gmail API error:", error);
      res.status(500).send({ success: false, error });
    }
  }
);
