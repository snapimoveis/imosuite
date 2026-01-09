
import React, { useState, useEffect, useRef } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Imovel, TipoImovel, ImovelMedia } from '../../types';
import { 
  Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Loader2, AlertCircle, 
  Building2, Zap, Sparkles, Check, 
  ChevronRight, ChevronLeft, Camera, Trash, Star,
  MoveUp, MoveDown, ShieldCheck, Euro, UploadCloud, GripVertical
} from 'lucide-react';
import { formatCurrency, generateSlug } from '../../lib/utils';
import { generatePropertyDescription } from '../../services/geminiService';

const AdminImoveis: React.FC = () => {
  const { profile, user } = useAuth();
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const initialFormState: Partial<Imovel> = {
    titulo: '',
    ref: '',
    tipo_imovel: 'apartamento',
    tipologia: 'T2',
    estado_conservacao: 'usado',
    ano_construcao: null,
    operacao: 'venda',
    arrendamento_tipo: null,
    disponivel_imediato: true,
    localizacao: {
      pais: 'PT', distrito: 'Lisboa', concelho: '', freguesia: '',
      codigo_postal: '', morada: '', porta: '', lat: null, lng: null, expor_morada: false
    },
    areas: {
      area_util_m2: null, area_bruta_m2: null, area_terreno_m2: null,
      pisos: 1, andar: '', elevador: false
    },
    divisoes: { quartos: 2, casas_banho: 1, garagem: { tem: false, lugares: 0 } },
    financeiro: {
      preco_venda: null, preco_arrendamento: null, negociavel: false,
      condominio_mensal: null, imi_anual: null, caucao_meses: null, despesas_incluidas: []
    },
    descricao: { curta: '', completa_md: '', gerada_por_ia: false, ultima_geracao_ia_at: null },
    certificacao: { certificado_energetico: 'Em preparação', licenca_utilizacao: '', licenca_utilizacao_numero: '', licenca_utilizacao_data: '', isento_licenca_utilizacao: false },
    publicacao: { estado: 'publicado', publicar_no_site: true, destaque: false, badges: [], data_publicacao: null },
    media: { cover_media_id: null, total: 0 },
    caracteristicas: []
  };

  const [formData, setFormData] = useState<Partial<Imovel>>(initialFormState);
  const [tempMedia, setTempMedia] = useState<ImovelMedia[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const loadProperties = async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending' || profile.tenantId === 'default') {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await PropertyService.getProperties(profile.tenantId);
      
      const enriched = await Promise.all(data.map(async (p) => {
        if (!p.media?.items || p.media.items.length === 0) {
          const items = await PropertyService.getPropertyMedia(profile.tenantId, p.id);
          return { ...p, media: { ...p.media, items } };
        }
        return p;
      }));
      
      setProperties(enriched);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProperties(); }, [profile?.tenantId]);

  const handleTogglePublish = async (imovel: Imovel) => {
    if (!profile?.tenantId) return;
    const newState = !imovel.publicacao?.publicar_no_site;
    try {
      await PropertyService.updateProperty(profile.tenantId, imovel.id, {
        publicacao: { ...imovel.publicacao, publicar_no_site: newState }
      });
      loadProperties();
    } catch (error) { alert("Erro ao atualizar visibilidade."); }
  };

  const handleToggleDestaque = async (imovel: Imovel) => {
    if (!profile?.tenantId) return;
    const newState = !imovel.publicacao?.destaque;
    try {
      await PropertyService.updateProperty(profile.tenantId, imovel.id, {
        publicacao: { ...imovel.publicacao, destaque: newState }
      });
      loadProperties();
    } catch (error) { alert("Erro ao atualizar destaque."); }
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setTempMedia([]);
    setCurrentStep(1);
    setIsModalOpen(true);
    setSaveError(null);
  };

  const handleEdit = async (imovel: Imovel) => {
    setEditingId(imovel.id);
    setSaveError(null);
    setFormData({
      ...initialFormState,
      ...imovel,
      financeiro: { ...initialFormState.financeiro, ...(imovel.financeiro || {}) },
      localizacao: { ...initialFormState.localizacao, ...(imovel.localizacao || {}) },
      divisoes: { ...initialFormState.divisoes, ...(imovel.divisoes || {}) },
      areas: { ...initialFormState.areas, ...(imovel.areas || {}) },
      descricao: { ...initialFormState.descricao, ...(imovel.descricao || {}) },
      publicacao: { ...initialFormState.publicacao, ...(imovel.publicacao || {}) },
    });
    setCurrentStep(1);
    
    if (profile?.tenantId) {
      try {
        const media = await PropertyService.getPropertyMedia(profile.tenantId, imovel.id);
        setTempMedia(media);
      } catch (err) {
        console.error("Erro ao carregar media:", err);
      }
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!profile?.tenantId || !window.confirm("Tem a certeza que deseja apagar este imóvel?")) return;
    try {
      await PropertyService.deleteProperty(profile.tenantId, id);
      loadProperties();
    } catch (error) {
      alert("Erro ao apagar imóvel.");
    }
  };

  const handleSave = async () => {
    if (!profile?.tenantId || !user) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      if (editingId) {
        await PropertyService.updateProperty(profile.tenantId, editingId, formData, tempMedia);
      } else {
        const slug = generateSlug(`${formData.titulo || 'imovel'}-${Date.now()}`);
        const finalPayload = {
          ...formData,
          slug,
          owner_uid: user.uid
        };
        await PropertyService.createProperty(profile.tenantId, finalPayload, tempMedia);
      }
      setIsModalOpen(false);
      loadProperties();
      setEditingId(null);
    } catch (err: any) {
      console.error("Save Error:", err);
      setSaveError(err.message || "Erro de permissão ou conexão ao guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    setSaveError(null);
    try {
      const result = await generatePropertyDescription(formData);
      setFormData((prev: any) => ({ 
        ...prev, 
        descricao: { 
          ...(prev.descricao || {}), 
          curta: result.curta,
          completa_md: result.completa,
          gerada_por_ia: true,
          ultima_geracao_ia_at: new Date()
        } 
      }));
    } catch (error: any) {
      console.error(error);
      setSaveError("Erro ao gerar descrição com IA. Verifique os dados do imóvel.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddMedia = (url: string) => {
    if (!url) return;
    const newMedia: ImovelMedia = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'image',
      url,
      storage_path: '',
      order: tempMedia.length,
      is_cover: tempMedia.length === 0,
      alt: formData.titulo || '',
      created_at: new Date()
    };
    setTempMedia(prev => [...prev, newMedia]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => handleAddMedia(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedItemIndex === null) return;
    const items = [...tempMedia];
    const draggedItem = items[draggedItemIndex];
    items.splice(draggedItemIndex, 1);
    items.splice(index, 0, draggedItem);
    
    const reordered = items.map((item, i) => ({ 
      ...item, 
      order: i,
      is_cover: i === 0 
    }));
    setTempMedia(reordered);
    setDraggedItemIndex(null);
  };

  return (
    <div className="space-y-6 font-brand">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1c2d51]">Gestão de Imóveis</h1>
          <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Inventário Completo</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-slate-900/10"><Plus size={20} /> Novo Imóvel</button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-[#1c2d51] rounded-xl flex items-center justify-center"><Building2 size={20}/></div>
                  <h3 className="text-xl font-black text-[#1c2d51]">{editingId ? 'Editar Imóvel' : 'Novo Imóvel Profissional'}</h3>
               </div>
               <div className="hidden md:flex items-center gap-2">
                  {[1,2,3,4,5,6].map(s => (
                    <div key={s} className={`h-1.5 w-10 rounded-full transition-all ${currentStep >= s ? 'bg-[#1c2d51]' : 'bg-slate-100'}`}></div>
                  ))}
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
              {saveError && (
                <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] flex items-center gap-4 text-sm font-bold mb-8 border border-red-100 animate-in shake duration-300">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm"><AlertCircle size={20} /></div>
                  <div>
                    <p className="uppercase text-[10px] tracking-widest opacity-60">Mensagem do Sistema</p>
                    <p>{saveError}</p>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <SectionTitle title="1. Identificação" subtitle="Dados base e classificação" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Referência Interna" required><input placeholder="IMOS-2024-001" className="admin-input" value={formData.ref} onChange={e => setFormData({...formData, ref: e.target.value})} /></InputGroup>
                      <InputGroup label="Título Comercial" required><input placeholder="Ex: Apartamento T3 com Terraço" className="admin-input" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} /></InputGroup>
                      <InputGroup label="Tipo de Imóvel">
                         <select className="admin-input" value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value as any})}>
                            <option value="apartamento">Apartamento</option><option value="moradia">Moradia</option><option value="predio">Prédio</option><option value="terreno">Terreno</option><option value="comercial">Comercial</option>
                         </select>
                      </InputGroup>
                      <InputGroup label="Tipologia">
                         <select className="admin-input" value={formData.tipologia} onChange={e => setFormData({...formData, tipologia: e.target.value})}>
                            <option>T0</option><option>T1</option><option>T2</option><option>T3</option><option>T4</option><option>T5+</option>
                         </select>
                      </InputGroup>
                      <InputGroup label="Estado">
                         <select className="admin-input" value={formData.estado_conservacao} onChange={e => setFormData({...formData, estado_conservacao: e.target.value as any})}>
                            <option value="novo">Novo</option><option value="usado">Usado</option><option value="renovado">Renovado</option><option value="para_renovar">Para recuperar</option>
                         </select>
                      </InputGroup>
                      <InputGroup label="Ano de Construção"><input type="number" className="admin-input" value={formData.ano_construcao || ''} onChange={e => setFormData({...formData, ano_construcao: Number(e.target.value) || null})} /></InputGroup>
                   </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <SectionTitle title="2. Operação & Regime" subtitle="Como será comercializado" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Tipo de Operação">
                        <div className="flex gap-2">
                           {['venda', 'arrendamento'].map(op => (
                             <button key={op} onClick={() => setFormData({...formData, operacao: op as any})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${formData.operacao === op ? 'bg-[#1c2d51] text-white' : 'bg-white text-slate-300'}`}>{op}</button>
                           ))}
                        </div>
                      </InputGroup>
                      {formData.operacao === 'arrendamento' && (
                        <InputGroup label="Tipo Arrendamento">
                           <select className="admin-input" value={formData.arrendamento_tipo || ''} onChange={e => setFormData({...formData, arrendamento_tipo: e.target.value as any})}>
                              <option value="residencial">Habitação Permanente</option><option value="temporario">Temporário / Nomad</option><option value="ferias">Alojamento Local / Férias</option>
                           </select>
                        </InputGroup>
                      )}
                      <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between col-span-2">
                         <div className="flex items-center gap-3"><Zap className="text-[#1c2d51]"/><span className="text-xs font-black uppercase">Disponível Imediatamente?</span></div>
                         <button onClick={() => setFormData({...formData, disponivel_imediato: !formData.disponivel_imediato})} className={`w-14 h-8 rounded-full relative transition-all ${formData.disponivel_imediato ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${formData.disponivel_imediato ? 'right-1' : 'left-1'}`}></div></button>
                      </div>
                   </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <SectionTitle title="3. Localização" subtitle="Dados geográficos detalhados" />
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputGroup label="Distrito"><input className="admin-input" value={formData.localizacao?.distrito} onChange={e => setFormData({...formData, localizacao: { ...formData.localizacao!, distrito: e.target.value }})} /></InputGroup>
                      <InputGroup label="Concelho" required><input className="admin-input" value={formData.localizacao?.concelho} onChange={e => setFormData({...formData, localizacao: { ...formData.localizacao!, concelho: e.target.value }})} /></InputGroup>
                      <InputGroup label="Freguesia"><input className="admin-input" value={formData.localizacao?.freguesia || ''} onChange={e => setFormData({...formData, localizacao: { ...formData.localizacao!, freguesia: e.target.value }})} /></InputGroup>
                      <div className="md:col-span-2"><InputGroup label="Morada Completa"><input className="admin-input" value={formData.localizacao?.morada || ''} onChange={e => setFormData({...formData, localizacao: { ...formData.localizacao!, morada: e.target.value }})} /></InputGroup></div>
                      <InputGroup label="Código Postal"><input className="admin-input" placeholder="1000-000" value={formData.localizacao?.codigo_postal || ''} onChange={e => setFormData({...formData, localizacao: { ...formData.localizacao!, codigo_postal: e.target.value }})} /></InputGroup>
                   </div>
                   <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-between">
                      <div className="flex items-center gap-3 text-blue-600"><ShieldCheck size={24}/><div><p className="text-xs font-black uppercase">Privacidade</p><p className="text-[10px] uppercase font-bold opacity-70">Expor morada exata no site público?</p></div></div>
                      <button onClick={() => setFormData({...formData, localizacao: { ...formData.localizacao!, expor_morada: !formData.localizacao?.expor_morada }})} className={`w-14 h-8 rounded-full relative transition-all ${formData.localizacao?.expor_morada ? 'bg-blue-600' : 'bg-slate-200'}`}><div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${formData.localizacao?.expor_morada ? 'right-1' : 'left-1'}`}></div></button>
                   </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <SectionTitle title="4. Áreas & Divisões" subtitle="Dimensões e espaços funcionais" />
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputGroup label="Área Útil (m²)"><input type="number" className="admin-input" value={formData.areas?.area_util_m2 || ''} onChange={e => setFormData({...formData, areas: { ...formData.areas!, area_util_m2: Number(e.target.value) }})} /></InputGroup>
                      <InputGroup label="Area Bruta (m²)"><input type="number" className="admin-input" value={formData.areas?.area_bruta_m2 || ''} onChange={e => setFormData({...formData, areas: { ...formData.areas!, area_bruta_m2: Number(e.target.value) }})} /></InputGroup>
                      <InputGroup label="Andar"><input className="admin-input" value={formData.areas?.andar || ''} onChange={e => setFormData({...formData, areas: { ...formData.areas!, andar: e.target.value }})} /></InputGroup>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <Counter label="Quartos" value={formData.divisoes?.quartos || 0} onChange={v => setFormData({...formData, divisoes: { ...formData.divisoes!, quartos: v }})} />
                      <Counter label="Casas Banho" value={formData.divisoes?.casas_banho || 0} onChange={v => setFormData({...formData, divisoes: { ...formData.divisoes!, casas_banho: v }})} />
                      <div className="p-6 bg-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center col-span-2">
                         <span className="text-[10px] font-black uppercase text-slate-400 mb-2">Lugar de Garagem</span>
                         <div className="flex items-center gap-6">
                            <button onClick={() => setFormData({...formData, divisoes: { ...formData.divisoes!, garagem: { tem: !formData.divisoes?.garagem?.tem, lugares: 1}}})} className={`px-4 py-2 rounded-xl text-[10px] font-black border uppercase ${formData.divisoes?.garagem?.tem ? 'bg-[#1c2d51] text-white' : 'bg-white'}`}>Sim</button>
                            <input type="number" placeholder="Nº" className="w-16 bg-white border-none rounded-xl p-2 text-center font-bold" value={formData.divisoes?.garagem?.lugares || ''} onChange={e => setFormData({...formData, divisoes: { ...formData.divisoes!, garagem: { ...formData.divisoes!.garagem, lugares: Number(e.target.value) } }})} />
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <SectionTitle title="5. Financeiro & Legal" subtitle="Preços, impostos e certificações" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-slate-50 p-8 rounded-[3rem] space-y-6">
                         <InputGroup label={formData.operacao === 'venda' ? 'Preço de Venda (€)' : 'Preço Arrendamento (€)'} required>
                            <div className="relative">
                               <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                               <input type="number" className="admin-input pl-12" value={(formData.operacao === 'venda' ? formData.financeiro?.preco_venda : formData.financeiro?.preco_arrendamento) || ''} onChange={e => {
                                   const val = Number(e.target.value);
                                   setFormData(prev => ({
                                     ...prev,
                                     financeiro: {
                                       ...(prev.financeiro || { preco_venda: null, preco_arrendamento: null, negociavel: false, condominio_mensal: null, imi_anual: null, caucao_meses: null, despesas_incluidas: [] }),
                                       [formData.operacao === 'venda' ? 'preco_venda' : 'preco_arrendamento']: val
                                     }
                                   }));
                                 }} 
                               />
                            </div>
                         </InputGroup>
                         <div className="grid grid-cols-2 gap-4">
                           <InputGroup label="Condomínio /mês"><input type="number" className="admin-input" value={formData.financeiro?.condominio_mensal || ''} onChange={e => setFormData((prev:any) => ({ ...prev, financeiro: { ...(prev.financeiro || {}), condominio_mensal: Number(e.target.value) } }))} /></InputGroup>
                           <InputGroup label="IMI Anual"><input type="number" className="admin-input" value={formData.financeiro?.imi_anual || ''} onChange={e => setFormData((prev:any) => ({ ...prev, financeiro: { ...(prev.financeiro || {}), imi_anual: Number(e.target.value) } }))} /></InputGroup>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <InputGroup label="Certificado Energético">
                            <select className="admin-input" value={formData.certificacao?.certificado_energetico} onChange={e => setFormData((prev:any) => ({ ...prev, certificacao: { ...(prev.certificacao || {}), certificado_energetico: e.target.value } }))}>
                               {['A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'G', 'Isento', 'Em preparação'].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                         </InputGroup>
                         <InputGroup label="Licença Utilização"><input placeholder="Ex: 123/2020" className="admin-input" value={formData.certificacao?.licenca_utilizacao_numero || ''} onChange={e => setFormData((prev:any) => ({ ...prev, certificacao: { ...(prev.certificacao || {}), licenca_utilizacao_numero: e.target.value } }))} /></InputGroup>
                      </div>
                   </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <div className="flex items-center justify-between">
                     <SectionTitle title="6. Marketing & Media" subtitle="A imagem que vende o imóvel" />
                     <button onClick={handleAIGenerate} disabled={isGeneratingAI} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-30">
                        {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                        {isGeneratingAI ? "A Gerar Conteúdo..." : "Gerar com IA Gemini"}
                     </button>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Descrição Curta (SEO & Redes)</label>
                        <textarea rows={2} className="admin-input" value={formData.descricao?.curta || ''} onChange={e => setFormData((prev:any) => ({ ...prev, descricao: { ...(prev.descricao || {}), curta: e.target.value } }))} placeholder="Uma frase impactante para as listagens..."></textarea>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Descrição Completa (Markdown)</label>
                        <textarea rows={8} className="admin-input font-medium leading-relaxed" value={formData.descricao?.completa_md || ''} onChange={e => setFormData((prev:any) => ({ ...prev, descricao: { ...(prev.descricao || {}), completa_md: e.target.value } }))} placeholder="Descrição detalhada do imóvel..."></textarea>
                      </div>
                   </div>

                   <div className="space-y-6 pt-6">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-slate-400">Media & Fotos</label>
                        <span className="text-[9px] text-slate-400 font-bold uppercase italic">Arraste as fotos para mudar a ordem. A primeira será a capa.</span>
                      </div>
                      <div onClick={() => fileInputRef.current?.click()} className="bg-slate-50 p-12 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-4 cursor-pointer hover:bg-slate-100 transition-all"><UploadCloud className="mx-auto text-slate-300" size={48}/><div><p className="text-sm font-black text-[#1c2d51] uppercase tracking-tight">Carregar Fotos do Imóvel</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Clique para selecionar ficheiros</p></div><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" /></div>
                      
                      {tempMedia.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                           {tempMedia.map((m, idx) => (
                             <div 
                               key={m.id} 
                               draggable
                               onDragStart={() => handleDragStart(idx)}
                               onDragOver={(e) => handleDragOver(e, idx)}
                               onDrop={() => handleDrop(idx)}
                               className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${m.is_cover || idx === 0 ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100'}`}
                             >
                                <img src={m.url} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="bg-white/90 backdrop-blur p-1 rounded-md text-slate-400 shadow-sm"><GripVertical size={12}/></div>
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                   <button onClick={() => {
                                     const newMedia = tempMedia.map((item, i) => ({ ...item, is_cover: i === idx }));
                                     setTempMedia(newMedia);
                                   }} className="p-2 bg-white rounded-lg hover:text-blue-500 shadow-sm transition-transform active:scale-90"><Star size={14} fill={(m.is_cover || idx === 0) ? 'currentColor' : 'none'} /></button>
                                   <button onClick={() => setTempMedia(tempMedia.filter((_, i) => i !== idx))} className="p-2 bg-white rounded-lg text-red-500 shadow-sm transition-transform active:scale-90"><Trash size={14}/></button>
                                </div>
                                {(m.is_cover || idx === 0) && <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Capa</div>}
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>

            <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
               <button onClick={handleBack} disabled={currentStep === 1} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] disabled:opacity-30"><ChevronLeft size={16}/> Voltar</button>
               <span className="text-[10px] font-black uppercase text-slate-300">Passo {currentStep} de {totalSteps}</span>
               {currentStep < totalSteps ? (
                 <button onClick={handleNext} className="bg-[#1c2d51] text-white px-10 py-4 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:translate-x-1 transition-all">Seguinte <ChevronRight size={16}/></button>
               ) : (
                 <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-12 py-4 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-xl shadow-[#1c2d51]/20 transition-all active:scale-95">{isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16}/>} {editingId ? 'Guardar Alterações' : 'Publicar Imóvel'}</button>
               )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="text" placeholder="Filtrar inventário por ref ou título..." className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Imóvel / Ref</th>
                <th className="px-8 py-5">Tipo & Negócio</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" /></td></tr>
              ) : properties.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-bold uppercase text-[10px]">Sem imóveis no inventário.</td></tr>
              ) : properties.filter(p => p.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || p.ref?.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden font-black text-slate-300 flex items-center justify-center border border-slate-200 flex-shrink-0">
                        {p.media?.items && p.media.items.length > 0 ? (
                          <img src={p.media.items[0].url} className="w-full h-full object-cover" alt={p.titulo} />
                        ) : (
                          p.titulo?.charAt(0) || "?"
                        )}
                      </div>
                      <div>
                        <div className="font-black text-sm text-[#1c2d51]">{p.titulo}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">REF: {p.ref} &bull; {formatCurrency(p.financeiro?.preco_venda || p.financeiro?.preco_arrendamento)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5"><span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{p.tipo_imovel} &bull; {p.operacao}</span></td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleTogglePublish(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${p.publicacao?.publicar_no_site ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                        title={p.publicacao?.publicar_no_site ? "Ocultar do Site" : "Publicar no Site"}
                      >
                        {p.publicacao?.publicar_no_site ? <Eye size={14}/> : <EyeOff size={14}/>}
                      </button>
                      <button 
                        onClick={() => handleToggleDestaque(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${p.publicacao?.destaque ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}
                        title={p.publicacao?.destaque ? "Remover Destaque" : "Marcar como Destaque"}
                      >
                        <Star size={14} fill={p.publicacao?.destaque ? "currentColor" : "none"}/>
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => handleEdit(p)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#1c2d51] hover:border-slate-300 hover:shadow-sm transition-all" title="Editar"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(p.id)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-red-400 hover:bg-red-50 hover:border-red-100 hover:shadow-sm transition-all" title="Apagar"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
               ))
              }
            </tbody>
          </table>
        </div>
      </div>
      <style>{`.admin-input { width: 100%; padding: 1rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }.admin-input:focus { background: #fff; border-color: #1c2d51; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }`}</style>
    </div>
  );
};

const SectionTitle = ({ title, subtitle }: any) => (<div><h4 className="text-2xl font-black text-[#1c2d51] tracking-tighter">{title}</h4><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{subtitle}</p></div>);
const InputGroup = ({ label, children, required }: any) => (<div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">{label}{required && '*'}</label>{children}</div>);
const Counter = ({ label, value, onChange }: any) => (
  <div className="bg-slate-50 p-6 rounded-[2rem] flex flex-col items-center justify-center">
     <span className="text-[9px] font-black uppercase text-slate-400 mb-3">{label}</span>
     <div className="flex items-center gap-4"><button onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 rounded-full bg-white text-lg font-black shadow-sm">-</button><span className="text-xl font-black">{value}</span><button onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full bg-white text-lg font-black shadow-sm">+</button></div>
  </div>
);
export default AdminImoveis;
