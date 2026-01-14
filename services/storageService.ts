import { storage } from "../lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export const StorageService = {
  /**
   * Faz o upload de uma imagem Base64 para o Firebase Storage.
   * Lança erro se falhar para evitar que o Firestore guarde strings gigantes.
   */
  async uploadBase64(path: string, base64: string): Promise<string> {
    if (!base64 || !base64.startsWith('data:image')) {
      return base64;
    }
    
    try {
      const storageRef = ref(storage, path);
      // 'data_url' é o formato correto para strings que começam com "data:image/..."
      await uploadString(storageRef, base64, 'data_url');
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error: any) {
      console.error("ERRO CRÍTICO NO STORAGE:", error);
      
      if (error.code === 'storage/unauthorized') {
        throw new Error("PERMISSÃO NEGADA: Por favor, atualize as 'Rules' do Storage no Firebase Console para permitir escrita a utilizadores autenticados.");
      }
      
      throw error;
    }
  }
};