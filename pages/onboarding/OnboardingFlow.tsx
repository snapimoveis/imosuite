
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
  CheckCircle2
} from 'lucide-react';

const TEMPLATES = [
  {
    id: 'heritage',
    name: 'Heritage',
    tag: 'Clássico',
    color: '#1B263B',
    accent: '#C5A059',
    description: 'Tradição e confiança para imobiliárias familiares.',
    bullets: ['Elegância atemporal', 'Foco em equipa', 'Layout institucional']
  },
  {
    id: 'canvas',
    name: 'Canvas',
    tag: 'Minimalista',
    color: '#007BFF',
    accent: '#212529',
    description: 'Foco absoluto no imóvel e na clareza visual.',
    bullets: ['Design limpo', 'Alta performance', 'Espaços brancos']
  },
  {
    id: 'prestige',
    name: 'Prestige',
    tag: 'Luxo',
    color: '#000000',
    accent: '#CD7F32',
    description: 'Experiência premium para o mercado de alto padrão.',
    bullets: ['Cinematográfico', 'Dark mode elegante', 'Tour 360º destaque']
  },
  {
    id: 'direct',
    name: 'Direct',
    tag: 'Conversão',
    color: '#DC3545',
    accent: '#FFC107',
    description: 'Desenhado para gerar leads e contactos rápidos.',
    bullets: ['CTA agressivo', 'Badges de urgência', 'Filtros rápidos']
  },
  {
    id: 'nexus',
    name: 'Nexus',
    tag: 'Tech',
    color: '#05445E',
    accent: '#189AB4',
    description: 'Para agências orientadas a dados e tecnologia.',
    bullets: ['Análise com IA', 'Visual futurista', 'Gráficos dinâmicos']
  }
];

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { tenant, setTenant } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);

  // Step 2 Form Data
  const [identityData, setIdentityData] = useState({
    logo: null,
    agencyName: tenant.nome || '',
    primaryColor: tenant.cor_primaria || '#1c2d51',
    phone: tenant.telefone || ''
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinishOnboarding = () => {
    setTenant({
      ...tenant,
      nome: identityData.agencyName,
      cor_primaria: identityData.primaryColor,
      telefone: identityData.phone,
    });
    navigate('/admin');
  };

  const renderStepIndicator = () => (
    <div className="max-w-xs mx-auto mb-12">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4].map(s => (
          <div 
            key={s} 
            className={`w-1/4 h-1.5 rounded-full mx-1 transition-all duration-500 ${s <= currentStep ? 'bg-[#1c2d51]' : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
        Passo {currentStep} de 4 — {
          currentStep === 1 ? 'Escolher Template' :
          currentStep === 2 ? 'Identidade Visual' :
          currentStep === 3 ? 'Primeiro Imóvel' : 'Finalizar'
        }
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-6 font-brand">
      <div className="max-w-6xl mx-auto">
        
        {/* Step 1: Welcome & Template Selection */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderStepIndicator()}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] mb-6 tracking-tighter">
                Vamos colocar o seu site imobiliário online.
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                Escolha um template, personalize a sua marca e comece a publicar imóveis em minutos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
              {TEMPLATES.map((tmpl) => (
                <div 
                  key={tmpl.id}
                  className={`group relative bg-white rounded-[2rem] border-2 transition-all duration-300 overflow-hidden cursor-pointer ${
                    selectedTemplate === tmpl.id ? 'border-[#1c2d51] shadow-2xl scale-105' : 'border-slate-100 hover:border-slate-300 hover:shadow-xl'
                  }`}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                >
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    {/* Simplified Template Preview Graphics */}
                    <div className="absolute inset-0 p-4">
                        <div className="w-full h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                            <div className="h-4 w-full" style={{ backgroundColor: tmpl.color }}></div>
                            <div className="p-2 space-y-1">
                                <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                                <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                                <div className="grid grid-cols-2 gap-1 pt-1">
                                    <div className="h-12 bg-slate-50 rounded"></div>
                                    <div className="h-12 bg-slate-50 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {selectedTemplate === tmpl.id && (
                      <div className="absolute top-3 right-3 bg-[#1c2d51] text-white p-1 rounded-full animate-in zoom-in">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#357fb2] mb-1 block">
                      {tmpl.tag}
                    </span>
                    <h3 className="text-lg font-black text-[#1c2d51] mb-3">{tmpl.name}</h3>
                    <ul className="space-y-2 mb-6">
                      {tmpl.bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                          <Check size={10} className="text-emerald-500" /> {b}
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsPreviewing(tmpl.id); }}
                      className="w-full py-3 rounded-xl bg-slate-50 text-slate-500 text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                    >
                      <Eye size={14} /> Pré-visualizar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button 
                disabled={!selectedTemplate}
                onClick={nextStep}
                className="bg-[#1c2d51] text-white px-12 py-5 rounded-2xl font-black text-lg flex items-center gap-3 shadow-xl shadow-[#1c2d51]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1"
              >
                Escolher template <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Agency Identity */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            {renderStepIndicator()}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black text-[#1c2d51] mb-4">A sua identidade.</h1>
              <p className="text-slate-500 font-medium">Personalize como os seus clientes verão a sua marca.</p>
            </div>

            <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 space-y-8">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors mb-4">
                  <Upload size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest mt-2">Logótipo</span>
                </div>
                <button className="text-xs font-black text-[#357fb2] uppercase tracking-widest">Carregar imagem</button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nome Comercial</label>
                  <input 
                    type="text" 
                    value={identityData.agencyName}
                    onChange={(e) => setIdentityData({...identityData, agencyName: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#1c2d51] font-bold text-lg"
                    placeholder="Ex: Algarve Dream Homes"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Telefone de Contacto</label>
                  <input 
                    type="text" 
                    value={identityData.phone}
                    onChange={(e) => setIdentityData({...identityData, phone: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#1c2d51] font-bold text-lg"
                    placeholder="+351 912 345 678"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Cor Principal da Marca</label>
                  <div className="flex gap-4">
                    {['#1c2d51', '#357fb2', '#b91c1c', '#15803d', '#7c3aed'].map(c => (
                      <button
                        key={c}
                        onClick={() => setIdentityData({...identityData, primaryColor: c})}
                        className={`w-12 h-12 rounded-2xl border-4 transition-all ${identityData.primaryColor === c ? 'border-slate-900 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button onClick={prevStep} className="flex-1 py-5 rounded-2xl font-black text-slate-400 hover:text-[#1c2d51] transition-colors">Voltar</button>
                <button onClick={nextStep} className="flex-[2] bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#1c2d51]/20 hover:-translate-y-1 transition-all">Continuar</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: First Property */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            {renderStepIndicator()}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black text-[#1c2d51] mb-4">Primeiro Imóvel.</h1>
              <p className="text-slate-500 font-medium">Vamos criar o seu primeiro anúncio com ajuda da nossa IA.</p>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Título do Imóvel</label>
                    <input type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#1c2d51] font-bold text-lg" placeholder="Ex: Apartamento T2 com Vista Mar" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Preço (€)</label>
                      <input type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-lg" placeholder="350.000" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tipologia</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-lg appearance-none">
                        <option>T0</option><option>T1</option><option selected>T2</option><option>T3+</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="text-blue-600" size={20} />
                    <span className="text-xs font-black text-blue-800 uppercase tracking-widest">Sugestão com IA</span>
                  </div>
                  <p className="text-sm text-blue-600 font-medium italic">"Ao clicar em publicar, a nossa IA irá gerar automaticamente uma descrição persuasiva e profissional para este imóvel."</p>
                </div>
                
                <div className="flex gap-4">
                  <button onClick={nextStep} className="flex-1 py-5 rounded-2xl font-black text-slate-400 hover:text-[#1c2d51]">Saltar</button>
                  <button onClick={nextStep} className="flex-[2] bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:-translate-y-1 transition-all">Publicar Imóvel</button>
                </div>
              </div>
              
              <div className="bg-slate-100 flex items-center justify-center p-12">
                <div className="w-full max-w-xs bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                  <div className="h-48 bg-slate-200 flex items-center justify-center text-slate-400">
                    <Building2 size={48} />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                    <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                    <div className="pt-4 flex justify-between">
                      <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
                      <div className="h-4 w-1/4 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Final Confirmation */}
        {currentStep === 4 && (
          <div className="max-w-2xl mx-auto text-center animate-in fade-in zoom-in duration-700">
            <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-emerald-500/10">
              <CheckCircle2 size={64} strokeWidth={3} />
            </div>
            
            <h1 className="text-5xl font-black text-[#1c2d51] mb-6 tracking-tighter">O seu portal está pronto.</h1>
            <p className="text-xl text-slate-500 mb-12 font-medium">
              Parabéns! O seu site imobiliário foi configurado com o template <span className="text-[#1c2d51] font-black">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span>.
            </p>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl mb-12 text-left">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Próximos passos na sua Dashboard</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#1c2d51]"><Rocket size={20} /></div>
                  <div>
                    <h4 className="font-black text-[#1c2d51] text-sm">Lançar Site</h4>
                    <p className="text-xs text-slate-400 font-medium">O seu site está em modo 'Rascunho'. Clique em 'Publicar' para ficar online.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#1c2d51]"><Globe size={20} /></div>
                  <div>
                    <h4 className="font-black text-[#1c2d51] text-sm">Ligar Domínio</h4>
                    <p className="text-xs text-slate-400 font-medium">Configure o seu domínio próprio (.pt, .com) no menu de Definições.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleFinishOnboarding}
                className="w-full bg-[#1c2d51] text-white py-6 rounded-2xl font-black text-xl shadow-2xl shadow-[#1c2d51]/20 hover:-translate-y-1 transition-all"
              >
                Entrar na Dashboard
              </button>
              <button onClick={() => setCurrentStep(1)} className="text-sm font-black text-slate-400 uppercase tracking-widest hover:text-[#1c2d51] transition-colors">
                Trocar template
              </button>
            </div>
            
            <p className="mt-10 text-xs text-slate-400 font-bold uppercase tracking-tighter">
              Pode mudar o template a qualquer momento durante os 14 dias de teste.
            </p>
          </div>
        )}

      </div>

      {/* Template Preview Modal */}
      {isPreviewing && (
        <div className="fixed inset-0 z-[100] bg-[#1c2d51]/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-6xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-[#1c2d51]">Template {TEMPLATES.find(t => t.id === isPreviewing)?.name}</h2>
                <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Modo de Pré-visualização
                </span>
              </div>
              <button 
                onClick={() => setIsPreviewing(null)}
                className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-slate-50 p-12">
               <div className="max-w-4xl mx-auto space-y-12">
                 {/* Simulating Website Sections */}
                 <div className="h-64 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-10 flex flex-col justify-center items-center text-center">
                   <h3 className="text-4xl font-black text-[#1c2d51] mb-4">Hero Section Dinâmico</h3>
                   <div className="w-64 h-2 bg-slate-100 rounded-full"></div>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                   <div className="h-80 bg-white rounded-[2rem] shadow-sm border border-slate-200"></div>
                   <div className="h-80 bg-white rounded-[2rem] shadow-sm border border-slate-200"></div>
                 </div>
               </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center gap-6">
              <button 
                onClick={() => setIsPreviewing(null)}
                className="px-10 py-4 font-black text-slate-500 uppercase tracking-widest"
              >
                Voltar à lista
              </button>
              <button 
                onClick={() => { setSelectedTemplate(isPreviewing); setIsPreviewing(null); }}
                className="bg-[#1c2d51] text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl"
              >
                Usar este template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const X: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default OnboardingFlow;
