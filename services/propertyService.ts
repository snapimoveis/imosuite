
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Imovel } from "../types";
import { MOCK_IMOVEIS } from "../mocks";

const USE_MOCK = true; // Toggle para facilitar desenvolvimento inicial

export const PropertyService = {
  async getProperties(tenantId: string): Promise<Imovel[]> {
    if (USE_MOCK) return MOCK_IMOVEIS;

    try {
      const propertiesRef = collection(db, "tenants", tenantId, "properties");
      const snapshot = await getDocs(propertiesRef);
      // Alterado nome da variável no map para não colidir com o import 'doc'
      return snapshot.docs.map(propertyDoc => ({ id: propertyDoc.id, ...propertyDoc.data() } as Imovel));
    } catch (error) {
      console.error("Firebase fetch error:", error);
      return [];
    }
  },

  async createProperty(tenantId: string, property: Partial<Imovel>) {
    if (USE_MOCK) {
      console.log("Mock Create:", property);
      return { id: Math.random().toString() };
    }

    const propertiesRef = collection(db, "tenants", tenantId, "properties");
    return await addDoc(propertiesRef, {
      ...property,
      created_at: new Date().toISOString(),
      visualizacoes: 0
    });
  },

  async updateProperty(tenantId: string, propertyId: string, updates: Partial<Imovel>) {
    if (USE_MOCK) return console.log("Mock Update:", propertyId, updates);

    const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
    return await updateDoc(propertyRef, updates);
  }
};
