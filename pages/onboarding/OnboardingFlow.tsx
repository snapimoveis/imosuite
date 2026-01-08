
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
  Brush,
  X,
  Info,
  // Add missing Clock icon import
  Clock
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
          {/* Using the imported Clock icon */}
          <Clock size={14} /> ⏳ Configuração Inicial
        </div>
      </header>

      <main className="pt-28 px-6 max-w-7xl mx-auto">
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-black text-[#1c2d51] mb-4 tracking-tighter">Escolha a face do seu negócio</h1>
              <p className="text-slate-500 font-medium">Selecione o estilo visual que melhor representa a sua agência.</p>
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

        {/* ... Passos 2 e 3 mantidos ... */}
        {currentStep === 2 && (
          <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
              <h2 className="text-3xl font-black text-[#1c2d51] mb-8 tracking-tighter">Identidade Visual</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Slogan Criativo (Gemini AI)</label>
                  <div className="relative">
                    <input type="text" value={identity.slogan} onChange={(e) => setIdentity({...identity, slogan: e.target.value})} className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]" placeholder="Ex: Construindo o seu futuro." />
                    <button onClick={handleGenerateSlogan} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600 hover:scale-110 transition-transform">
                      {isGeneratingSlogan ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Cor da Marca</label>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                    <input type="color" value={identity.primaryColor} onChange={(e) => setIdentity({...identity, primaryColor: e.target.value})} className="w-10 h-10 rounded-lg border-none cursor-pointer bg-transparent" />
                    <span className="text-xs font-black uppercase tracking-widest text-[#1c2d51]">{identity.primaryColor}</span>
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <button onClick={prevStep} className="flex-1 bg-slate-50 text-slate-400 py-5 rounded-2xl font-black uppercase text-xs tracking-widest">Voltar</button>
                  <button onClick={nextStep} className="flex-[2] bg-[#1c2d51] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">Continuar</button>
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
                <input type="text" placeholder="Título do Anúncio (ex: T3 em Lisboa)" value={property.titulo} onChange={(e) => setProperty({...property, titulo: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Preço (€)" value={property.preco} onChange={(e) => setProperty({...property, preco: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]" />
                  <input type="text" placeholder="Localidade" value={property.concelho} onChange={(e) => setProperty({...property, concelho: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 flex justify-between">
                    Descrição Profissional
                    <button onClick={handleGenerateDesc} className="text-blue-600 flex items-center gap-1 hover:scale-105 transition-transform">
                      {isGeneratingDescription ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Gerar com IA
                    </button>
                  </label>
                  <textarea rows={4} value={property.descricao} onChange={(e) => setProperty({...property, descricao: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium text-slate-600 leading-relaxed"></textarea>
                </div>
                <button onClick={handleFinishOnboarding} disabled={isFinishing} className="w-full bg-[#1c2d51] text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl">
                  {isFinishing ? <Loader2 className="animate-spin" /> : 'Finalizar e Publicar Site'}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto py-10 animate-in zoom-in-95 duration-700 text-center">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce shadow-lg"><Check size={40} strokeWidth={4} /></div>
             <h2 className="text-5xl font-black text-[#1c2d51] mb-4 tracking-tighter">Parabéns!</h2>
             <p className="text-xl text-slate-400 mb-12 font-medium">O portal da imobiliária <strong>{tenant.nome}</strong> já está no ar.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button onClick={() => navigate(`/agencia/${tenant.slug}`)} className="bg-[#1c2d51] text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl hover:-translate-y-1 transition-all"><Globe size={24}/> Abrir Website</button>
                <button onClick={() => navigate('/admin')} className="bg-white border border-slate-100 py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"><BarChart3 size={24}/> Gestão Interna</button>
             </div>
          </div>
        )}
      </main>

      {/* MODAL DE PRÉ-VISUALIZAÇÃO MODERNA */}
      {previewingTemplate && (
        <TemplatePreviewModal 
          templateId={previewingTemplate} 
          onClose={() => setPreviewingTemplate(null)} 
          onSelect={() => {
            setSelectedTemplate(previewingTemplate);
            setPreviewingTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// COMPONENTE DE PREVIEW INTERATIVO
const TemplatePreviewModal = ({ templateId, onClose, onSelect }: { templateId: string, onClose: () => void, onSelect: () => void }) => {
  const [activePage, setActivePage] = useState<'home' | 'list' | 'detail'>('home');
  const template = TEMPLATES.find(t => t.id === templateId);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      {/* HEADER FIXO DA PRÉ-VISUALIZAÇÃO */}
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
            <ChevronLeft size={16}/> Voltar
          </button>
          <div className="h-6 w-px bg-slate-100 mx-2"></div>
          <div>
            <span className="text-[8px] font-black uppercase text-slate-300 block tracking-widest">Template</span>
            <span className="text-sm font-black text-[#1c2d51] tracking-tighter">{template?.name}</span>
          </div>
        </div>

        {/* SELECTOR DE PÁGINAS */}
        <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center gap-1">
          <PageTab active={activePage === 'home'} onClick={() => setActivePage('home')} label="Homepage" />
          <PageTab active={activePage === 'list'} onClick={() => setActivePage('list')} label="Listagem" />
          <PageTab active={activePage === 'detail'} onClick={() => setActivePage('detail')} label="Detalhe do Imóvel" />
        </div>

        <button 
          onClick={onSelect}
          className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
        >
          Usar este Template
        </button>
      </header>

      {/* ÁREA DE CONTEÚDO DINÂMICA */}
      <div className="flex-1 overflow-y-auto bg-slate-50 relative">
        <div className="max-w-[1440px] mx-auto min-h-full shadow-2xl bg-white">
          {activePage === 'home' && <PreviewHome template={template} />}
          {activePage === 'list' && <PreviewList template={template} />}
          {activePage === 'detail' && <PreviewDetail template={template} />}
        </div>

        {/* OVERLAYS INFORMATIVOS (TOOLTIPS) */}
        <div className="fixed bottom-10 right-10 flex flex-col gap-4 max-w-xs animate-in slide-in-from-bottom-10">
          <Tooltip text="Os seus imóveis reais aparecerão aqui" icon={<Building2 size={14}/>} />
          <Tooltip text="As descrições podem ser geradas com IA" icon={<Sparkles size={14}/>} />
        </div>
      </div>
      
      {/* FOOTER FIXO (OPCIONAL) */}
      <footer className="h-10 bg-slate-900 text-white/40 flex items-center justify-center text-[8px] font-black uppercase tracking-[0.4em] shrink-0">
        ImoSuite EcoSystem &bull; Live Preview Mode
      </footer>
    </div>
  );
};

const PageTab = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {label}
  </button>
);

const Tooltip = ({ text, icon }: { text: string, icon: any }) => (
  <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-blue-100 flex items-center gap-3 text-[10px] font-bold text-[#1c2d51]">
    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">{icon}</div>
    {text}
  </div>
);

/* --- SECÇÕES DE PRÉ-VISUALIZAÇÃO --- */

const PreviewHome = ({ template }: any) => (
  <div className="animate-in fade-in duration-500">
    {/* HERO SECTION */}
    <section className="h-[600px] relative flex items-center justify-center text-center px-10 overflow-hidden">
      <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-slate-900/40"></div>
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-6xl font-black text-white mb-6 tracking-tighter leading-tight">Encontre o lar dos seus sonhos hoje.</h1>
        <p className="text-xl text-white/80 mb-10 font-medium">As melhores oportunidades em Portugal com o selo de confiança ImoSuite.</p>
        <button className="px-10 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl" style={{ backgroundColor: template.color }}>Ver todos os imóveis</button>
      </div>
    </section>

    {/* PESQUISA RÁPIDA */}
    <section className="max-w-4xl mx-auto -mt-16 relative z-20">
      <div className="bg-white p-4 rounded-3xl shadow-2xl flex gap-4 border border-slate-100">
        <div className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest">Tipo de Imóvel</div>
        <div className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest">Localização</div>
        <div className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest">Preço Máx</div>
        <button className="px-10 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest" style={{ backgroundColor: template.color }}>Pesquisar</button>
      </div>
    </section>

    {/* DESTAQUES */}
    <section className="py-24 px-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-black text-[#1c2d51] mb-12 tracking-tighter">Imóveis em Destaque</h2>
      <div className="grid grid-cols-3 gap-8">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 group cursor-pointer shadow-sm hover:shadow-xl transition-all">
            <div className="h-48 bg-slate-100 relative overflow-hidden">
               <img src={`https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80&sig=${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
               <div className="absolute top-4 left-4 bg-white/90 text-slate-900 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Venda</div>
            </div>
            <div className="p-6">
              <h4 className="font-black text-sm text-[#1c2d51] mb-2">Apartamento Moderno T2</h4>
              <p className="text-lg font-black" style={{ color: template.color }}>350.000 €</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* INDICADORES DE CONFIANÇA */}
    <section className="bg-slate-50 py-20 px-10">
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-12 text-center">
        <div>
          <div className="text-4xl font-black text-[#1c2d51] mb-2 tracking-tighter">15+</div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Anos de experiência</div>
        </div>
        <div>
          <div className="text-4xl font-black text-[#1c2d51] mb-2 tracking-tighter">1.2k</div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Imóveis Vendidos</div>
        </div>
        <div>
          <div className="text-4xl font-black text-[#1c2d51] mb-2 tracking-tighter">98%</div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Clientes Satisfeitos</div>
        </div>
      </div>
    </section>
  </div>
);

const PreviewList = ({ template }: any) => (
  <div className="animate-in fade-in duration-500 py-16 px-10">
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-[#1c2d51] tracking-tighter mb-8">Todos os Imóveis</h2>
        {/* FILTROS */}
        <div className="flex flex-wrap gap-3 mb-12">
          {['Tipo', 'Tipologia', 'Distrito', 'Preço'].map(f => (
            <div key={f} className="px-6 py-3 bg-slate-50 rounded-xl font-bold text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-4">
              {f} <ChevronDown size={14} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-10">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 group">
             <div className="h-60 bg-slate-200 overflow-hidden relative">
               <img src={`https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80&sig=${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
               <div className="absolute top-6 left-6 bg-white/95 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Moradia</div>
             </div>
             <div className="p-8">
               <h3 className="font-black text-xl text-[#1c2d51] mb-4">Moradia Exclusiva V4</h3>
               <div className="flex justify-between items-center">
                 <span className="text-xl font-black" style={{ color: template.color }}>{formatCurrency(850000)}</span>
                 <div className="flex gap-4 opacity-40 text-[9px] font-black uppercase tracking-widest">
                   <span><Bed size={12} className="inline mr-1" /> V4</span>
                   <span><Square size={12} className="inline mr-1" /> 240m²</span>
                 </div>
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* PAGINAÇÃO */}
      <div className="mt-20 flex justify-center items-center gap-4">
        <button className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300"><ChevronLeft size={20}/></button>
        <button className="w-12 h-12 bg-[#1c2d51] text-white rounded-xl font-black text-sm">1</button>
        <button className="w-12 h-12 bg-white border border-slate-100 text-slate-400 rounded-xl font-black text-sm">2</button>
        <button className="w-12 h-12 bg-white border border-slate-100 text-slate-400 rounded-xl font-black text-sm">3</button>
        <button className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300"><ChevronRight size={20}/></button>
      </div>
    </div>
  </div>
);

const PreviewDetail = ({ template }: any) => (
  <div className="animate-in fade-in duration-500 pb-24">
    {/* GALERIA */}
    <div className="h-[500px] grid grid-cols-4 gap-2 bg-slate-50 p-2">
      <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl">
        <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200" className="w-full h-full object-cover" />
      </div>
      <div className="overflow-hidden rounded-2xl"><img src="https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?w=800" className="w-full h-full object-cover" /></div>
      <div className="overflow-hidden rounded-2xl"><img src="https://images.unsplash.com/photo-1600585154526-990dcea4db0d?w=800" className="w-full h-full object-cover" /></div>
      <div className="overflow-hidden rounded-2xl"><img src="https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800" className="w-full h-full object-cover" /></div>
      <div className="overflow-hidden rounded-2xl relative">
        <img src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800" className="w-full h-full object-cover blur-sm" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-black text-white text-xs">+12 Fotos</div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-10 py-16 grid grid-cols-3 gap-16">
      <div className="col-span-2 space-y-12">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
            <MapPin size={14} className="text-blue-500" /> Alcântara, Lisboa &bull; Ref: IMO-2024
          </div>
          <h1 className="text-5xl font-black text-[#1c2d51] tracking-tighter mb-8 leading-tight">Apartamento T3 Renovado com Vista Rio</h1>
          
          <div className="grid grid-cols-4 gap-8 py-8 border-y border-slate-100">
            <div><p className="text-[8px] font-black uppercase text-slate-300 mb-1">Preço</p><p className="font-black text-xl" style={{ color: template.color }}>450.000 €</p></div>
            <div><p className="text-[8px] font-black uppercase text-slate-300 mb-1">Tipologia</p><p className="font-black text-xl text-[#1c2d51]">T3</p></div>
            <div><p className="text-[8px] font-black uppercase text-slate-300 mb-1">Área</p><p className="font-black text-xl text-[#1c2d51]">120m²</p></div>
            <div><p className="text-[8px] font-black uppercase text-slate-300 mb-1">WC</p><p className="font-black text-xl text-[#1c2d51]">2</p></div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-[#1c2d51] mb-6 flex items-center gap-2">
            <Info size={14}/> Descrição do Imóvel
          </h3>
          <p className="text-slate-500 leading-relaxed font-medium">
            Este magnífico apartamento T3, recentemente renovado com materiais de alta qualidade, oferece uma experiência de vida urbana inigualável. Localizado no coração de Alcântara, destaca-se pela sua luminosidade natural e vista panorâmica sobre o Rio Tejo...
          </p>
        </div>

        <div>
           <h3 className="text-xs font-black uppercase tracking-widest text-[#1c2d51] mb-6">Características Principais</h3>
           <div className="grid grid-cols-3 gap-4">
             {['Ar Condicionado', 'Cozinha Equipada', 'Varanda', 'Garagem', 'Elevador', 'Segurança 24h'].map(c => (
               <div key={c} className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                 <Check size={12} className="text-emerald-500" /> {c}
               </div>
             ))}
           </div>
        </div>
        
        {/* MAPA PLACEHOLDER */}
        <div className="h-64 bg-slate-100 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group border border-slate-200">
           <MapPin size={40} className="text-slate-300 animate-bounce" />
           <p className="absolute bottom-4 font-black uppercase text-[8px] tracking-[0.3em] text-slate-400">Mapa Interativo (Demo)</p>
        </div>
      </div>

      {/* CONTACTO */}
      <div className="space-y-6">
        <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h4 className="font-black text-[#1c2d51] text-lg mb-6 tracking-tighter">Agendar Visita</h4>
          <div className="space-y-4">
            <div className="h-12 bg-white rounded-xl border border-slate-100"></div>
            <div className="h-12 bg-white rounded-xl border border-slate-100"></div>
            <div className="h-24 bg-white rounded-xl border border-slate-100"></div>
            <button className="w-full py-4 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg" style={{ backgroundColor: template.color }}>Enviar Mensagem</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ChevronDown = ({ size, className }: any) => <ChevronLeft size={size} className={`rotate-270 ${className}`} />;
const ChevronRight = ({ size, className }: any) => <ChevronLeft size={size} className={`rotate-180 ${className}`} />;

export default OnboardingFlow;
