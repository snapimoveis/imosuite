
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAv_79arQMs-2v5RU2pzdaTvYHT4XJ5_lU",
  authDomain: "imosuite-350d6.firebaseapp.com",
  projectId: "imosuite-350d6",
  storageBucket: "imosuite-350d6.firebasestorage.app",
  messagingSenderId: "788478642020",
  appId: "1:788478642020:web:4ad28b0dc4fcd71f5c1c71",
  measurementId: "G-SG8GBG1NR5"
};

// Use initializeApp, getApps, and getApp from firebase/app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use getAuth from firebase/auth
export const auth = getAuth(app);
// Use getFirestore from firebase/firestore
export const db = getFirestore(app);

// Use getAnalytics and isSupported from firebase/analytics
export const initAnalytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
