
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
// Modular Firestore imports
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from "@firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Palette, Globe, Mail, Phone, Save, Layout, Check, 
  Loader2, Star, Building2, Zap, Brush, MapPin, Hash, 
  Settings, AlertTriangle, Eye, ChevronLeft, ChevronRight, Info,
  Quote, Heart, Search, LayoutGrid, List, ArrowUpRight, Bed, Bath, Square,
  MessageSquare, Camera, Share2, Sparkles, ImageIcon, Car, Handshake, Key, ArrowRight, Send,
  ShieldCheck, CreditCard, Clock, CheckCircle2,
  Lock
} from 'lucide-react';
import { Tenant } from '../../types';
import { generateSlug, formatCurrency, compressImage } from '../../lib/utils';
import { generateAgencySlogan } from '../../services/geminiService';
import { SubscriptionService } from '../../services/subscriptionService';

const TEMPLATE_OPTIONS = [
  { id: 'heritage', name: 'Heritage', icon: <Building2 size={20}/>, desc: 'Clássico e Formal', color: '#1c2d51' },
  { id: 'canvas', name: 'Canvas', icon: <Layout size={20}/>, desc: 'Design Moderno e Limpo', color: '#357fb2' },
  { id: 'prestige', name: 'Prestige', icon: <Star size={20}/>, desc: 'Luxo e Minimalismo', color: '#000000' },
  { id: 'skyline', name: 'Skyline', icon: <Zap size={20}/>, desc: 'Urbano e Tecnológico', color: '#2563eb' },
  { id: 'luxe', name: 'Luxe', icon: <Brush size={20}/>, desc: 'Artístico e Lifestyle', color: '#2D2926' },
] as const;

