// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjfJjZwLxqHg7zWKqHDgZpLdTKLWiUNTg",
  authDomain: "hotelmanagement-e654a.firebaseapp.com",
  projectId: "hotelmanagement-e654a",
  storageBucket: "hotelmanagement-e654a.firebasestorage.app",
  messagingSenderId: "596815169048",
  appId: "1:596815169048:web:f0d601a53af2f10dcde56d",
  measurementId: "G-DH4H3HQY01"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const functions = getFunctions(app);

export { app, db, auth, analytics, functions };