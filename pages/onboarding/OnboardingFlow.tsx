
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
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
  HelpCircle,
  Zap,
  Brush
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { formatCurrency } from '../../lib/utils';
import { generateAgencySlogan, generatePropertyDescription } from '../../services/geminiService';
import { PropertyService } from '../../services/propertyService';

const TEMPLATES = [
  {
    id: 'heritage',
    name: 'Heritage',
    icon: <Building2 />,
    color: '#1c2d51',
    description: 'Tradição e confiança para agências familiares.'
  },
  {
    id: 'canvas',
    name: 'Canvas',
    icon: <Layout />,
    color: '#357fb2',
    description: 'Design moderno, limpo e focado no imóvel.'
  },
  {
    id: 'prestige',
    name: 'Prestige',
    icon: <Star />,
    color: '#000000',
    description: 'Minimalismo de luxo para o mercado premium.'
  },
  {
    id: 'skyline',
    name: 'Skyline',
    icon: <Zap />,
    color: '#10b981',
    description: 'Dinâmico, urbano e tecnológico.'
  },
  {
    id: 'luxe',
    name: 'Luxe',
    icon: <Brush />,
    color: '#f59e0b',
    description: 'Expressivo, artístico e focado em lifestyle.'
  }
];

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { tenant, setTenant } = useTenant();
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const [identity, setIdentity] = useState({
    name: tenant.nome || '',
    slogan: '',
    primaryColor: tenant.cor_primaria || '#1c2d51',
    secondaryColor: tenant.cor_secundaria || '#357fb2',
    email: tenant.email || '',
    phone: tenant.telefone || '',
  });

  const [property, setProperty] = useState({
    negocio: 'venda' as 'venda' | 'arrendamento',
    tipo: 'Apartamento',
    preco: '450000',
    concelho: 'Lisboa',
    titulo: '',
    descricao: '',
  });

  const [isGeneratingSlogan, setIsGeneratingSlogan] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinishOnboarding = async () => {
    if (!profile?.tenantId) return;
    setIsFinishing(true);
    try {
      if (property.titulo) {
        await PropertyService.createProperty(profile.tenantId, {
          titulo: property.titulo,
          descricao_md: property.descricao,
          tipo_imovel: property.tipo,
          concelho: property.concelho,
          distrito: 'Lisboa',
          preco: Number(property.preco),
          tipo_negocio: property.negocio,
          referencia: `INI-${Math.floor(Math.random() * 999)}`,
          slug: property.titulo.toLowerCase().replace(/\s+/g, '-')
        });
      }

      const tenantRef = doc(db, 'tenants', profile.tenantId);
      const updates = {
        template_id: selectedTemplate,
        slogan: identity.slogan,
        cor_primaria: identity.primaryColor,
        cor_secundaria: identity.secondaryColor,
        email: identity.email,
        telefone: identity.phone,
        onboarding_completed: true,
        updated_at: serverTimestamp()
      };
      
      await updateDoc(tenantRef, updates);
      setTenant({ ...tenant, ...updates });
      nextStep();
    } catch (err) {
      console.error("Erro ao finalizar onboarding:", err);
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

  const handleGenerateDesc = async () => {
    if (!property.titulo) return;
    setIsGeneratingDescription(true);
    try {
      const desc = await generatePropertyDescription({
        titulo: property.titulo,
        tipo_imovel: property.tipo,
        concelho: property.concelho,
        distrito: 'Lisboa',
      });
      setProperty(prev => ({ ...prev, descricao: desc }));
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-brand">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-50">
        <Logo size="sm" />
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Clock size={14} /> ⏳ Configuração Inicial
        </div>
      </header>

      <main className="pt-28 px-6 max-w-7xl mx-auto">
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-black text-[#1c2d51] mb-4">Selecione o estilo do site</h1>
              <p className="text-slate-500">O site será acessível em <strong>imosuite.pt/#/agencia/{tenant.slug}</strong></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} onClick={() => setSelectedTemplate(tmpl.id)} className={`bg-white p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedTemplate === tmpl.id ? 'border-[#1c2d51] shadow-xl' : 'border-transparent opacity-80'}`}>
                  <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-white" style={{ backgroundColor: tmpl.color }}>
                    {tmpl.icon}
                  </div>
                  <h3 className="text-lg font-black mb-1">{tmpl.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold leading-tight">{tmpl.description}</p>
                </div>
              ))}
            </div>
            {selectedTemplate && (
              <div className="flex justify-center mt-12">
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
              <h2 className="text-3xl font-black text-[#1c2d51] mb-8">Identidade</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Slogan Criativo (Gemini AI)</label>
                  <div className="relative">
                    <input type="text" value={identity.slogan} onChange={(e) => setIdentity({...identity, slogan: e.target.value})} className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" placeholder="Deixe-me criar um slogan..." />
                    <button onClick={handleGenerateSlogan} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600">
                      {isGeneratingSlogan ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Cor da Marca</label>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                    <input type="color" value={identity.primaryColor} onChange={(e) => setIdentity({...identity, primaryColor: e.target.value})} className="w-10 h-10 rounded-lg border-none cursor-pointer bg-transparent" />
                    <span className="text-xs font-black uppercase">{identity.primaryColor}</span>
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black">Voltar</button>
                  <button onClick={nextStep} className="flex-[2] bg-[#1c2d51] text-white py-5 rounded-2xl font-black">Continuar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
              <h2 className="text-3xl font-black text-[#1c2d51] mb-8 tracking-tighter">Primeiro Imóvel Real</h2>
              <div className="space-y-6">
                <input type="text" placeholder="Título do Anúncio" value={property.titulo} onChange={(e) => setProperty({...property, titulo: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Preço (€)" value={property.preco} onChange={(e) => setProperty({...property, preco: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                  <input type="text" placeholder="Localidade" value={property.concelho} onChange={(e) => setProperty({...property, concelho: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 flex justify-between">
                    Descrição (Gemini AI)
                    <button onClick={handleGenerateDesc} className="text-blue-600 flex items-center gap-1">
                      {isGeneratingDescription ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Gerar
                    </button>
                  </label>
                  <textarea rows={4} value={property.descricao} onChange={(e) => setProperty({...property, descricao: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium"></textarea>
                </div>
                <button onClick={handleFinishOnboarding} disabled={isFinishing} className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-2">
                  {isFinishing ? <Loader2 className="animate-spin" /> : 'Publicar Site'}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto py-10 animate-in zoom-in-95 duration-700 text-center">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce"><Check size={40} strokeWidth={4} /></div>
             <h2 className="text-5xl font-black text-[#1c2d51] mb-4">Tudo pronto!</h2>
             <p className="text-xl text-slate-400 mb-12">O portal da imobiliária <strong>{tenant.nome}</strong> já está ativo.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button onClick={() => navigate(`/agencia/${tenant.slug}`)} className="bg-[#1c2d51] text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl hover:-translate-y-1 transition-all"><Globe size={24}/> Abrir Website</button>
                <button onClick={() => navigate('/admin')} className="bg-white border border-slate-100 py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"><BarChart3 size={24}/> Ir para Backoffice</button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OnboardingFlow;
