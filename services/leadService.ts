
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Lead } from "../types";

export const LeadService = {
  async getLeads(tenantId: string): Promise<Lead[]> {
    if (!tenantId || tenantId === 'pending') return [];
    try {
      const leadsRef = collection(db, "tenants", tenantId, "leads");
      const q = query(leadsRef, orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      // Fix: Cast d.data() to any to resolve spread type error
      return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Lead));
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
      return [];
    }
  },

  async createLead(tenantId: string, lead: Partial<Lead>) {
    const leadsRef = collection(db, "tenants", tenantId, "leads");
    return await addDoc(leadsRef, {
      ...lead,
      tenant_id: tenantId,
      estado: 'novo',
      lido: false,
      created_at: new Date().toISOString() // Fallback for simple sorting if needed
    });
  },

  async markAsRead(tenantId: string, leadId: string) {
    const leadRef = doc(db, "tenants", tenantId, "leads", leadId);
    return await updateDoc(leadRef, { lido: true, estado: 'em_analise' });
  }
};
