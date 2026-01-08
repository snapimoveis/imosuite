
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { 
  Check, 
  ArrowRight, 
  Layout, 
  Palette, 
  Building2, 
  Rocket, 
  Eye, 
  Star, 
  Shield, 
  Zap, 
  Globe, 
  Smartphone,
  ChevronLeft,
  Sparkles,
  Upload,
  CheckCircle2,
  X,
  HelpCircle,
  Clock,
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  ChevronRight,
  Info,
  Calendar,
  Camera,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Image as ImageIcon,
  Tag,
  Euro,
  ExternalLink,
  /* Added Plus icon to resolve "Cannot find name 'Plus'" error */
  Plus
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { formatCurrency } from '../../lib/utils';
import { generateAgencySlogan, generatePropertyDescription } from '../../services/geminiService';

const TEMPLATES = [
  {
    id: 'heritage',
    name: 'Heritage',
    tag: 'Tradicional',
    color: '#1B263B',
    description: 'Tradição e confiança para imobiliárias familiares.',
    bullets: ['Layout institucional e elegante', 'Ideal para imobiliárias tradicionais', 'Navegação simples e clara']
  },
  {
    id: 'canvas',
    name: 'Canvas',
    tag: 'Moderno',
    color: '#007BFF',
    description: 'Foco absoluto no imóvel e na clareza visual.',
    bullets: ['Design limpo e minimalista', 'Foco na fotografia do imóvel', 'Alta performance de carregamento']
  },
  {
    id: 'prestige',
    name: 'Prestige',
    tag: 'Premium',
    color: '#000000',
    description: 'Experiência premium para o mercado de alto padrão.',
    bullets: ['Dark mode sofisticado', 'Tipografia exclusiva', 'Destaque para imóveis de luxo']
  },
  {
    id: 'direct',
    name: 'Direct',
    tag: 'Conversão',
    color: '#DC3545',
    description: 'Desenhado para gerar leads e contactos rápidos.',
    bullets: ['CTAs de contacto persistentes', 'Filtros de busca rápidos', 'Layout focado em urgência']
  },
  {
    id: 'nexus',
    name: 'Nexus',
    tag: 'Tech',
    color: '#05445E',
    description: 'Para agências orientadas a dados e tecnologia.',
    bullets: ['Interface futurista', 'Integração visual com mapas', 'Gráficos de mercado integrados']
  }
];

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { tenant, setTenant } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'home' | 'list' | 'detail'>('home');
  
  // Step 2 Form State
  const [identity, setIdentity] = useState({
    name: tenant.nome || '',
    slogan: '',
    logo: null as string | null,
    primaryColor: tenant.cor_primaria || '#1c2d51',
    secondaryColor: tenant.cor_secundaria || '#357fb2',
    email: tenant.email || '',
    phone: tenant.telefone || '',
    address: '',
    facebook: '',
    instagram: '',
    linkedin: ''
  });

  // Step 3 Property Form State
  const [property, setProperty] = useState({
    negocio: 'venda',
    tipo: 'Apartamento',
    tipologia: 'T2',
    preco: '',
    concelho: '',
    distrito: 'Lisboa',
    titulo: '',
    descricao: '',
    fotos: [] as string[]
  });

  const [isGeneratingSlogan, setIsGeneratingSlogan] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const propertyPhotoRef = useRef<HTMLInputElement>(null);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinishOnboarding = () => {
    setTenant({ 
      ...tenant, 
      nome: identity.name,
      cor_primaria: identity.primaryColor,
      cor_secundaria: identity.secondaryColor,
      email: identity.email,
      telefone: identity.phone
    });
    navigate('/admin');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setIdentity(prev => ({ ...prev, logo: reader.result as string }));
      /* Explicitly cast file to Blob to resolve "Argument of type 'unknown' is not assignable to parameter of type 'Blob'" error */
      reader.readAsDataURL(file as unknown as Blob);
    }
  };

  const handlePropertyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProperty(prev => ({ 
            ...prev, 
            fotos: [...prev.fotos, reader.result as string].slice(0, 5) 
          }));
        };
        /* Explicitly cast file to Blob to ensure consistency and prevent similar type errors */
        reader.readAsDataURL(file as unknown as Blob);
      });
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

  const handleGenerateDesc = async () => {
    if (!property.titulo) return;
    setIsGeneratingDescription(true);
    try {
      const desc = await generatePropertyDescription({
        titulo: property.titulo,
        tipo_imovel: property.tipo,
        tipologia: property.tipologia,
        concelho: property.concelho,
        distrito: property.distrito,
        caracteristicas: ['Excelente localização', 'Pronto a habitar'],
        preco: property.preco
      });
      setProperty(prev => ({ ...prev, descricao: desc }));
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-50">
      <Logo size="sm" />
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Clock size={14} /> ⏳ Teste gratuito — 14 dias restantes
        </div>
        <button className="text-slate-400 hover:text-[#1c2d51] transition-colors">
          <HelpCircle size={20} />
        </button>
      </div>
    </header>
  );

  const renderProgressBar = () => (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
        {[
          { step: 1, label: 'Escolher site' },
          { step: 2, label: 'Identidade' },
          { step: 3, label: 'Publicar imóvel' },
          { step: 4, label: 'Concluído' }
        ].map((s) => (
          <div key={s.step} className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
              currentStep === s.step ? 'bg-[#1c2d51] text-white ring-4 ring-blue-50' : 
              currentStep > s.step ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-300'
            }`}>
              {currentStep > s.step ? <Check size={14} strokeWidth={4} /> : s.step}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              currentStep === s.step ? 'text-[#1c2d51]' : 'text-slate-400'
            }`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreviewContent = () => {
    switch (previewTab) {
      case 'home':
        return (
          <div className="animate-in fade-in duration-500">
            <section className="relative h-[500px] flex items-center justify-center text-white overflow-hidden rounded-b-[4rem]">
              <img src="https://images.unsplash.com/photo-1600585154340-be6191da95b8?auto=format&fit=crop&w=1200&q=80" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 text-center max-w-2xl px-6">
                <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Encontre o seu imóvel de sonho em Portugal</h1>
                <div className="bg-white/95 backdrop-blur p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl">
                  <div className="flex-1 flex items-center px-4 py-3 bg-slate-50 rounded-xl text-slate-400 border border-slate-100">
                    <Search size={18} className="mr-2" />
                    <span className="text-xs font-bold">Localização...</span>
                  </div>
                  <button className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest">Pesquisar</button>
                </div>
              </div>
            </section>
          </div>
        );
      case 'list': return <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Catálogo Simulado</div>;
      case 'detail': return <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Página do Imóvel Simulada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-brand">
      {renderHeader()}

      <main className="pt-28 px-6 max-w-7xl mx-auto">
        
        {/* STEP 1: SELECT TEMPLATE */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderProgressBar()}
            <div className="text-center mb-16">
              <h1 className="text-4xl font-black text-[#1c2d51] mb-4 tracking-tighter">Escolha o site da sua imobiliária</h1>
              <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                Selecione um modelo de site. Pode alterar o template a qualquer momento durante o teste gratuito, sem perder os seus dados.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`group relative bg-white rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                    selectedTemplate === tmpl.id ? 'border-[#1c2d51] shadow-2xl scale-[1.02]' : 'border-transparent shadow-sm hover:shadow-xl hover:translate-y-[-4px]'
                  }`}>
                  <div className="h-56 bg-slate-100 relative group-hover:overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={(e) => { e.stopPropagation(); setIsPreviewing(tmpl.id); }}
                         className="bg-white/90 backdrop-blur px-6 py-3 rounded-xl font-black text-xs text-[#1c2d51] flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                       >
                         <Eye size={16} /> Pré-visualizar
                       </button>
                    </div>
                    <div className="p-6 h-full flex flex-col gap-3">
                       <div className="h-4 w-1/3 rounded-full" style={{ backgroundColor: tmpl.color, opacity: 0.2 }}></div>
                       <div className="flex-1 bg-white rounded-t-xl border border-slate-100 shadow-sm overflow-hidden p-3 space-y-2">
                          <div className="h-2 w-1/2 bg-slate-50 rounded"></div>
                          <div className="h-24 bg-slate-50 rounded-lg"></div>
                       </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-black text-[#1c2d51]">{tmpl.name}</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#357fb2]">{tmpl.tag}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {tmpl.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-400 leading-tight">
                          <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                          {b}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-3">
                      <button onClick={(e) => { e.stopPropagation(); setIsPreviewing(tmpl.id); }} className="flex-1 py-3.5 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">Pré-visualizar</button>
                      <button className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTemplate === tmpl.id ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                        {selectedTemplate === tmpl.id ? 'Selecionado' : 'Selecionar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: IDENTITY */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {renderProgressBar()}
            
            <div className="flex flex-col lg:flex-row gap-12 items-start mb-20">
              <div className="flex-1 space-y-10 w-full">
                <div className="mb-4">
                   <h2 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Identidade da sua imobiliária</h2>
                   <p className="text-slate-500 font-medium">Personalize o seu site com a sua marca.</p>
                </div>
                {/* Simplified form for Step 2 demo flow */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nome comercial da imobiliária *</label>
                     <input type="text" value={identity.name} onChange={(e) => setIdentity({...identity, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-lg" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Slogan</label>
                     <div className="relative">
                        <input type="text" value={identity.slogan} onChange={(e) => setIdentity({...identity, slogan: e.target.value})} className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-lg" />
                        <button onClick={handleGenerateSlogan} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                          {isGeneratingSlogan ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        </button>
                     </div>
                   </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 pt-10">
                   <button onClick={nextStep} className="flex-1 py-6 text-slate-400 font-black uppercase tracking-widest text-xs">Saltar este passo</button>
                   <button onClick={nextStep} className="flex-[2] bg-[#1c2d51] text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-[#1c2d51]/20">Guardar e continuar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PUBLISH FIRST PROPERTY */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {renderProgressBar()}

            <div className="flex flex-col lg:flex-row gap-12 items-start mb-20">
              {/* Form Column */}
              <div className="flex-1 space-y-8 w-full">
                <div className="mb-4">
                  <h2 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Publique o seu primeiro imóvel</h2>
                  <p className="text-slate-500 font-medium">Crie um imóvel de exemplo para ver o seu site em ação.</p>
                </div>

                {/* Secção 1: Dados Essenciais */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Tag size={20} /></div>
                    <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Dados Essenciais</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tipo de Negócio *</label>
                      <div className="flex bg-slate-50 p-1 rounded-xl">
                        {['venda', 'arrendamento'].map(n => (
                          <button 
                            key={n}
                            onClick={() => setProperty({...property, negocio: n})}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${property.negocio === n ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400'}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Preço (€) *</label>
                      <div className="relative">
                        <Euro size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          type="number" 
                          value={property.preco} 
                          onChange={(e) => setProperty({...property, preco: e.target.value})}
                          placeholder="0.00" 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold text-sm" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tipo de Imóvel *</label>
                      <select 
                        value={property.tipo}
                        onChange={(e) => setProperty({...property, tipo: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold text-sm appearance-none"
                      >
                        <option>Apartamento</option>
                        <option>Moradia</option>
                        <option>Terreno</option>
                        <option>Comercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tipologia *</label>
                      <select 
                        value={property.tipologia}
                        onChange={(e) => setProperty({...property, tipologia: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold text-sm appearance-none"
                      >
                        <option>T0</option><option>T1</option><option>T2</option><option>T3</option><option>T4+</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Secção 2: Conteúdo Comercial */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Sparkles size={20} /></div>
                    <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Conteúdo Comercial</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Título do Anúncio *</label>
                      <input 
                        type="text" 
                        value={property.titulo}
                        onChange={(e) => setProperty({...property, titulo: e.target.value})}
                        placeholder="Ex: Apartamento T2 no centro de Lisboa com terraço" 
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#1c2d51]" 
                      />
                    </div>
                    <div className="relative">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição do Imóvel</label>
                        <button 
                          onClick={handleGenerateDesc}
                          disabled={!property.titulo || isGeneratingDescription}
                          className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50"
                        >
                          {isGeneratingDescription ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Gerar com IA
                        </button>
                      </div>
                      <textarea 
                        rows={4}
                        value={property.descricao}
                        onChange={(e) => setProperty({...property, descricao: e.target.value})}
                        placeholder="Descreva o imóvel ou use o botão acima para gerar automaticamente..."
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium text-sm focus:ring-2 focus:ring-[#1c2d51]"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Secção 3: Fotografias */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ImageIcon size={20} /></div>
                    <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Fotografias</h3>
                  </div>

                  <div 
                    onClick={() => propertyPhotoRef.current?.click()}
                    className="border-2 border-dashed border-slate-100 rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <input type="file" ref={propertyPhotoRef} onChange={handlePropertyPhotoUpload} className="hidden" multiple accept="image/*" />
                    {property.fotos.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto w-full pb-2">
                        {property.fotos.map((f, i) => (
                          <div key={i} className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                             <img src={f} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300">
                           <Plus size={20} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-2"><Camera size={18} /></div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adicionar até 5 fotos</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-10">
                   <button onClick={nextStep} className="flex-1 py-6 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-[#1c2d51] transition-colors">Guardar rascunho</button>
                   <button 
                      onClick={nextStep}
                      className="flex-[2] bg-[#1c2d51] text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-[#1c2d51]/20 hover:-translate-y-1 transition-all"
                   >
                     Publicar imóvel <ArrowRight size={22} />
                   </button>
                </div>
              </div>

              {/* Sidebar Column: Live Property Preview */}
              <div className="hidden lg:block sticky top-28 w-96 shrink-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Eye size={14} /> Preview do Imóvel no Site
                </div>
                
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-50 group">
                   <div className="h-56 bg-slate-100 relative overflow-hidden">
                      {property.fotos[0] ? (
                        <img src={property.fotos[0]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                           <ImageIcon size={48} strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                        {property.negocio}
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white px-4 py-2 rounded-xl font-black text-lg shadow-xl">
                          {property.preco ? formatCurrency(Number(property.preco)) : '0 €'}
                        </div>
                      </div>
                   </div>
                   <div className="p-8">
                      <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <MapPin size={10} /> {property.distrito}
                      </div>
                      <h4 className="text-xl font-black text-[#1c2d51] mb-6 leading-tight line-clamp-2">
                        {property.titulo || 'O seu título aqui...'}
                      </h4>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50 text-slate-400">
                        <div className="flex items-center gap-2">
                          <Bed size={16} /> <span className="text-xs font-black">{property.tipologia}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bath size={16} /> <span className="text-xs font-black">--</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Square size={16} /> <span className="text-xs font-black">-- m²</span>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-4">
                   <Info size={20} className="text-blue-500 shrink-0" />
                   <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                     O seu imóvel aparecerá automaticamente na Homepage e na Listagem do template escolhido.
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS / CONCLUDED */}
        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto text-center py-10 animate-in zoom-in duration-700">
             <div className="relative inline-block mb-12">
               <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[3rem] flex items-center justify-center mx-auto relative z-10 animate-bounce">
                 <Check size={64} strokeWidth={3} />
               </div>
               <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 animate-pulse delay-100">
                 <Sparkles size={24} />
               </div>
               <div className="absolute -bottom-2 -left-4 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 animate-pulse delay-300">
                 <Rocket size={20} />
               </div>
             </div>

             <h2 className="text-5xl font-black text-[#1c2d51] mb-6 tracking-tighter">Parabéns! O seu site está vivo.</h2>
             <p className="text-xl text-slate-500 font-medium mb-16 max-w-2xl mx-auto leading-relaxed">
               Configurou a sua marca e publicou o seu primeiro imóvel. Agora a sua agência está preparada para dominar o mercado digital.
             </p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
               <button 
                  onClick={() => navigate('/demo')}
                  className="group bg-white border-2 border-slate-100 p-8 rounded-[3rem] text-left hover:border-[#357fb2]/20 hover:shadow-2xl transition-all"
               >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Globe size={24} />
                  </div>
                  <h4 className="text-xl font-black text-[#1c2d51] mb-2">Ver Site Público</h4>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    Visualizar como os seus clientes verão <ExternalLink size={12} />
                  </p>
               </button>

               <button 
                  onClick={handleFinishOnboarding}
                  className="group bg-[#1c2d51] p-8 rounded-[3rem] text-left hover:shadow-2xl hover:shadow-[#1c2d51]/30 transition-all hover:-translate-y-1"
               >
                  <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                    <Layout size={24} />
                  </div>
                  <h4 className="text-xl font-black text-white mb-2">Ir para a Dashboard</h4>
                  <p className="text-xs font-bold text-white/50 flex items-center gap-2">
                    Gerir imóveis, leads e equipa <ArrowRight size={12} />
                  </p>
               </button>
             </div>

             <p className="mt-20 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
               ImoSuite SaaS • O seu parceiro tecnológico
             </p>
          </div>
        )}
      </main>

      {/* FIXED FOOTER CTA BAR (Step 1 Only) */}
      {selectedTemplate && currentStep === 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 flex items-center justify-center z-40 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-4 px-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Layout size={20} className="text-[#357fb2]" />
               </div>
               <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Template Selecionado</div>
                  <div className="text-lg font-black text-[#1c2d51] leading-none">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</div>
               </div>
            </div>
            <button onClick={nextStep} className="w-full md:w-auto bg-[#1c2d51] text-white px-12 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-[#1c2d51]/30 hover:-translate-y-1 transition-all">
              Continuar configuração <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* DETAILED PREVIEW MODAL */}
      {isPreviewing && (
        <div className="fixed inset-0 z-[100] bg-[#1c2d51]/98 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
          <div className="w-full h-full flex flex-col">
            <div className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0 shadow-sm z-50">
              <button onClick={() => setIsPreviewing(null)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1c2d51] transition-colors">
                <ChevronLeft size={16} strokeWidth={3} /> Voltar à escolha
              </button>
              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                {[
                  { id: 'home', label: 'Homepage' },
                  { id: 'list', label: 'Listagem' },
                  { id: 'detail', label: 'Detalhe do imóvel' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setPreviewTab(tab.id as any)} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewTab === tab.id ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
                ))}
              </div>
              <button onClick={() => { setSelectedTemplate(isPreviewing); setIsPreviewing(null); }} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1c2d51]/20 hover:-translate-y-0.5 transition-all">Usar este template</button>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">{renderPreviewContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
