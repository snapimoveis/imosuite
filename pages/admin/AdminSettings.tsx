
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Palette, Globe, Mail, Phone, Save, Upload, Layout, Check, Loader2, Star, Building2, Zap, Brush } from 'lucide-react';

const TEMPLATE_OPTIONS = [
  { id: 'heritage', name: 'Heritage', icon: <Building2 size={20}/>, desc: 'Clássico e Formal' },
  { id: 'canvas', name: 'Canvas', icon: <Layout size={20}/>, desc: 'Clean e Moderno' },
  { id: 'prestige', name: 'Prestige', icon: <Star size={20}/>, desc: 'Luxo e Minimalismo' },
  { id: 'skyline', name: 'Skyline', icon: <Zap size={20}/>, desc: 'Urbano e Tecnológico' },
  { id: 'luxe', name: 'Luxe', icon: <Brush size={20}/>, desc: 'Artístico e Lifestyle' },
];

const AdminSettings: React.FC = () => {
  const { tenant, setTenant } = useTenant();
  const { profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [localTenant, setLocalTenant] = useState(tenant);

  // Sincroniza o estado local quando o tenant do contexto muda (ex: após carregar do Firebase)
  useEffect(() => {
    setLocalTenant(tenant);
  }, [tenant]);

  const handleSave = async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending') {
      return; // Prevenção silenciosa se ainda estiver a carregar
    }

    setIsSaving(true);
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
      alert("Configurações guardadas com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao guardar definições.");
    } finally {
      setIsSaving(false);
    }
  };

  if (profile?.tenantId === 'pending') {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-xs font-black uppercase tracking-widest">A carregar definições...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 font-brand">
      <div>
        <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Configurações do Portal</h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Personalize a sua identidade digital</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Templates Selector */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest mb-8 flex items-center gap-2">
              <Layout size={18} className="text-blue-500" /> Selecionar Template Ativo
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEMPLATE_OPTIONS.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setLocalTenant({ ...localTenant, template_id: tmpl.id } as any)}
                  className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all text-left ${
                    (localTenant as any).template_id === tmpl.id 
                    ? 'border-[#1c2d51] bg-slate-50 shadow-inner' 
                    : 'border-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    (localTenant as any).template_id === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {tmpl.icon}
                  </div>
                  <div>
                    <div className="font-black text-sm text-[#1c2d51]">{tmpl.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{tmpl.desc}</div>
                  </div>
                  {(localTenant as any).template_id === tmpl.id && (
                    <div className="ml-auto text-emerald-500"><Check size={20} /></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
             <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest mb-8">Dados da Agência</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Nome Comercial</label>
                  <input type="text" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Email Público</label>
                  <input type="email" value={localTenant.email} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar: Brand & Colors */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
             <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest mb-8">Cores da Marca</h3>
             <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: localTenant.cor_primaria }}></div>
                      <span className="text-xs font-black uppercase">{localTenant.cor_primaria}</span>
                   </div>
                   <input type="color" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} className="w-8 h-8 opacity-0 absolute cursor-pointer" />
                   <button className="text-[10px] font-black uppercase text-blue-500">Mudar</button>
                </div>
             </div>
          </div>

          <div className="bg-[#1c2d51] p-8 rounded-[3rem] text-white shadow-xl shadow-slate-900/20">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">Ações do Sistema</p>
             <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full bg-white text-[#1c2d51] py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
             >
                {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Guardar Tudo</>}
             </button>
             <a 
              href={`#/agencia/${tenant.slug}`} 
              target="_blank" 
              className="w-full mt-4 border border-white/20 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-white/5 transition-all"
             >
                <Globe size={20} /> Ver Portal Público
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
