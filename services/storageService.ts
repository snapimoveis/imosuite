import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { base64ToBlob } from "../lib/utils";

export const StorageService = {
  /**
   * Faz o upload de uma imagem Base64 para o Firebase Storage e retorna a URL pública.
   * Se a string não for Base64 (ex: já for uma URL), retorna-a sem alteração.
   */
  async uploadBase64(path: string, base64: string): Promise<string> {
    if (!base64 || !base64.startsWith('data:image')) {
      return base64;
    }
    
    try {
      const blob = base64ToBlob(base64);
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Erro no upload para Storage:", error);
      return base64; // Fallback para manter funcionalidade se o storage falhar
    }
  }
};