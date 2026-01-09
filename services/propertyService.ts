
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Imovel, ImovelMedia } from "../types";

// Função utilitária para garantir que não enviamos undefined para o Firestore
const cleanData = (obj: any): any => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined) {
      newObj[key] = null;
    } else if (newObj[key] !== null && typeof newObj[key] === 'object' && !(newObj[key] instanceof Date)) {
      newObj[key] = cleanData(newObj[key]);
    }
  });
  return newObj;
};

export const PropertyService = {
  async getProperties(tenantId: string): Promise<Imovel[]> {
    if (!tenantId || tenantId === 'pending' || tenantId === 'default') return [];
    try {
      const propertiesRef = collection(db, "tenants", tenantId, "properties");
      const snapshot = await getDocs(propertiesRef);
      return snapshot.docs.map(propertyDoc => ({ 
        id: propertyDoc.id, 
        ...propertyDoc.data() 
      } as Imovel));
    } catch (error) {
      console.error("Erro ao listar imóveis:", error);
      return [];
    }
  },

  async getPropertyMedia(tenantId: string, propertyId: string): Promise<ImovelMedia[]> {
    const mediaRef = collection(db, "tenants", tenantId, "properties", propertyId, "media");
    const snapshot = await getDocs(mediaRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ImovelMedia));
  },

  async createProperty(tenantId: string, propertyData: Partial<Imovel>, mediaItems: ImovelMedia[] = []) {
    if (!tenantId || tenantId === 'pending') {
      throw new Error("Agência não carregada.");
    }
    
    try {
      const propertiesRef = collection(db, "tenants", tenantId, "properties");
      
      const finalData = cleanData({
        ...propertyData,
        tenant_id: tenantId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        tracking: { views: 0, favorites: 0 }
      });

      const docRef = await addDoc(propertiesRef, finalData);

      if (mediaItems.length > 0) {
        const mediaColRef = collection(db, "tenants", tenantId, "properties", docRef.id, "media");
        for (const item of mediaItems) {
          await addDoc(mediaColRef, {
            ...item,
            created_at: serverTimestamp()
          });
        }
        
        await updateDoc(docRef, {
          "media.total": mediaItems.length,
          "media.cover_media_id": mediaItems.find(m => m.is_cover)?.id || null
        });
      }

      return docRef;
    } catch (error: any) {
      console.error("Erro Firestore ao criar imóvel:", error);
      throw error;
    }
  },

  async updateProperty(tenantId: string, propertyId: string, updates: Partial<Imovel>, mediaItems?: ImovelMedia[]) {
    const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
    
    // Remove ID and timestamps from updates to avoid overwriting
    const { id, created_at, ...cleanUpdates } = updates as any;
    
    await updateDoc(propertyRef, cleanData({
      ...cleanUpdates,
      updated_at: serverTimestamp()
    }));

    // Se houver media para atualizar, isto simplifica o processo (substitui/adiciona)
    if (mediaItems) {
       // Nota: Numa app real, faríamos diffing. Aqui apenas garantimos que o total e a capa estão certos.
       await updateDoc(propertyRef, {
        "media.total": mediaItems.length,
        "media.cover_media_id": mediaItems.find(m => m.is_cover)?.id || null
      });
    }
  },

  async deleteProperty(tenantId: string, propertyId: string) {
    const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
    return await deleteDoc(propertyRef);
  }
};
