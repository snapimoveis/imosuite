import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
// Modular Firestore imports
// Fix: Using @firebase/firestore to resolve missing exported members
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from "@firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Palette, Globe, Mail, Phone, Save, Layout, Check, 
  Loader2, Star, Building2, Zap, Brush, MapPin, Hash, 
  Settings, AlertTriangle, Eye, ChevronLeft, ChevronRight, Info,
  Quote, Heart, Search, LayoutGrid, List, ArrowUpRight, Bed, Bath, Square,
  MessageSquare, Camera, Share2, Sparkles, Image as ImageIcon, Car, Handshake, Key, ArrowRight
} from 'lucide-react';
import { Tenant } from '../../types';
import { generateSlug, formatCurrency, compressImage } from '../../lib/utils';
import { generateAgencySlogan } from '../../services/geminiService';

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
  const handleHeroClick = () => heroInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      // Comprimimos imagens para não exceder limite do Firestore
      const compressed = await compressImage(base64, 1200, 1200, 0.75);
      
      if (type === 'logo') {
        setLocalTenant(prev => ({ ...prev, logo_url: compressed }));
      } else {
        setLocalTenant(prev => ({ ...prev, hero_image_url: compressed }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSlogan = async () => {
    if (!localTenant.nome) return;
    setIsGeneratingSlogan(true);
    try {
      const slogan = await generateAgencySlogan(localTenant.nome);
      setLocalTenant(prev => ({ ...prev, slogan }));
    } finally {
      setIsGeneratingSlogan(false);
    }
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
        if (!snap.empty && snap.docs[0].id !== tId) {
          throw new Error("Este slug já está em uso por outra agência.");
        }
        localTenant.slug = normalizedSlug;
      }

      const { id, ...dataToSave } = localTenant;
      const updates = {
        ...dataToSave,
        updated_at: serverTimestamp()
      };

      await setDoc(doc(db, 'tenants', tId), updates, { merge: true });
      setTenant({ ...localTenant, id: tId });
      
      const root = document.documentElement;
      root.style.setProperty('--primary', localTenant.cor_primaria);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('exceeds the maximum allowed size')) {
        setErrorMessage("Erro: Os dados da agência excedem o limite de 1MB. Tente reduzir o tamanho do Logótipo ou da imagem de capa.");
      } else {
        setErrorMessage(err.message || "Erro ao guardar definições.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (tenantLoading && !user) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  }

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Configuração da Agência</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gerir identidade e presença online</p>
        </div>
        <div className="flex items-center gap-4">
          {success && <div className="text-emerald-600 text-xs font-black uppercase flex items-center gap-2 animate-bounce"><Check size={16}/> Guardado!</div>}
          <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Gravar Tudo
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
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-bold border border-red-100">
              <AlertTriangle size={18} /> {errorMessage}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4">Dados da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label htmlFor="agency_name" className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Comercial</label>
                    <input id="agency_name" name="agency_name" className="admin-input-settings" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label htmlFor="agency_nif" className="text-[10px] font-black uppercase text-slate-400 ml-2">NIF / Identificação</label>
                    <input id="agency_nif" name="agency_nif" className="admin-input-settings" value={localTenant.nif || ''} onChange={e => setLocalTenant({...localTenant, nif: e.target.value})} />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label htmlFor="agency_slogan" className="text-[10px] font-black uppercase text-slate-400 ml-2">Slogan / Frase de Capa</label>
                    <div className="relative">
                      <input id="agency_slogan" name="agency_slogan" className="admin-input-settings pr-14" value={localTenant.slogan || ''} onChange={e => setLocalTenant({...localTenant, slogan: e.target.value})} />
                      <button onClick={handleGenerateSlogan} disabled={isGeneratingSlogan} className="absolute right-2 top-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm hover:bg-blue-50 transition-colors">
                        {isGeneratingSlogan ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      </button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label htmlFor="agency_email" className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Público</label>
                    <input id="agency_email" name="agency_email" type="email" className="admin-input-settings" value={localTenant.email} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label htmlFor="agency_phone" className="text-[10px] font-black uppercase text-slate-400 ml-2">Telefone Público</label>
                    <input id="agency_phone" name="agency_phone" className="admin-input-settings" value={localTenant.telefone || ''} onChange={e => setLocalTenant({...localTenant, telefone: e.target.value})} />
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
                       <label htmlFor="color_primary" className="text-[10px] font-black uppercase text-slate-400 ml-2">Cor Primária</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                          <input id="color_primary" name="color_primary" type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} />
                          <span className="font-black text-xs uppercase tracking-widest">{localTenant.cor_primaria}</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label htmlFor="color_secondary" className="text-[10px] font-black uppercase text-slate-400 ml-2">Cor Secundária</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                          <input id="color_secondary" name="color_secondary" type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer" value={localTenant.cor_secundaria} onChange={e => setLocalTenant({...localTenant, cor_secundaria: e.target.value})} />
                          <span className="font-black text-xs uppercase tracking-widest">{localTenant.cor_secundaria}</span>
                       </div>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-4 block">Logótipo da Agência</label>
                    <div onClick={handleLogoClick} className="h-52 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:bg-slate-100 transition-all overflow-hidden p-6 relative group">
                       {localTenant.logo_url ? (
                         <>
                           <img src={localTenant.logo_url} className="h-full w-auto object-contain" alt="Agency Logo" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase">Alterar Logo</div>
                         </>
                       ) : (
                         <>
                           <Camera size={32} className="mb-2"/>
                           <span className="text-[10px] font-black uppercase">Upload PNG/JPG</span>
                         </>
                       )}
                       <input type="file" id="logo_input" name="logo_input" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} className="hidden" accept="image/*" />
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-12 animate-in fade-in">
              <div className="space-y-6">
                 <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Endereço & Hero</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label htmlFor="agency_slug" className="text-[10px] font-black uppercase text-slate-400 ml-2">Slug do Website</label>
                       <div className="flex items-center bg-slate-50 rounded-2xl px-6 py-4">
                         <span className="text-slate-300 font-bold text-sm">/agencia/</span>
                         <input id="agency_slug" name="agency_slug" className="flex-1 bg-transparent outline-none font-black text-[#1c2d51] text-sm lowercase" value={localTenant.slug} onChange={e => setLocalTenant({...localTenant, slug: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Imagem de Capa (Hero)</label>
                       <div onClick={handleHeroClick} className="h-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center gap-4 px-6 cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative">
                          {localTenant.hero_image_url ? (
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white"><img src={localTenant.hero_image_url} className="w-full h-full object-cover" alt="Hero" /></div>
                              <span className="text-[10px] font-black text-[#1c2d51] uppercase truncate">Imagem Personalizada</span>
                            </div>
                          ) : (
                            <>
                              <ImageIcon size={20} className="text-slate-300" />
                              <span className="text-[10px] font-black text-slate-400 uppercase">Usar padrão ou Upload</span>
                            </>
                          )}
                          <input type="file" id="hero_input" name="hero_input" ref={heroInputRef} onChange={(e) => handleFileChange(e, 'hero')} className="hidden" accept="image/*" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 border-t pt-10">
                <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Catálogo de Templates (5 Estilos)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {TEMPLATE_OPTIONS.map((tmpl) => (
                    <div key={tmpl.id} className={`group relative p-8 rounded-[2.5rem] border-2 transition-all ${localTenant.template_id === tmpl.id ? 'border-[#1c2d51] bg-[#1c2d51]/5' : 'border-slate-50 hover:border-slate-200 shadow-sm'}`}>
                      <div className="flex justify-between items-start mb-6">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${localTenant.template_id === tmpl.id ? 'bg-[#1c2d51] text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-white'}`}>{tmpl.icon}</div>
                         {localTenant.template_id === tmpl.id && <div className="bg-[#1c2d51] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-sm">Ativo</div>}
                      </div>
                      <h4 className="font-black text-lg text-[#1c2d51] mb-1">{tmpl.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-8 leading-tight">{tmpl.desc}</p>
                      <div className="flex gap-2">
                         <button onClick={() => setLocalTenant({ ...localTenant, template_id: tmpl.id })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localTenant.template_id === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-50 text-slate-400 hover:bg-[#1c2d51] hover:text-white'}`}>Selecionar</button>
                         <button onClick={() => setPreviewingTemplate(tmpl.id)} className="px-5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1c2d51] hover:border-[#1c2d51] transition-all flex items-center justify-center gap-2"><Eye size={16}/> <span className="hidden sm:inline text-[8px] font-black uppercase">Ver</span></button>
                      </div>
                    </div>
                  ))}
                </div>
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
            const tid = previewingTemplate;
            if (tid) {
              setLocalTenant({ ...localTenant, template_id: tid }); 
            }
            setPreviewingTemplate(null); 
          }} 
          tenantData={localTenant}
        />
      )}

      <style>{`
        .admin-input-settings {
          width: 100%;
          padding: 1rem 1.25rem;
          background: #f8fafc;
          border: 2px solid transparent;
          border-radius: 1.25rem;
          outline: none;
          font-weight: 700;
          color: #1c2d51;
          transition: all 0.2s;
        }
        .admin-input-settings:focus {
          background: #fff;
          border-color: #1c2d51;
        }
      `}</style>
    </div>
  );
};

