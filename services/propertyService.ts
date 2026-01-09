
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, writeBatch, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Imovel, ImovelMedia } from "../types";

/**
 * Normaliza objetos para o Firestore, removendo campos ilegais (undefined)
 * e garantindo que tipos complexos sejam serializáveis.
 */
const prepareForFirestore = (obj: any, isUpdate: boolean = false): any => {
  if (obj === null || obj === undefined) return null;
  if (obj instanceof Timestamp || obj instanceof Date) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => prepareForFirestore(item, isUpdate));
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      // Campos que NUNCA devem ser enviados num update ou create como dados internos
      if (key === 'id') return;
      if (isUpdate && (key === 'tenant_id' || key === 'created_at' || key === 'owner_uid')) return;
      
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = prepareForFirestore(value, isUpdate);
      }
    });
    return cleaned;
  }
  
  return obj;
};

export const PropertyService = {
  async getProperties(tenantId: string): Promise<Imovel[]> {
    if (!tenantId || tenantId === 'pending' || tenantId === 'default') return [];
    try {
      const propertiesRef = collection(db, "tenants", tenantId, "properties");
      const snapshot = await getDocs(propertiesRef);
      return snapshot.docs.map(propertyDoc => ({ 
        id: propertyDoc.id, 
        ...(propertyDoc.data() as any) 
      } as Imovel));
    } catch (error) {
      console.error("Erro ao listar imóveis:", error);
      return [];
    }
  },

  async getPropertyMedia(tenantId: string, propertyId: string): Promise<ImovelMedia[]> {
    try {
      const mediaRef = collection(db, "tenants", tenantId, "properties", propertyId, "media");
      const snapshot = await getDocs(mediaRef);
      return snapshot.docs
        .map(d => ({ id: d.id, ...(d.data() as any) } as ImovelMedia))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      return [];
    }
  },

  async createProperty(tenantId: string, propertyData: Partial<Imovel>, mediaItems: ImovelMedia[] = []) {
    if (!tenantId || tenantId === 'pending') throw new Error("Agência não identificada.");
    try {
      const propertiesRef = collection(db, "tenants", tenantId, "properties");
      
      // Dados base
      const finalData = prepareForFirestore({
        ...propertyData,
        tenant_id: tenantId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        tracking: { views: 0, favorites: 0 }
      }, false);

      const docRef = await addDoc(propertiesRef, finalData);

      if (mediaItems.length > 0) {
        const mediaColRef = collection(db, "tenants", tenantId, "properties", docRef.id, "media");
        const batch = writeBatch(db);
        
        mediaItems.forEach((item, index) => {
          const newMediaRef = doc(mediaColRef);
          const mediaData = prepareForFirestore({
            ...item,
            order: index,
            created_at: serverTimestamp()
          }, false);
          batch.set(newMediaRef, mediaData);
        });
        
        await batch.commit();
        
        // Atualizar capa
        await updateDoc(docRef, { 
          "media.total": mediaItems.length, 
          "media.cover_media_id": mediaItems[0].id || "auto" 
        });
      }

      return docRef;
    } catch (error: any) {
      console.error("Erro na criação:", error);
      throw error;
    }
  },

  async updateProperty(tenantId: string, propertyId: string, updates: Partial<Imovel>, mediaItems?: ImovelMedia[]) {
    if (!tenantId || !propertyId) return;
    try {
      const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
      
      // Limpeza profunda para evitar erro de permissões
      const cleanUpdates = prepareForFirestore(updates, true);
      
      await updateDoc(propertyRef, {
        ...cleanUpdates,
        updated_at: serverTimestamp()
      });

      if (mediaItems) {
        const mediaColRef = collection(db, "tenants", tenantId, "properties", propertyId, "media");
        
        // Sincronizar media via Batch
        const existingMedia = await getDocs(mediaColRef);
        const batch = writeBatch(db);
        
        // 1. Remover antigas
        existingMedia.docs.forEach(d => batch.delete(d.ref));
        
        // 2. Gravar novas com nova ordem
        mediaItems.forEach((item, index) => {
          const newMediaRef = doc(mediaColRef);
          const mediaData = prepareForFirestore({
            ...item,
            order: index,
            created_at: item.created_at || serverTimestamp()
          }, false);
          batch.set(newMediaRef, mediaData);
        });

        await batch.commit();

        // 3. Atualizar total e capa no pai
        await updateDoc(propertyRef, { 
          "media.total": mediaItems.length,
          "media.cover_media_id": mediaItems.find(m => m.is_cover)?.id || (mediaItems[0]?.id || null)
        });
      }
    } catch (error: any) {
      console.error("Erro no updateProperty:", error);
      throw error;
    }
  },

  async deleteProperty(tenantId: string, propertyId: string) {
    const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
    return await deleteDoc(propertyRef);
  }
};
