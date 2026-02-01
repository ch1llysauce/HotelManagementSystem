// src/firebaseFunctions.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';

// Example: Send a welcome email via Cloud Function
export const sendWelcomeEmail = async (email: string) => {
  const sendEmail = httpsCallable(functions, 'sendWelcomeEmail');
  const result = await sendEmail({ email });
  return result.data;
};

// Example: Calculate something via Cloud Function
export const calculateSomething = async (input: { x: number; y: number }) => {
  const calculateFn = httpsCallable(functions, 'calculateSomething');
  const result = await calculateFn(input);
  return result.data;
};
