
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { 
  Check, 
  ArrowRight, 
  Layout, 
  Building2, 
  Rocket, 
  Eye, 
  Star, 
  ChevronLeft,
  Sparkles,
  Upload,
  Clock,
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
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
  ArrowUpRight,
  Globe,
  HelpCircle
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
  }
];

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { tenant, setTenant } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'home' | 'list' | 'detail'>('home');
  
  const [identity, setIdentity] = useState({
    name: tenant.nome || '',
    slogan: '',
    logo: null as string | null,
    primaryColor: tenant.cor_primaria || '#1c2d51',
    secondaryColor: tenant.cor_secundaria || '#357fb2',
    email: tenant.email || '',
    phone: tenant.telefone || '',
    address: ''
  });

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
    if (file && (file instanceof Blob)) {
      const reader = new FileReader();
      reader.onloadend = () => setIdentity(prev => ({ ...prev, logo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handlePropertyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        if (file instanceof Blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setProperty(prev => ({ 
              ...prev, 
              fotos: [...prev.fotos, reader.result as string].slice(0, 5) 
            }));
          };
          reader.readAsDataURL(file);
        }
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
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-500">
            {renderProgressBar()}
            <div className="text-center mb-16">
              <h1 className="text-4xl font-black text-[#1c2d51] mb-4">Escolha o seu template</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} onClick={() => setSelectedTemplate(tmpl.id)} className={`bg-white p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all ${selectedTemplate === tmpl.id ? 'border-[#1c2d51] shadow-xl' : 'border-transparent shadow-sm'}`}>
                  <h3 className="text-xl font-black mb-2">{tmpl.name}</h3>
                  <p className="text-sm text-slate-500 mb-6">{tmpl.description}</p>
                  <button className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs ${selectedTemplate === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {selectedTemplate === tmpl.id ? 'Selecionado' : 'Selecionar'}
                  </button>
                </div>
              ))}
            </div>
            {selectedTemplate && (
              <div className="flex justify-center mt-12">
                <button onClick={nextStep} className="bg-[#1c2d51] text-white px-12 py-5 rounded-2xl font-black flex items-center gap-3">
                  Continuar <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in fade-in duration-500">
            {renderProgressBar()}
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm max-w-2xl mx-auto">
              <h2 className="text-3xl font-black text-[#1c2d51] mb-8">Identidade</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Nome Comercial</label>
                  <input type="text" value={identity.name} onChange={(e) => setIdentity({...identity, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Slogan</label>
                  <div className="relative">
                    <input type="text" value={identity.slogan} onChange={(e) => setIdentity({...identity, slogan: e.target.value})} className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                    <button onClick={handleGenerateSlogan} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600">
                      {isGeneratingSlogan ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    </button>
                  </div>
                </div>
                <button onClick={nextStep} className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black mt-10">Continuar</button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in duration-500">
            {renderProgressBar()}
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm max-w-2xl mx-auto">
              <h2 className="text-3xl font-black text-[#1c2d51] mb-8">Primeiro Imóvel</h2>
              <div className="space-y-6">
                <input type="text" placeholder="Título do anúncio" value={property.titulo} onChange={(e) => setProperty({...property, titulo: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                <div className="relative">
                  <textarea rows={3} placeholder="Descrição..." value={property.descricao} onChange={(e) => setProperty({...property, descricao: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium"></textarea>
                  <button onClick={handleGenerateDesc} className="absolute right-4 top-4 text-blue-600">
                    {isGeneratingDescription ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  </button>
                </div>
                <button onClick={nextStep} className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black mt-10">Publicar Imóvel</button>
              </div>
            </div>
          </div>
        )}

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
