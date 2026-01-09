import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
// Correct modular Firestore imports for version 9+
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Palette, Globe, Mail, Phone, Save, Layout, Check, 
  Loader2, Star, Building2, Zap, Brush, MapPin, Hash, 
  Settings, AlertTriangle, Eye, ChevronLeft, ChevronRight, Info,
  Quote, Heart, Search, LayoutGrid, List, ArrowUpRight, Bed, Bath, Square,
  MessageSquare, Camera, Share2, Sparkles, Image as ImageIcon, Car, Handshake, Key, ArrowRight
} from 'lucide-react';
import { Tenant } from '../../types';
import { formatCurrency, generateSlug } from '../../lib/utils';
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
      if (type === 'logo') {
        setLocalTenant(prev => ({ ...prev, logo_url: base64 }));
      } else {
        setLocalTenant(prev => ({ ...prev, hero_image_url: base64 }));
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

      // Prepare data for saving
      const { id, ...dataToSave } = localTenant;
      const updates = {
        ...dataToSave,
        updated_at: serverTimestamp()
      };

      await setDoc(doc(db, 'tenants', tId), updates, { merge: true });
      setTenant({ ...localTenant, id: tId });
      
      // Update primary color in CSS variables
      const root = document.documentElement;
      root.style.setProperty('--primary', localTenant.cor_primaria);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro ao guardar definições.");
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
          {activeTab === 'general' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4">Dados da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Comercial</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">NIF / Identificação</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={localTenant.nif || ''} onChange={e => setLocalTenant({...localTenant, nif: e.target.value})} />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Slogan / Frase de Capa</label>
                    <div className="relative">
                      <input className="w-full p-4 pr-14 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={localTenant.slogan || ''} onChange={e => setLocalTenant({...localTenant, slogan: e.target.value})} />
                      <button onClick={handleGenerateSlogan} disabled={isGeneratingSlogan} className="absolute right-2 top-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm hover:bg-blue-50 transition-colors">
                        {isGeneratingSlogan ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      </button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Público</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={localTenant.email} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Telefone Público</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={localTenant.telefone || ''} onChange={e => setLocalTenant({...localTenant, telefone: e.target.value})} />
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
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cor Secundária</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                          <input type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer" value={localTenant.cor_secundaria} onChange={e => setLocalTenant({...localTenant, cor_secundaria: e.target.value})} />
                          <span className="font-black text-xs uppercase tracking-widest">{localTenant.cor_secundaria}</span>
                       </div>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-4 block">Logótipo da Agência</label>
                    <div onClick={handleLogoClick} className="h-52 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:bg-slate-100 transition-all overflow-hidden p-6 relative group">
                       {localTenant.logo_url ? (
                         <>
                           <img src={localTenant.logo_url} className="h-full w-auto object-contain" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase">Alterar Logo</div>
                         </>
                       ) : (
                         <>
                           <Camera size={32} className="mb-2"/>
                           <span className="text-[10px] font-black uppercase">Upload PNG/JPG</span>
                         </>
                       )}
                       <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} className="hidden" accept="image/*" />
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
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Slug do Website</label>
                       <div className="flex items-center bg-slate-50 rounded-2xl px-6 py-4">
                         <span className="text-slate-300 font-bold text-sm">/agencia/</span>
                         <input className="flex-1 bg-transparent outline-none font-black text-[#1c2d51] text-sm lowercase" value={localTenant.slug} onChange={e => setLocalTenant({...localTenant, slug: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Imagem de Capa (Hero)</label>
                       <div onClick={handleHeroClick} className="h-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center gap-4 px-6 cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative">
                          {localTenant.hero_image_url ? (
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white"><img src={localTenant.hero_image_url} className="w-full h-full object-cover" /></div>
                              <span className="text-[10px] font-black text-[#1c2d51] uppercase truncate">Imagem Personalizada</span>
                            </div>
                          ) : (
                            <>
                              <ImageIcon size={20} className="text-slate-300" />
                              <span className="text-[10px] font-black text-slate-400 uppercase">Usar padrão ou Upload</span>
                            </>
                          )}
                          <input type="file" ref={heroInputRef} onChange={(e) => handleFileChange(e, 'hero')} className="hidden" accept="image/*" />
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

// --- COMPONENTES DE PRÉ-VISUALIZAÇÃO ---

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
          <PreviewEngine templateId={templateId} page={page} color={template?.color} tenant={tenantData} />
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

  // 1. HERITAGE (Classic, Dark Blue, Serif)
  if (templateId === 'heritage') return (
    <div className="font-brand text-slate-900">
       <nav className="h-20 border-b border-slate-100 px-10 flex items-center justify-between bg-white">
          <span className="font-black text-xl text-[#1c2d51] tracking-tighter">{tenant.nome}</span>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Início</span><span>Imóveis</span><span>Contacto</span></div>
       </nav>
       <header className="py-32 px-10 text-center bg-slate-50 border-b border-slate-100 relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <h1 className="text-7xl font-black text-[#1c2d51] tracking-tighter leading-[0.9] mb-8 max-w-4xl mx-auto font-heritage italic">Tradição & Confiança.</h1>
          <p className="text-slate-400 text-sm mb-12 max-w-lg mx-auto font-medium uppercase tracking-widest">O seu próximo capítulo começa aqui.</p>
          <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-xl mx-auto flex gap-2 border border-slate-100">
             <div className="flex-1 bg-slate-50 rounded-xl px-6 py-4 text-left text-slate-400 text-xs font-bold uppercase tracking-widest">Onde quer viver?</div>
             <button className="bg-[#1c2d51] text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Pesquisar</button>
          </div>
       </header>
       <main className="py-32 px-10 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-20 border-b pb-8">
             <h2 className="text-4xl font-black text-[#1c2d51] tracking-tighter font-heritage italic">Destaques</h2>
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Curadoria exclusiva</span>
          </div>
          <div className="grid grid-cols-3 gap-12">
            {dummyProps.map(p => (
              <div key={p.id} className="group cursor-pointer">
                 <div className="aspect-[4/5] bg-slate-200 rounded-[2.5rem] overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                    <img src={p.img} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                 </div>
                 <h4 className="font-black text-xl text-[#1c2d51] mb-1 font-heritage italic tracking-tight">{p.title}</h4>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{p.loc}</p>
                 <p className="text-[#1c2d51] font-black text-lg mt-3">{formatCurrency(p.price)}</p>
              </div>
            ))}
          </div>
       </main>
    </div>
  );

  // 2. CANVAS (Modern, Clean, Blue/White)
  if (templateId === 'canvas') return (
    <div className="bg-white font-brand text-slate-900">
       <nav className="h-20 px-12 flex items-center justify-between border-b border-slate-50">
          <div className="w-10 h-10 bg-blue-500 rounded-2xl"></div>
          <div className="flex gap-12 font-bold text-sm text-slate-500"><span>Home</span><span>Catalogue</span><span>Services</span></div>
          <button className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest">Connect</button>
       </nav>
       <header className="grid grid-cols-2 gap-20 p-20 items-center">
          <div className="space-y-8">
             <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Real Estate Platform</div>
             <h1 className="text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">{tenant.nome}.</h1>
             <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm">{tenant.slogan || 'Minimalist approach to property search.'}</p>
             <div className="flex items-center gap-6">
                <button className="bg-blue-500 text-white px-10 py-5 rounded-3xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Explore Now</button>
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400 group cursor-pointer hover:text-blue-500">View Demo <ArrowRight size={16}/></div>
             </div>
          </div>
          <div className="aspect-square bg-slate-100 rounded-[4rem] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl">
             <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000" className="w-full h-full object-cover" />
          </div>
       </header>
       <main className="p-20">
          <div className="grid grid-cols-3 gap-8">
             {dummyProps.map(p => (
               <div key={p.id} className="bg-slate-50 p-4 rounded-[3rem] border border-transparent hover:bg-white hover:border-blue-100 hover:shadow-2xl transition-all group">
                  <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6"><img src={p.img} className="w-full h-full object-cover" /></div>
                  <div className="px-4 pb-4">
                    <h4 className="font-black text-lg text-slate-900 mb-2">{p.title}</h4>
                    <div className="flex justify-between items-center"><span className="text-blue-500 font-black">{formatCurrency(p.price)}</span><span className="text-slate-300 font-bold text-[9px] uppercase tracking-widest">{p.ref}</span></div>
                  </div>
               </div>
             ))}
          </div>
       </main>
    </div>
  );

  // 3. PRESTIGE (Luxury, Minimal, Grayscale focus)
  if (templateId === 'prestige') return (
    <div className="bg-[#080808] text-white min-h-full font-brand selection:bg-white selection:text-black">
       <nav className="h-24 px-20 flex items-center justify-between absolute w-full z-10">
          <span className="text-2xl font-black tracking-[0.4em] uppercase">PRESTIGE</span>
          <div className="flex gap-16 text-[9px] font-black uppercase tracking-[0.4em] opacity-40"><span>Collection</span><span>About</span><span>Contact</span></div>
       </nav>
       <header className="h-screen flex items-center justify-center text-center px-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
          <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600" className="absolute inset-0 w-full h-full object-cover -z-10 opacity-30 grayscale" />
          <div className="relative space-y-12 animate-in fade-in zoom-in-95 duration-1000">
             <p className="text-[10px] font-black uppercase tracking-[1em] opacity-40">Exclusivity Defined</p>
             <h1 className="text-[12rem] font-black tracking-tighter leading-[0.7] opacity-90 uppercase italic">Luxury.</h1>
             <div className="w-px h-32 bg-white/20 mx-auto mt-20"></div>
             <p className="text-white/40 text-sm font-light uppercase tracking-[0.5em] mt-10">Portugal's finest estates</p>
          </div>
       </header>
       <main className="py-60 px-20 max-w-7xl mx-auto space-y-80">
          {dummyProps.slice(0,2).map((p, i) => (
            <div key={p.id} className={`flex items-center gap-32 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
               <div className="flex-1 aspect-[4/5] bg-white/5 overflow-hidden group">
                  <img src={p.img} className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
               </div>
               <div className="flex-1 space-y-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">The Reserve &bull; 2024</span>
                  <h3 className="text-7xl font-black tracking-tighter uppercase leading-none">{p.title}</h3>
                  <p className="text-white/40 italic text-xl font-light leading-relaxed">A sanctuary of pure architectural brilliance and natural harmony.</p>
                  <div className="flex items-center gap-6"><div className="w-20 h-px bg-white/20"></div><span className="font-black text-lg tracking-widest">{formatCurrency(p.price)}</span></div>
               </div>
            </div>
          ))}
       </main>
    </div>
  );

  // 4. SKYLINE (Urban, Tech, Vibrant Blue)
  if (templateId === 'skyline') return (
    <div className="bg-[#f0f4f8] font-brand text-[#1a2b3c]">
       <nav className="h-20 bg-white border-b border-slate-200 px-12 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/30">S</div>
             <span className="font-black text-2xl tracking-tighter">Skyline</span>
          </div>
          <div className="flex gap-8 font-black text-[10px] uppercase tracking-widest text-slate-400"><span>City</span><span>Investment</span><span>Rent</span></div>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Submit Lead</button>
       </nav>
       <header className="bg-white border-b border-slate-100 py-24 px-12 grid grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
             <div className="bg-blue-50 text-blue-600 text-[9px] font-black px-4 py-2 rounded-full uppercase inline-block shadow-sm">High Performance Portfolio</div>
             <h1 className="text-7xl font-black tracking-tighter leading-[0.95] text-[#1a2b3c]">Real-time Urban Living.</h1>
             <div className="p-1.5 bg-slate-100 rounded-2xl flex gap-1 shadow-inner max-w-sm">
                <input type="text" placeholder="Neighborhood..." className="flex-1 bg-transparent border-none outline-none px-4 font-bold text-sm" />
                <button className="bg-white p-3 rounded-xl shadow-md text-blue-600"><Search size={18}/></button>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="aspect-[4/3] bg-slate-200 rounded-3xl overflow-hidden shadow-xl"><img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600" className="w-full h-full object-cover" /></div>
             <div className="aspect-[4/3] bg-slate-200 rounded-3xl overflow-hidden shadow-xl mt-12"><img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600" className="w-full h-full object-cover" /></div>
          </div>
       </header>
       <main className="p-20 grid grid-cols-4 gap-6 max-w-8xl mx-auto">
          {dummyProps.concat(dummyProps[0]).map((p, i) => (
            <div key={i} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-xl hover:-translate-y-2 transition-all">
               <div className="aspect-video bg-slate-50 rounded-[1.5rem] mb-6 overflow-hidden relative">
                  <img src={p.img} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase">Urban</div>
               </div>
               <h4 className="font-black text-sm mb-1">{p.title}</h4>
               <p className="text-slate-400 text-[9px] font-bold uppercase mb-4">{p.loc}</p>
               <div className="flex justify-between items-center border-t border-slate-50 pt-4"><span className="text-blue-600 font-black text-base">{formatCurrency(p.price)}</span><ArrowUpRight size={18} className="text-slate-200"/></div>
            </div>
          ))}
       </main>
    </div>
  );

  // 5. LUXE (Artistic, Lifestyle, Earthy Tones)
  if (templateId === 'luxe') return (
    <div className="bg-[#FAF9F6] text-[#2D2926] font-brand selection:bg-[#2D2926] selection:text-white">
       <nav className="h-24 px-12 flex items-center justify-between absolute w-full">
          <span className="text-3xl font-black tracking-widest italic font-heritage">Luxe</span>
          <div className="flex gap-12 text-[9px] font-black uppercase tracking-[0.4em] opacity-30"><span>Curated</span><span>Spaces</span><span>Atelier</span></div>
       </nav>
       <header className="h-screen flex items-center px-24 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-3/4 h-full bg-slate-100 z-0 overflow-hidden">
             <img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200" className="w-full h-full object-cover opacity-90 scale-105" />
          </div>
          <div className="relative z-10 space-y-10 max-w-3xl">
             <div className="flex items-center gap-6 text-[#2D2926]/40 text-[9px] font-black uppercase tracking-[0.6em]">
                <div className="w-20 h-px bg-[#2D2926]/20"></div> Estética Imobiliária
             </div>
             <h1 className="text-[10rem] font-black tracking-tighter leading-[0.8] font-heritage">Espaços<br/><span className="italic font-light ml-40">com Alma.</span></h1>
             <p className="text-lg text-[#2D2926]/60 font-medium leading-relaxed max-w-sm ml-40">Curadoria exclusiva de imóveis com história e design de autor.</p>
          </div>
       </header>
       <main className="py-60 px-24 grid grid-cols-2 gap-40 items-start max-w-7xl mx-auto">
          {dummyProps.slice(0,2).map((p, i) => (
            <div key={p.id} className={`flex flex-col ${i === 1 ? 'mt-60' : ''}`}>
               <div className="aspect-[3/4] rounded-[5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] mb-12 relative group">
                  <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </div>
               <div className="px-10 space-y-6">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.5em] text-[#2D2926]/30">
                     <span>{p.loc.split(',')[1]} &bull; Art House</span>
                     <Heart size={16} strokeWidth={1} />
                  </div>
                  <h3 className="text-5xl font-black tracking-tighter font-heritage italic leading-none">{p.title}</h3>
                  <div className="w-12 h-0.5 bg-[#2D2926]/10"></div>
                  <p className="text-2xl font-light text-[#2D2926]/80">{formatCurrency(p.price)}</p>
               </div>
            </div>
          ))}
       </main>
    </div>
  );

  return null;
};

const TabLink = ({ active, icon, label, tab }: any) => (
  <Link to={`/admin/settings?tab=${tab}`} className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all border ${active ? 'bg-[#1c2d51] text-white border-[#1c2d51] shadow-xl shadow-slate-900/10' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>
    <div className={active ? 'text-white' : 'text-slate-300'}>{icon}</div>
    <div className={`font-black text-[11px] uppercase tracking-tighter leading-none ${active ? 'text-white' : 'text-[#1c2d51]'}`}>{label}</div>
  </Link>
);

export default AdminSettings;