
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Using standard modular Firestore import from the official package
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAv_79arQMs-2v5RU2pzdaTvYHT4XJ5_lU",
  authDomain: "imosuite-350d6.firebaseapp.com",
  projectId: "imosuite-350d6",
  storageBucket: "imosuite-350d6.firebasestorage.app",
  messagingSenderId: "788478642020",
  appId: "1:788478642020:web:4ad28b0dc4fcd71f5c1c71"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Correct usage of getFirestore with the app instance for modular SDK
export const db = getFirestore(app);

export const auth = getAuth(app);
export default app;
