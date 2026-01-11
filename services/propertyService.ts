
// Fix: Using @firebase/firestore to resolve missing modular exports
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, writeBatch, Timestamp } from "@firebase/firestore";
import { db } from "../lib/firebase";
import { Imovel, ImovelMedia } from "../types";

const prepareData = (obj: any, isUpdate: boolean = false): any => {
  if (obj === null || obj === undefined) return null;
  if (obj instanceof Timestamp || obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(item => prepareData(item, isUpdate));
  if (typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      if (key === 'id' || key === 'items') return; // IMPORTANTE: Não incluímos 'items' (fotos pesadas) no doc principal
      if (isUpdate && (key === 'tenant_id' || key === 'owner_uid' || key === 'created_at' || key === 'tracking')) return;
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = prepareData(value, isUpdate);
      }
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
      return snapshot.docs.map(propertyDoc => {
        const data = propertyDoc.data() as any;
        return { 
          id: propertyDoc.id, 
          ...data,
          caracteristicas: Array.isArray(data.caracteristicas) ? data.caracteristicas : []
        } as Imovel;
      });
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
    } catch (error) { return []; }
  },

  async createProperty(tenantId: string, propertyData: Partial<Imovel>, mediaItems: ImovelMedia[] = []) {
    if (!tenantId || tenantId === 'pending') throw new Error("Sessão expirada ou agência inválida.");
    
    const propertiesRef = collection(db, "tenants", tenantId, "properties");
    const coverImage = mediaItems.find(m => m.is_cover) || mediaItems[0];

    const finalData = prepareData({
      ...propertyData,
      tipologia: propertyData.tipologia || propertyData.tipology || 'T0',
      tenant_id: tenantId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      tracking: { views: 0, favorites: 0 },
      caracteristicas: propertyData.caracteristicas || [],
      media: {
        cover_media_id: coverImage?.id || null,
        cover_url: coverImage?.url || null, // Guardamos apenas o URL da capa para economia de espaço
        total: mediaItems.length
      }
    }, false);

    const docRef = await addDoc(propertiesRef, finalData);

    if (mediaItems.length > 0) {
      const mediaColRef = collection(db, "tenants", tenantId, "properties", docRef.id, "media");
      const batch = writeBatch(db);
      mediaItems.forEach((item, index) => {
        const newMediaRef = doc(mediaColRef);
        const { id: mId, ...itemData } = item as any;
        batch.set(newMediaRef, prepareData({
          ...itemData,
          order: index,
          created_at: serverTimestamp()
        }));
      });
      await batch.commit();
    }
    return docRef;
  },

  async updateProperty(tenantId: string, propertyId: string, updates: Partial<Imovel>, mediaItems?: ImovelMedia[]) {
    if (!tenantId || !propertyId) return;
    
    const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
    const coverImage = mediaItems?.find(m => m.is_cover) || mediaItems?.[0];
    
    const cleanUpdates = prepareData({
      ...updates,
      tipologia: updates.tipologia || updates.tipology || 'T0',
      ...(mediaItems && {
        media: {
          cover_media_id: coverImage?.id || null,
          cover_url: coverImage?.url || null,
          total: mediaItems.length
        }
      })
    }, true);
    
    await updateDoc(propertyRef, { ...cleanUpdates, updated_at: serverTimestamp() });

    if (mediaItems) {
      const mediaColRef = collection(db, "tenants", tenantId, "properties", propertyId, "media");
      const existingMedia = await getDocs(mediaColRef);
      const batch = writeBatch(db);
      existingMedia.docs.forEach(d => batch.delete(d.ref));
      mediaItems.forEach((item, index) => {
        const newMediaRef = doc(mediaColRef);
        const { id: mId, ...itemData } = item as any;
        batch.set(newMediaRef, prepareData({
          ...itemData,
          order: index,
          created_at: item.created_at || serverTimestamp()
        }));
      });
      await batch.commit();
    }
  },

  async deleteProperty(tenantId: string, propertyId: string) {
    if (!tenantId || !propertyId) return;
    return await deleteDoc(doc(db, "tenants", tenantId, "properties", propertyId));
  }
};
