
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, writeBatch, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Imovel, ImovelMedia } from "../types";

/**
 * Limpa o objeto para o Firestore, tratando Timestamps e removendo undefined.
 */
const cleanForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (obj instanceof Timestamp || obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(item => cleanForFirestore(item));
  if (typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) cleaned[key] = cleanForFirestore(value);
    });
    return cleaned;
  }
  return obj;
};

export const PropertyService = {
  async getProperties(tenantId: string): Promise<Imovel[]> {
    if (!tenantId || tenantId === 'pending') return [];
    try {
      const propertiesRef = collection(db, "tenants", tenantId, "properties");
      const snapshot = await getDocs(propertiesRef);
      return snapshot.docs.map(propertyDoc => ({ 
        id: propertyDoc.id, 
        ...(propertyDoc.data() as any) 
      } as Imovel));
    } catch (error) {
      console.error("Erro ao listar:", error);
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
    if (!tenantId || tenantId === 'pending') throw new Error("Tenant não identificado");
    
    const propertiesRef = collection(db, "tenants", tenantId, "properties");
    
    // Preparar dados de criação
    const { id, ...dataToSave } = propertyData;
    const finalData = cleanForFirestore({
      ...dataToSave,
      tenant_id: tenantId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      tracking: { views: 0, favorites: 0 }
    });

    const docRef = await addDoc(propertiesRef, finalData);

    if (mediaItems.length > 0) {
      const mediaColRef = collection(db, "tenants", tenantId, "properties", docRef.id, "media");
      const batch = writeBatch(db);
      mediaItems.forEach((item, index) => {
        const newMediaRef = doc(mediaColRef);
        const { id: _, ...mD } = item;
        batch.set(newMediaRef, cleanForFirestore({ ...mD, order: index, created_at: serverTimestamp() }));
      });
      await batch.commit();
      await updateDoc(docRef, { "media.total": mediaItems.length, "media.cover_media_id": mediaItems[0].id || "auto" });
    }
    return docRef;
  },

  async updateProperty(tenantId: string, propertyId: string, updates: Partial<Imovel>, mediaItems?: ImovelMedia[]) {
    if (!tenantId || !propertyId) return;
    
    const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
    
    // REMOVER campos que causam erro de permissão em updates
    const { id, tenant_id, created_at, owner_uid, tracking, ...allowedUpdates } = updates as any;
    
    const cleanUpdates = cleanForFirestore({
      ...allowedUpdates,
      updated_at: serverTimestamp()
    });

    await updateDoc(propertyRef, cleanUpdates);

    if (mediaItems) {
      const mediaColRef = collection(db, "tenants", tenantId, "properties", propertyId, "media");
      const existingMedia = await getDocs(mediaColRef);
      const batch = writeBatch(db);
      
      existingMedia.docs.forEach(d => batch.delete(d.ref));
      
      mediaItems.forEach((item, index) => {
        const newMediaRef = doc(mediaColRef);
        const { id: _, created_at: __, ...mD } = item;
        batch.set(newMediaRef, cleanForFirestore({ ...mD, order: index, created_at: item.created_at || serverTimestamp() }));
      });
      
      await batch.commit();
      await updateDoc(propertyRef, { 
        "media.total": mediaItems.length,
        "media.cover_media_id": mediaItems.find(m => m.is_cover)?.id || (mediaItems[0]?.id || null)
      });
    }
  },

  async deleteProperty(tenantId: string, propertyId: string) {
    const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
    return await deleteDoc(propertyRef);
  }
};
