
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Configuração robusta para evitar erros de stream (ERR_QUIC_PROTOCOL_ERROR)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Crucial para estabilidade em redes instáveis ou com bloqueio de QUIC
});

export const auth = getAuth(app);

export const initAnalytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
