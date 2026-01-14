import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  ArrowRight, Layout, Building2, Eye, Star, ChevronLeft,
  Sparkles, MapPin, Bed, Bath, Square, Loader2, Globe, Zap, Brush, Clock, ChevronDown, ChevronRight, Info,
  CheckCircle2, ArrowUpRight, Heart, Search
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { generateAgencySlogan } from '../../services/geminiService';

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
  const [isFinishing, setIsFinishing] = useState(false);
  
  const [identity, setIdentity] = useState({
    name: tenant.nome || '',
    slogan: tenant.slogan || '',
    primaryColor: tenant.cor_primaria || '#1c2d51',
    secondaryColor: tenant.cor_secundaria || '#357fb2',
    email: tenant.email || '',
    phone: tenant.telefone || '',
  });

  const [isGeneratingSlogan, setIsGeneratingSlogan] = useState(false);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
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
      alert("Erro ao finalizar configuração.");
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

  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-brand">
        <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500 border border-slate-100">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={48} strokeWidth={2.5} className="animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-[#1c2d51] tracking-tighter">Está Pronto!</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
              O seu ecossistema imobiliário foi <br/> configurado com sucesso.
            </p>
          </div>
          <button 
            onClick={() => navigate('/admin')}
            className="w-full bg-[#1c2d51] text-white py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 transition-all"
          >
            Entrar no Cockpit <ArrowRight />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-brand">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-50">
        <Logo size="sm" />
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Clock size={14} /> Configuração Inicial
        </div>
      </header>

      <main className="pt-28 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
             <div>
                <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">
                  {currentStep === 1 ? 'Identidade da Agência' : 'Visual & Template'}
                </h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Passo {currentStep} de 2</p>
             </div>
             <div className="flex gap-2">
                <div className={`h-2 w-12 rounded-full transition-all ${currentStep >= 1 ? 'bg-[#1c2d51]' : 'bg-slate-200'}`}></div>
                <div className={`h-2 w-12 rounded-full transition-all ${currentStep >= 2 ? 'bg-[#1c2d51]' : 'bg-slate-200'}`}></div>
             </div>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Comercial</label>
                    <input 
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51] border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all" 
                      value={identity.name} 
                      onChange={e => setIdentity({...identity, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email de Contacto</label>
                    <input 
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51] border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all" 
                      value={identity.email} 
                      onChange={e => setIdentity({...identity, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">
                      Slogan / Frase de Impacto 
                      <span className="text-[8px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">AI Powered</span>
                    </label>
                    <div className="relative">
                      <input 
                        className="w-full p-4 pr-14 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51] border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all" 
                        placeholder="Ex: A sua casa, o nosso compromisso."
                        value={identity.slogan} 
                        onChange={e => setIdentity({...identity, slogan: e.target.value})} 
                      />
                      <button 
                        onClick={handleGenerateSlogan} 
                        disabled={isGeneratingSlogan || !identity.name}
                        className="absolute right-2 top-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm hover:bg-blue-50 transition-colors disabled:opacity-30"
                      >
                        {isGeneratingSlogan ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Telefone</label>
                    <input 
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51] border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all" 
                      placeholder="+351 900 000 000"
                      value={identity.phone} 
                      onChange={e => setIdentity({...identity, phone: e.target.value})} 
                    />
                  </div>
               </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={nextStep}
                className="bg-[#1c2d51] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all"
              >
                Próximo Passo <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.map((tmpl) => (
                <div 
                  key={tmpl.id} 
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`group cursor-pointer p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden ${selectedTemplate === tmpl.id ? 'border-[#1c2d51] bg-white shadow-xl' : 'border-slate-100 bg-white/50 hover:border-slate-200'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${selectedTemplate === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {tmpl.icon}
                  </div>
                  <h3 className="font-black text-lg text-[#1c2d51] mb-1">{tmpl.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4 leading-relaxed">{tmpl.description}</p>
                  
                  {selectedTemplate === tmpl.id && (
                    <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-50 p-1.5 rounded-full">
                       <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
               <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Personalizar Cores</h3>
               <div className="flex flex-wrap gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cor Primária</label>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <input type="color" className="w-10 h-10 rounded-lg border-none cursor-pointer" value={identity.primaryColor} onChange={e => setIdentity({...identity, primaryColor: e.target.value})} />
                      <span className="font-black text-xs uppercase tracking-widest text-[#1c2d51]">{identity.primaryColor}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cor Secundária</label>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <input type="color" className="w-10 h-10 rounded-lg border-none cursor-pointer" value={identity.secondaryColor} onChange={e => setIdentity({...identity, secondaryColor: e.target.value})} />
                      <span className="font-black text-xs uppercase tracking-widest text-[#1c2d51]">{identity.secondaryColor}</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-between items-center">
              <button 
                onClick={prevStep}
                className="text-slate-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:text-[#1c2d51] transition-all"
              >
                <ChevronLeft size={18} /> Voltar
              </button>
              <button 
                onClick={handleFinishOnboarding}
                disabled={isFinishing}
                className="bg-[#1c2d51] text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                {isFinishing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />} Finalizar Configuração
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OnboardingFlow;