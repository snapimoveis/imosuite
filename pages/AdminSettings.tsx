import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { 
  Palette, Globe, Mail, Phone, Save, Layout, Check, 
  Loader2, Star, Building2, Zap, Brush, MapPin, Hash, 
  Settings, AlertTriangle, Eye, ChevronLeft, ChevronRight, Info,
  Quote, Heart, Search, LayoutGrid, List, ArrowUpRight, Camera, ArrowRight
} from 'lucide-react';
import { Tenant } from '../types';
import { formatCurrency, generateSlug } from '../lib/utils';
import { generateAgencySlogan } from '../services/geminiService';

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
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'general';

  useEffect(() => {
    if (!tenantLoading) {
      setLocalTenant(prev => ({
        ...prev,
        ...tenant,
        id: tenant.id !== 'default-tenant-uuid' ? tenant.id : prev.id
      }));
    }
  }, [tenant, tenantLoading]);

  const handleLogoClick = () => logoInputRef.current?.click();

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => setLocalTenant(prev => ({ ...prev, logo_url: reader.result as string }));
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
      const updates = {
        ...localTenant,
        id: tId,
        updated_at: serverTimestamp()
      };
      await setDoc(doc(db, 'tenants', tId), updates, { merge: true });
      setTenant({ ...localTenant, id: tId });
      
      const root = document.documentElement;
      root.style.setProperty('--primary', localTenant.cor_primaria);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Configuração</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{activeTab}</p>
        </div>
        <div className="flex items-center gap-4">
          {success && <div className="text-emerald-600 text-xs font-black uppercase flex items-center gap-2"><Check size={16}/> Guardado!</div>}
          <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl">
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Gravar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-2">
          <TabLink active={activeTab === 'general'} icon={<Building2 size={18}/>} label="Empresa" tab="general" />
          <TabLink active={activeTab === 'branding'} icon={<Brush size={18}/>} label="Branding" tab="branding" />
          <TabLink active={activeTab === 'website'} icon={<Globe size={18}/>} label="Website" tab="website" />
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4">Dados da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Comercial</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Público</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={localTenant.email} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} />
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4">Branding & Cores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cor Primária</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                          <input type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} />
                          <span className="font-black text-xs uppercase tracking-widest">{localTenant.cor_primaria}</span>
                       </div>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-4 block">Logótipo</label>
                    <div onClick={handleLogoClick} className="h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 relative group overflow-hidden p-4">
                       {localTenant.logo_url ? (
                         <img src={localTenant.logo_url} className="h-full object-contain" alt="Logo" />
                       ) : (
                         <Camera size={24} className="text-slate-300" />
                       )}
                       <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
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
            if (templateId) {
              setLocalTenant({ ...localTenant, template_id: templateId }); 
            }
            setPreviewingTemplate(null); 
          }} 
          tenantData={localTenant}
        />
      )}
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
  const template = TEMPLATE_OPTIONS.find(t => t.id === templateId);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><ChevronLeft size={16}/> Voltar</button>
        <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1">
           {['home', 'list', 'detail'].map(p => (
             <PageTab key={p} active={page === p} onClick={() => setPage(p)} label={p} />
           ))}
        </div>
        <button onClick={onSelect} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Usar este Template</button>
      </header>
      <div className="flex-1 overflow-y-auto bg-slate-100 p-8 sm:p-12 lg:p-20">
        <div className="max-w-[1440px] mx-auto min-h-full bg-white shadow-2xl rounded-[3rem] overflow-hidden">
          <PreviewEngine templateId={templateId} page={page} tenant={tenantData} />
        </div>
      </div>
    </div>
  );
};

const PageTab = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {label}
  </button>
);

const PreviewEngine = ({ templateId, tenant }: any) => {
  const dummyProps = [
    { id: 1, title: 'Apartamento T3 com Vista Mar', price: 385000, loc: 'Cascais', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
    { id: 2, title: 'Moradia V4 com Jardim', price: 750000, loc: 'Vila Nova de Gaia', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800' },
  ];

  if (templateId === 'heritage') return (
    <div className="font-brand text-slate-900">
       <nav className="h-20 border-b border-slate-100 px-10 flex items-center justify-between bg-white font-heritage italic">Heritage Agency</nav>
       <header className="py-24 px-10 text-center bg-slate-50 font-heritage italic">
          <h1 className="text-6xl font-black text-[#1c2d51] mb-4">Tradição & Confiança.</h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest">O seu próximo capítulo começa aqui.</p>
       </header>
       <main className="p-10 grid grid-cols-2 gap-10">
          {dummyProps.map(p => (
            <div key={p.id}>
               <div className="aspect-[4/5] bg-slate-200 rounded-[2.5rem] overflow-hidden mb-4 grayscale hover:grayscale-0 transition-all">
                  <img src={p.img} className="w-full h-full object-cover" alt={p.title} />
               </div>
               <h4 className="font-heritage italic text-xl font-black">{p.title}</h4>
               <p className="text-[#1c2d51] font-black">{formatCurrency(p.price)}</p>
            </div>
          ))}
       </main>
    </div>
  );

  return <div className="p-20 text-center font-black uppercase text-slate-300">Pré-visualização do Template {templateId}</div>;
};

export default AdminSettings;