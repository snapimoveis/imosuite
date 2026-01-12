
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from "@firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Building2, Brush, Globe, CreditCard, Save, Loader2, Camera, CheckCircle2, Clock, ArrowRight
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
    { id: 'general', label: 'Agência', icon: <Building2 size={18}/> },
    { id: 'branding', label: 'Marca', icon: <Brush size={18}/> },
    { id: 'website', label: 'Website', icon: <Globe size={18}/> },
    { id: 'billing', label: 'Faturação', icon: <CreditCard size={18}/> },
  ];

  if (tenantLoading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" /></div>;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tight">Configurações</h1>
          <p className="text-slate-400 font-medium text-sm">Gira a identidade e faturação da sua agência</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:opacity-90 transition-all">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {success ? 'Guardado' : 'Guardar Alterações'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Tabs Simples */}
        <aside className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0">
            {tabs.map(tab => (
              <Link 
                key={tab.id}
                to={`/admin/settings?tab=${tab.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-[#1c2d51] text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                {tab.icon} {tab.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-100 shadow-sm min-h-[500px]">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-lg font-black text-[#1c2d51]">Dados Principais</h3>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Nome da Empresa</label>
                  <input className="admin-input-simple" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Slogan</label>
                  <input className="admin-input-simple" value={localTenant.slogan || ''} onChange={e => setLocalTenant({...localTenant, slogan: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-lg font-black text-[#1c2d51]">Visual</h3>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Cor Primária</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <input type="color" className="w-10 h-10 border-none bg-transparent cursor-pointer" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} />
                      <span className="font-mono font-bold text-sm uppercase">{localTenant.cor_primaria}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Logótipo</label>
                  <div onClick={() => logoInputRef.current?.click()} className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all p-6 overflow-hidden relative">
                    {localTenant.logo_url ? <img src={localTenant.logo_url} className="h-full object-contain" /> : <Camera className="text-slate-300" />}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex items-center justify-between border-b pb-6">
                <h3 className="text-lg font-black text-[#1c2d51]">A Minha Subscrição</h3>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Ativo</span>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Plano Atual</p>
                  <p className="text-2xl font-black text-[#1c2d51] uppercase">{localTenant.subscription?.plan_id || 'Starter'}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Faturação</p>
                  <p className="text-2xl font-black text-[#1c2d51] flex items-center gap-2"><Clock size={20}/> Mensal</p>
                </div>
              </div>
              <Link to="/planos" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                Alterar o meu plano atual <ArrowRight size={16}/>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .admin-input-simple { width: 100%; padding: 0.875rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; outline: none; font-weight: 600; color: #1c2d51; }
        .admin-input-simple:focus { border-color: #1c2d51; background: #fff; box-shadow: 0 0 0 4px rgba(28, 45, 81, 0.05); }
      `}</style>
    </div>
  );
};

export default AdminSettings;
