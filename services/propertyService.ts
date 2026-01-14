import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, writeBatch, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Imovel, ImovelMedia } from "../types";
import { StorageService } from "./storageService";

const prepareData = (obj: any, isUpdate: boolean = false): any => {
  if (obj === null || obj === undefined) return null;
  if (obj instanceof Timestamp || obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(item => prepareData(item, isUpdate));
  if (typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      if (key === 'id' || key === 'items') return; 
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

    // 1. Criar o documento primeiro para ter o ID da propriedade
    const tempPropertyData = {
      ...propertyData,
      tipologia: propertyData.tipologia || propertyData.tipology || 'T0',
      tenant_id: tenantId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      tracking: { views: 0, favorites: 0 },
      caracteristicas: propertyData.caracteristicas || [],
      media: { total: mediaItems.length, cover_media_id: null, cover_url: null }
    };
    
    const docRef = await addDoc(propertiesRef, prepareData(tempPropertyData, false));
    const propertyId = docRef.id;

    // 2. Processar e fazer upload das imagens
    const processedMedia = await Promise.all(mediaItems.map(async (item, index) => {
      if (item.url.startsWith('data:image')) {
        const fileName = `${crypto.randomUUID()}.jpg`;
        const storagePath = `tenants/${tenantId}/properties/${propertyId}/photos/${fileName}`;
        const downloadUrl = await StorageService.uploadBase64(storagePath, item.url);
        return { ...item, url: downloadUrl, storage_path: storagePath, order: index };
      }
      return { ...item, order: index };
    }));

    const coverImage = processedMedia.find(m => m.is_cover) || processedMedia[0];

    // 3. Atualizar o documento principal com a capa correta
    await updateDoc(docRef, {
      "media.cover_media_id": coverImage?.id || null,
      "media.cover_url": coverImage?.url || null
    });

    // 4. Salvar subcoleção de media
    if (processedMedia.length > 0) {
      const mediaColRef = collection(db, "tenants", tenantId, "properties", propertyId, "media");
      const batch = writeBatch(db);
      processedMedia.forEach((item) => {
        const newMediaRef = doc(mediaColRef);
        const { id: mId, ...itemData } = item as any;
        batch.set(newMediaRef, prepareData({
          ...itemData,
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
    let finalMediaData = updates.media;

    if (mediaItems) {
      // Processar uploads das imagens novas (Base64)
      const processedMedia = await Promise.all(mediaItems.map(async (item, index) => {
        if (item.url.startsWith('data:image')) {
          const fileName = `${crypto.randomUUID()}.jpg`;
          const storagePath = `tenants/${tenantId}/properties/${propertyId}/photos/${fileName}`;
          const downloadUrl = await StorageService.uploadBase64(storagePath, item.url);
          return { ...item, url: downloadUrl, storage_path: storagePath, order: index };
        }
        return { ...item, order: index };
      }));

      const coverImage = processedMedia.find(m => m.is_cover) || processedMedia[0];
      
      finalMediaData = {
        cover_media_id: coverImage?.id || null,
        cover_url: coverImage?.url || null,
        total: processedMedia.length
      };

      // Atualizar subcoleção de media
      const mediaColRef = collection(db, "tenants", tenantId, "properties", propertyId, "media");
      const existingMedia = await getDocs(mediaColRef);
      const batch = writeBatch(db);
      existingMedia.docs.forEach(d => batch.delete(d.ref));
      processedMedia.forEach((item) => {
        const newMediaRef = doc(mediaColRef);
        const { id: mId, ...itemData } = item as any;
        batch.set(newMediaRef, prepareData({
          ...itemData,
          created_at: item.created_at || serverTimestamp()
        }));
      });
      await batch.commit();
    }
    
    const cleanUpdates = prepareData({
      ...updates,
      tipologia: updates.tipologia || updates.tipology || 'T0',
      media: finalMediaData
    }, true);
    
    await updateDoc(propertyRef, { ...cleanUpdates, updated_at: serverTimestamp() });
  },

  async deleteProperty(tenantId: string, propertyId: string) {
    if (!tenantId || !propertyId) return;
    return await deleteDoc(doc(db, "tenants", tenantId, "properties", propertyId));
  }
};