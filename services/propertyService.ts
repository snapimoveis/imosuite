
import { collection, getDocs, addDoc, updateDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Imovel } from "../types";

const USE_MOCK = false; 

export const PropertyService = {
  async getProperties(tenantId: string): Promise<Imovel[]> {
    try {
      const propertiesRef = collection(db, "tenants", tenantId, "properties");
      const snapshot = await getDocs(propertiesRef);
      return snapshot.docs.map(propertyDoc => ({ 
        id: propertyDoc.id, 
        ...propertyDoc.data() 
      } as Imovel));
    } catch (error) {
      console.error("Firebase fetch error:", error);
      return [];
    }
  },

  async createProperty(tenantId: string, property: Partial<Imovel>) {
    const propertiesRef = collection(db, "tenants", tenantId, "properties");
    return await addDoc(propertiesRef, {
      ...property,
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
      visualizacoes: 0,
      publicado: property.publicado ?? true,
      destaque: property.destaque ?? false,
      estado: 'disponivel',
      media: property.media || []
    });
  },

  async updateProperty(tenantId: string, propertyId: string, updates: Partial<Imovel>) {
    const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
    return await updateDoc(propertyRef, updates);
  }
};
