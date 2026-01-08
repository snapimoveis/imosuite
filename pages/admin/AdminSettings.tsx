
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Palette, Globe, Mail, Phone, Save, Upload, Layout, Check, Loader2, Star, Building2, Zap, Brush, AlertCircle } from 'lucide-react';

const TEMPLATE_OPTIONS = [
  { id: 'heritage', name: 'Heritage', icon: <Building2 size={20}/>, desc: 'Clássico e Formal' },
  { id: 'canvas', name: 'Canvas', icon: <Layout size={20}/>, desc: 'Clean e Moderno' },
  { id: 'prestige', name: 'Prestige', icon: <Star size={20}/>, desc: 'Luxo e Minimalismo' },
  { id: 'skyline', name: 'Skyline', icon: <Zap size={20}/>, desc: 'Urbano e Tecnológico' },
  { id: 'luxe', name: 'Luxe', icon: <Brush size={20}/>, desc: 'Artístico e Lifestyle' },
];

const AdminSettings: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [localTenant, setLocalTenant] = useState(tenant);
  const [success, setSuccess] = useState(false);

  // Sincroniza o estado local quando os dados reais chegam da base de dados
  useEffect(() => {
    if (!tenantLoading) {
      setLocalTenant(tenant);
    }
  }, [tenant, tenantLoading]);

  const handleSave = async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;

    setIsSaving(true);
    setSuccess(false);
    try {
      const tenantRef = doc(db, 'tenants', profile.tenantId);
      const updates = {
        nome: localTenant.nome,
        email: localTenant.email,
        telefone: localTenant.telefone || '',
        cor_primaria: localTenant.cor_primaria,
        template_id: (localTenant as any).template_id || 'heritage',
        updated_at: serverTimestamp()
      };
      
      await updateDoc(tenantRef, updates);
      setTenant({ ...tenant, ...updates });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Erro ao guardar definições.");
    } finally {
      setIsSaving(false);
    }
  };

  if (tenantLoading || profile?.tenantId === 'pending') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-300 font-brand">
        <Loader2 className="animate-spin mb-4 text-[#1c2d51]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">A carregar definições da agência...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 font-brand animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Configurações do Portal</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Personalize a sua identidade digital</p>
        </div>
        {success && (
          <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4">
            <Check size={16} strokeWidth={3} /> Guardado com sucesso
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm transition-all">
            <h3 className="font-black text-[#1c2d51] uppercase text-[10px] tracking-widest mb-10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><Layout size={16} /></div> 
              Design do Website
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEMPLATE_OPTIONS.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setLocalTenant({ ...localTenant, template_id: tmpl.id } as any)}
                  className={`flex items-start gap-4 p-6 rounded-3xl border-2 transition-all text-left group ${
                    (localTenant as any).template_id === tmpl.id 
                    ? 'border-[#1c2d51] bg-slate-50' 
                    : 'border-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    (localTenant as any).template_id === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}>
                    {tmpl.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-sm text-[#1c2d51]">{tmpl.name}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase mt-1 leading-relaxed">{tmpl.desc}</div>
                  </div>
                  {(localTenant as any).template_id === tmpl.id && (
                    <div className="text-emerald-500 animate-in zoom-in"><Check size={20} strokeWidth={3} /></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
             <h3 className="font-black text-[#1c2d51] uppercase text-[10px] tracking-widest mb-10">Informação Geral</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2">Nome Comercial</label>
                  <input type="text" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2">Email de Contacto</label>
                  <input type="email" value={localTenant.email} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/10 transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2">Telefone</label>
                  <input type="text" value={localTenant.telefone || ''} onChange={e => setLocalTenant({...localTenant, telefone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/10 transition-all" placeholder="+351 000 000 000" />
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
             <h3 className="font-black text-[#1c2d51] uppercase text-[10px] tracking-widest mb-10">Branding</h3>
             <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 ml-2">Cor Principal</label>
                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl shadow-lg border-2 border-white" style={{ backgroundColor: localTenant.cor_primaria }}></div>
                        <span className="text-xs font-black uppercase tracking-widest text-[#1c2d51]">{localTenant.cor_primaria}</span>
                     </div>
                     <div className="relative">
                        <input type="color" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} className="w-8 h-8 opacity-0 absolute inset-0 cursor-pointer z-10" />
                        <button className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-600 transition-colors">Alterar</button>
                     </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-[#1c2d51] p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8">Gestão de Sistema</p>
             <div className="space-y-4">
               <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full bg-white text-[#1c2d51] py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
               >
                  {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18} strokeWidth={3} /> Gravar Tudo</>}
               </button>
               <a 
                href={`#/agencia/${tenant.slug}`} 
                target="_blank" 
                className="w-full border border-white/20 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-white/5 transition-all"
               >
                  <Globe size={18} strokeWidth={3} /> Ver Website
               </a>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
