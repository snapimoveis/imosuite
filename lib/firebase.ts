
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração obtida do console do Firebase
// Em produção, estes valores devem vir de variáveis de ambiente
const firebaseConfig = {
  apiKey: "AIzaSyAv_79arQMs-2v5RU2pzdaTvYHT4XJ5_lU",
  authDomain: "imosuite-350d6.firebaseapp.com",
  projectId: "imosuite-350d6",
  storageBucket: "imosuite-350d6.firebasestorage.app",
  messagingSenderId: "788478642020",
  appId: "1:788478642020:web:4ad28b0dc4fcd71f5c1c71",
};

// Singleton para evitar múltiplas inicializações em ambientes HMR (Hot Module Replacement)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicialização dos serviços
// Estas chamadas registram internamente os componentes no core do Firebase App
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
export default app;
