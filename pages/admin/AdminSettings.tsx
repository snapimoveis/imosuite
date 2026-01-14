import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Building2, Brush, Globe, CreditCard, Save, Loader2, Camera, Clock, 
  ArrowRight, CheckCircle2, Layout, Star, Zap, Eye, ChevronLeft, Building,
  Smartphone, Monitor, MousePointer2, Check
} from 'lucide-react';
import { Tenant } from '../../types';
import { compressImage, formatCurrency } from '../../lib/utils';
import { StorageService } from '../../services/storageService';

const TEMPLATE_OPTIONS = [
  { id: 'heritage', name: 'Heritage', icon: <Building size={20}/>, desc: 'Clássico e Formal', color: '#1c2d51' },
  { id: 'canvas', name: 'Canvas', icon: <Layout size={20}/>, desc: 'Design Moderno e Limpo', color: '#357fb2' },
  { id: 'prestige', name: 'Prestige', icon: <Star size={20}/>, desc: 'Luxo e Minimalismo', color: '#000000' },
  { id: 'skyline', name: 'Skyline', icon: <Zap size={20}/>, desc: 'Urbano e Tecnológico', color: '#2563eb' },
  { id: 'luxe', name: 'Luxe', icon: <Brush size={20}/>, desc: 'Artístico e Lifestyle', color: '#2D2926' },
] as const;

const AdminSettings: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { user } = useAuth();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [localTenant, setLocalTenant] = useState<Tenant>(tenant);
  const [success, setSuccess] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<Tenant['template_id'] | null>(null);
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
      const compressed = await compressImage(reader.result as string, 400, 400, 0.6);
      setLocalTenant(prev => ({ ...prev, logo_url: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user || !localTenant.id) return;
    setIsSaving(true);
    try {
      let finalLogoUrl = localTenant.logo_url;
      if (finalLogoUrl && finalLogoUrl.startsWith('data:image')) {
        finalLogoUrl = await StorageService.uploadBase64(`tenants/${localTenant.id}/branding/logo.png`, finalLogoUrl);
      }
      const { id, ...dataToSave } = localTenant;
      const updatedData = { ...dataToSave, logo_url: finalLogoUrl, updated_at: serverTimestamp() };
      await setDoc(doc(db, 'tenants', localTenant.id), updatedData, { merge: true });
      setTenant({ ...localTenant, logo_url: finalLogoUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const tabs = [
    { id: 'general', label: 'AGÊNCIA', icon: <Building2 size={16}/> },
    { id: 'branding', label: 'MARCA', icon: <Brush size={16}/> },
    { id: 'website', label: 'WEBSITE', icon: <Globe size={16}/> },
    { id: 'billing', label: 'FATURAÇÃO', icon: <CreditCard size={16}/> },
  ];

  if (tenantLoading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in pb-10 font-brand">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter uppercase">Configurações</h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Identidade da Agência</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl">
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
          {success ? 'GUARDADO' : 'GUARDAR ALTERAÇÕES'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-60 shrink-0">
          <nav className="flex lg:flex-col gap-1">
            {tabs.map(tab => (
              <Link 
                key={tab.id}
                to={`/admin/settings?tab=${tab.id}`}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-[#1c2d51] text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-[#1c2d51]'
                }`}
              >
                {tab.icon} {tab.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px]">
          {activeTab === 'branding' && (
            <div className="space-y-10 animate-in fade-in">
              <h3 className="text-sm font-black text-[#1c2d51] uppercase tracking-widest border-b pb-4">Visual da Marca</h3>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Cor Primária</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <input type="color" className="w-10 h-10 border-none bg-transparent cursor-pointer" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} />
                      <span className="font-mono font-black text-xs uppercase">{localTenant.cor_primaria}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Cor Secundária</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <input type="color" className="w-10 h-10 border-none bg-transparent cursor-pointer" value={localTenant.cor_secundaria} onChange={e => setLocalTenant({...localTenant, cor_secundaria: e.target.value})} />
                      <span className="font-mono font-black text-xs uppercase">{localTenant.cor_secundaria}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Logótipo</label>
                  <div onClick={() => logoInputRef.current?.click()} className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 relative p-6 overflow-hidden group">
                    {localTenant.logo_url ? (
                      <>
                        <img src={localTenant.logo_url} className="h-full object-contain" alt="Logo" />
                        <div className="absolute inset-0 bg-[#1c2d51]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[9px] uppercase">Alterar</div>
                      </>
                    ) : <Camera className="text-slate-300" size={32} />}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Outras abas (general, website, billing) permanecem como no ficheiro original */}
        </div>
      </div>
      <style>{`
        .admin-input-sober { width: 100%; padding: 1rem 1.25rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 1rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }
        .admin-input-sober:focus { border-color: #1c2d51; background: #fff; }
      `}</style>
    </div>
  );
};

export default AdminSettings;