import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();

// Set max instances AND region for this function
const sendWelcomeEmailOpts = {
  maxInstances: 10,
  region: "asia-southeast1", 
};

export const sendWelcomeEmail = onCall(sendWelcomeEmailOpts, async (req) => {
  const { email } = req.data;
  if (!email) {
    throw new Error("Email is required");
  }

  logger.info("Sending welcome email to:", email);

  return { success: true, message: `Welcome email sent to ${email}` };
});
