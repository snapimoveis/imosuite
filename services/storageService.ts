import { storage } from "../lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export const StorageService = {
  /**
   * Faz o upload de uma imagem Base64 para o Firebase Storage usando o formato data_url.
   */
  async uploadBase64(path: string, base64: string): Promise<string> {
    if (!base64 || !base64.startsWith('data:image')) {
      return base64;
    }
    
    try {
      const storageRef = ref(storage, path);
      
      // uploadString com 'data_url' é o método recomendado para strings base64 que incluem o prefixo data:image/...
      await uploadString(storageRef, base64, 'data_url');
      
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error: any) {
      console.error("Erro no upload para Storage:", error);
      
      // Log específico para ajudar o utilizador a identificar problemas de configuração
      if (error.code === 'storage/unauthorized') {
        console.error("ERRO: Verifique as Regras de Segurança (Rules) do seu bucket no Firebase Console.");
      } else if (error.message?.includes('CORS')) {
        console.error("ERRO DE CORS: O seu bucket não permite uploads do domínio atual. Siga o Passo 2 abaixo.");
      }
      
      return base64; // Fallback para manter funcionalidade (Firestore guardará base64 se o storage falhar)
    }
  }
};