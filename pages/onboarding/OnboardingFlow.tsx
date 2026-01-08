
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
  HelpCircle
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { formatCurrency } from '../../lib/utils';
import { generateAgencySlogan, generatePropertyDescription } from '../../services/geminiService';
import { PropertyService } from '../../services/propertyService';

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
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  
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
    negocio: 'venda' as 'venda' | 'arrendamento',
    tipo: 'Apartamento',
    tipologia: 'T2',
    preco: '450000',
    concelho: 'Lisboa',
    distrito: 'Lisboa',
    titulo: '',
    descricao: '',
    fotos: [] as string[]
  });

  const [isGeneratingSlogan, setIsGeneratingSlogan] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinishOnboarding = async () => {
    if (!profile?.tenantId) return;
    setIsFinishing(true);
    try {
      // 1. Gravar primeiro imóvel se houver título
      if (property.titulo) {
        await PropertyService.createProperty(profile.tenantId, {
          titulo: property.titulo,
          descricao_md: property.descricao,
          tipo_imovel: property.tipo,
          tipologia: property.tipologia,
          concelho: property.concelho,
          distrito: property.distrito,
          preco: Number(property.preco),
          tipo_negocio: property.negocio,
          referencia: `INI-${Math.floor(Math.random() * 999)}`,
          slug: property.titulo.toLowerCase().replace(/\s+/g, '-')
        });
      }

      // 2. Atualizar configurações do Tenant no Firestore
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

      // 3. Sincronizar contexto local
      setTenant({ ...tenant, ...updates });
      
      nextStep(); // Vai para o passo final de sucesso
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
          <Clock size={14} /> ⏳ Período de Avaliação Ativo
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
              <h1 className="text-4xl font-black text-[#1c2d51] mb-4">Escolha o estilo do seu portal</h1>
              <p className="text-slate-500">Poderá alterar o template e as cores a qualquer momento.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} onClick={() => setSelectedTemplate(tmpl.id)} className={`bg-white p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all hover:translate-y-[-4px] ${selectedTemplate === tmpl.id ? 'border-[#1c2d51] shadow-2xl' : 'border-transparent shadow-sm'}`}>
                  <div className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center" style={{ backgroundColor: tmpl.color }}>
                    <Layout className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-black mb-2">{tmpl.name}</h3>
                  <p className="text-sm text-slate-500 mb-6">{tmpl.description}</p>
                  <ul className="space-y-3 mb-8">
                    {tmpl.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Check size={14} className="text-emerald-500" /> {b}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs ${selectedTemplate === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {selectedTemplate === tmpl.id ? 'Selecionado' : 'Selecionar'}
                  </button>
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
          <div className="animate-in fade-in duration-500">
            {renderProgressBar()}
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm max-w-2xl mx-auto">
              <h2 className="text-3xl font-black text-[#1c2d51] mb-8">Identidade da Marca</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Nome da Agência</label>
                  <input type="text" value={identity.name} onChange={(e) => setIdentity({...identity, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold focus:ring-2 focus:ring-[#1c2d51]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Slogan Criativo (IA)</label>
                  <div className="relative">
                    <input type="text" value={identity.slogan} onChange={(e) => setIdentity({...identity, slogan: e.target.value})} className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" placeholder="Deixe a IA criar um slogan para si..." />
                    <button onClick={handleGenerateSlogan} disabled={isGeneratingSlogan} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                      {isGeneratingSlogan ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Cor Primária</label>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                      <input type="color" value={identity.primaryColor} onChange={(e) => setIdentity({...identity, primaryColor: e.target.value})} className="w-10 h-10 rounded-lg border-none cursor-pointer bg-transparent" />
                      <span className="text-xs font-black uppercase">{identity.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Email Público</label>
                    <input type="email" value={identity.email} onChange={(e) => setIdentity({...identity, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
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
          <div className="animate-in fade-in duration-500">
            {renderProgressBar()}
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm max-w-2xl mx-auto">
              <h2 className="text-3xl font-black text-[#1c2d51] mb-2 tracking-tighter">Primeiro Imóvel</h2>
              <p className="text-slate-400 text-sm mb-8 font-medium uppercase tracking-widest">Crie um anúncio de teste rápido</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Título do Anúncio</label>
                  <input type="text" placeholder="Ex: Apartamento T2 com Varanda em Alvalade" value={property.titulo} onChange={(e) => setProperty({...property, titulo: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold focus:ring-2 focus:ring-[#1c2d51]" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Tipo</label>
                    <select value={property.tipo} onChange={(e) => setProperty({...property, tipo: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold appearance-none">
                      <option>Apartamento</option>
                      <option>Moradia</option>
                      <option>Terreno</option>
                    </select>
                   </div>
                   <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Preço (€)</label>
                    <input type="number" value={property.preco} onChange={(e) => setProperty({...property, preco: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                   </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 flex justify-between items-center">
                    Descrição Comercial
                    <button onClick={handleGenerateDesc} disabled={isGeneratingDescription || !property.titulo} className="text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-30">
                      {isGeneratingDescription ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Gerar com IA
                    </button>
                  </label>
                  <textarea rows={4} placeholder="Descreva os pontos fortes do imóvel..." value={property.descricao} onChange={(e) => setProperty({...property, descricao: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium"></textarea>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black">Voltar</button>
                  <button onClick={handleFinishOnboarding} disabled={isFinishing} className="flex-[2] bg-[#1c2d51] text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2">
                    {isFinishing ? <Loader2 className="animate-spin" /> : 'Finalizar Configuração'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="max-w-5xl mx-auto py-10 animate-in zoom-in-95 duration-700">
             <div className="text-center mb-16">
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto relative z-10 animate-bounce">
                    <Check size={48} strokeWidth={4} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 animate-pulse">
                    <Sparkles size={16} />
                  </div>
                </div>
                <h2 className="text-5xl font-black text-[#1c2d51] mb-4 tracking-tighter">🎉 ImoSuite Ativado!</h2>
                <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                  O seu ecossistema imobiliário está agora online. Os dados foram gravados e o seu site já está acessível no seu domínio personalizado.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <button 
                   onClick={() => navigate('/demo')}
                   className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      <Globe size={24} />
                   </div>
                   <h4 className="text-lg font-black text-[#1c2d51] mb-1">Ver o portal</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Site público</p>
                   <div className="text-[10px] font-black text-[#357fb2] flex items-center gap-2">
                     Template: {TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Heritage'} <ArrowUpRight size={10} />
                   </div>
                </button>

                <button 
                   onClick={() => navigate('/admin/imoveis')}
                   className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left relative overflow-hidden"
                >
                   <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                      <Building2 size={24} />
                   </div>
                   <h4 className="text-lg font-black text-[#1c2d51] mb-1">Inventário</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Gerir Imóveis</p>
                   <div className="text-[10px] font-black text-emerald-600 flex items-center gap-2">
                     {property.titulo ? '1 imóvel publicado' : '0 imóveis publicados'} <Check size={10} />
                   </div>
                </button>

                <button 
                   onClick={() => navigate('/admin')}
                   className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left relative overflow-hidden"
                >
                   <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                      <BarChart3 size={24} />
                   </div>
                   <h4 className="text-lg font-black text-[#1c2d51] mb-1">Backoffice</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Gestão Total</p>
                   <div className="text-[10px] font-black text-slate-400 flex items-center gap-2">
                     Ir para Dashboard <ArrowRight size={10} />
                   </div>
                </button>
             </div>

             <div className="flex flex-col items-center gap-10">
                <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">
                   <button 
                      onClick={() => navigate('/admin')}
                      className="flex-1 bg-white border-2 border-slate-100 py-6 rounded-3xl font-black text-lg text-[#1c2d51] hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                   >
                     <Layout size={22} /> Ir para o Dashboard
                   </button>
                   <button 
                      onClick={() => navigate('/demo')}
                      className="flex-[1.5] bg-[#1c2d51] text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-[#1c2d51]/20 hover:-translate-y-1 transition-all"
                   >
                     Ver Site da Agência <Globe size={22} />
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OnboardingFlow;
