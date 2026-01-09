
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, writeBatch, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Imovel, ImovelMedia } from "../types";

const prepareForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (obj instanceof Timestamp || obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(item => prepareForFirestore(item));
  if (typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) cleaned[key] = prepareForFirestore(value);
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
      // Fix: Cast propertyDoc.data() to any to resolve spread type error
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
      // Fix: Cast d.data() to any to resolve spread type error
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
      const { id, ...dataToSave } = propertyData as any;
      const finalData = prepareForFirestore({
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
          const { id: _, ...mediaData } = item;
          batch.set(newMediaRef, prepareForFirestore({ ...mediaData, order: index, created_at: serverTimestamp() }));
        });
        await batch.commit();
        await updateDoc(docRef, { "media.total": mediaItems.length, "media.cover_media_id": mediaItems[0].id });
      }
      return docRef;
    } catch (error: any) {
      throw error;
    }
  },

  async updateProperty(tenantId: string, propertyId: string, updates: Partial<Imovel>, mediaItems?: ImovelMedia[]) {
    if (!tenantId || !propertyId) return;
    try {
      const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
      const { id, created_at, tenant_id, owner_uid, tracking, ...cleanUpdates } = updates as any;
      
      await updateDoc(propertyRef, prepareForFirestore({ ...cleanUpdates, updated_at: serverTimestamp() }));

      if (mediaItems) {
        const mediaColRef = collection(db, "tenants", tenantId, "properties", propertyId, "media");
        const existingMedia = await getDocs(mediaColRef);
        const batch = writeBatch(db);
        existingMedia.docs.forEach(d => batch.delete(d.ref));
        mediaItems.forEach((item, index) => {
          const newMediaRef = doc(mediaColRef);
          const { id: _, created_at: __, ...mediaData } = item;
          batch.set(newMediaRef, prepareForFirestore({ ...mediaData, order: index, created_at: item.created_at || serverTimestamp() }));
        });
        await batch.commit();
        await updateDoc(propertyRef, { "media.total": mediaItems.length });
      }
    } catch (error: any) {
      throw error;
    }
  },

  async deleteProperty(tenantId: string, propertyId: string) {
    const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
    return await deleteDoc(propertyRef);
  }
};
