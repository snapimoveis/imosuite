
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
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4">Branding & Cores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Cor Primária</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                          <input type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value.toUpperCase()})} />
                          <span className="font-black text-xs uppercase tracking-widest">{localTenant.cor_primaria}</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Cor Secundária</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                          <input type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer" value={localTenant.cor_secundaria} onChange={e => setLocalTenant({...localTenant, cor_secundaria: e.target.value.toUpperCase()})} />
                          <span className="font-black text-xs uppercase tracking-widest">{localTenant.cor_secundaria}</span>
                       </div>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-4 block">Logótipo da Agência</label>
                    <div onClick={() => logoInputRef.current?.click()} className="h-64 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 cursor-pointer hover:bg-slate-100 transition-all overflow-hidden p-6 relative group">
                       {localTenant.logo_url ? (
                         <>
                           <img src={localTenant.logo_url} className="h-full w-auto object-contain" alt="Logo" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase">Alterar Logótipo</div>
                         </>
                       ) : (
                         <>
                           <Camera size={32} className="mb-2"/>
                           <span className="text-[10px] font-black uppercase">Upload PNG/JPG</span>
                         </>
                       )}
                       <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} className="hidden" accept="image/png,image/jpeg,image/webp" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-3 text-center">Recomendamos logótipos em PNG transparente.</p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
               <div>
                 <h3 className="font-black text-[#1c2d51] uppercase text-sm tracking-widest mb-2">Dados da Empresa</h3>
                 <div className="w-16 h-1 bg-[#1c2d51] rounded-full"></div>
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
          
          {activeTab === 'website' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Catálogo de Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {TEMPLATE_OPTIONS.map((tmpl) => (
                  <div key={tmpl.id} className={`group relative p-8 rounded-[2.5rem] border-2 transition-all ${localTenant.template_id === tmpl.id ? 'border-[#1c2d51] bg-[#1c2d51]/5' : 'border-slate-50 hover:border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${localTenant.template_id === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-50 text-slate-400'}`}>{tmpl.icon}</div>
                       {localTenant.template_id === tmpl.id && <div className="bg-[#1c2d51] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase">Ativo</div>}
                    </div>
                    <h4 className="font-black text-lg text-[#1c2d51]">{tmpl.name}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">{tmpl.desc}</p>
                    <div className="flex gap-2">
                       <button onClick={() => setLocalTenant({ ...localTenant, template_id: tmpl.id })} className="flex-1 bg-[#1c2d51] text-white py-3 rounded-xl text-[10px] font-black uppercase">Selecionar</button>
                       <button onClick={() => setPreviewingTemplate(tmpl.id)} className="px-4 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1c2d51] transition-colors"><Eye size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {previewingTemplate && (
        <TemplatePreviewModal 
          templateId={previewingTemplate} 
          onClose={() => setPreviewingTemplate(null)} 
          onSelect={() => { 
            const templateId = previewingTemplate;
            if (templateId) setLocalTenant({ ...localTenant, template_id: templateId }); 
            setPreviewingTemplate(null); 
          }} 
          tenantData={localTenant}
        />
      )}

      <style>{`
        .admin-input-settings { width: 100%; padding: 1.25rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }
        .admin-input-settings:focus { background: #fff; border-color: #1c2d51; }
      `}</style>
    </div>
  );
};

const TabLink = ({ active, icon, label, tab }: { active: boolean, icon: any, label: string, tab: string }) => (
  <Link to={`/admin/settings?tab=${tab}`} className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all border ${active ? 'bg-[#1c2d51] text-white border-[#1c2d51] shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>
    <div className={active ? 'text-white' : 'text-slate-300'}>{icon}</div>
    <div className={`font-black text-[11px] uppercase tracking-tighter leading-none ${active ? 'text-white' : 'text-[#1c2d51]'}`}>{label}</div>
  </Link>
);

const TemplatePreviewModal = ({ templateId, onClose, onSelect, tenantData }: any) => {
  const [page, setPage] = useState('home');
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"><ChevronLeft size={16}/> Voltar</button>
        <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1">
           {['home', 'catalogo', 'detalhe'].map(p => (
             <button key={p} onClick={() => setPage(p)} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${page === p ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{p}</button>
           ))}
        </div>
        <button onClick={onSelect} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Aplicar Template</button>
      </header>
      <div className="flex-1 overflow-y-auto bg-slate-100 p-8 sm:p-12 lg:p-20">
        <div className="max-w-[1440px] mx-auto min-h-full bg-white shadow-2xl rounded-[3rem] overflow-hidden">
          <PreviewEngine templateId={templateId} page={page} tenant={tenantData} />
        </div>
      </div>
    </div>
  );
};

const PreviewEngine = ({ templateId, page, tenant }: any) => {
  const dummyProps = [
    { id: 1, title: 'Apartamento T3 com Vista Rio', price: 425000, loc: 'Lisboa', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800' },
    { id: 2, title: 'Moradia V4 com Piscina', price: 950000, loc: 'Cascais', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800' },
  ];

  return (
    <div className="min-h-screen bg-white">
       <nav className="h-24 px-10 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1c2d51] flex items-center justify-center text-white text-[10px] font-black">IS</div>
            <span className="font-black text-xl text-[#1c2d51]">{tenant.nome}</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Início</span>
            <span>Imóveis</span>
            <span>Contactos</span>
          </div>
       </nav>

       <main>
          {page === 'home' && (
            <>
              <header className="py-32 px-10 text-center bg-slate-50 relative overflow-hidden">
                 <div className="relative z-10">
                   <h1 className={`text-7xl font-black text-[#1c2d51] mb-6 ${templateId === 'prestige' ? 'italic' : ''}`}>{tenant.nome}</h1>
                   <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">{tenant.slogan || 'Encontre o seu próximo lar.'}</p>
                 </div>
              </header>
              <div className="p-20 grid grid-cols-2 gap-10">
                {dummyProps.map(p => (
                  <div key={p.id} className="group cursor-pointer">
                    <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden mb-6">
                      <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1c2d51]">{p.title}</h3>
                    <p className="text-[#357fb2] font-black text-lg">{formatCurrency(p.price)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {page !== 'home' && (
            <div className="p-20 flex flex-col items-center justify-center text-slate-300 space-y-4">
              <Loader2 className="animate-spin" />
              <p className="font-black text-xs uppercase tracking-widest">A renderizar visualização de {page}...</p>
            </div>
          )}
       </main>
    </div>
  );
};

export default AdminSettings;
