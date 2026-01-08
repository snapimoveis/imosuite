
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Fix: Use firestore/lite to ensure modular exports are found in environments with type resolution issues
import { getFirestore } from "firebase/firestore/lite";
// Fix: Use standard analytics exports from the modular SDK
import { getAnalytics, isSupported } from "firebase/analytics";

// Configuração oficial do ImoSuite
const firebaseConfig = {
  apiKey: "AIzaSyAv_79arQMs-2v5RU2pzdaTvYHT4XJ5_lU",
  authDomain: "imosuite-350d6.firebaseapp.com",
  projectId: "imosuite-350d6",
  storageBucket: "imosuite-350d6.firebasestorage.app",
  messagingSenderId: "788478642020",
  appId: "1:788478642020:web:4ad28b0dc4fcd71f5c1c71",
  measurementId: "G-SG8GBG1NR5"
};

// Singleton para evitar múltiplas inicializações
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicialização dos serviços
const auth = getAuth(app);
const db = getFirestore(app);

// Inicialização de Analytics (opcional, apenas se suportado pelo browser)
let analytics: any = null;
isSupported().then(yes => {
  if (yes) analytics = getAnalytics(app);
});

export { app, auth, db, analytics };
export default app;