const TabLink = ({ active, icon, label, tab }: { active: boolean, icon: any, label: string, tab: string }) => (
  <Link to={`/admin/settings?tab=${tab}`} className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all border ${active ? 'bg-[#1c2d51] text-white border-[#1c2d51] shadow-xl shadow-slate-900/10' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>
    <div className={active ? 'text-white' : 'text-slate-300'}>{icon}</div>
    <div className={`font-black text-[11px] uppercase tracking-tighter leading-none ${active ? 'text-white' : 'text-[#1c2d51]'}`}>{label}</div>
  </Link>
);

const TemplatePreviewModal = ({ templateId, onClose, onSelect, tenantData }: any) => {
  const [page, setPage] = useState('home');
  const template = TEMPLATE_OPTIONS.find(t => t.id === templateId);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1c2d51] transition-all">
            <ChevronLeft size={16}/> Voltar
          </button>
          <div className="h-8 w-px bg-slate-100"></div>
          <div>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Pré-visualização Real</span>
            <h4 className="text-sm font-black text-[#1c2d51] tracking-tighter">{template?.name}</h4>
          </div>
        </div>

        <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center gap-1">
           <PageTab active={page === 'home'} onClick={() => setPage('home')} label="Homepage" />
        </div>

        <button onClick={onSelect} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all">
          Usar este Template
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-100 p-8 sm:p-12 lg:p-20">
        <div className="max-w-[1440px] mx-auto min-h-full bg-white shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-[3rem] overflow-hidden">
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
    { id: 1, title: 'Apartamento T3 com Vista Mar', price: 385000, loc: 'Cascais e Estoril, Cascais', ref: 'REF001', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
    { id: 2, title: 'Moradia V4 com Jardim e Piscina', price: 750000, loc: 'Madalena, Vila Nova de Gaia', ref: 'REF002', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800' },
    { id: 3, title: 'Moradia T5 com Vista Panorâmica', price: 1250000, loc: 'São Pedro de Penaferrim, Sintra', ref: 'REF004', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' },
  ];

  if (templateId === 'heritage') return (
    <div className="font-brand text-slate-900">
       <nav className="h-20 border-b border-slate-100 px-10 flex items-center justify-between bg-white">
          <span className="font-black text-xl text-[#1c2d51] tracking-tighter">{tenant.nome}</span>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Início</span><span>Imóveis</span><span>Contacto</span></div>
       </nav>
       <header className="py-32 px-10 text-center bg-slate-50 border-b border-slate-100 relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <h1 className="text-7xl font-black text-[#1c2d51] tracking-tighter leading-[0.9] mb-8 max-w-4xl mx-auto italic">Tradição & Confiança.</h1>
          <p className="text-slate-400 text-sm mb-12 max-w-lg mx-auto font-medium uppercase tracking-widest">O seu próximo capítulo começa aqui.</p>
       </header>
       <main className="py-32 px-10 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-20 border-b pb-8">
             <h2 className="text-4xl font-black text-[#1c2d51] tracking-tighter italic">Destaques</h2>
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Curadoria exclusiva</span>
          </div>
          <div className="grid grid-cols-3 gap-12">
            {dummyProps.map(p => (
              <div key={p.id} className="group cursor-pointer">
                 <div className="aspect-[4/5] bg-slate-200 rounded-[2.5rem] overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                    <img src={p.img} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt={p.title} />
                 </div>
                 <h4 className="font-black text-xl text-[#1c2d51] mb-1 italic tracking-tight">{p.title}</h4>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{p.loc}</p>
                 <p className="text-[#1c2d51] font-black text-lg mt-3">{formatCurrency(p.price)}</p>
              </div>
            ))}
          </div>
       </main>
    </div>
  );

  return <div className="p-20 text-center font-black uppercase text-slate-200">Layout Preview em Construção</div>;
};

export default AdminSettings;