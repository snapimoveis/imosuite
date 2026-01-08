
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
  Plus,
  BarChart3,
  MessageSquare,
  ArrowUpRight
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
      reader.readAsDataURL(file as unknown as Blob);
    }
  };

  const handlePropertyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProperty(prev => ({ 
            ...prev, 
            fotos: [...prev.fotos, reader.result as string].slice(0, 5) 
          }));
        };
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
              <div className="flex-1 space-y-8 w-full">
                <div className="mb-4">
                  <h2 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Publique o seu primeiro imóvel</h2>
                  <p className="text-slate-500 font-medium">Crie um imóvel de exemplo para ver o seu site em ação.</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Negócio *</label>
                      <div className="flex bg-slate-50 p-1 rounded-xl">
                        {['venda', 'arrendamento'].map(n => (
                          <button key={n} onClick={() => setProperty({...property, negocio: n})} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${property.negocio === n ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400'}`}>{n}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Preço (€) *</label>
                      <input type="number" value={property.preco} onChange={(e) => setProperty({...property, preco: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Título do Anúncio *</label>
                    <input type="text" value={property.titulo} onChange={(e) => setProperty({...property, titulo: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
                  </div>
                  <div className="relative">
                    <button onClick={handleGenerateDesc} className="absolute right-0 -top-6 text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">{isGeneratingDescription ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} IA</button>
                    <textarea rows={3} value={property.descricao} onChange={(e) => setProperty({...property, descricao: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium text-sm"></textarea>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 pt-10">
                   <button onClick={nextStep} className="flex-1 py-6 text-slate-400 font-black uppercase tracking-widest text-xs">Guardar rascunho</button>
                   <button onClick={nextStep} className="flex-[2] bg-[#1c2d51] text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-[#1c2d51]/20">Publicar imóvel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS / EVERYTHING READY (Wireframe Implementation) */}
        {currentStep === 4 && (
          <div className="max-w-5xl mx-auto py-10 animate-in zoom-in-95 duration-700">
             {/* Header Conclusão */}
             <div className="text-center mb-16">
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto relative z-10 animate-bounce">
                    <Check size={48} strokeWidth={4} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 animate-pulse">
                    <Sparkles size={16} />
                  </div>
                </div>
                <h2 className="text-5xl font-black text-[#1c2d51] mb-4 tracking-tighter">🎉 Tudo pronto!</h2>
                <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                  O seu site imobiliário já está online e pronto a receber contactos. Em poucos minutos criou a base digital da sua imobiliária com o ImoSuite.
                </p>
             </div>

             {/* Área Principal - Resumo Visual */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <button 
                   onClick={() => navigate('/demo')}
                   className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      <Globe size={24} />
                   </div>
                   <h4 className="text-lg font-black text-[#1c2d51] mb-1">Ver o site</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Site publicado</p>
                   <div className="text-[10px] font-black text-[#357fb2] flex items-center gap-2">
                     Template: {TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Heritage'} <ArrowUpRight size={10} />
                   </div>
                </button>

                <div className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left relative overflow-hidden">
                   <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                      <Building2 size={24} />
                   </div>
                   <h4 className="text-lg font-black text-[#1c2d51] mb-1">Ver imóvel</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Imóvel ativo</p>
                   <div className="text-[10px] font-black text-emerald-600 flex items-center gap-2">
                     1 imóvel publicado <Check size={10} />
                   </div>
                </div>

                <div className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left relative overflow-hidden">
                   <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                      <MessageSquare size={24} />
                   </div>
                   <h4 className="text-lg font-black text-[#1c2d51] mb-1">Ver contactos</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Leads</p>
                   <div className="text-[10px] font-black text-slate-300 flex items-center gap-2">
                     0 contactos recebidos
                   </div>
                </div>
             </div>

             {/* Próximos Passos */}
             <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-sm mb-16">
                <h3 className="text-2xl font-black text-[#1c2d51] mb-10 tracking-tighter">O que fazer a seguir</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="flex gap-6 items-start group">
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1c2d51] group-hover:bg-[#1c2d51] group-hover:text-white transition-all">
                        <Plus size={24} />
                      </div>
                      <div>
                        <h5 className="font-black text-[#1c2d51] mb-2 uppercase text-[10px] tracking-widest">Publicar mais imóveis</h5>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">Aumente o inventário para melhorar a visibilidade do seu site.</p>
                      </div>
                   </div>

                   <div className="flex gap-6 items-start group">
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1c2d51] group-hover:bg-[#1c2d51] group-hover:text-white transition-all">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h5 className="font-black text-[#1c2d51] mb-2 uppercase text-[10px] tracking-widest">Usar IA nos anúncios</h5>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">Crie descrições comerciais mais eficazes e persuasivas.</p>
                      </div>
                   </div>

                   <div className="flex gap-6 items-start group opacity-60">
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1c2d51]">
                        <Camera size={24} />
                      </div>
                      <div>
                        <h5 className="font-black text-[#1c2d51] mb-2 uppercase text-[10px] tracking-widest">Snap Immobile</h5>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">Prepare-se para integrar fotografia profissional (brevemente).</p>
                      </div>
                   </div>

                   <div className="flex gap-6 items-start group opacity-60">
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1c2d51]">
                        <BarChart3 size={24} />
                      </div>
                      <div>
                        <h5 className="font-black text-[#1c2d51] mb-2 uppercase text-[10px] tracking-widest">Estudos de Mercado</h5>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">Funcionalidade premium disponível na próxima atualização.</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Mensagem de Trial e Footer */}
             <div className="flex flex-col items-center gap-10">
                <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-full border border-blue-100">
                   <Clock size={16} className="text-blue-600" />
                   <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Está no teste gratuito — 11 dias restantes</span>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">
                   <button 
                      onClick={() => navigate('/admin')}
                      className="flex-1 bg-white border-2 border-slate-100 py-6 rounded-3xl font-black text-lg text-[#1c2d51] hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                   >
                     <Layout size={22} /> Ir para o dashboard
                   </button>
                   <button 
                      onClick={() => navigate('/demo')}
                      className="flex-[1.5] bg-[#1c2d51] text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-[#1c2d51]/20 hover:-translate-y-1 transition-all"
                   >
                     Ver o site <Globe size={22} />
                   </button>
                </div>

                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#1c2d51] transition-colors">Conhecer planos e fazer upgrade</button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OnboardingFlow;
