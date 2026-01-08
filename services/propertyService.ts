
import { collection, getDocs, addDoc, updateDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Imovel } from "../types";

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

  async createProperty(tenantId: string, property: Partial<Imovel>) {
    // Validação crítica: Impedir gravação se o tenantId não estiver carregado
    if (!tenantId || tenantId === 'pending' || tenantId === 'default') {
      console.error("Tentativa de criar imóvel com ID inválido:", tenantId);
      throw new Error("O ID da sua agência ainda não foi carregado. Aguarde um momento.");
    }
    
    try {
      const propertiesRef = collection(db, "tenants", tenantId, "properties");
      const data = {
        ...property,
        tenant_id: tenantId,
        created_at: serverTimestamp(),
        visualizacoes: 0,
        publicado: property.publicado ?? true,
        destaque: property.destaque ?? false,
        estado: 'disponivel',
        media: property.media || [],
        caracteristicas: property.caracteristicas || [],
        garagem: property.garagem || 0,
        casas_banho: property.casas_banho || 0,
        quartos: property.quartos || 0,
        area_util_m2: property.area_util_m2 || 0,
        tipologia: property.tipologia || 'N/A',
        distrito: property.distrito || 'Lisboa'
      };
      return await addDoc(propertiesRef, data);
    } catch (error: any) {
      console.error("Erro Firestore ao criar imóvel:", error);
      throw error;
    }
  },

  async updateProperty(tenantId: string, propertyId: string, updates: Partial<Imovel>) {
    const propertyRef = doc(db, "tenants", tenantId, "properties", propertyId);
    return await updateDoc(propertyRef, updates);
  }
};
