
import React, { useState, useEffect } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Imovel, TipoImovel, ImovelMedia } from '../../types';
import { 
  Plus, Search, Edit2, Trash2, Eye, X, Loader2, AlertCircle, 
  ImageIcon, MapPin, Building2, Zap, Sparkles, Check, 
  ChevronRight, ChevronLeft, Info, Camera, Trash, Star,
  MoveUp, MoveDown, Globe, ShieldCheck, Euro
} from 'lucide-react';
import { formatCurrency, generateSlug } from '../../lib/utils';
import { generatePropertyDescription } from '../../services/geminiService';

// Helper components moved to the top to resolve hoisting and children prop issues in TypeScript
const SectionTitle = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div>
     <h4 className="text-2xl font-black text-[#1c2d51] tracking-tighter">{title}</h4>
     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{subtitle}</p>
  </div>
);

const InputGroup = ({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 flex items-center gap-1">
       {label} {required && <span className="text-red-400">*</span>}
     </label>
     {children}
  </div>
);

const Counter = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
  <div className="bg-slate-50 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3">
     <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
     <div className="flex items-center gap-4">
        <button onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#1c2d51] hover:bg-slate-100">-</button>
        <span className="text-2xl font-black text-[#1c2d51]">{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#1c2d51] hover:bg-slate-100">+</button>
     </div>
  </div>
);

const ToggleItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 text-center ${active ? 'bg-[#1c2d51] text-white border-[#1c2d51]' : 'bg-white text-slate-300 border-slate-50'}`}
  >
     {icon}
     <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const AdminImoveis: React.FC = () => {
  const { profile } = useAuth();
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState<Partial<Imovel>>({
    titulo: '',
    referencia: '',
    tipo_imovel: 'Apartamento',
    tipologia: 'T2',
    tipo_negocio: 'venda',
    estado_conservacao: 'usado',
    ano_construcao: new Date().getFullYear(),
    preco: undefined,
    preco_arrendamento: undefined,
    disponibilidade_imediata: true,
    distrito: 'Lisboa',
    concelho: '',
    fregiesia: '',
    morada: '',
    codigo_postal: '',
    expor_morada_publica: false,
    area_util_m2: undefined,
    area_bruta_m2: undefined,
    area_terreno_m2: undefined,
    quartos: 2,
    casas_banho: 1,
    garagem: 0,
    n_lugares_garagem: 0,
    tem_elevador: false,
    tem_piscina: false,
    tem_jardim: false,
    tem_varanda_terraco: false,
    caracteristicas: [],
    certificado_energetico: 'Em preparação',
    licenca_utilizacao: '',
    negociavel: false,
    comissao_incluida: true,
    descricao_curta: '',
    descricao_md: '',
    publicado: true,
    destaque: false,
    media: []
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const loadProperties = async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending' || profile.tenantId === 'default') {
      if (profile?.tenantId !== 'pending') setIsLoading(false);
      return;
    }
    try {
      const data = await PropertyService.getProperties(profile.tenantId);
      setProperties(data);
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProperties(); }, [profile]);

  const validateStep = (step: number) => {
    switch(step) {
      case 1: return formData.titulo && formData.tipo_imovel && formData.referencia;
      case 2: return formData.distrito && formData.concelho;
      case 3: return (formData.area_util_m2 || 0) > 0;
      case 4: return (formData.preco || formData.preco_arrendamento || 0) > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      setSaveError("Por favor, preencha os campos obrigatórios desta secção.");
      setTimeout(() => setSaveError(null), 3000);
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSave = async () => {
    if (!profile?.tenantId) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const slug = generateSlug(`${formData.titulo}-${Date.now()}`);
      
      const payload = {
        ...formData,
        slug,
        visualizacoes: 0,
        estado: 'disponivel',
        created_at: new Date().toISOString()
      };

      await PropertyService.createProperty(profile.tenantId, payload as any);
      
      setIsModalOpen(false);
      loadProperties();
      // Reset form
      setFormData({
        titulo: '', referencia: '', tipo_imovel: 'Apartamento', tipologia: 'T2', 
        tipo_negocio: 'venda', estado_conservacao: 'usado', preco: undefined, 
        area_util_m2: undefined, caracteristicas: [], media: []
      });
      setCurrentStep(1);
    } catch (err: any) {
      setSaveError(err.message || "Erro ao salvar o imóvel.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    try {
      const desc = await generatePropertyDescription(formData);
      setFormData(prev => ({ ...prev, descricao_md: desc }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddMedia = (url: string) => {
    if (!url) return;
    const newMedia: ImovelMedia = {
      id: Math.random().toString(36).substr(2, 9),
      imovel_id: '',
      url,
      tipo: 'foto',
      ordem: (formData.media?.length || 0),
      principal: (formData.media?.length === 0)
    };
    setFormData(prev => ({ ...prev, media: [...(prev.media || []), newMedia] }));
  };

  const removeMedia = (id: string) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media?.filter(m => m.id !== id)
    }));
  };

  const setPrincipalMedia = (id: string) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media?.map(m => ({ ...m, principal: m.id === id }))
    }));
  };

  const moveMedia = (index: number, direction: 'up' | 'down') => {
    if (!formData.media) return;
    const newMedia = [...formData.media];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newMedia.length) return;
    
    [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
    // Update order
    const orderedMedia = newMedia.map((m, i) => ({ ...m, ordem: i }));
    setFormData(prev => ({ ...prev, media: orderedMedia }));
  };

  const filteredProperties = properties.filter(p => 
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.referencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-brand">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1c2d51]">Gestão de Imóveis</h1>
          <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Inventário da Agência</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setCurrentStep(1); }} 
          disabled={profile?.tenantId === 'pending'}
          className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
        >
          <Plus size={20} /> Novo Imóvel
        </button>
      </div>

      {/* FORM MODAL - PROFESSIONAL MULTI-STEP */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
            {/* Header Steps */}
            <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-[#1c2d51] rounded-xl flex items-center justify-center"><Building2 size={20}/></div>
                  <h3 className="text-xl font-black text-[#1c2d51]">Inserir Novo Imóvel</h3>
               </div>
               <div className="hidden md:flex items-center gap-2">
                  {[1,2,3,4,5].map(s => (
                    <div key={s} className={`h-1.5 w-12 rounded-full transition-all ${currentStep >= s ? 'bg-[#1c2d51]' : 'bg-slate-100'}`}></div>
                  ))}
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
              {saveError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold mb-8 border border-red-100">
                  <AlertCircle size={18} /> {saveError}
                </div>
              )}

              {/* STEP 1: IDENTIFICATION & OPERATION */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <SectionTitle title="1. Identificação & Operação" subtitle="Dados base do imóvel para portais" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Referência Interna (Obrigatória)" required>
                         <input placeholder="Ex: IMO-2024-001" className="admin-input" value={formData.referencia} onChange={e => setFormData({...formData, referencia: e.target.value})} />
                      </InputGroup>
                      <InputGroup label="Título Comercial (SEO)" required>
                         <input placeholder="Ex: Apartamento T2 com Vista Rio em Lisboa" className="admin-input" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
                      </InputGroup>
                      <InputGroup label="Tipo de Imóvel">
                         <select className="admin-input" value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value as TipoImovel})}>
                            <option>Apartamento</option>
                            <option>Moradia</option>
                            <option>Casa rústica</option>
                            <option>Terreno</option>
                            <option>Escritório</option>
                            <option>Armazém</option>
                         </select>
                      </InputGroup>
                      <InputGroup label="Tipologia">
                         <select className="admin-input" value={formData.tipologia} onChange={e => setFormData({...formData, tipologia: e.target.value})}>
                            <option>T0</option><option>T1</option><option>T2</option><option>T3</option><option>T4</option><option>T5+</option>
                         </select>
                      </InputGroup>
                      <InputGroup label="Operação">
                         <div className="flex gap-2">
                            {['venda', 'arrendamento'].map(op => (
                              <button key={op} onClick={() => setFormData({...formData, tipo_negocio: op as any})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.tipo_negocio === op ? 'bg-[#1c2d51] text-white border-[#1c2d51]' : 'bg-white text-slate-400 border-slate-100'}`}>
                                {op}
                              </button>
                            ))}
                         </div>
                      </InputGroup>
                      <InputGroup label="Estado de Conservação">
                         <select className="admin-input" value={formData.estado_conservacao} onChange={e => setFormData({...formData, estado_conservacao: e.target.value as any})}>
                            <option value="novo">Novo / Em construção</option>
                            <option value="usado">Usado / Bom estado</option>
                            <option value="renovado">Renovado</option>
                            <option value="para_renovar">Para recuperar</option>
                         </select>
                      </InputGroup>
                   </div>
                </div>
              )}

              {/* STEP 2: LOCALIZAÇÃO */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <SectionTitle title="2. Localização Exata" subtitle="Onde se encontra a propriedade" />
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputGroup label="Distrito">
                        <select className="admin-input" value={formData.distrito} onChange={e => setFormData({...formData, distrito: e.target.value})}>
                           <option>Lisboa</option><option>Porto</option><option>Setúbal</option><option>Faro</option><option>Braga</option>
                        </select>
                      </InputGroup>
                      <InputGroup label="Concelho" required>
                         <input placeholder="Ex: Cascais" className="admin-input" value={formData.concelho} onChange={e => setFormData({...formData, concelho: e.target.value})} />
                      </InputGroup>
                      <InputGroup label="Freguesia">
                         <input placeholder="Ex: Carcavelos" className="admin-input" value={formData.freguesia} onChange={e => setFormData({...formData, freguesia: e.target.value})} />
                      </InputGroup>
                   </div>
                   <InputGroup label="Morada Completa">
                      <input placeholder="Rua de Exemplo, nº 123" className="admin-input" value={formData.morada} onChange={e => setFormData({...formData, morada: e.target.value})} />
                   </InputGroup>
                   <div className="p-6 bg-blue-50 rounded-3xl flex items-center justify-between border border-blue-100">
                      <div className="flex items-center gap-3">
                         <ShieldCheck className="text-blue-600" size={24}/>
                         <div>
                            <p className="text-xs font-black text-[#1c2d51] uppercase tracking-tighter">Privacidade da Morada</p>
                            <p className="text-[10px] text-blue-600 font-bold uppercase">Expor morada publicamente no site?</p>
                         </div>
                      </div>
                      <button onClick={() => setFormData({...formData, expor_morada_publica: !formData.expor_morada_publica})} className={`w-14 h-8 rounded-full relative p-1 transition-all ${formData.expor_morada_publica ? 'bg-blue-600' : 'bg-slate-200'}`}>
                         <div className={`w-6 h-6 bg-white rounded-full shadow transition-all ${formData.expor_morada_publica ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                   </div>
                </div>
              )}

              {/* STEP 3: AREAS & CHARACTERISTICS */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <SectionTitle title="3. Áreas & Características" subtitle="Espaço físico e funcionalidades" />
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputGroup label="Área Útil (m²)" required>
                         <input type="number" className="admin-input" value={formData.area_util_m2 || ''} onChange={e => setFormData({...formData, area_util_m2: Number(e.target.value)})} />
                      </InputGroup>
                      <InputGroup label="Área Bruta (m²)">
                         <input type="number" className="admin-input" value={formData.area_bruta_m2 || ''} onChange={e => setFormData({...formData, area_bruta_m2: Number(e.target.value)})} />
                      </InputGroup>
                      <InputGroup label="Andar">
                         <input placeholder="Ex: 2º Esq" className="admin-input" value={formData.andar || ''} onChange={e => setFormData({...formData, andar: e.target.value})} />
                      </InputGroup>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <Counter label="Quartos" value={formData.quartos || 0} onChange={v => setFormData({...formData, quartos: v})} />
                      <Counter label="WCs" value={formData.casas_banho || 0} onChange={v => setFormData({...formData, casas_banho: v})} />
                      <Counter label="Lugares Garagem" value={formData.n_lugares_garagem || 0} onChange={v => setFormData({...formData, n_lugares_garagem: v})} />
                      <Counter label="Nº Pisos" value={formData.n_pisos || 1} onChange={v => setFormData({...formData, n_pisos: v})} />
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <ToggleItem icon={<Zap size={14}/>} label="Elevador" active={formData.tem_elevador || false} onClick={() => setFormData({...formData, tem_elevador: !formData.tem_elevador})} />
                      <ToggleItem icon={<Star size={14}/>} label="Piscina" active={formData.tem_piscina || false} onClick={() => setFormData({...formData, tem_piscina: !formData.tem_piscina})} />
                      <ToggleItem icon={<Globe size={14}/>} label="Jardim" active={formData.tem_jardim || false} onClick={() => setFormData({...formData, tem_jardim: !formData.tem_jardim})} />
                      <ToggleItem icon={<ImageIcon size={14}/>} label="Varanda" active={formData.tem_varanda_terraco || false} onClick={() => setFormData({...formData, tem_varanda_terraco: !formData.tem_varanda_terraco})} />
                   </div>
                </div>
              )}

              {/* STEP 4: PREÇO & LEGAL */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <SectionTitle title="4. Preço & Dados Legais" subtitle="Condições financeiras e certificações" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-6">
                        <InputGroup label={formData.tipo_negocio === 'venda' ? 'Preço de Venda (€)' : 'Preço Arrendamento /mês (€)'} required>
                           <div className="relative">
                              <Euro className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                              <input type="number" className="admin-input pl-14" value={(formData.tipo_negocio === 'venda' ? formData.preco : formData.preco_arrendamento) || ''} onChange={e => setFormData(formData.tipo_negocio === 'venda' ? {...formData, preco: Number(e.target.value)} : {...formData, preco_arrendamento: Number(e.target.value)})} />
                           </div>
                        </InputGroup>
                        <div className="flex gap-4">
                           <button onClick={() => setFormData({...formData, negociavel: !formData.negociavel})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.negociavel ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'}`}>Negociável</button>
                           <button onClick={() => setFormData({...formData, comissao_incluida: !formData.comissao_incluida})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.comissao_incluida ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-100'}`}>Comissão Incluída</button>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <InputGroup label="Certificado Energético">
                           <select className="admin-input" value={formData.certificado_energetico} onChange={e => setFormData({...formData, certificado_energetico: e.target.value as any})}>
                              <option>A+</option><option>A</option><option>B</option><option>B-</option><option>C</option><option>D</option><option>E</option><option>F</option><option>G</option><option>Isento</option><option>Em preparação</option>
                           </select>
                        </InputGroup>
                        <InputGroup label="Licença de Utilização">
                           <input placeholder="Ex: Licença nº 123/2020" className="admin-input" value={formData.licenca_utilizacao} onChange={e => setFormData({...formData, licenca_utilizacao: e.target.value})} />
                        </InputGroup>
                      </div>
                   </div>
                </div>
              )}

              {/* STEP 5: MEDIA & DESCRIPTION (AI) */}
              {currentStep === 5 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <SectionTitle title="5. Marketing & Media" subtitle="A cara do seu anúncio" />
                   
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Descrição Completa</label>
                         <button 
                           onClick={handleAIGenerate}
                           disabled={isGeneratingAI}
                           className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 disabled:opacity-50"
                         >
                           {isGeneratingAI ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>}
                           Gerar com IA Gemini
                         </button>
                      </div>
                      <textarea rows={6} className="admin-input py-6 text-sm font-medium leading-relaxed" placeholder="Escreva sobre o imóvel..." value={formData.descricao_md} onChange={e => setFormData({...formData, descricao_md: e.target.value})}></textarea>
                   </div>

                   <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Galeria de Imagens</label>
                      <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-4">
                         <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center text-slate-300"><Camera size={32}/></div>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cole o URL das imagens abaixo</p>
                         <div className="flex gap-2 max-w-lg mx-auto">
                            <input id="mediaUrl" placeholder="https://..." className="admin-input bg-white" onKeyPress={e => e.key === 'Enter' && handleAddMedia((e.target as HTMLInputElement).value)} />
                            <button onClick={() => {
                              const input = document.getElementById('mediaUrl') as HTMLInputElement;
                              handleAddMedia(input.value);
                              input.value = '';
                            }} className="bg-[#1c2d51] text-white px-6 rounded-xl font-black uppercase text-xs">Adicionar</button>
                         </div>
                      </div>

                      {/* MEDIA LIST */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {formData.media?.map((m, idx) => (
                           <div key={m.id} className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${m.principal ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100'}`}>
                              <img src={m.url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                 <button onClick={() => moveMedia(idx, 'up')} className="p-1.5 bg-white rounded-lg hover:text-blue-500"><MoveUp size={14}/></button>
                                 <button onClick={() => moveMedia(idx, 'down')} className="p-1.5 bg-white rounded-lg hover:text-blue-500"><MoveDown size={14}/></button>
                                 <button onClick={() => removeMedia(m.id)} className="p-1.5 bg-white rounded-lg text-red-500 hover:bg-red-50"><Trash size={14}/></button>
                              </div>
                              <button 
                                onClick={() => setPrincipalMedia(m.id)}
                                className={`absolute top-2 left-2 p-1.5 rounded-lg transition-all ${m.principal ? 'bg-blue-500 text-white' : 'bg-white/90 text-slate-400 hover:text-blue-500'}`}
                              >
                                <Star size={12} fill={m.principal ? 'currentColor' : 'none'} />
                              </button>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/50">
               <button 
                 onClick={handleBack} 
                 disabled={currentStep === 1}
                 className="flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-30"
               >
                 <ChevronLeft size={16}/> Voltar
               </button>
               
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Passo {currentStep} de {totalSteps}</div>
               
               {currentStep < totalSteps ? (
                 <button 
                   onClick={handleNext} 
                   className="bg-[#1c2d51] text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:translate-x-1 transition-all"
                 >
                   Seguinte <ChevronRight size={16}/>
                 </button>
               ) : (
                 <button 
                   onClick={handleSave} 
                   disabled={isSaving}
                   className="bg-[#1c2d51] text-white px-12 py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-[#1c2d51]/20"
                 >
                   {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Check size={16}/>}
                   Confirmar & Publicar
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND TABLE - MAINTAINED FROM ORIGINAL BUT STYLED */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por título ou referência..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Detalhes do Imóvel</th>
                <th className="px-8 py-5">Tipo & Negócio</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={3} className="px-8 py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" /></td></tr>
              ) : filteredProperties.length === 0 ? (
                <tr>
                   <td colSpan={3} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                         <AlertCircle size={32} />
                         <p className="font-bold uppercase text-[10px] tracking-widest">Nenhum imóvel no inventário.</p>
                      </div>
                   </td>
                </tr>
              ) : filteredProperties.map((imovel) => (
                <tr key={imovel.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-300 font-black border border-slate-200 overflow-hidden">
                        {imovel.media?.[0]?.url ? <img src={imovel.media[0].url} className="w-full h-full object-cover" /> : imovel.titulo.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-[#1c2d51] text-sm">{imovel.titulo}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ref: {imovel.referencia} • {formatCurrency(imovel.preco || imovel.preco_arrendamento)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{imovel.tipo_imovel} &bull; {imovel.tipo_negocio}</div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`#/agencia/${profile?.tenantId}/imovel/${imovel.slug}`} target="_blank" className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-500 bg-white rounded-xl border border-slate-100 shadow-sm"><Eye size={16}/></a>
                      <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#1c2d51] bg-white rounded-xl border border-slate-100 shadow-sm"><Edit2 size={16}/></button>
                      <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 bg-white rounded-xl border border-slate-100 shadow-sm"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        .admin-input {
          width: 100%;
          padding: 1rem 1.5rem;
          background-color: #f8fafc;
          border: 2px solid transparent;
          border-radius: 1.25rem;
          outline: none;
          font-weight: 700;
          color: #1c2d51;
          transition: all 0.2s;
        }
        .admin-input:focus {
          background-color: #fff;
          border-color: #1c2d51;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default AdminImoveis;
