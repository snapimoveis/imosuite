
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { 
  Palette, Globe, Mail, Phone, Save, Layout, Check, 
  Loader2, Star, Building2, Zap, Brush, MapPin, Hash, 
  Settings, AlertTriangle, Eye, ChevronLeft, ChevronRight, Info,
  Quote, Heart, Search, LayoutGrid, List, ArrowUpRight, Bed, Bath, Square,
  MessageSquare, Camera, Share2, Printer
} from 'lucide-react';
import { Tenant } from '../../types.ts';
import { formatCurrency } from '../../lib/utils';

const TEMPLATE_OPTIONS = [
  { id: 'heritage', name: 'Heritage', icon: <Building2 size={20}/>, desc: 'Clássico e Formal', color: '#1c2d51' },
  { id: 'prestige', name: 'Prestige', icon: <Star size={20}/>, desc: 'Luxo e Minimalismo', color: '#000000' },
  { id: 'skyline', name: 'Skyline', icon: <Zap size={20}/>, desc: 'Urbano e Tecnológico', color: '#2563eb' },
  { id: 'luxe', name: 'Luxe', icon: <Brush size={20}/>, desc: 'Artístico e Lifestyle', color: '#2D2926' },
];

const AdminSettings: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile, user } = useAuth();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [localTenant, setLocalTenant] = useState<Tenant>(tenant);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<string | null>(null);
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
      setTenant({ ...tenant, ...updates });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Erro ao guardar definições.");
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
          {success && <div className="text-emerald-600 text-xs font-black uppercase flex items-center gap-2 animate-bounce"><Check size={16}/> Guardado com sucesso!</div>}
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
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome da Agência</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">NIF</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={localTenant.nif || ''} onChange={e => setLocalTenant({...localTenant, nif: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Público</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={localTenant.email} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Telefone</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={localTenant.telefone || ''} onChange={e => setLocalTenant({...localTenant, telefone: e.target.value})} />
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4">Identidade Visual</h3>
              <div className="flex flex-col md:flex-row gap-10">
                 <div className="flex-1 space-y-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cor de Destaque</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                          <input type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} />
                          <span className="font-black text-xs uppercase tracking-widest">{localTenant.cor_primaria}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-4 block">Logótipo</label>
                    <div onClick={handleLogoClick} className="h-40 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:bg-slate-100 transition-all overflow-hidden p-6">
                       {localTenant.logo_url ? <img src={localTenant.logo_url} className="h-full w-auto object-contain" /> : <Camera size={32}/>}
                       <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" />
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
              <div className="flex justify-between items-center border-b pb-4">
                 <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Catálogo de Templates</h3>
                 <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase">Novos Brevemente</div>
              </div>
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
          )}
        </div>
      </div>

      {previewingTemplate && (
        <TemplatePreviewModal 
          templateId={previewingTemplate} 
          onClose={() => setPreviewingTemplate(null)} 
          onSelect={() => { 
            setLocalTenant({ ...localTenant, template_id: previewingTemplate }); 
            setPreviewingTemplate(null); 
          }} 
        />
      )}
    </div>
  );
};

// --- COMPONENTES DE PRÉ-VISUALIZAÇÃO ---

const TemplatePreviewModal = ({ templateId, onClose, onSelect }: any) => {
  const [page, setPage] = useState('home');
  const template = TEMPLATE_OPTIONS.find(t => t.id === templateId);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      {/* Modal Header */}
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1c2d51] transition-all">
            <ChevronLeft size={16}/> Voltar
          </button>
          <div className="h-8 w-px bg-slate-100"></div>
          <div>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Pré-visualização</span>
            <h4 className="text-sm font-black text-[#1c2d51] tracking-tighter">{template?.name}</h4>
          </div>
        </div>

        <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center gap-1">
           <PageTab active={page === 'home'} onClick={() => setPage('home')} label="Homepage" />
           <PageTab active={page === 'list'} onClick={() => setPage('list')} label="Listagem" />
           <PageTab active={page === 'detail'} onClick={() => setPage('detail')} label="Detalhe" />
        </div>

        <button onClick={onSelect} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all">
          Usar este Template
        </button>
      </header>

      {/* Modal Body / Iframe Mock */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-8 sm:p-12 lg:p-20">
        <div className="max-w-[1440px] mx-auto min-h-full bg-white shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-[3rem] overflow-hidden">
          <PreviewEngine templateId={templateId} page={page} color={template.color} />
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

const PreviewEngine = ({ templateId, page, color }: any) => {
  const dummyProps = [
    { id: 1, title: 'Apartamento T3 Centro Histórico', price: 450000, loc: 'Lisboa', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800' },
    { id: 2, title: 'Moradia de Luxo com Piscina', price: 1250000, loc: 'Cascais', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800' },
    { id: 3, title: 'Loft Industrial em Marvila', price: 320000, loc: 'Lisboa', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800' },
  ];

  // ---------------------------------------------------------
  // 1. HERITAGE PREVIEW (Traditional & Formal)
  // ---------------------------------------------------------
  if (templateId === 'heritage') {
    const Navbar = () => (
      <nav className="h-20 border-b border-slate-100 px-12 flex items-center justify-between bg-white sticky top-0 z-50">
        <span className="font-black text-xl text-[#1c2d51] tracking-tighter">Heritage Agency</span>
        <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Início</span><span>Imóveis</span><span>Sobre</span><span>Contacto</span>
        </div>
      </nav>
    );

    if (page === 'home') return (
      <div className="font-brand text-slate-900 animate-in fade-in duration-700">
        <Navbar />
        <header className="py-32 px-12 text-center bg-slate-50 border-b border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <div className="absolute rotate-45 -top-20 -left-20 w-64 h-64 border-4 border-[#1c2d51]"></div>
           </div>
           <h1 className="text-7xl font-black text-[#1c2d51] tracking-tighter leading-none mb-8 max-w-4xl mx-auto italic">Onde a tradição encontra o seu novo lar.</h1>
           <p className="text-slate-500 max-w-xl mx-auto mb-12 font-medium">Mais de 20 anos a construir confiança no mercado imobiliário português.</p>
           <div className="bg-white p-2 rounded-[2rem] shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-6 py-4 text-left border-r border-slate-50">
                 <Search size={18} className="text-slate-300 mr-3"/>
                 <span className="text-xs font-bold text-slate-400">Lisboa, Porto, Cascais...</span>
              </div>
              <button className="bg-[#1c2d51] text-white px-12 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest">Pesquisar</button>
           </div>
        </header>
        <main className="py-24 px-12 space-y-20">
           <div className="text-center"><h2 className="text-3xl font-black text-[#1c2d51] tracking-tighter mb-4">Propriedades Exclusivas</h2><div className="w-12 h-1 bg-[#1c2d51] mx-auto"></div></div>
           <div className="grid grid-cols-3 gap-10 max-w-7xl mx-auto">
              {dummyProps.map(p => (
                <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all">
                   <div className="h-64 bg-slate-200 overflow-hidden"><img src={p.img} className="w-full h-full object-cover"/></div>
                   <div className="p-8 space-y-4">
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-300"><MapPin size={10}/> {p.loc}</div>
                      <h4 className="font-black text-lg text-[#1c2d51] leading-tight h-14">{p.title}</h4>
                      <p className="font-black text-2xl text-[#1c2d51]">{formatCurrency(p.price)}</p>
                   </div>
                </div>
              ))}
           </div>
        </main>
      </div>
    );

    if (page === 'list') return (
      <div className="font-brand animate-in fade-in">
        <Navbar />
        <div className="p-12 max-w-7xl mx-auto">
           <div className="flex justify-between items-end mb-12">
              <div><h2 className="text-4xl font-black text-[#1c2d51] tracking-tighter">Resultados em Lisboa</h2><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">12 Imóveis encontrados</p></div>
              <div className="flex gap-2"><div className="w-10 h-10 rounded-lg bg-[#1c2d51] text-white flex items-center justify-center"><LayoutGrid size={18}/></div><div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center"><List size={18}/></div></div>
           </div>
           <div className="grid grid-cols-2 gap-8">
              {[...dummyProps, ...dummyProps].map((p, i) => (
                <div key={i} className="flex bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                   <div className="w-1/3 aspect-square bg-slate-100"><img src={p.img} className="w-full h-full object-cover"/></div>
                   <div className="flex-1 p-8 flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] font-black uppercase text-blue-600 mb-2 block">Venda &bull; {p.loc}</span>
                        <h4 className="font-black text-xl text-[#1c2d51]">{p.title}</h4>
                      </div>
                      <div className="flex justify-between items-center"><span className="text-2xl font-black text-[#1c2d51]">{formatCurrency(p.price)}</span><ChevronRight className="text-slate-300"/></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    );

    if (page === 'detail') return (
      <div className="font-brand animate-in slide-in-from-right duration-500">
        <Navbar />
        <div className="p-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
           <div className="space-y-6">
              <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl"><img src={dummyProps[1].img} className="w-full h-full object-cover"/></div>
              <div className="grid grid-cols-4 gap-4">
                 {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-slate-100 rounded-2xl overflow-hidden"><img src={dummyProps[0].img} className="w-full h-full object-cover opacity-50"/></div>)}
              </div>
           </div>
           <div className="space-y-10 py-6">
              <div className="space-y-4">
                 <div className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2"><MapPin size={12}/> {dummyProps[1].loc} &bull; Ref: HS-2024</div>
                 <h1 className="text-5xl font-black text-[#1c2d51] tracking-tighter leading-tight">{dummyProps[1].title}</h1>
                 <p className="text-4xl font-black text-[#1c2d51]">{formatCurrency(dummyProps[1].price)}</p>
              </div>
              <div className="flex gap-10 border-y py-10 text-slate-400 font-bold uppercase text-[10px]">
                 <span className="flex flex-col gap-2 items-center"><Bed size={20} className="text-slate-900" /> 4 Quartos</span>
                 <span className="flex flex-col gap-2 items-center"><Bath size={20} className="text-slate-900" /> 3 WCs</span>
                 <span className="flex flex-col gap-2 items-center"><Square size={20} className="text-slate-900" /> 240 m²</span>
              </div>
              <button className="w-full bg-[#1c2d51] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-[#1c2d51]/20">Contactar Especialista</button>
           </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 2. PRESTIGE PREVIEW (High Luxury & Minimal)
  // ---------------------------------------------------------
  if (templateId === 'prestige') {
    const Nav = () => (
       <nav className="fixed w-full h-24 px-16 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent">
          <span className="text-2xl font-bold tracking-[0.6em] uppercase italic text-white">Prestige</span>
          <div className="w-12 h-px bg-white/40"></div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 space-x-10 hidden md:block">
             <span>Catalog</span><span>Legacy</span><span>Connect</span>
          </div>
       </nav>
    );

    if (page === 'home') return (
      <div className="bg-[#0a0a0a] text-white font-heritage h-full min-h-[800px] animate-in zoom-in duration-1000">
         <Nav />
         <header className="h-screen flex items-center justify-center text-center px-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/60"></div>
            <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600" className="absolute inset-0 w-full h-full object-cover -z-10 grayscale opacity-40 scale-110" />
            <div className="relative space-y-10 max-w-4xl">
               <p className="text-[11px] font-black uppercase tracking-[1em] opacity-40 animate-pulse">The Private Collection</p>
               <h1 className="text-[10rem] font-bold tracking-tighter leading-none italic opacity-90 mb-10">Ethereal</h1>
               <div className="w-px h-32 bg-white/20 mx-auto mt-12 mb-12"></div>
               <button className="text-[10px] font-bold uppercase tracking-[0.4em] border-b border-white/20 pb-2 hover:border-white transition-all">Scroll to Explore</button>
            </div>
         </header>
      </div>
    );

    if (page === 'list') return (
      <div className="bg-[#0a0a0a] text-white font-heritage h-full animate-in fade-in">
         <Nav />
         <main className="pt-40 px-16 pb-40 space-y-40">
            {dummyProps.map((p, i) => (
              <div key={i} className={`flex items-center gap-32 ${i % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
                 <div className="flex-1 aspect-[4/5] bg-white/5 overflow-hidden group shadow-2xl">
                    <img src={p.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                 </div>
                 <div className="flex-1 space-y-12">
                    <div className="space-y-6">
                       <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30 italic">Lote {i+1}</span>
                       <h3 className="text-8xl font-bold tracking-tighter italic leading-none">{p.title.split(' ')[0]} <br/> <span className="ml-20">{p.title.split(' ')[1]}</span></h3>
                       <p className="text-white/40 italic text-2xl max-w-md">Uma fusão intemporal de arquitetura e natureza.</p>
                    </div>
                    <div className="flex items-center gap-6"><span className="text-3xl font-light tracking-widest">{formatCurrency(p.price)}</span> <ArrowUpRight size={48} strokeWidth={0.5} className="text-white/20" /></div>
                 </div>
              </div>
            ))}
         </main>
      </div>
    );

    if (page === 'detail') return (
      <div className="bg-[#0a0a0a] text-white font-heritage h-full animate-in slide-in-from-bottom duration-700">
         <Nav />
         <div className="h-screen relative flex items-end p-20 overflow-hidden">
            <img src={dummyProps[1].img} className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            <div className="relative z-10 max-w-4xl space-y-8">
               <h1 className="text-9xl font-bold italic tracking-tighter leading-none">{dummyProps[1].title}</h1>
               <div className="flex gap-20 items-center">
                  <div className="text-white/40 italic uppercase text-[10px] tracking-widest flex flex-col gap-2"><span>Curated Space</span><span>Lisboa, PT</span></div>
                  <div className="h-px w-40 bg-white/20"></div>
                  <div className="text-4xl font-light tracking-tighter">{formatCurrency(dummyProps[1].price)}</div>
               </div>
            </div>
         </div>
         <div className="p-40 grid grid-cols-3 gap-20 max-w-7xl mx-auto border-t border-white/5">
            <div className="col-span-2 space-y-12">
               <h2 className="text-5xl italic font-bold tracking-tighter">The Vision</h2>
               <p className="text-white/60 text-2xl leading-relaxed italic">Desenhada para os apreciadores da forma pura e do silêncio absoluto. Cada ângulo foi planeado para maximizar a luz etérea de Cascais.</p>
            </div>
            <div className="space-y-10 pt-4">
               {['A++ Certified', 'Private Security', 'Helipad Access', 'Smart Ecology'].map(f => <div key={f} className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 pb-4 border-b border-white/10">{f}</div>)}
            </div>
         </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 3. SKYLINE PREVIEW (Urban & Tech)
  // ---------------------------------------------------------
  if (templateId === 'skyline') {
    const Navbar = () => (
      <nav className="h-20 bg-white border-b border-slate-200 px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">S</div>
           <span className="font-black text-xl tracking-tighter text-slate-900">Skyline</span>
        </div>
        <div className="flex items-center gap-8 font-black text-[11px] uppercase text-slate-500">
           <span className="text-blue-600">Novidades</span><span>Mapa</span><span>Explorar</span>
           <button className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow-xl shadow-blue-200 hover:scale-105 transition-all">Entrar em Contacto</button>
        </div>
      </nav>
    );

    if (page === 'home') return (
      <div className="bg-slate-50 font-brand text-slate-900 h-full animate-in slide-in-from-top duration-500">
        <Navbar />
        <header className="bg-white border-b border-slate-100 py-24 px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <div className="bg-blue-50 text-blue-600 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest inline-block border border-blue-100">Pronto para Mudar?</div>
              <h1 className="text-[5.5rem] font-black tracking-tighter leading-[0.9] text-slate-900">A sua nova base na cidade.</h1>
              <div className="relative max-w-lg">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                 <input className="w-full bg-slate-50 p-6 pl-14 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all shadow-sm" placeholder="Rua, Bairro ou Código Postal" />
              </div>
           </div>
           <div className="relative">
              <div className="aspect-square bg-blue-600 rounded-[3rem] rotate-3 overflow-hidden shadow-2xl shadow-blue-200">
                 <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800" className="w-full h-full object-cover -rotate-3 scale-110" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-50 max-w-xs animate-bounce-slow">
                 <div className="flex items-center gap-3 mb-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-black uppercase text-slate-400">Novo Destaque</span></div>
                 <p className="font-black text-sm text-slate-900">T2 Renovado em Santos</p>
                 <p className="text-blue-600 font-black text-lg mt-1">285.000 €</p>
              </div>
           </div>
        </header>
      </div>
    );

    if (page === 'list') return (
      <div className="bg-slate-50 font-brand h-full animate-in fade-in">
        <Navbar />
        <div className="p-10 grid grid-cols-4 gap-6">
           <aside className="col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8">
                 <h4 className="font-black uppercase text-xs tracking-widest text-slate-900">Filtros Avançados</h4>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Preço Máximo</label>
                    <div className="h-1 bg-slate-100 rounded-full relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md"></div></div>
                 </div>
                 {['Com Elevador', 'Garagem', 'Renovado'].map(f => <div key={f} className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-500 uppercase">{f}</span><div className="w-8 h-4 bg-slate-100 rounded-full"></div></div>)}
              </div>
           </aside>
           <main className="col-span-3 grid grid-cols-3 gap-6">
              {[...dummyProps, ...dummyProps].map((p, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm group hover:border-blue-600 transition-all">
                   <div className="aspect-square bg-slate-100 relative">
                      <img src={p.img} className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-all"><Heart size={20}/></div>
                   </div>
                   <div className="p-6 space-y-3">
                      <h4 className="font-black text-xs text-slate-900 uppercase tracking-tighter truncate">{p.title}</h4>
                      <p className="text-blue-600 font-black text-xl">{formatCurrency(p.price)}</p>
                      <div className="flex gap-4 pt-2 text-slate-300 font-black text-[9px] uppercase border-t"><span>3 Bed</span><span>2 Bath</span><span>95m²</span></div>
                   </div>
                </div>
              ))}
           </main>
        </div>
      </div>
    );

    if (page === 'detail') return (
      <div className="bg-slate-50 font-brand h-full animate-in zoom-in-95">
        <Navbar />
        <div className="p-10 max-w-[1200px] mx-auto space-y-10">
           <div className="flex justify-between items-start">
              <div className="space-y-2">
                 <div className="bg-blue-50 text-blue-600 text-[8px] font-black px-3 py-1 rounded-full uppercase inline-block">Ref: SKY-102</div>
                 <h2 className="text-5xl font-black tracking-tighter text-slate-900">{dummyProps[2].title}</h2>
                 <p className="text-slate-400 font-bold uppercase text-xs flex items-center gap-2"><MapPin size={14}/> Beato, Lisboa Creative Hub</p>
              </div>
              <div className="text-right">
                 <p className="text-slate-400 font-bold uppercase text-[10px] mb-1">Preço de Venda</p>
                 <p className="text-4xl font-black text-blue-600 tracking-tighter">{formatCurrency(dummyProps[2].price)}</p>
              </div>
           </div>
           <div className="grid grid-cols-3 gap-6 h-[500px]">
              <div className="col-span-2 bg-slate-100 rounded-[2rem] overflow-hidden"><img src={dummyProps[2].img} className="w-full h-full object-cover" /></div>
              <div className="grid grid-rows-2 gap-6">
                 <div className="bg-slate-100 rounded-[2rem] overflow-hidden"><img src={dummyProps[0].img} className="w-full h-full object-cover opacity-80" /></div>
                 <div className="bg-slate-100 rounded-[2rem] overflow-hidden relative">
                    <img src={dummyProps[1].img} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white font-black text-xl">+12 Fotos</div>
                 </div>
              </div>
           </div>
           <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-200 grid grid-cols-3 gap-16">
              <div className="col-span-2 space-y-8">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase border-b pb-4">A Experiência</h3>
                 <p className="text-slate-500 font-medium leading-relaxed text-lg italic">"Um espaço que respira criatividade, em plena zona de expansão tecnológica. Pé direito duplo, acabamentos em betão aparente e luz zenital..."</p>
                 <div className="flex gap-10">
                    <div className="text-center bg-slate-50 p-6 rounded-3xl flex-1"><Bed size={24} className="mx-auto mb-2 text-blue-600"/> <p className="font-black text-lg">2</p></div>
                    <div className="text-center bg-slate-50 p-6 rounded-3xl flex-1"><Bath size={24} className="mx-auto mb-2 text-blue-600"/> <p className="font-black text-lg">1</p></div>
                    <div className="text-center bg-slate-50 p-6 rounded-3xl flex-1"><Square size={24} className="mx-auto mb-2 text-blue-600"/> <p className="font-black text-lg">85m²</p></div>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="bg-slate-50 p-8 rounded-[2rem] text-center border border-slate-100">
                    <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest mb-6">Agendar Visita</p>
                    <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs shadow-lg shadow-blue-100">Marcar no Calendário</button>
                    <button className="w-full border-2 border-slate-200 text-slate-400 py-4 rounded-xl font-black uppercase text-xs mt-3">Pedir Planta</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 4. LUXE PREVIEW (Artistic & Elegant)
  // ---------------------------------------------------------
  if (templateId === 'luxe') {
    const Navbar = () => (
      <nav className="h-24 px-16 flex items-center justify-between absolute w-full z-50">
        <span className="text-3xl font-bold tracking-[0.3em] italic text-[#2D2926]">Luxe</span>
        <div className="flex items-center gap-16 text-[9px] font-black uppercase tracking-[0.4em] text-[#2D2926]/40">
           <span className="text-[#2D2926] border-b border-[#2D2926] pb-1">Curadoria</span><span>Estética</span><span>Essência</span><span>A Agência</span>
        </div>
      </nav>
    );

    if (page === 'home') return (
      <div className="bg-[#FAF9F6] text-[#2D2926] font-heritage h-full min-h-[800px] animate-in slide-in-from-left duration-1000">
         <Navbar />
         <header className="h-full flex items-center px-24 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-2/3 h-full bg-[#f1efe9]"><img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1000" className="w-full h-full object-cover opacity-80 mix-blend-multiply" /></div>
            <div className="relative z-10 space-y-12 max-w-3xl">
               <div className="flex items-center gap-4 text-[#2D2926]/40 text-[9px] font-black uppercase tracking-[0.8em]"><div className="w-16 h-px bg-[#2D2926]/20"></div> Estética Imobiliária</div>
               <h1 className="text-[10rem] font-bold tracking-tighter leading-[0.75] text-[#2D2926]">Espaços <br/> <span className="italic font-light ml-56 text-[#2D2926]/80">com Alma.</span></h1>
               <div className="pt-10"><button className="px-12 py-6 bg-[#2D2926] text-[#FAF9F6] rounded-full font-bold text-lg tracking-tighter hover:bg-[#2D2926]/90 transition-all">Ver Coleção</button></div>
            </div>
         </header>
      </div>
    );

    if (page === 'list') return (
      <div className="bg-[#FAF9F6] text-[#2D2926] font-heritage h-full animate-in fade-in">
         <Navbar />
         <main className="py-40 px-24 space-y-32">
            <div className="max-w-4xl border-l border-[#2D2926]/10 pl-12"><h2 className="text-6xl font-bold tracking-tighter italic leading-none">Curadoria exclusiva em <br/> locais emblemáticos.</h2></div>
            <div className="grid grid-cols-2 gap-32 items-start">
               {dummyProps.map((p, i) => (
                 <div key={i} className={`flex flex-col space-y-10 ${i % 2 !== 0 ? 'mt-48' : ''}`}>
                    <div className="aspect-[3/4] rounded-[5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] group">
                       <img src={p.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    </div>
                    <div className="px-10 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] text-[#2D2926]/30">
                          <span>{p.loc} &bull; T3</span>
                          <Heart size={16}/>
                       </div>
                       <h3 className="text-5xl font-bold tracking-tighter italic leading-tight">{p.title}</h3>
                       <div className="flex items-center gap-6 pt-4">
                          <span className="h-px w-20 bg-[#2D2926]/20"></span>
                          <span className="text-2xl font-light tracking-tighter italic">{formatCurrency(p.price)}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </main>
      </div>
    );

    if (page === 'detail') return (
      <div className="bg-[#FAF9F6] text-[#2D2926] font-heritage h-full animate-in fade-in duration-1000">
         <Navbar />
         <div className="h-screen grid grid-cols-5 gap-0">
            <div className="col-span-3 h-full relative overflow-hidden">
               <img src={dummyProps[0].img} className="w-full h-full object-cover" />
               <div className="absolute bottom-12 left-12 flex gap-4">
                  <button className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"><Camera size={18}/></button>
                  <button className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"><Share2 size={18}/></button>
               </div>
            </div>
            <div className="col-span-2 h-full flex flex-col justify-center p-24 space-y-12 bg-[#F1EFE9]">
               <div className="space-y-6">
                  <div className="flex items-center gap-4 text-[#2D2926]/30 text-[9px] font-black uppercase tracking-[0.5em]"><div className="w-10 h-px bg-[#2D2926]/20"></div> Disponível</div>
                  <h1 className="text-7xl font-bold italic tracking-tighter leading-[0.85]">{dummyProps[0].title}</h1>
                  <p className="text-4xl font-light tracking-tighter italic text-[#2D2926]/60">{formatCurrency(dummyProps[0].price)}</p>
               </div>
               <div className="h-px w-full bg-[#2D2926]/10"></div>
               <div className="grid grid-cols-3 gap-10 text-[10px] font-bold uppercase tracking-widest text-[#2D2926]/40">
                  <div className="flex flex-col gap-2"><span>Divisões</span><span className="text-xl italic text-[#2D2926]">T3</span></div>
                  <div className="flex flex-col gap-2"><span>Área</span><span className="text-xl italic text-[#2D2926]">112 m²</span></div>
                  <div className="flex flex-col gap-2"><span>Estado</span><span className="text-xl italic text-[#2D2926]">Novo</span></div>
               </div>
               <p className="text-lg leading-relaxed italic opacity-70">"Uma obra de arte habitável onde cada detalhe foi curado para evocar serenidade e harmonia."</p>
               <div className="pt-6">
                  <button className="w-full py-6 border border-[#2D2926] text-[#2D2926] rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-[#2D2926] hover:text-white transition-all">Solicitar Dossier</button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return <div className="p-20 text-center font-brand text-slate-300 font-black uppercase text-sm tracking-widest">Layout de Preview indisponível para este template.</div>;
};

const TabLink = ({ active, icon, label, tab }: any) => (
  <Link to={`/admin/settings?tab=${tab}`} className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all border ${active ? 'bg-[#1c2d51] text-white border-[#1c2d51] shadow-xl shadow-slate-900/10' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>
    <div className={active ? 'text-white' : 'text-slate-300'}>{icon}</div>
    <div className={`font-black text-[11px] uppercase tracking-tighter leading-none ${active ? 'text-white' : 'text-[#1c2d51]'}`}>{label}</div>
  </Link>
);

export default AdminSettings;
