import { https } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import { google } from "googleapis";
import { initializeApp } from "firebase-admin/app";
import cors from "cors";

initializeApp();

const CLIENT_ID = defineSecret("GMAIL_CLIENT_ID");
const CLIENT_SECRET = defineSecret("GMAIL_CLIENT_SECRET");
const REFRESH_TOKEN = defineSecret("GMAIL_REFRESH_TOKEN");
const SENDER_EMAIL = "your-email@gmail.com";

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

export const sendReceipt = https.onRequest(
  { region: "asia-southeast1", secrets: [CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN], timeoutSeconds: 60 },
  async (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== "POST") return res.status(405).send({ success: false, error: "Only POST allowed" });

      const { to, subject, html } = req.body;
      if (!to || !subject || !html) return res.status(400).send({ success: false, error: "Missing parameters" });

      try {
        const clientId = await CLIENT_ID.value();
        const clientSecret = await CLIENT_SECRET.value();
        const refreshToken = await REFRESH_TOKEN.value();

        const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
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

        await gmail.users.messages.send({ userId: "me", requestBody: { raw: encodedMessage } });

        res.status(200).send({ success: true });
      } catch (error) {
        console.error("Gmail API error:", error);
        res.status(500).send({ success: false, error });
      }
    });
  }
);
