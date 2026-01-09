
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
// Added CheckCircle2 to lucide-react imports
import { 
  ArrowRight, Layout, Building2, Eye, Star, ChevronLeft,
  Sparkles, MapPin, Bed, Square, Loader2, Globe, Zap, Brush, Clock, ChevronDown, ChevronRight, Info,
  CheckCircle2
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { formatCurrency } from '../../lib/utils';
import { generateAgencySlogan, generatePropertyDescription } from '../../services/geminiService';
import { PropertyService } from '../../services/propertyService';

const TEMPLATES = [
  { id: 'heritage', name: 'Heritage', icon: <Building2 />, color: '#1c2d51', description: 'Tradição e confiança.' },
  { id: 'canvas', name: 'Canvas', icon: <Layout />, color: '#357fb2', description: 'Design moderno e limpo.' },
  { id: 'prestige', name: 'Prestige', icon: <Star />, color: '#000000', description: 'Luxo e Minimalismo.' },
  { id: 'skyline', name: 'Skyline', icon: <Zap />, color: '#10b981', description: 'Urbano e tecnológico.' },
  { id: 'luxe', name: 'Luxe', icon: <Brush />, color: '#f59e0b', description: 'Artístico e lifestyle.' }
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
        // Fix: Update createProperty payload to match Imovel nested structure
        await PropertyService.createProperty(profile.tenantId, {
          titulo: property.titulo,
          ref: `INI-${Math.floor(Math.random() * 999)}`,
          tipo_imovel: 'apartamento',
          tipologia: 'T2',
          estado_conservacao: 'novo',
          operacao: property.negocio as any,
          localizacao: {
            pais: 'Portugal',
            distrito: 'Lisboa',
            concelho: property.concelho,
            freguesia: null,
            codigo_postal: null,
            morada: null,
            porta: null,
            lat: null,
            lng: null,
            expor_morada: true
          },
          financeiro: {
            preco_venda: property.negocio === 'venda' ? Number(property.preco) : null,
            preco_arrendamento: property.negocio === 'arrendamento' ? Number(property.preco) : null,
            negociavel: false,
            condominio_mensal: null,
            imi_anual: null,
            caucao_meses: null,
            despesas_incluidas: []
          },
          descricao: {
            curta: '',
            completa_md: property.descricao,
            gerada_por_ia: false,
            ultima_geracao_ia_at: null
          },
          publicacao: {
            estado: 'publicado',
            publicar_no_site: true,
            destaque: true,
            badges: [],
            data_publicacao: serverTimestamp()
          },
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
          <Clock size={14} /> Configuração Inicial
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

        {currentStep === 2 && (
          <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
              <h2 className="text-3xl font-black text-[#1c2d51] mb-8 tracking-tighter">Identidade Visual</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Slogan Criativo</label>
                  <div className="relative">
                    <input type="text" value={identity.slogan} onChange={(e) => setIdentity({...identity, slogan: e.target.value})} className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]" />
                    <button onClick={handleGenerateSlogan} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600">
                      {isGeneratingSlogan ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    </button>
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

        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto py-10 animate-in zoom-in-95 duration-700 text-center">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg"><CheckCircle2 size={40} /></div>
             <h2 className="text-5xl font-black text-[#1c2d51] mb-4 tracking-tighter">Parabéns!</h2>
             <p className="text-xl text-slate-400 mb-12">O portal da imobiliária já está no ar.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button onClick={() => navigate(`/agencia/${tenant.slug}`)} className="bg-[#1c2d51] text-white py-6 rounded-[2rem] font-black text-xl flex items-center gap-3 justify-center"><Globe size={24}/> Abrir Website</button>
                <button onClick={() => navigate('/admin')} className="bg-white border border-slate-100 py-6 rounded-[2rem] font-black text-xl flex items-center gap-3 justify-center">Painel de Gestão</button>
             </div>
          </div>
        )}
      </main>

      {previewingTemplate && (
        <TemplatePreviewModal 
          templateId={previewingTemplate} 
          onClose={() => setPreviewingTemplate(null)} 
          onSelect={() => { setSelectedTemplate(previewingTemplate); setPreviewingTemplate(null); }}
        />
      )}
    </div>
  );
};

const TemplatePreviewModal = ({ templateId, onClose, onSelect }: any) => {
  const [activePage, setActivePage] = useState<'home' | 'list' | 'detail'>('home');
  const template = TEMPLATES.find(t => t.id === templateId);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8">
        <button onClick={onClose} className="flex items-center gap-2 text-xs font-black uppercase text-slate-400"><ChevronLeft size={16}/> Voltar</button>
        <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1">
          {['home', 'list', 'detail'].map(p => (
            <button key={p} onClick={() => setActivePage(p as any)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${activePage === p ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400'}`}>{p}</button>
          ))}
        </div>
        <button onClick={onSelect} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl text-xs font-black uppercase">Usar Template</button>
      </header>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-[1440px] mx-auto min-h-full bg-white shadow-2xl p-20 text-center">
          <h2 className="text-4xl font-black text-slate-200 uppercase tracking-tighter">Preview de {template?.name} - Página {activePage}</h2>
          <p className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Layout real renderizado no portal público</p>
        </div>
      </div>
    </div>
  );
};

const Tooltip = ({ text, icon }: { text: string, icon: any }) => (
  <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-blue-100 flex items-center gap-3 text-[10px] font-bold text-[#1c2d51]">
    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">{icon}</div>
    {text}
  </div>
);

export default OnboardingFlow;
