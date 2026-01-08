
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

// Singleton check to prevent multiple initializations
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Accessing components ensures they are registered to this specific 'app' instance
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize analytics optionally
let analytics: any = null;
isSupported().then(yes => {
  if (yes) {
    analytics = getAnalytics(app);
  }
}).catch(err => {
  console.debug("Firebase Analytics support check failed:", err);
});

export { app, auth, db, analytics };
export default app;
