
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração obtida do console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSy...", // Placeholder - Substituir por chave real no console do Firebase
  authDomain: "imosuite-saas.firebaseapp.com",
  projectId: "imosuite-saas",
  storageBucket: "imosuite-saas.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Singleton para evitar múltiplas inicializações em ambientes HMR (Hot Module Replacement)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicialização dos serviços
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
export default app;
