
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from "@firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Building2, Brush, Globe, CreditCard, Save, Loader2, Camera, Clock, ArrowRight, CheckCircle2
} from 'lucide-react';
import { Tenant } from '../../types';
import { compressImage } from '../../lib/utils';

const AdminSettings: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { user } = useAuth();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [localTenant, setLocalTenant] = useState<Tenant>(tenant);
  const [success, setSuccess] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'general';

  useEffect(() => {
    if (!tenantLoading) {
      setLocalTenant({ ...tenant });
    }
  }, [tenant, tenantLoading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string, 1200, 1200, 0.9);
      setLocalTenant(prev => ({ ...prev, logo_url: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user || !localTenant.id) return;
    setIsSaving(true);
    try {
      const { id, ...dataToSave } = localTenant;
      await setDoc(doc(db, 'tenants', localTenant.id), { ...dataToSave, updated_at: serverTimestamp() }, { merge: true });
      setTenant({ ...localTenant });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'AGÊNCIA', icon: <Building2 size={16}/> },
    { id: 'branding', label: 'MARCA', icon: <Brush size={16}/> },
    { id: 'website', label: 'WEBSITE', icon: <Globe size={16}/> },
    { id: 'billing', label: 'FATURAÇÃO', icon: <CreditCard size={16}/> },
  ];

  if (tenantLoading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" /></div>;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Configurações</h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em]">Gestão da Identidade da sua Imobiliária</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl hover:opacity-90 transition-all">
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
          {success ? 'Guardado' : 'Guardar Alterações'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs Simples na Esquerda */}
        <aside className="lg:w-60 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0">
            {tabs.map(tab => (
              <Link 
                key={tab.id}
                to={`/admin/settings?tab=${tab.id}`}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-[#1c2d51] text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-[#1c2d51]'
                }`}
              >
                {tab.icon} {tab.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content Area - Cartão Branco Limpo */}
        <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm min-h-[500px]">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h3 className="text-sm font-black text-[#1c2d51] uppercase tracking-widest border-b border-slate-50 pb-4">Dados Principais</h3>
              <div className="grid gap-8 max-w-2xl">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nome Comercial</label>
                  <input className="admin-input-refined" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Slogan da Agência</label>
                  <input className="admin-input-refined" value={localTenant.slogan || ''} onChange={e => setLocalTenant({...localTenant, slogan: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <h3 className="text-sm font-black text-[#1c2d51] uppercase tracking-widest border-b border-slate-50 pb-4">Identidade Visual</h3>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Cor de Branding (Primária)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <input type="color" className="w-10 h-10 border-none bg-transparent cursor-pointer rounded-lg" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} />
                      <span className="font-mono font-black text-xs uppercase text-[#1c2d51]">{localTenant.cor_primaria}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Logótipo da Empresa</label>
                  <div onClick={() => logoInputRef.current?.click()} className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all p-6 overflow-hidden relative group">
                    {localTenant.logo_url ? (
                      <>
                        <img src={localTenant.logo_url} className="h-full object-contain" alt="Logo" />
                        <div className="absolute inset-0 bg-[#1c2d51]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest">Alterar Imagem</div>
                      </>
                    ) : <Camera className="text-slate-300" size={32} />}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h3 className="text-sm font-black text-[#1c2d51] uppercase tracking-widest">Gestão de Conta</h3>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5"><CheckCircle2 size={12}/> Plano Ativo</span>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Plano Escolhido</p>
                  <p className="text-2xl font-black text-[#1c2d51] uppercase tracking-tight">{localTenant.subscription?.plan_id || 'Starter'}</p>
                </div>
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ciclo de Faturação</p>
                  <p className="text-2xl font-black text-[#1c2d51] flex items-center gap-2 tracking-tight"><Clock size={20}/> Mensal</p>
                </div>
              </div>
              <div className="pt-6">
                <Link to="/planos" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">
                  Alterar o meu Plano <ArrowRight size={14}/>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .admin-input-refined { 
          width: 100%; 
          padding: 1.15rem 1.4rem; 
          background: #F8F9FB; 
          border: 1px solid #E6E9EF; 
          border-radius: 1.25rem; 
          outline: none; 
          font-weight: 800; 
          color: #1c2d51; 
          transition: all 0.2s;
          font-size: 0.9rem;
        }
        .admin-input-refined:focus { 
          border-color: #1c2d51; 
          background: #fff; 
          box-shadow: 0 10px 20px -10px rgba(28, 45, 81, 0.1); 
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;
