import { auth } from "../firebase/firebaseConfig";
import {
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";

export async function requireRecentPasswordAuth(getPassword: () => Promise<string>) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  // Check last login time
  const lastSignIn = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).getTime()
    : 0;

  const fifteenMinutes = 15 * 60 * 1000;
  const tooOld = Date.now() - lastSignIn > fifteenMinutes;

  if (!tooOld) return;

  if (!user.email) throw new Error("No email on account");

  const password = await getPassword(); // from a modal input
  const cred = EmailAuthProvider.credential(user.email, password);

  await reauthenticateWithCredential(user, cred);
}