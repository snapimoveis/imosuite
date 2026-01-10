import React, { useEffect, useState, useCallback } from 'react';
import { LeadService } from '../../services/leadService';
import { useAuth } from '../../contexts/AuthContext';
import { Lead } from '../../types';
import { Mail, Phone, MessageSquare, Clock, Loader2, User } from 'lucide-react';
import { formatDate } from '../../lib/utils';

const AdminLeads: React.FC = () => {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLeads = useCallback(async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    try {
      const data = await LeadService.getLeads(profile.tenantId);
      setLeads(data);
    } catch (err) {
      console.error("Erro ao carregar leads:", err);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.tenantId]);

  useEffect(() => { 
    loadLeads(); 
  }, [loadLeads]);

  const handleRead = async (id: string) => {
    if (!profile?.tenantId) return;
    try {
      // Functional UI update first for perceived speed
      setLeads(prev => prev.map(l => l.id === id ? { ...l, lido: true, estado: 'em_analise' } : l));
      await LeadService.markAsRead(profile.tenantId, id);
      // Formal sync with backend
      await loadLeads();
    } catch (err) {
      console.error("Erro ao atualizar lead:", err);
      loadLeads(); // Revert on failure
    }
  };

  return (
    <div className="space-y-8 font-brand animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Gestão de Leads</h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Acompanhe as suas oportunidades de negócio</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-slate-200" size={40} /></div>
        ) : leads.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border border-dashed border-slate-200">
             <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
             <p className="font-black text-slate-300 uppercase text-xs tracking-widest">Ainda não recebeu contactos no seu portal.</p>
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className={`bg-white p-8 rounded-[2.5rem] border transition-all hover:shadow-lg flex flex-col md:flex-row justify-between gap-6 ${!lead.lido ? 'border-l-4 border-l-blue-500 border-slate-100' : 'border-slate-100 opacity-80'}`}>
              <div className="flex gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${!lead.lido ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                  <User size={24} />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-black text-[#1c2d51] text-lg">{lead.nome}</h3>
                    {!lead.lido && <span className="bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Novo</span>}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Mail size={14}/> {lead.email}</span>
                    {lead.telefone && <span className="flex items-center gap-1"><Phone size={14}/> {lead.telefone}</span>}
                    <span className="flex items-center gap-1"><Clock size={14}/> {formatDate(lead.created_at)}</span>
                  </div>
                  <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl italic mt-2">
                    {lead.property_ref && <span className="block mb-2 font-black text-[9px] uppercase text-blue-500">Ref Imóvel: {lead.property_ref}</span>}
                    "{lead.mensagem}"
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end gap-4 shrink-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Tipo: {lead.tipo}</div>
                <button 
                  onClick={() => handleRead(lead.id)}
                  disabled={lead.lido}
                  className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${!lead.lido ? 'bg-[#1c2d51] text-white shadow-xl shadow-slate-900/10 hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-default'}`}
                >
                  {lead.lido ? 'Lido & Respondido' : 'Marcar como Lido'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLeads;