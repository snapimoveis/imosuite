
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
// Fixing modular Firestore imports for version 9+
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  ArrowRight, Layout, Building2, Eye, Star, ChevronLeft,
  Sparkles, MapPin, Bed, Square, Loader2, Globe, Zap, Brush, Clock, ChevronDown, ChevronRight, Info,
  CheckCircle2, ArrowUpRight, Heart, Search
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { formatCurrency } from '../../lib/utils';
import { generateAgencySlogan, generatePropertyDescription } from '../../services/geminiService';
import { PropertyService } from '../../services/propertyService';

const TEMPLATES = [
  { id: 'heritage', name: 'Heritage', icon: <Building2 />, color: '#1c2d51', description: 'Tradição e confiança com um toque formal.' },
  { id: 'canvas', name: 'Canvas', icon: <Layout />, color: '#357fb2', description: 'Design moderno, limpo e funcional.' },
  { id: 'prestige', name: 'Prestige', icon: <Star />, color: '#000000', description: 'Luxo e Minimalismo absoluto.' },
  { id: 'skyline', name: 'Skyline', icon: <Zap />, color: '#2563eb', description: 'Urbano, tecnológico e focado em leads.' },
  { id: 'luxe', name: 'Luxe', icon: <Brush />, color: '#2D2926', description: 'Artístico, curadoria e foco em lifestyle.' }
];

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { tenant, setTenant } = useTenant();
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('heritage');
  const [previewingTemplate, setPreviewingTemplate] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const [identity, setIdentity] = useState({
    name: tenant.nome || '',
    slogan: '',
    primaryColor: tenant.cor_primaria || '#1c2d51',
    secondaryColor: tenant.cor_secundaria || '#357fb2',
    email: tenant.email || '',
    phone: tenant.telefone || '',
  });

  const [isGeneratingSlogan, setIsGeneratingSlogan] = useState(false);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinishOnboarding = async () => {
    if (!profile?.tenantId) return;
    setIsFinishing(true);
    try {
      const tenantRef = doc(db, 'tenants', profile.tenantId);
      const updates = {
        template_id: selectedTemplate as any,
        slogan: identity.slogan,
        cor_primaria: identity.primaryColor,
        cor_secundaria: identity.secondaryColor,
        email: identity.email,
        telefone: identity.phone,
        onboarding_completed: true,
        updated_at: serverTimestamp()
      };
      
      await updateDoc(tenantRef, updates);
      setTenant({ ...tenant, ...updates } as any);
      nextStep();
    } catch (err) {
      console.error(err);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleGenerateSlogan = async () => {
    if (!identity.name) return;
    setIsGeneratingSlogan(true);
    try {
      const slogan = await generateAgencySlogan(identity.name);
      setIdentity(prev => ({ ...prev, slogan }));
    } finally {
      setIsGeneratingSlogan(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-brand">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-50">
        <Logo size="sm" />
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Clock size={14} /> Configuração Inicial
        </div>
      </header>

      <main className="pt-28 px-6 max-w-7xl mx-auto">
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-black text-[#1c2d51] mb-4 tracking-tighter">Escolha a face do seu negócio</h1>
              <p className="text-slate-500 font-medium text-lg">Selecione entre os 5 estilos visuais que melhor representa a sua agência.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {TEMPLATES.map((tmpl) => (
                <div 
                  key={tmpl.id} 
                  className={`group relative bg-white p-8 rounded-[2.5rem] border-2 transition-all flex flex-col ${selectedTemplate === tmpl.id ? 'border-[#1c2d51] shadow-2xl' : 'border-transparent hover:border-slate-100 shadow-sm'}`}
                >
                  <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: tmpl.color }}>
                    {tmpl.icon}
                  </div>
                  <h3 className="text-xl font-black mb-2 text-[#1c2d51]">{tmpl.name}</h3>
                  <p className="text-[11px] text-slate-400 font-bold leading-tight mb-8">{tmpl.description}</p>
                  
                  <div className="mt-auto space-y-3">
                    <button 
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTemplate === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-50 text-slate-400 hover:bg-[#1c2d51] hover:text-white'}`}
                    >
                      {selectedTemplate === tmpl.id ? 'Selecionado' : 'Selecionar'}
                    </button>
                    <button 
                      onClick={() => setPreviewingTemplate(tmpl.id)}
                      className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1c2d51] border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={14}/> Pré-visualizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {selectedTemplate && (
              <div className="flex justify-center mt-16">
                <button onClick={nextStep} className="bg-[#1c2d51] text-white px-12 py-5 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
                  Continuar <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Brush size={24}/></div>
                 <h2 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Identidade Visual</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">Slogan Criativo (Gerado por IA)</label>
                  <div className="relative">
                    <input type="text" value={identity.slogan} onChange={(e) => setIdentity({...identity, slogan: e.target.value})} className="w-full pl-6 pr-14 py-5 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]" placeholder="Ex: A sua porta para o futuro." />
                    <button onClick={handleGenerateSlogan} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                      {isGeneratingSlogan ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">Cor Primária</label>
                      <input type="color" value={identity.primaryColor} onChange={e => setIdentity({...identity, primaryColor: e.target.value})} className="w-full h-14 rounded-2xl cursor-pointer bg-white border border-slate-100" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">Cor Secundária</label>
                      <input type="color" value={identity.secondaryColor} onChange={e => setIdentity({...identity, secondaryColor: e.target.value})} className="w-full h-14 rounded-2xl cursor-pointer bg-white border border-slate-100" />
                   </div>
                </div>
                <div className="flex gap-4 pt-10">
                  <button onClick={prevStep} className="flex-1 bg-slate-50 text-slate-400 py-5 rounded-2xl font-black uppercase text-xs tracking-widest">Voltar</button>
                  <button onClick={handleFinishOnboarding} disabled={isFinishing} className="flex-[2] bg-[#1c2d51] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-2">
                    {isFinishing ? <Loader2 size={18} className="animate-spin"/> : 'Finalizar Configuração'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto py-10 animate-in zoom-in-95 duration-700 text-center">
             <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl animate-bounce"><CheckCircle2 size={48} strokeWidth={3} /></div>
             <h2 className="text-6xl font-black text-[#1c2d51] mb-4 tracking-tighter">Site Publicado!</h2>
             <p className="text-xl text-slate-400 mb-16 max-w-lg mx-auto font-medium leading-relaxed">A sua agência imobiliária já tem presença digital profissional e única.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button onClick={() => navigate(`/agencia/${tenant.slug}`)} className="bg-[#1c2d51] text-white py-6 rounded-[2rem] font-black text-xl flex items-center gap-4 justify-center shadow-2xl hover:scale-105 transition-all"><Globe size={28}/> Abrir Website</button>
                <button onClick={() => navigate('/admin')} className="bg-white border border-slate-100 py-6 rounded-[2rem] font-black text-xl flex items-center gap-4 justify-center hover:bg-slate-50 transition-all">Painel de Gestão</button>
             </div>
          </div>
        )}
      </main>

      {previewingTemplate && (
        <TemplatePreviewModal 
          templateId={previewingTemplate} 
          onClose={() => setPreviewingTemplate(null)} 
          onSelect={() => { setSelectedTemplate(previewingTemplate); setPreviewingTemplate(null); }}
          tenantName={identity.name}
        />
      )}
    </div>
  );
};

// --- PREVIEW ENGINE REPLICADO PARA O ONBOARDING ---

const TemplatePreviewModal = ({ templateId, onClose, onSelect, tenantName }: any) => {
  const template = TEMPLATES.find(t => t.id === templateId);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8">
        <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest"><ChevronLeft size={16}/> Voltar ao Onboarding</button>
        <div>
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Layout de Template</span>
           <h4 className="text-sm font-black text-[#1c2d51] tracking-tight">{template?.name}</h4>
        </div>
        <button onClick={onSelect} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Usar este Template</button>
      </header>
      <div className="flex-1 overflow-y-auto bg-slate-100 p-10 sm:p-20">
        <div className="max-w-[1440px] mx-auto min-h-full bg-white shadow-2xl rounded-[3rem] overflow-hidden">
          <PreviewVisualEngine templateId={templateId} tenantName={tenantName} />
        </div>
      </div>
    </div>
  );
};

const PreviewVisualEngine = ({ templateId, tenantName }: any) => {
  const props = [
    { title: 'The Modern Loft', price: 285000, img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600' },
    { title: 'Sunset Villa', price: 890000, img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600' },
    { title: 'Central Penthouse', price: 1250000, img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600' },
  ];

  if (templateId === 'heritage') return (
    <div className="font-brand text-[#1c2d51]">
       <nav className="h-20 border-b border-slate-50 px-10 flex items-center justify-between bg-white font-heritage italic">Heritage Agency</nav>
       <header className="py-32 px-10 text-center bg-slate-50 font-heritage">
          <h1 className="text-7xl font-black tracking-tighter leading-none mb-6 italic">Elegância e Património.</h1>
          <div className="max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex gap-2 border border-slate-100">
             <div className="flex-1 p-4 text-left text-slate-300 font-bold uppercase text-[9px] tracking-widest">Onde procura?</div>
             <button className="bg-[#1c2d51] text-white px-10 py-4 rounded-xl font-black uppercase text-[10px]">Pesquisar</button>
          </div>
       </header>
       <main className="p-20 grid grid-cols-3 gap-10">
          {props.map((p, i) => (
            <div key={i} className="group"><div className="aspect-[4/5] bg-slate-200 rounded-[2.5rem] overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-700"><img src={p.img} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" /></div><h4 className="font-heritage italic text-xl font-black mb-1">{p.title}</h4><p className="font-black text-slate-400">{formatCurrency(p.price)}</p></div>
          ))}
       </main>
    </div>
  );

  if (templateId === 'canvas') return (
    <div className="bg-white font-brand text-slate-900">
       <nav className="h-20 px-12 border-b flex items-center justify-between font-black uppercase text-[10px] tracking-[0.2em] text-slate-400"><span>Home</span><div className="w-8 h-8 bg-blue-500 rounded-lg"></div><span>Menu</span></nav>
       <header className="grid grid-cols-2 p-20 items-center">
          <div className="space-y-8"><h1 className="text-8xl font-black tracking-tighter leading-[0.85] text-slate-900">{tenantName || 'Canvas'}.</h1><button className="bg-blue-500 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20">Explore Inventory</button></div>
          <div className="aspect-square bg-slate-50 rounded-[4rem] overflow-hidden rotate-2 shadow-2xl"><img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800" className="w-full h-full object-cover" /></div>
       </header>
       <main className="px-20 py-20 grid grid-cols-3 gap-8">
          {props.map((p, i) => (
             <div key={i} className="bg-slate-50 p-3 rounded-[2.5rem] hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-slate-100"><div className="aspect-video rounded-[1.5rem] overflow-hidden mb-6"><img src={p.img} className="w-full h-full object-cover" /></div><div className="px-4 pb-4"><h4 className="font-black text-base">{p.title}</h4><span className="text-blue-500 font-black text-sm">{formatCurrency(p.price)}</span></div></div>
          ))}
       </main>
    </div>
  );

  if (templateId === 'prestige') return (
    <div className="bg-[#080808] text-white font-brand">
       <nav className="h-24 px-12 flex items-center justify-between absolute w-full font-black text-[9px] uppercase tracking-[0.5em] opacity-40"><span>Collection</span><span>Contact</span></nav>
       <header className="h-screen flex items-center justify-center text-center relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" />
          <div className="relative space-y-10"><p className="text-[10px] font-black uppercase tracking-[1em] opacity-30">Pure Luxury</p><h1 className="text-[10rem] font-black tracking-tighter leading-none italic opacity-90 uppercase">ESTATE.</h1><div className="w-px h-24 bg-white/20 mx-auto"></div></div>
       </header>
       <main className="py-40 px-20 grid grid-cols-2 gap-20">
          {props.slice(0,2).map((p, i) => (
             <div key={i} className="space-y-8"><div className="aspect-[4/3] bg-white/5 overflow-hidden group"><img src={p.img} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000" /></div><h3 className="text-4xl font-black tracking-tighter uppercase">{p.title}</h3></div>
          ))}
       </main>
    </div>
  );

  if (templateId === 'skyline') return (
    <div className="bg-[#f1f5f9] font-brand text-[#1a2b3c]">
       <nav className="h-20 bg-white border-b px-10 flex items-center justify-between shadow-sm"><div className="w-8 h-8 bg-blue-600 rounded-lg"></div><button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Lead Gen</button></nav>
       <header className="bg-white p-20 flex gap-20 items-center border-b border-slate-100">
          <div className="space-y-8"><div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest inline-block">City Smart</div><h1 className="text-6xl font-black tracking-tighter leading-[0.95]">The Center of Everything.</h1><input type="text" placeholder="Search Zip Code..." className="w-full bg-slate-50 p-4 rounded-xl outline-none font-black text-sm" /></div>
          <div className="aspect-video bg-slate-100 rounded-[2rem] overflow-hidden shadow-2xl flex-1"><img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800" className="w-full h-full object-cover" /></div>
       </header>
       <main className="p-10 grid grid-cols-4 gap-6">
          {props.concat(props[0]).map((p, i) => (
             <div key={i} className="bg-white p-4 rounded-[2rem] shadow-xl"><div className="aspect-square bg-slate-50 rounded-2xl mb-4 overflow-hidden"><img src={p.img} className="w-full h-full object-cover" /></div><h4 className="font-black text-xs mb-1">{p.title}</h4><span className="text-blue-600 font-black text-sm">{formatCurrency(p.price)}</span></div>
          ))}
       </main>
    </div>
  );

  if (templateId === 'luxe') return (
    <div className="bg-[#FAF9F6] text-[#2D2926] font-heritage">
       <nav className="h-24 px-12 flex items-center justify-between font-black text-[8px] uppercase tracking-[0.5em] opacity-30"><span>Atelier</span><div className="text-2xl font-black tracking-widest italic">Luxe</div><span>Contact</span></nav>
       <header className="h-screen flex items-center px-24 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-2/3 h-full bg-slate-50 z-0"><img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200" className="w-full h-full object-cover opacity-80" /></div>
          <div className="relative z-10 space-y-12 max-w-xl"><div className="flex items-center gap-6 text-[8px] font-black uppercase tracking-[0.6em] text-[#2D2926]/40"><div className="w-12 h-px bg-[#2D2926]/20"></div> Artistic Curation</div><h1 className="text-9xl font-black tracking-tighter leading-[0.8] italic">Soulful<br/>Spaces.</h1></div>
       </header>
       <main className="py-40 px-24 grid grid-cols-2 gap-32">
          {props.slice(0,2).map((p, i) => (
             <div key={i} className={i === 1 ? 'mt-40' : ''}><div className="aspect-[3/4] rounded-[5rem] overflow-hidden shadow-2xl mb-10"><img src={p.img} className="w-full h-full object-cover" /></div><h3 className="text-4xl font-black italic tracking-tighter">{p.title}</h3><p className="text-2xl font-light mt-4">{formatCurrency(p.price)}</p></div>
          ))}
       </main>
    </div>
  );

  return null;
};

export default OnboardingFlow;
