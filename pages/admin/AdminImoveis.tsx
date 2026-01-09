
import React, { useState, useEffect, useRef } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Imovel, TipoImovel, ImovelMedia } from '../../types';
import { 
  Plus, X, Loader2, AlertCircle, Sparkles, Check, ChevronRight, ChevronLeft, 
  Trash, UploadCloud, MapPin, Bed, Bath, Square, Info, ShieldCheck, 
  Building2, Euro, Layout, Camera, Star, Zap, Brush, Search, MoveUp, MoveDown, Eye, EyeOff, FileText, Video, Globe, Calendar
} from 'lucide-react';
import { formatCurrency, generateSlug } from '../../lib/utils';
import { generatePropertyDescription } from '../../services/geminiService';

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

  const initialFormState: Partial<Imovel> = {
    titulo: '', ref: '', tipo_imovel: 'apartamento', tipologia: 'T2', 
    estado_conservacao: 'usado', ano_construcao: null, operacao: 'venda', 
    arrendamento_tipo: null, arrendamento_duracao_min_meses: null, disponivel_imediato: true,
    localizacao: { pais: 'Portugal', distrito: 'Lisboa', concelho: '', freguesia: '', codigo_postal: '', morada: '', porta: '', lat: null, lng: null, expor_morada: false },
    areas: { area_util_m2: null, area_bruta_m2: null, area_terreno_m2: null, pisos: 1, andar: '', elevador: false },
    divisoes: { quartos: 0, casas_banho: 0, garagem: { tem: false, lugares: 0 } },
    financeiro: { preco_venda: null, preco_arrendamento: null, negociavel: false, condominio_mensal: null, imi_anual: null, caucao_meses: null, despesas_incluidas: [] },
    descricao: { curta: '', completa_md: '', gerada_por_ia: false, ultima_geracao_ia_at: null },
    certificacao: { certificado_energetico: 'Em preparação', licenca_utilizacao: 'Sim', licenca_utilizacao_numero: '', licenca_utilizacao_data: '', isento_licenca_utilizacao: false },
    publicacao: { estado: 'publicado', publicar_no_site: true, destaque: false, badges: [], data_publicacao: null },
    media: { cover_media_id: null, total: 0 },
    caracteristicas: []
  };

  const [formData, setFormData] = useState<Partial<Imovel>>(initialFormState);
  const [tempMedia, setTempMedia] = useState<ImovelMedia[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const loadProperties = async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    setIsLoading(true);
    try {
      const data = await PropertyService.getProperties(profile.tenantId);
      setProperties(data);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { loadProperties(); }, [profile?.tenantId]);

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
    setFormData({ ...initialFormState, ...imovel, caracteristicas: Array.isArray(imovel.caracteristicas) ? imovel.caracteristicas : [] });
    setSaveError(null);
    setCurrentStep(1);
    if (profile?.tenantId) {
      const media = await PropertyService.getPropertyMedia(profile.tenantId, imovel.id);
      setTempMedia(media);
    }
    setIsModalOpen(true);
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
        await PropertyService.createProperty(profile.tenantId, { ...formData, slug, owner_uid: user.uid }, tempMedia);
      }
      setIsModalOpen(false);
      loadProperties();
    } catch (err: any) {
      setSaveError(err.message?.includes("permission") ? "Erro: Verifique as permissões de gravação da agência." : "Erro ao guardar imóvel.");
    } finally { setIsSaving(false); }
  };

  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await generatePropertyDescription(formData);
      setFormData(prev => ({
        ...prev,
        descricao: { curta: result.curta, completa_md: result.completa, gerada_por_ia: true, ultima_geracao_ia_at: new Date() } as any
      }));
    } catch (error: any) {
      setSaveError("IA: " + error.message);
    } finally { setIsGeneratingAI(false); }
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const isVideo = file.type.startsWith('video/');
        const newMedia: ImovelMedia = {
          id: Math.random().toString(36).substr(2, 9),
          type: isVideo ? 'video' : 'image',
          url: reader.result as string,
          storage_path: '',
          order: tempMedia.length,
          is_cover: !isVideo && tempMedia.length === 0,
          alt: formData.titulo || '',
          created_at: new Date()
        };
        setTempMedia(prev => [...prev, newMedia]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Added missing handleFileChange function
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
  };

  const reorderMedia = (index: number, direction: 'up' | 'down') => {
    const newMedia = [...tempMedia];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newMedia.length) return;
    [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
    setTempMedia(newMedia.map((m, i) => ({ ...m, order: i })));
  };

  const renderStep = () => {
    const currentFeatures = Array.isArray(formData.caracteristicas) ? formData.caracteristicas : [];

    switch (currentStep) {
      case 1: return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 border-b pb-4"><div className="w-8 h-8 rounded-lg bg-[#1c2d51] text-white flex items-center justify-center font-black text-xs">01</div><h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Identificação do Imóvel</h4></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Referência Interna (Única)</label><input className="admin-input" value={formData.ref} onChange={e => setFormData({...formData, ref: e.target.value})} placeholder="Ex: IMO-001" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título do Anúncio</label><input className="admin-input" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ex: Apartamento T3 com Vista Rio" /></div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipo de Imóvel</label>
              <select className="admin-input" value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value as TipoImovel})}>
                <option value="apartamento">Apartamento</option><option value="moradia">Moradia</option><option value="casa_rustica">Casa Rústica</option><option value="ruina">Ruína</option><option value="escritorio">Escritório</option><option value="comercial">Espaço comercial / Armazém</option><option value="garagem">Lugar de garagem</option><option value="arrecadacao">Arrecadação</option><option value="predio">Prédio</option><option value="terreno">Terreno</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipologia</label><select className="admin-input" value={formData.tipologia} onChange={e => setFormData({...formData, tipologia: e.target.value})}><option>T0</option><option>T1</option><option>T2</option><option>T3</option><option>T4</option><option>T5+</option></select></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Estado</label><select className="admin-input" value={formData.estado_conservacao} onChange={e => setFormData({...formData, estado_conservacao: e.target.value as any})}><option value="novo">Novo</option><option value="usado">Usado</option><option value="renovado">Renovado</option><option value="para_renovar">Para renovar</option></select></div>
            </div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Ano de Construção</label><input type="number" className="admin-input" value={formData.ano_construcao || ''} onChange={e => setFormData({...formData, ano_construcao: Number(e.target.value)})} /></div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 border-b pb-4"><div className="w-8 h-8 rounded-lg bg-[#1c2d51] text-white flex items-center justify-center font-black text-xs">02</div><h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Operação / Regime</h4></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipo de Operação</label>
              <div className="flex gap-2">
                {['venda', 'arrendamento'].map(op => (
                  <button key={op} onClick={() => setFormData({...formData, operacao: op as any})} className={`flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.operacao === op ? 'bg-[#1c2d51] text-white shadow-xl' : 'bg-slate-50 text-slate-400'}`}>{op}</button>
                ))}
              </div>
            </div>
            {formData.operacao === 'arrendamento' && (
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipo de Arrendamento</label><select className="admin-input" value={formData.arrendamento_tipo || ''} onChange={e => setFormData({...formData, arrendamento_tipo: e.target.value as any})}><option value="residencial">Residencial (Habitação permanente)</option><option value="temporario">Temporário (Estudos, trabalho)</option><option value="ferias">Férias / Alojamento turístico</option></select></div>
            )}
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Duração Mínima do Contrato (Meses)</label><input type="number" className="admin-input" value={formData.arrendamento_duracao_min_meses || ''} onChange={e => setFormData({...formData, arrendamento_duracao_min_meses: Number(e.target.value)})} /></div>
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
               <span className="text-[10px] font-black uppercase text-[#1c2d51]">Disponibilidade Imediata?</span>
               <button onClick={() => setFormData({...formData, disponivel_imediato: !formData.disponivel_imediato})} className={`w-14 h-8 rounded-full relative transition-all ${formData.disponivel_imediato ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.disponivel_imediato ? 'right-1' : 'left-1'}`}></div></button>
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 border-b pb-4"><div className="w-8 h-8 rounded-lg bg-[#1c2d51] text-white flex items-center justify-center font-black text-xs">03</div><h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Localização</h4></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">País</label><input className="admin-input bg-slate-100" value="Portugal" readOnly /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Distrito</label><input className="admin-input" value={formData.localizacao?.distrito} onChange={e => setFormData({...formData, localizacao: {...formData.localizacao!, distrito: e.target.value}})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Concelho</label><input className="admin-input" value={formData.localizacao?.concelho} onChange={e => setFormData({...formData, localizacao: {...formData.localizacao!, concelho: e.target.value}})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Freguesia</label><input className="admin-input" value={formData.localizacao?.freguesia || ''} onChange={e => setFormData({...formData, localizacao: {...formData.localizacao!, freguesia: e.target.value}})} /></div>
            <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Morada Completa</label><input className="admin-input" value={formData.localizacao?.morada || ''} onChange={e => setFormData({...formData, localizacao: {...formData.localizacao!, morada: e.target.value}})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Código Postal</label><input className="admin-input" value={formData.localizacao?.codigo_postal || ''} onChange={e => setFormData({...formData, localizacao: {...formData.localizacao!, codigo_postal: e.target.value}})} /></div>
            <div className="flex items-center justify-between p-6 bg-blue-50 rounded-2xl">
               <span className="text-[10px] font-black uppercase text-blue-700">Expor Morada Publicamente?</span>
               <button onClick={() => setFormData({...formData, localizacao: {...formData.localizacao!, expor_morada: !formData.localizacao?.expor_morada}})} className={`w-14 h-8 rounded-full relative transition-all ${formData.localizacao?.expor_morada ? 'bg-blue-600' : 'bg-slate-200'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.localizacao?.expor_morada ? 'right-1' : 'left-1'}`}></div></button>
            </div>
            <div className="md:col-span-2 p-10 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center flex flex-col items-center">
               <MapPin className="text-slate-300 mb-2" size={32}/>
               <p className="text-[10px] font-black uppercase text-slate-400">Coordenadas GPS (Automático após morada)</p>
               <div className="text-[8px] text-slate-300 mt-1 uppercase tracking-widest">Mapa Preview Indisponível em Offline</div>
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 border-b pb-4"><div className="w-8 h-8 rounded-lg bg-[#1c2d51] text-white flex items-center justify-center font-black text-xs">04</div><h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Áreas e Dimensões</h4></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Área Útil (m²)</label><input type="number" className="admin-input" value={formData.areas?.area_util_m2 || ''} onChange={e => setFormData({...formData, areas: {...formData.areas!, area_util_m2: Number(e.target.value)}})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Área Bruta (m²)</label><input type="number" className="admin-input" value={formData.areas?.area_bruta_m2 || ''} onChange={e => setFormData({...formData, areas: {...formData.areas!, area_bruta_m2: Number(e.target.value)}})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Área de Terreno (m²)</label><input type="number" className="admin-input" value={formData.areas?.area_terreno_m2 || ''} onChange={e => setFormData({...formData, areas: {...formData.areas!, area_terreno_m2: Number(e.target.value)}})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Número de Pisos</label><input type="number" className="admin-input" value={formData.areas?.pisos || 1} onChange={e => setFormData({...formData, areas: {...formData.areas!, pisos: Number(e.target.value)}})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Andar (Se apto)</label><input className="admin-input" value={formData.areas?.andar || ''} onChange={e => setFormData({...formData, areas: {...formData.areas!, andar: e.target.value}})} /></div>
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
               <span className="text-[10px] font-black uppercase text-[#1c2d51]">Elevador?</span>
               <button onClick={() => setFormData({...formData, areas: {...formData.areas!, elevador: !formData.areas?.elevador}})} className={`w-14 h-8 rounded-full relative transition-all ${formData.areas?.elevador ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.areas?.elevador ? 'right-1' : 'left-1'}`}></div></button>
            </div>
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 border-b pb-4"><div className="w-8 h-8 rounded-lg bg-[#1c2d51] text-white flex items-center justify-center font-black text-xs">05</div><h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Características</h4></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Quartos</label><input type="number" className="admin-input" value={formData.divisoes?.quartos || 0} onChange={e => setFormData({...formData, divisoes: {...formData.divisoes!, quartos: Number(e.target.value)}})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Casas de Banho</label><input type="number" className="admin-input" value={formData.divisoes?.casas_banho || 0} onChange={e => setFormData({...formData, divisoes: {...formData.divisoes!, casas_banho: Number(e.target.value)}})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Garagem (Lugares)</label><input type="number" className="admin-input" value={formData.divisoes?.garagem.lugares || 0} onChange={e => setFormData({...formData, divisoes: {...formData.divisoes!, garagem: {tem: Number(e.target.value) > 0, lugares: Number(e.target.value)}}})} /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
             {['Varanda / Terraço', 'Arrecadação', 'Piscina', 'Jardim'].map(feature => (
               <button key={feature} onClick={() => {
                 const current = currentFeatures;
                 setFormData({...formData, caracteristicas: current.includes(feature) ? current.filter(c => c !== feature) : [...current, feature]});
               }} className={`py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${currentFeatures.includes(feature) ? 'bg-[#1c2d51] text-white' : 'bg-slate-50 text-slate-400'}`}>{feature}</button>
             ))}
          </div>
          <div className="space-y-4 pt-6">
             <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Lista de Extras (Multi-select)</label>
             <div className="flex flex-wrap gap-2">
                {['Ar Condicionado', 'Aquecimento Central', 'Painéis Solares', 'Lareira', 'Cozinha Equipada', 'Mobilado', 'Vista Mar', 'Vista Rio', 'Vista Cidade'].map(extra => (
                  <button key={extra} onClick={() => {
                    const current = currentFeatures;
                    setFormData({...formData, caracteristicas: current.includes(extra) ? current.filter(c => c !== extra) : [...current, extra]});
                  }} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${currentFeatures.includes(extra) ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{extra}</button>
                ))}
             </div>
          </div>
        </div>
      );
      case 6: return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 border-b pb-4"><div className="w-8 h-8 rounded-lg bg-[#1c2d51] text-white flex items-center justify-center font-black text-xs">06</div><h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Certificação e Legalidade</h4></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Certificado Energético</label>
               <div className="grid grid-cols-4 gap-2">
                  {['A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'G', 'Isento', 'Em preparação'].map(ce => (
                    <button key={ce} onClick={() => setFormData({...formData, certificacao: {...formData.certificacao!, certificado_energetico: ce}})} className={`py-3 rounded-lg text-[9px] font-black transition-all ${formData.certificacao?.certificado_energetico === ce ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>{ce}</button>
                  ))}
               </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Licença de Utilização</label><select className="admin-input" value={formData.certificacao?.licenca_utilizacao || 'Sim'} onChange={e => setFormData({...formData, certificacao: {...formData.certificacao!, licenca_utilizacao: e.target.value}})}><option>Sim</option><option>Em processo</option><option>Isento</option></select></div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">IMI Estimado (Anual)</label><input type="number" className="admin-input" value={formData.financeiro?.imi_anual || ''} onChange={e => setFormData({...formData, financeiro: {...formData.financeiro!, imi_anual: Number(e.target.value)}})} /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Condomínio Mensal</label><input type="number" className="admin-input" value={formData.financeiro?.condominio_mensal || ''} onChange={e => setFormData({...formData, financeiro: {...formData.financeiro!, condominio_mensal: Number(e.target.value)}})} /></div>
              </div>
            </div>
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 border-b pb-4"><div className="w-8 h-8 rounded-lg bg-[#1c2d51] text-white flex items-center justify-center font-black text-xs">07</div><h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Preço e Condições</h4></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-10 rounded-[3rem]">
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Preço de {formData.operacao === 'venda' ? 'Venda' : 'Arrendamento'}</label>
                  <div className="relative">
                    <input type="number" className="admin-input bg-white pl-12" value={(formData.operacao === 'venda' ? formData.financeiro?.preco_venda : formData.financeiro?.preco_arrendamento) || ''} onChange={e => {
                      const val = Number(e.target.value);
                      const key = formData.operacao === 'venda' ? 'preco_venda' : 'preco_arrendamento';
                      setFormData({...formData, financeiro: {...formData.financeiro!, [key]: val}});
                    }} />
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase text-[#1c2d51]">Preço Negociável?</span>
                   <button onClick={() => setFormData({...formData, financeiro: {...formData.financeiro!, negociavel: !formData.financeiro?.negociavel}})} className={`w-12 h-6 rounded-full relative transition-all ${formData.financeiro?.negociavel ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${formData.financeiro?.negociavel ? 'right-0.5' : 'left-0.5'}`}></div></button>
                </div>
             </div>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase text-[#1c2d51]">Comissão Incluída?</span>
                   <button className="w-12 h-6 rounded-full bg-emerald-500 relative"><div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full"></div></button>
                </div>
                {formData.operacao === 'arrendamento' && (
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Caução Exigida (Nº Meses)</label><input type="number" className="admin-input bg-white" value={formData.financeiro?.caucao_meses || ''} onChange={e => setFormData({...formData, financeiro: {...formData.financeiro!, caucao_meses: Number(e.target.value)}})} /></div>
                )}
             </div>
          </div>
        </div>
      );
      case 8: return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between bg-[#1c2d51] p-8 rounded-[3rem] text-white shadow-2xl">
            <div className="flex items-center gap-4"><Sparkles size={28} className="text-blue-400" /><div><h4 className="font-black text-xs uppercase tracking-widest">Descrição Inteligente</h4><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">O Gemini gera textos persuasivos otimizados para portais.</p></div></div>
            <button onClick={handleAIGenerate} disabled={isGeneratingAI} className="bg-white text-[#1c2d51] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
               {isGeneratingAI ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16}/>} {isGeneratingAI ? 'A Processar...' : 'Gerar com IA'}
            </button>
          </div>
          <div className="space-y-6">
             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4">Descrição Curta (SEO)</label><textarea rows={2} className="admin-input" value={formData.descricao?.curta} onChange={e => setFormData({...formData, descricao: {...formData.descricao!, curta: e.target.value} as any})} /></div>
             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4">Descrição Completa (Markdown)</label><textarea rows={10} className="admin-input font-medium" value={formData.descricao?.completa_md} onChange={e => setFormData({...formData, descricao: {...formData.descricao!, completa_md: e.target.value} as any})} /></div>
          </div>
        </div>
      );
      case 9: return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 border-b pb-4"><div className="w-8 h-8 rounded-lg bg-[#1c2d51] text-white flex items-center justify-center font-black text-xs">09</div><h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Media (Fotos e Vídeos)</h4></div>
          <div 
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()} 
            className={`bg-slate-50 p-20 rounded-[3rem] border-2 border-dashed text-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-100'}`}
          >
            <UploadCloud className="mx-auto text-slate-300 mb-4" size={48}/>
            <p className="text-xs font-black text-[#1c2d51] uppercase tracking-widest">Arraste os ficheiros aqui ou clique para selecionar</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*,video/*" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
            {tempMedia.map((m, idx) => (
              <div key={idx} className={`relative aspect-square rounded-[2rem] overflow-hidden group shadow-md border-2 ${m.is_cover ? 'border-emerald-500' : 'border-transparent'}`}>
                {m.type === 'video' ? <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white"><Video size={32}/></div> : <img src={m.url} className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                   <div className="flex justify-end gap-1">
                      <button onClick={() => reorderMedia(idx, 'up')} className="p-1.5 bg-white/90 rounded-lg text-slate-700 hover:bg-white"><MoveUp size={12}/></button>
                      <button onClick={() => reorderMedia(idx, 'down')} className="p-1.5 bg-white/90 rounded-lg text-slate-700 hover:bg-white"><MoveDown size={12}/></button>
                   </div>
                   <div className="flex justify-center gap-2">
                      <button onClick={() => setTempMedia(tempMedia.map((item, i) => ({ ...item, is_cover: i === idx })))} className={`p-2 rounded-xl shadow-lg transition-all ${m.is_cover ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 hover:text-[#1c2d51]'}`}><Star size={16}/></button>
                      <button onClick={() => setTempMedia(tempMedia.filter((_, i) => i !== idx))} className="bg-white p-2 rounded-xl text-red-500 shadow-lg hover:bg-red-50 transition-all"><Trash size={16}/></button>
                   </div>
                </div>
                {m.is_cover && <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Capa</div>}
              </div>
            ))}
          </div>
        </div>
      );
      case 10: return (
        <div className="space-y-10 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto text-center py-10">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><Check size={48}/></div>
          <div className="space-y-4">
             <h4 className="text-3xl font-black text-[#1c2d51] tracking-tight">Tudo pronto para publicar!</h4>
             <p className="text-slate-400 font-medium">Configure os últimos detalhes da visibilidade do imóvel.</p>
          </div>
          <div className="bg-slate-50 p-10 rounded-[3rem] space-y-8 text-left border border-slate-100 shadow-sm">
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Estado Atual</label>
                <select className="admin-input bg-white" value={formData.publicacao?.estado} onChange={e => setFormData({...formData, publicacao: {...formData.publicacao!, estado: e.target.value as any}})}>
                   <option value="rascunho">Rascunho</option><option value="publicado">Publicado</option><option value="reservado">Reservado</option><option value="vendido">Vendido</option><option value="arrendado">Arrendado</option>
                </select>
             </div>
             <div className="flex items-center justify-between">
                <div className="space-y-1"><h5 className="font-black text-[#1c2d51] text-xs uppercase tracking-widest">Publicar no Site Público</h5><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Visível para todos os visitantes</p></div>
                <button onClick={() => setFormData({...formData, publicacao: {...formData.publicacao!, publicar_no_site: !formData.publicacao?.publicar_no_site}})} className={`w-14 h-8 rounded-full relative transition-all ${formData.publicacao?.publicar_no_site ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.publicacao?.publicar_no_site ? 'right-1' : 'left-1'}`}></div></button>
             </div>
             <div className="flex items-center justify-between border-t pt-8">
                <div className="space-y-1"><h5 className="font-black text-[#1c2d51] text-xs uppercase tracking-widest">Destaque na Homepage</h5><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aparece na página inicial em primeiro</p></div>
                <button onClick={() => setFormData({...formData, publicacao: {...formData.publicacao!, destaque: !formData.publicacao?.destaque}})} className={`w-14 h-8 rounded-full relative transition-all ${formData.publicacao?.destaque ? 'bg-amber-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.publicacao?.destaque ? 'right-1' : 'left-1'}`}></div></button>
             </div>
             <div className="space-y-4 pt-4 border-t">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Data de Publicação</label>
                <div className="relative"><input type="date" className="admin-input bg-white" value={formData.publicacao?.data_publicacao ? new Date(formData.publicacao.data_publicacao).toISOString().split('T')[0] : ''} onChange={e => setFormData({...formData, publicacao: {...formData.publicacao!, data_publicacao: e.target.value}})} /><Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/></div>
             </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-6 font-brand">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#1c2d51] tracking-tighter">Inventário de Imóveis</h1>
        <button onClick={handleOpenCreate} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-slate-900/10 hover:opacity-90 transition-all"><Plus size={20} /> Inserir Novo</button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl h-full max-h-[96vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-12 py-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1c2d51]"><Building2 size={24}/></div>
                <div><h3 className="text-xl font-black text-[#1c2d51] tracking-tight">{editingId ? 'Editar Registo' : 'Novo Imóvel ImoSuite'}</h3><p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Passo {currentStep} de 10</p></div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors p-3 bg-slate-50 rounded-2xl"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 bg-white">
              {saveError && (
                <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] flex items-center gap-4 text-sm font-bold mb-8 border border-red-100">
                  <AlertCircle size={20} className="shrink-0" /> {saveError}
                </div>
              )}
              {renderStep()}
            </div>

            <div className="px-12 py-8 border-t bg-slate-50/50 flex items-center justify-between sticky bottom-0 z-10">
               <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1} className="text-slate-400 font-black uppercase text-[10px] tracking-widest disabled:opacity-0 flex items-center gap-2 hover:text-[#1c2d51] transition-colors"><ChevronLeft size={16}/> Anterior</button>
               <div className="flex gap-4">
                 {currentStep < 10 ? (
                   <button onClick={() => setCurrentStep(prev => prev + 1)} className="bg-[#1c2d51] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#1c2d51]/20 hover:-translate-y-0.5 transition-all">Próximo Passo <ChevronRight size={16}/></button>
                 ) : (
                   <button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 text-white px-14 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-emerald-500/20 hover:-translate-y-1 transition-all disabled:opacity-50">
                     {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20}/>} {editingId ? 'Gravar Alterações' : 'Publicar Agora'}
                   </button>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Listagem */}
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest"><th className="px-8 py-5">Imóvel</th><th className="px-8 py-5">Preço / Local</th><th className="px-8 py-5">Estado</th><th className="px-8 py-5 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={32} /></td></tr>
              ) : properties.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest italic">Nenhum imóvel disponível na agência.</td></tr>
              ) : properties.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0"><img src={p.media?.items?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100'} className="w-full h-full object-cover" /></div>
                       <div><div className="font-black text-sm text-[#1c2d51]">{p.titulo}</div><div className="text-[10px] text-slate-400 font-bold uppercase">Ref: {p.ref} &bull; {p.tipo_imovel}</div></div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-black text-[#1c2d51] text-sm">{formatCurrency((p.operacao === 'venda' ? p.financeiro?.preco_venda : p.financeiro?.preco_arrendamento) || 0)}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{p.localizacao?.concelho}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${p.publicacao?.publicar_no_site ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{p.publicacao?.publicar_no_site ? 'Online' : 'Oculto'}</span>
                  </td>
                  <td className="px-8 py-6 text-right"><button onClick={() => handleEdit(p)} className="p-3 text-slate-300 hover:text-[#1c2d51] hover:bg-slate-100 rounded-xl transition-all"><Brush size={18}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`.admin-input { width: 100%; padding: 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }.admin-input:focus { background: #fff; border-color: #1c2d51; shadow: 0 0 0 4px rgba(28,45,81,0.05); } select.admin-input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.25rem center; background-size: 1rem; }`}</style>
    </div>
  );
};

export default AdminImoveis;
