
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Imovel, TipoImovel, ImovelMedia } from '../../types';
import { 
  Plus, X, Loader2, AlertCircle, Sparkles, Check, ChevronRight, ChevronLeft, 
  Trash, UploadCloud, Building2, Star, Zap, Brush, MoveUp, MoveDown,
  Info, MapPin, Eye, FileText, Camera, Video, Layers, Map, Globe
} from 'lucide-react';
import { formatCurrency, generateSlug } from '../../lib/utils';
import { generatePropertyDescription } from '../../services/geminiService';

const EXTRAS_OPTIONS = [
  "Ar Condicionado", "Aquecimento Central", "Painéis Solares", 
  "Lareira", "Cozinha Equipada", "Mobilado", 
  "Vista Mar", "Vista Rio", "Vista Cidade"
];

const AdminImoveis: React.FC = () => {
  const { profile, user } = useAuth();
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [aiTone, setAiTone] = useState<string>('formal');

  const initialFormState: Partial<Imovel> = {
    titulo: '', ref: '', tipo_imovel: 'apartamento', tipologia: 'T2', tipology: 'T2',
    estado_conservacao: 'usado', ano_construcao: null, operacao: 'venda', 
    arrendamento_tipo: 'residencial', arrendamento_duracao_min_meses: null, disponivel_imediato: true,
    localizacao: { pais: 'Portugal', distrito: 'Lisboa', concelho: '', freguesia: '', codigo_postal: '', morada: '', porta: '', lat: null, lng: null, expor_morada: false },
    areas: { area_util_m2: null, area_bruta_m2: null, area_terreno_m2: null, pisos: 1, andar: '', elevador: false },
    divisoes: { quartos: 0, casas_banho: 0, garagem: { tem: false, lugares: 0 }, varanda: false, arrecadacao: false, piscina: false, jardim: false },
    financeiro: { preco_venda: null, preco_arrendamento: null, negociavel: false, comissao_incluida: true, condominio_mensal: null, imi_anual: null, caucao_meses: null, despesas_incluidas: [] },
    descricao: { curta: '', completa_md: '', gerada_por_ia: false, ultima_geracao_ia_at: null },
    certificacao: { certificado_energetico: 'C', licenca_utilizacao: 'Sim', licenca_utilizacao_numero: '', licenca_utilizacao_data: '', isento_licenca_utilizacao: false, estado_licenca: 'sim' },
    publicacao: { estado: 'publicado', publicar_no_site: true, destaque: false, badges: [], data_publicacao: null },
    media: { cover_media_id: null, total: 0 },
    caracteristicas: []
  };

  const [formData, setFormData] = useState<Partial<Imovel>>(initialFormState);
  const [tempMedia, setTempMedia] = useState<ImovelMedia[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const loadProperties = useCallback(async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    setIsLoading(true);
    try {
      const data = await PropertyService.getProperties(profile.tenantId);
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally { 
      setIsLoading(false); 
    }
  }, [profile?.tenantId]);

  useEffect(() => { 
    loadProperties(); 
  }, [loadProperties]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setTempMedia([]);
    setCurrentStep(1);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (imovel: Imovel) => {
    setEditingId(imovel.id);
    setFormData({ 
      ...initialFormState, 
      ...imovel, 
      tipology: imovel.tipologia || imovel.tipology,
      caracteristicas: Array.isArray(imovel.caracteristicas) ? imovel.caracteristicas : [] 
    });
    setSaveError(null);
    setCurrentStep(1);
    if (profile?.tenantId) {
      const media = await PropertyService.getPropertyMedia(profile.tenantId, imovel.id);
      setTempMedia(media);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!profile?.tenantId) return;
    if (window.confirm("Deseja apagar este imóvel permanentemente?")) {
      try {
        await PropertyService.deleteProperty(profile.tenantId, id);
        await loadProperties();
      } catch (err) {
        alert("Erro ao apagar.");
      }
    }
  };

  const handleSave = async () => {
    if (!profile?.tenantId || !user) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const finalData = {
        ...formData,
        tipologia: formData.tipologia || formData.tipology
      };

      if (editingId) {
        await PropertyService.updateProperty(profile.tenantId, editingId, finalData, tempMedia);
      } else {
        const slug = generateSlug(`${formData.titulo || 'imovel'}-${Date.now()}`);
        await PropertyService.createProperty(profile.tenantId, { ...finalData, slug, owner_uid: user.uid }, tempMedia);
      }
      setIsModalOpen(false);
      await loadProperties();
    } catch (err: any) {
      console.error(err);
      setSaveError("Erro ao gravar. Verifique os campos.");
    } finally { setIsSaving(false); }
  };

  const handleAIGenerate = async () => {
    if (!formData.titulo) {
      setSaveError("Defina um título primeiro.");
      return;
    }
    setIsGeneratingAI(true);
    try {
      const result = await generatePropertyDescription(formData, aiTone);
      setFormData(prev => ({
        ...prev,
        descricao: {
          curta: result.curta,
          completa_md: result.completa,
          gerada_por_ia: true,
          ultima_geracao_ia_at: new Date()
        } as any
      }));
    } catch (error: any) {
      setSaveError("IA erro: " + error.message);
    } finally { setIsGeneratingAI(false); }
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const isVideo = file.type.startsWith('video/');
        const isPdf = file.type === 'application/pdf';
        const type: any = isVideo ? 'video' : isPdf ? 'document' : 'image';
        
        const newMedia: ImovelMedia = {
          id: crypto.randomUUID(),
          type,
          url: reader.result as string,
          storage_path: '',
          order: tempMedia.length,
          is_cover: type === 'image' && tempMedia.filter(m => m.type === 'image').length === 0,
          alt: formData.titulo || '',
          created_at: new Date()
        };
        setTempMedia(prev => [...prev, newMedia]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
  };

  const toggleFeature = (f: string) => {
    const current = formData.caracteristicas || [];
    if (current.includes(f)) {
      setFormData({...formData, caracteristicas: current.filter(x => x !== f)});
    } else {
      setFormData({...formData, caracteristicas: [...current, f]});
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: 
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">1</div>
              <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Identificação do Imóvel</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Referência Interna (Única)" value={formData.ref} onChange={v => setFormData({...formData, ref: v})} placeholder="Ex: IMO-001" />
              <Field label="Título do Anúncio *" value={formData.titulo} onChange={v => setFormData({...formData, titulo: v})} placeholder="Ex: Apartamento Moderno com Vista Rio" />
              <Select label="Tipo de Imóvel" value={formData.tipo_imovel} onChange={v => setFormData({...formData, tipo_imovel: v as any})}>
                <option value="apartamento">Apartamento</option>
                <option value="moradia">Moradia</option>
                <option value="casa_rustica">Casa Rústica</option>
                <option value="ruina">Ruína</option>
                <option value="escritorio">Escritório</option>
                <option value="comercial">Espaço Comercial / Armazém</option>
                <option value="garagem">Lugar de Garagem</option>
                <option value="arrecadacao">Arrecadação</option>
                <option value="predio">Prédio</option>
                <option value="terreno">Terreno</option>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Tipologia" value={formData.tipologia} onChange={v => setFormData({...formData, tipologia: v, tipology: v})}>
                  {['T0', 'T1', 'T2', 'T3', 'T4', 'T5+'].map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
                <Select label="Estado do Imóvel" value={formData.estado_conservacao} onChange={v => setFormData({...formData, estado_conservacao: v as any})}>
                  <option value="novo">Novo</option><option value="usado">Usado</option><option value="renovado">Renovado</option><option value="para_renovar">Para renovar</option>
                </Select>
              </div>
              <Field label="Ano de Construção" type="number" value={formData.ano_construcao || ''} onChange={v => setFormData({...formData, ano_construcao: v ? Number(v) : null})} placeholder="Ex: 2024" />
            </div>
          </div>
        );

      case 2: 
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">2</div>
              <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Operação / Regime</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Tipo de Operação" value={formData.operacao} onChange={v => setFormData({...formData, operacao: v as any})}>
                <option value="venda">Venda</option>
                <option value="arrendamento">Arrendamento</option>
                <option value="venda_arrendamento">Venda e Arrendamento</option>
              </Select>
              {(formData.operacao === 'arrendamento' || formData.operacao === 'venda_arrendamento') && (
                <>
                  <Select label="Tipo de Arrendamento" value={formData.arrendamento_tipo} onChange={v => setFormData({...formData, arrendamento_tipo: v as any})}>
                    <option value="residencial">Residencial (Habitação permanente)</option>
                    <option value="temporario">Temporário (Estudos, trabalho)</option>
                    <option value="ferias">Férias / Alojamento Turístico</option>
                  </Select>
                  <Field label="Duração Mínima (meses)" type="number" value={formData.arrendamento_duracao_min_meses || ''} onChange={v => setFormData({...formData, arrendamento_duracao_min_meses: v ? Number(v) : null})} />
                </>
              )}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-[#1c2d51]">Disponibilidade Imediata</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Imóvel pronto a entrar</p>
                </div>
                <Toggle checked={formData.disponivel_imediato || false} onChange={v => setFormData({...formData, disponivel_imediato: v})} />
              </div>
            </div>
          </div>
        );

      case 3: 
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">3</div>
              <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Localização</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="País" value={formData.localizacao?.pais} onChange={v => setFormData({...formData, localizacao: {...formData.localizacao!, pais: v}})} />
              <Field label="Distrito" value={formData.localizacao?.distrito} onChange={v => setFormData({...formData, localizacao: {...formData.localizacao!, distrito: v}})} />
              <Field label="Concelho" value={formData.localizacao?.concelho} onChange={v => setFormData({...formData, localizacao: {...formData.localizacao!, concelho: v}})} />
              <Field label="Freguesia" value={formData.localizacao?.freguesia || ''} onChange={v => setFormData({...formData, localizacao: {...formData.localizacao!, freguesia: v}})} />
              <div className="md:col-span-2"><Field label="Morada Completa" value={formData.localizacao?.morada || ''} onChange={v => setFormData({...formData, localizacao: {...formData.localizacao!, morada: v}})} /></div>
              <Field label="Código Postal" value={formData.localizacao?.codigo_postal || ''} onChange={v => setFormData({...formData, localizacao: {...formData.localizacao!, codigo_postal: v}})} />
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div><p className="text-[10px] font-black uppercase text-[#1c2d51]">Expor morada publicamente</p><p className="text-[8px] text-slate-400 font-bold uppercase">Mostrar rua e porta no site</p></div>
                <Toggle checked={formData.localizacao?.expor_morada || false} onChange={v => setFormData({...formData, localizacao: {...formData.localizacao!, expor_morada: v}})} />
              </div>
            </div>
          </div>
        );

      case 4: 
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">4</div>
              <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Áreas e Dimensões</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Área Útil (m²)" type="number" value={formData.areas?.area_util_m2 || ''} onChange={v => setFormData({...formData, areas: {...formData.areas!, area_util_m2: Number(v)}})} />
              <Field label="Área Bruta (m²)" type="number" value={formData.areas?.area_bruta_m2 || ''} onChange={v => setFormData({...formData, areas: {...formData.areas!, area_bruta_m2: Number(v)}})} />
              <Field label="Área de Terreno (m²)" type="number" value={formData.areas?.area_terreno_m2 || ''} onChange={v => setFormData({...formData, areas: {...formData.areas!, area_terreno_m2: Number(v)}})} />
              <Field label="Número de Pisos" type="number" value={formData.areas?.pisos || ''} onChange={v => setFormData({...formData, areas: {...formData.areas!, pisos: Number(v)}})} />
              {formData.tipo_imovel === 'apartamento' && <Field label="Andar" value={formData.areas?.andar || ''} onChange={v => setFormData({...formData, areas: {...formData.areas!, andar: v}})} />}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div><p className="text-[10px] font-black uppercase text-[#1c2d51]">Elevador</p><p className="text-[8px] text-slate-400 font-bold uppercase">Prédio com elevador</p></div>
                <Toggle checked={formData.areas?.elevador || false} onChange={v => setFormData({...formData, areas: {...formData.areas!, elevador: v}})} />
              </div>
            </div>
          </div>
        );

      case 5: 
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">5</div>
              <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Características do Imóvel</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <Field label="Quartos" type="number" value={formData.divisoes?.quartos || 0} onChange={v => setFormData({...formData, divisoes: {...formData.divisoes!, quartos: Number(v)}})} />
                   <Field label="Casas de Banho" type="number" value={formData.divisoes?.casas_banho || 0} onChange={v => setFormData({...formData, divisoes: {...formData.divisoes!, casas_banho: Number(v)}})} />
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-[#1c2d51]">Garagem / Estacionamento</p>
                    <input type="number" className="mt-2 bg-transparent border-b border-slate-200 outline-none w-16 font-black text-sm" placeholder="Lugares" value={formData.divisoes?.garagem?.lugares || 0} onChange={e => setFormData({...formData, divisoes: {...formData.divisoes!, garagem: { tem: Number(e.target.value) > 0, lugares: Number(e.target.value) }}})} />
                  </div>
                  <Toggle checked={formData.divisoes?.garagem?.tem || false} onChange={v => setFormData({...formData, divisoes: {...formData.divisoes!, garagem: { ...formData.divisoes!.garagem, tem: v }}})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FeatureToggle label="Varanda" checked={formData.divisoes?.varanda || false} onChange={v => setFormData({...formData, divisoes: {...formData.divisoes!, varanda: v}})} />
                  <FeatureToggle label="Arrecadação" checked={formData.divisoes?.arrecadacao || false} onChange={v => setFormData({...formData, divisoes: {...formData.divisoes!, arrecadacao: v}})} />
                  <FeatureToggle label="Piscina" checked={formData.divisoes?.piscina || false} onChange={v => setFormData({...formData, divisoes: {...formData.divisoes!, piscina: v}})} />
                  <FeatureToggle label="Jardim" checked={formData.divisoes?.jardim || false} onChange={v => setFormData({...formData, divisoes: {...formData.divisoes!, jardim: v}})} />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 ml-2">Lista de Extras</p>
                <div className="grid grid-cols-1 gap-2">
                  {EXTRAS_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => toggleFeature(opt)} className={`p-3 rounded-xl border text-left text-[10px] font-black uppercase tracking-widest transition-all ${formData.caracteristicas?.includes(opt) ? 'bg-[#1c2d51] text-white border-[#1c2d51]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>
                       {formData.caracteristicas?.includes(opt) ? <Check size={12} className="inline mr-2"/> : <Plus size={12} className="inline mr-2"/>} {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6: 
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">6</div>
              <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Certificação e Legalidade</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Certificado Energético" value={formData.certificacao?.certificado_energetico} onChange={v => setFormData({...formData, certificacao: {...formData.certificacao!, certificado_energetico: v}})}>
                {['A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'G'].map(v => <option key={v} value={v}>{v}</option>)}
              </Select>
              <Select label="Licença de Utilização" value={formData.certificacao?.estado_licenca} onChange={v => setFormData({...formData, certificacao: {...formData.certificacao!, estado_licenca: v as any}})}>
                <option value="sim">Sim</option><option value="processo">Em processo</option><option value="isento">Isento</option>
              </Select>
              <Field label="IMI Estimado (Anual)" type="number" value={formData.financeiro?.imi_anual || ''} onChange={v => setFormData({...formData, financeiro: {...formData.financeiro!, imi_anual: Number(v)}})} />
              <Field label="Condomínio Mensal" type="number" value={formData.financeiro?.condominio_mensal || ''} onChange={v => setFormData({...formData, financeiro: {...formData.financeiro!, condominio_mensal: Number(v)}})} />
            </div>
          </div>
        );

      case 7: 
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">7</div>
              <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Preço e Condições</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Preço de Venda (€)" type="number" value={formData.financeiro?.preco_venda || ''} onChange={v => setFormData({...formData, financeiro: {...formData.financeiro!, preco_venda: Number(v)}})} />
              <Field label="Preço de Arrendamento (€)" type="number" value={formData.financeiro?.preco_arrendamento || ''} onChange={v => setFormData({...formData, financeiro: {...formData.financeiro!, preco_arrendamento: Number(v)}})} />
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400">Opções Financeiras</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-600 uppercase">Preço Negociável</span><Toggle checked={formData.financeiro?.negociavel || false} onChange={v => setFormData({...formData, financeiro: {...formData.financeiro!, negociavel: v}})} /></div>
                  <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-600 uppercase">Comissão Incluída</span><Toggle checked={formData.financeiro?.comissao_incluida || false} onChange={v => setFormData({...formData, financeiro: {...formData.financeiro!, comissao_incluida: v}})} /></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 8: // Descrição com IA Melhorada
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">8</div>
              <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Descrição do Imóvel</h4>
            </div>
            
            <div className="bg-[#1c2d51] p-8 rounded-[3rem] text-white shadow-2xl overflow-hidden relative group">
              <Sparkles size={120} className="absolute -right-10 -bottom-10 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
              <div className="relative z-10 space-y-6">
                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest">Inteligência Artificial ImoSuite</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Geramos o texto ideal baseado em dados reais de localização e características.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-4">
                   <div className="flex-1 w-full">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">Escolher Tom da Escrita</label>
                      <select 
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:bg-white/20"
                        value={aiTone}
                        onChange={e => setAiTone(e.target.value)}
                      >
                        <option value="formal" className="text-slate-900">Formal & Profissional</option>
                        <option value="casual" className="text-slate-900">Casual & Acolhedor</option>
                        <option value="luxo" className="text-slate-900">Sofisticado & Luxo</option>
                      </select>
                   </div>
                   <button onClick={handleAIGenerate} disabled={isGeneratingAI} className="bg-white text-[#1c2d51] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                      {isGeneratingAI ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16}/>} Gerar com IA
                   </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <Field label="Descrição Curta (Máx 350 carac.)" type="textarea" value={formData.descricao?.curta} onChange={v => setFormData({...formData, descricao: {...formData.descricao!, curta: v} as any})} rows={2} />
               <Field label="Descrição Completa (Pode editar manualmente)" type="textarea" value={formData.descricao?.completa_md} onChange={v => setFormData({...formData, descricao: {...formData.descricao!, completa_md: v} as any})} rows={10} />
            </div>
          </div>
        );

      case 9: 
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">9</div>
              <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Galeria & Media</h4>
            </div>
            <div onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()} className={`bg-slate-50 p-20 rounded-[3rem] border-2 border-dashed text-center cursor-pointer transition-all ${dragActive ? 'border-[#1c2d51] bg-blue-50' : 'border-slate-200 hover:bg-slate-100'}`}>
              <UploadCloud className="mx-auto text-slate-300 mb-4" size={48}/><p className="text-xs font-black text-[#1c2d51] uppercase tracking-widest">Fotos, Vídeos, Plantas ou PDFs</p><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*,video/*,application/pdf" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
              {tempMedia.sort((a,b) => a.order - b.order).map((m, idx) => (
                <div key={m.id} className={`relative aspect-square rounded-[2rem] overflow-hidden group shadow-md border-2 ${m.is_cover ? 'border-emerald-500' : 'border-transparent'}`}>
                  {m.type === 'image' && <img src={m.url} className="w-full h-full object-cover" />}
                  {m.type === 'video' && <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white"><Video size={32}/></div>}
                  {m.type === 'document' && <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400"><FileText size={32}/></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                     <div className="flex justify-end gap-1"><button onClick={() => { const n = [...tempMedia]; if(idx>0) [n[idx], n[idx-1]] = [n[idx-1], n[idx]]; setTempMedia(n.map((x,i)=>({...x, order:i}))); }} className="p-1.5 bg-white/90 rounded-lg text-slate-700 hover:bg-white"><MoveUp size={12}/></button></div>
                     <div className="flex justify-center gap-2">{m.type === 'image' && <button onClick={() => setTempMedia(tempMedia.map((item, i) => ({ ...item, is_cover: i === idx })))} className={`p-2 rounded-xl shadow-lg transition-all ${m.is_cover ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 hover:text-[#1c2d51]'}`}><Star size={16}/></button>}<button onClick={() => setTempMedia(tempMedia.filter((_, i) => i !== idx))} className="bg-white p-2 rounded-xl text-red-500 shadow-lg hover:bg-red-50 transition-all"><Trash size={16}/></button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 10: 
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">10</div>
              <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Publicação e Visibilidade</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Select label="Estado do Negócio" value={formData.publicacao?.estado} onChange={v => setFormData({...formData, publicacao: {...formData.publicacao!, estado: v as any}})}>
                <option value="rascunho">Rascunho</option><option value="publicado">Publicado (Activo)</option><option value="reservado">Reservado</option><option value="vendido">Vendido / Arrendado</option>
              </Select>
              <Field label="Data de Publicação" type="date" value={formData.publicacao?.data_publicacao || ''} onChange={v => setFormData({...formData, publicacao: {...formData.publicacao!, data_publicacao: v}})} />
              <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-between md:col-span-2"><div><h4 className="font-black text-[#1c2d51] text-sm">Visibilidade no Website</h4><p className="text-[10px] text-slate-400 font-bold uppercase">Tornar o imóvel acessível ao público.</p></div><Toggle checked={formData.publicacao?.publicar_no_site || false} onChange={v => setFormData({...formData, publicacao: {...formData.publicacao!, publicar_no_site: v}})} /></div>
              <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-between md:col-span-2"><div><h4 className="font-black text-[#1c2d51] text-sm">Destaque na Homepage</h4><p className="text-[10px] text-slate-400 font-bold uppercase">Exibir na secção premium da agência.</p></div><Toggle checked={formData.publicacao?.destaque || false} onChange={v => setFormData({...formData, publicacao: {...formData.publicacao!, destaque: v}})} /></div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="space-y-6 font-brand animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-black text-[#1c2d51] tracking-tighter">Inventário de Imóveis</h1><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Gestão de carteira e portfólio</p></div>
        <button onClick={handleOpenCreate} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:scale-105 transition-all"><Plus size={20} /> Novo Imóvel</button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-full max-h-[95vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="relative">
               <div className="px-12 py-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                 <div className="flex items-center gap-4"><div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1c2d51]"><Building2 size={24}/></div><div><h3 className="text-xl font-black text-[#1c2d51] tracking-tight">{editingId ? 'Editar Imóvel' : 'Novo Imóvel'}</h3><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Passo {currentStep} de 10</p></div></div>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors p-3 bg-slate-50 rounded-2xl"><X size={24}/></button>
               </div>
               <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(currentStep/10)*100}%` }}></div></div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-white">{saveError && <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] flex items-center gap-4 text-sm font-bold mb-8 border border-red-100"><AlertCircle size={20} /> {saveError}</div>}{renderStepContent()}</div>
            <div className="px-12 py-8 border-t bg-slate-50/50 flex items-center justify-between"><button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1} className="text-slate-400 font-black uppercase text-[10px] tracking-widest disabled:opacity-0 flex items-center gap-2 hover:text-[#1c2d51] transition-all"><ChevronLeft size={16}/> Anterior</button><div className="flex gap-4">{currentStep < 10 ? <button onClick={() => setCurrentStep(prev => Math.min(10, prev + 1))} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:-translate-y-0.5 transition-all">Próximo Passo <ChevronRight size={16}/></button> : <button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 text-white px-14 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl disabled:opacity-50 hover:bg-emerald-700 transition-all">{isSaving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20}/>} Finalizar e Gravar</button>}</div></div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest"><th className="px-8 py-5">Imóvel</th><th className="px-8 py-5">Preço / Local</th><th className="px-8 py-5">Estado</th><th className="px-8 py-5 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-50">{isLoading ? <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={32} /></td></tr> : properties.length === 0 ? <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest italic">Nenhum imóvel registado.</td></tr> : properties.map(p => <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group"><td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0"><img src={(p.media as any)?.cover_url || p.media?.items?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100'} className="w-full h-full object-cover" /></div><div><div className="font-black text-sm text-[#1c2d51]">{p.titulo}</div><div className="text-[10px] text-slate-400 font-bold uppercase">Ref: {p.ref}</div></div></div></td><td className="px-8 py-6"><div className="font-black text-[#1c2d51] text-sm">{formatCurrency((p.operacao === 'venda' ? p.financeiro?.preco_venda : p.financeiro?.preco_arrendamento) || 0)}</div><div className="text-[10px] text-slate-400 font-bold uppercase">{p.localizacao?.concelho}</div></td><td className="px-8 py-6"><span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${p.publicacao?.publicar_no_site ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{p.publicacao?.publicar_no_site ? 'Online' : 'Oculto'}</span></td><td className="px-8 py-6 text-right flex justify-end gap-2"><button onClick={() => handleEdit(p)} className="p-3 text-slate-300 hover:text-[#1c2d51] hover:bg-slate-100 rounded-xl transition-all"><Brush size={18}/></button><button onClick={() => handleDelete(p.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash size={18}/></button></td></tr>)}</tbody></table></div></div>
      <style>{`.admin-input-v3 { width: 100%; padding: 1rem 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 14px; }.admin-input-v3:focus { background: #fff; border-color: #1c2d51; } select.admin-input-v3 { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.25rem center; background-size: 1rem; }`}</style>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder, type = 'text', rows = 3 }: any) => (
  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">{label}</label>{type === 'textarea' ? <textarea rows={rows} className="admin-input-v3 resize-none" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /> : <input type={type} className="admin-input-v3" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}</div>
);

const Select = ({ label, value, onChange, children }: any) => (
  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">{label}</label><select className="admin-input-v3" value={value} onChange={e => onChange(e.target.value)}>{children}</select></div>
);

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!checked)} className={`w-12 h-6 rounded-full relative transition-all ${checked ? 'bg-blue-500' : 'bg-slate-200'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`} /></button>
);

const FeatureToggle = ({ label, checked, onChange }: any) => (
  <button onClick={() => onChange(!checked)} className={`p-3 rounded-xl border text-[9px] font-black uppercase tracking-tighter flex items-center justify-between transition-all ${checked ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>{label} {checked && <Check size={12}/>}</button>
);

export default AdminImoveis;