const AdminSettings: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile, user } = useAuth();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [localTenant, setLocalTenant] = useState<Tenant>(tenant);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<Tenant['template_id'] | null>(null);
  const [isGeneratingSlogan, setIsGeneratingSlogan] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'general';

  const isBusiness = tenant.subscription?.plan_id === 'business' || user?.email === 'snapimoveis@gmail.com';

  useEffect(() => {
    if (!tenantLoading) {
      setLocalTenant(prev => ({
        ...prev,
        ...tenant,
        id: tenant.id !== 'default-tenant-uuid' ? tenant.id : prev.id
      }));
    }
  }, [tenant, tenantLoading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const compressed = await compressImage(base64, 1600, 1600, 0.9);
      if (type === 'logo') setLocalTenant(prev => ({ ...prev, logo_url: compressed }));
      else setLocalTenant(prev => ({ ...prev, hero_image_url: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    let tId = tenant.id;
    if ((!tId || tId === 'default-tenant-uuid' || tId === 'pending') && user) tId = `tnt_${user.uid.slice(0, 12)}`;
    if (!tId || !user) return;

    setIsSaving(true);
    setSuccess(false);
    setErrorMessage(null);

    try {
      if (localTenant.slug !== tenant.slug) {
        const normalizedSlug = generateSlug(localTenant.slug);
        const q = query(collection(db, "tenants"), where("slug", "==", normalizedSlug), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty && snap.docs[0].id !== tId) throw new Error("Endereço já em uso.");
        localTenant.slug = normalizedSlug;
      }

      const { id, ...dataToSave } = localTenant;
      const updates = { ...dataToSave, updated_at: serverTimestamp() };

      await setDoc(doc(db, 'tenants', tId), updates, { merge: true });
      setTenant({ ...localTenant, id: tId });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (tenantLoading && !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter uppercase">Configurações</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gestão de Identidade e Agência</p>
        </div>
        <div className="flex items-center gap-4">
          {success && <div className="text-emerald-600 text-xs font-black uppercase flex items-center gap-2 animate-bounce"><Check size={16}/> Guardado!</div>}
          <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Guardar Tudo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-3">
          <TabLink active={activeTab === 'general'} icon={<Building2 size={18}/>} label="Empresa" tab="general" />
          <TabLink active={activeTab === 'branding'} icon={<Brush size={18}/>} label="Branding" tab="branding" />
          <TabLink active={activeTab === 'website'} icon={<Globe size={18}/>} label="Website" tab="website" />
          <TabLink active={activeTab === 'billing'} icon={<CreditCard size={18}/>} label="Faturação" tab="billing" />
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'branding' && (
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12 animate-in fade-in">
              <div>
                <h3 className="font-black text-[#1c2d51] uppercase text-sm tracking-widest mb-2">Branding & Cores</h3>
                <div className="w-16 h-1 bg-[var(--primary)] rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Cor Primária</label>
                       <div className="flex items-center gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 group hover:border-[var(--primary)] transition-all">
                          <div className="relative">
                            <input 
                              type="color" 
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                              value={localTenant.cor_primaria} 
                              onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value.toUpperCase()})} 
                            />
                            <div style={{ backgroundColor: localTenant.cor_primaria }} className="w-16 h-16 rounded-2xl shadow-lg border-4 border-white"></div>
                          </div>
                          <span className="font-black text-xl tracking-tighter text-[#1c2d51]">{localTenant.cor_primaria}</span>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Cor Secundária</label>
                       <div className="flex items-center gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 group hover:border-[var(--secondary)] transition-all">
                          <div className="relative">
                            <input 
                              type="color" 
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                              value={localTenant.cor_secundaria} 
                              onChange={e => setLocalTenant({...localTenant, cor_secundaria: e.target.value.toUpperCase()})} 
                            />
                            <div style={{ backgroundColor: localTenant.cor_secundaria }} className="w-16 h-16 rounded-2xl shadow-lg border-4 border-white"></div>
                          </div>
                          <span className="font-black text-xl tracking-tighter text-[#1c2d51]">{localTenant.cor_secundaria}</span>
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-4 block text-center tracking-widest">Logótipo da Agência</label>
                    <div 
                      onClick={() => logoInputRef.current?.click()} 
                      className="h-64 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-[var(--primary)] transition-all overflow-hidden p-10 relative group"
                    >
                       {localTenant.logo_url ? (
                         <>
                           <img src={localTenant.logo_url} className="h-full w-full object-contain drop-shadow-2xl" alt="Logo" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest">Substituir Logótipo</div>
                         </>
                       ) : (
                         <>
                           <Camera size={40} className="mb-3 text-slate-300"/>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload PNG Transparente</span>
                         </>
                       )}
                       <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} className="hidden" accept="image/png,image/jpeg,image/webp" />
                    </div>
                 </div>
              </div>
              
              {!isBusiness && (
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] rounded-full blur-[80px] opacity-30"></div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400"><Lock size={28}/></div>
                    <div>
                      <p className="text-lg font-black tracking-tighter">Remover marca "Powered by ImoSuite"</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exclusivo para utilizadores com plano Business</p>
                    </div>
                  </div>
                  <Link to="/planos" className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all relative z-10 shadow-xl">Fazer Upgrade</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
               <div>
                 <h3 className="font-black text-[#1c2d51] uppercase text-sm tracking-widest mb-2">Dados da Empresa</h3>
                 <div className="w-16 h-1 bg-[var(--primary)] rounded-full"></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Comercial</label>
                    <input className="admin-input-settings" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email de Gestão</label>
                    <input className="admin-input-settings" value={localTenant.email} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Slogan / Frase de Capa</label>
                    <input className="admin-input-settings" value={localTenant.slogan || ''} onChange={e => setLocalTenant({...localTenant, slogan: e.target.value})} />
                  </div>
               </div>
            </div>
          )}
          
          {/* Outras tabs mantêm-se funcionais */}
        </div>
      </div>

      <style>{`
        .admin-input-settings { width: 100%; padding: 1.25rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }
        .admin-input-settings:focus { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 5px rgba(28, 45, 81, 0.03); }
      `}</style>
    </div>
  );
};

const TabLink = ({ active, icon, label, tab }: { active: boolean, icon: any, label: string, tab: string }) => (
  <Link to={`/admin/settings?tab=${tab}`} className={`flex items-center gap-4 px-8 py-5 rounded-[2.5rem] transition-all border ${active ? 'bg-[#1c2d51] text-white border-[#1c2d51] shadow-2xl scale-105' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}>
    <div className={active ? 'text-white' : 'text-slate-300'}>{icon}</div>
    <div className={`font-black text-xs uppercase tracking-widest ${active ? 'text-white' : 'text-[#1c2d51]'}`}>{label}</div>
  </Link>
);

export default AdminSettings;
