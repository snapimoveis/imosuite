
import React, { useState } from 'react';
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
  Camera
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { formatCurrency } from '../../lib/utils';

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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinishOnboarding = () => {
    setTenant({ ...tenant });
    navigate('/admin');
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
    <div className="max-w-2xl mx-auto mb-16">
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

  // MOCK CONTENT FOR PREVIEW
  const renderPreviewContent = () => {
    const activeTemplate = TEMPLATES.find(t => t.id === isPreviewing);
    
    switch (previewTab) {
      case 'home':
        return (
          <div className="animate-in fade-in duration-500">
            {/* Hero */}
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

            {/* Featured */}
            <section className="py-20 px-6 max-w-5xl mx-auto">
              <div className="flex justify-between items-end mb-10">
                <h2 className="text-2xl font-black text-[#1c2d51]">Imóveis em Destaque</h2>
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest cursor-pointer">Ver todos</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group">
                    <div className="h-48 bg-slate-100 relative">
                       <img src={`https://images.unsplash.com/photo-1600${500+i}5154340-be6191da95b8?auto=format&fit=crop&w=400&q=80`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Property" />
                       <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-black uppercase">Venda</div>
                    </div>
                    <div className="p-6">
                      <div className="text-sm font-black text-[#1c2d51] mb-2">Apartamento Moderno T2</div>
                      <div className="text-[10px] font-bold text-slate-400 mb-4 flex items-center gap-1"><MapPin size={10} /> Lisboa, Alvalade</div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                        <span className="text-lg font-black text-[#1c2d51]">{formatCurrency(350000)}</span>
                        <div className="flex gap-2 text-slate-400">
                           <Bed size={14} /> <span className="text-[10px] font-bold">2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Trust Indicators */}
            <section className="py-20 bg-slate-50 rounded-[4rem] text-center px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
                <div>
                   <div className="text-4xl font-black text-[#1c2d51] mb-2">15+</div>
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Anos de Mercado</div>
                </div>
                <div>
                   <div className="text-4xl font-black text-[#1c2d51] mb-2">500+</div>
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Imóveis Vendidos</div>
                </div>
                <div>
                   <div className="text-4xl font-black text-[#1c2d51] mb-2">98%</div>
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clientes Satisfeitos</div>
                </div>
              </div>
            </section>
          </div>
        );
      case 'list':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 p-8 pt-12">
            <div className="max-w-6xl mx-auto">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                  <h1 className="text-3xl font-black text-[#1c2d51]">Catálogo de Imóveis</h1>
                  <div className="flex gap-3">
                     {['Tipo', 'Tipologia', 'Preço'].map(f => (
                       <div key={f} className="px-6 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         {f} <ChevronLeft className="-rotate-90" size={12} />
                       </div>
                     ))}
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="bg-white rounded-3xl border border-slate-100 p-2 shadow-sm">
                      <div className="h-40 bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
                         <img src={`https://images.unsplash.com/photo-1600${510+i}5154340-be6191da95b8?auto=format&fit=crop&w=400&q=80`} className="w-full h-full object-cover" alt="List" />
                         <div className="absolute top-3 right-3 bg-[#1c2d51] text-white p-2 rounded-full shadow-lg">
                           <Sparkles size={12} />
                         </div>
                      </div>
                      <div className="p-4">
                         <div className="text-base font-black text-[#1c2d51] mb-1">Moradia T4 Cascais</div>
                         <div className="text-[10px] font-bold text-slate-400 mb-4 tracking-tight">Referência: IMO-78{i}</div>
                         <div className="text-xl font-black text-emerald-600">{formatCurrency(1250000)}</div>
                      </div>
                    </div>
                  ))}
               </div>

               <div className="flex justify-center gap-2">
                 {[1, 2, 3].map(n => (
                   <div key={n} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${n === 1 ? 'bg-[#1c2d51] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>
                     {n}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        );
      case 'detail':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* Gallery Simulation */}
            <div className="grid grid-cols-4 grid-rows-2 h-[500px] gap-2 p-2">
               <div className="col-span-2 row-span-2 bg-slate-200 rounded-3xl overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1600585154340-be6191da95b8?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Detail Main" />
                  <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur px-4 py-2 rounded-xl text-white font-black text-xs flex items-center gap-2">
                    <Camera size={14} /> 12 Fotos
                  </div>
               </div>
               <div className="bg-slate-200 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1600566752355-3979ff119ccd?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="Detail 1" /></div>
               <div className="bg-slate-200 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="Detail 2" /></div>
               <div className="bg-slate-200 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1600585154526-990dcea42e49?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="Detail 3" /></div>
               <div className="bg-slate-200 rounded-2xl overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover blur-[2px]" alt="Detail 4" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white font-black text-sm">Ver todas</div>
               </div>
            </div>

            <div className="max-w-6xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
               <div className="lg:col-span-2">
                  <div className="flex items-center gap-4 mb-6">
                     <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Novo</span>
                     <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Referência: IMO-2024-X1</span>
                  </div>
                  <h1 className="text-4xl font-black text-[#1c2d51] mb-4">Moradia Independente T4 em Cascais</h1>
                  <div className="flex gap-8 mb-10 py-6 border-y border-slate-100">
                     <div className="flex items-center gap-2">
                        <Bed className="text-[#357fb2]" size={20} />
                        <div><div className="text-sm font-black">4</div><div className="text-[10px] text-slate-400 font-bold uppercase">Quartos</div></div>
                     </div>
                     <div className="flex items-center gap-2">
                        <Bath className="text-[#357fb2]" size={20} />
                        <div><div className="text-sm font-black">3</div><div className="text-[10px] text-slate-400 font-bold uppercase">WCs</div></div>
                     </div>
                     <div className="flex items-center gap-2">
                        <Square className="text-[#357fb2]" size={20} />
                        <div><div className="text-sm font-black">240m²</div><div className="text-[10px] text-slate-400 font-bold uppercase">Área Útil</div></div>
                     </div>
                  </div>

                  <div className="prose prose-slate max-w-none mb-12 relative group">
                     <div className="absolute -top-4 -right-4 bg-[#357fb2] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                       🤖 Criado com IA
                     </div>
                     <h3 className="text-xl font-black text-[#1c2d51] mb-4">Sobre este imóvel</h3>
                     <p className="text-slate-500 font-medium leading-relaxed">
                        Esta magnífica moradia contemporânea, situada no coração de Cascais, oferece um estilo de vida exclusivo. Com acabamentos de luxo e uma luminosidade ímpar, o imóvel destaca-se pelas suas áreas generosas e integração harmoniosa com o jardim exterior.
                     </p>
                     <p className="text-slate-500 font-medium leading-relaxed mt-4">
                        A cozinha de design italiano está totalmente equipada, enquanto a master suite oferece um walk-in closet e vista desafogada. Ideal para famílias que privilegiam o conforto e a proximidade ao mar.
                     </p>
                  </div>

                  <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                     <h3 className="text-xl font-black text-[#1c2d51] mb-6">Localização</h3>
                     <div className="h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xs italic uppercase tracking-widest">
                        Mapa Interativo Simulado (Leaflet)
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-1">
                  <div className="sticky top-12 space-y-6">
                     <div className="bg-[#1c2d51] rounded-3xl p-8 text-white shadow-2xl">
                        <div className="text-3xl font-black mb-1">{formatCurrency(1250000)}</div>
                        <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-8">Venda direta</div>
                        <div className="space-y-4">
                           <button className="w-full bg-white text-[#1c2d51] py-4 rounded-xl font-black text-xs uppercase tracking-widest">Marcar Visita</button>
                           <button className="w-full bg-[#357fb2] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest">Pedir Informações</button>
                        </div>
                     </div>
                     <div className="bg-white rounded-3xl p-6 border border-slate-100 text-center">
                        <Sparkles size={24} className="text-blue-500 mx-auto mb-4" />
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight">
                           Preparado para integração<br/>Snap Immobile
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-brand">
      {renderHeader()}

      <main className="pt-32 px-6 max-w-7xl mx-auto">
        
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
                <div 
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`group relative bg-white rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                    selectedTemplate === tmpl.id 
                    ? 'border-[#1c2d51] shadow-2xl scale-[1.02]' 
                    : 'border-transparent shadow-sm hover:shadow-xl hover:translate-y-[-4px]'
                  }`}
                >
                  <div className="h-56 bg-slate-100 relative group-hover:overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setIsPreviewing(tmpl.id); }}
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
                    {selectedTemplate === tmpl.id && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                        <Check size={16} strokeWidth={4} />
                      </div>
                    )}
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
                      <button 
                         onClick={(e) => { e.stopPropagation(); setIsPreviewing(tmpl.id); }}
                         className="flex-1 py-3.5 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors"
                      >
                        Pré-visualizar
                      </button>
                      <button 
                         className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                           selectedTemplate === tmpl.id ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-[#1c2d51] group-hover:text-white'
                         }`}
                      >
                        {selectedTemplate === tmpl.id ? 'Selecionado' : 'Selecionar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-slate-400 text-xs font-bold mb-4 flex items-center justify-center gap-2 text-center max-w-lg mx-auto leading-relaxed">
                Os templates ligam-se automaticamente aos seus imóveis, contactos e conteúdos.
                <span className="text-blue-600 cursor-pointer block mt-1 hover:underline">Saber mais sobre templates</span>
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: IDENTITY */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4">
            {renderProgressBar()}
            <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center">
               <h2 className="text-3xl font-black text-[#1c2d51] mb-8 tracking-tighter">Identidade da sua Marca</h2>
               <div className="flex gap-4 mt-12">
                  <button onClick={prevStep} className="flex-1 py-5 font-black text-slate-400">Voltar</button>
                  <button onClick={nextStep} className="flex-[2] bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#1c2d51]/20">Continuar</button>
               </div>
            </div>
          </div>
        )}

        {/* STEP 3 & 4 */}
        {(currentStep === 3 || currentStep === 4) && (
          <div className="max-w-2xl mx-auto text-center py-20">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
               <CheckCircle2 size={40} />
             </div>
             <h2 className="text-3xl font-black text-[#1c2d51] mb-4">A processar o seu site...</h2>
             <button onClick={handleFinishOnboarding} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black mt-8">Ir para a Dashboard</button>
          </div>
        )}
      </main>

      {/* FIXED FOOTER CTA BAR */}
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
            <button 
              onClick={nextStep}
              className="w-full md:w-auto bg-[#1c2d51] text-white px-12 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-[#1c2d51]/30 hover:-translate-y-1 transition-all"
            >
              Continuar configuração <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* DETAILED PREVIEW MODAL */}
      {isPreviewing && (
        <div className="fixed inset-0 z-[100] bg-[#1c2d51]/98 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
          <div className="w-full h-full flex flex-col">
            {/* Fixed Header of Preview */}
            <div className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0 shadow-sm z-50">
              <button 
                onClick={() => setIsPreviewing(null)}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1c2d51] transition-colors"
              >
                <ChevronLeft size={16} strokeWidth={3} /> Voltar à escolha
              </button>

              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                {[
                  { id: 'home', label: 'Homepage' },
                  { id: 'list', label: 'Listagem' },
                  { id: 'detail', label: 'Detalhe do imóvel' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id as any)}
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      previewTab === tab.id ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => { setSelectedTemplate(isPreviewing); setIsPreviewing(null); }}
                className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1c2d51]/20 hover:-translate-y-0.5 transition-all"
              >
                Usar este template
              </button>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white">
               {renderPreviewContent()}
            </div>

            {/* Fixed Footer of Preview */}
            <div className="h-16 bg-slate-50 border-t border-slate-100 px-8 flex items-center justify-between shrink-0">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-4">
                 <span>Template: {TEMPLATES.find(t => t.id === isPreviewing)?.name}</span>
                 <div className="w-1 h-1 rounded-full bg-slate-300" />
                 <span>Pode alterar o template a qualquer momento</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-blue-600 text-[8px] font-black uppercase tracking-widest">
                    <Sparkles size={12} /> Preparado para descrições com IA
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
