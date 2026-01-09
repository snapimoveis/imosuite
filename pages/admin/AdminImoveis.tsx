
import React, { useState, useEffect, useRef } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Imovel, TipoImovel, ImovelMedia } from '../../types';
import { 
  Plus, X, Loader2, AlertCircle, Sparkles, Check, ChevronRight, ChevronLeft, 
  Trash, UploadCloud, MapPin, Bed, Bath, Square, Info, ShieldCheck, 
  Building2, Euro, Layout, Camera, Star, Zap, Brush, Search, MoveUp, MoveDown, Eye, FileText, Video, Globe, Calendar
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
    titulo: '', ref: '', tipo_imovel: 'apartamento', tipologia: 'T2', tipology: 'T2',
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
    setFormData({ 
      ...initialFormState, 
      ...imovel, 
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
    if (window.confirm("Tem a certeza que deseja apagar este imóvel permanentemente?")) {
      try {
        await PropertyService.deleteProperty(profile.tenantId, id);
        loadProperties();
      } catch (err) {
        alert("Erro ao apagar imóvel. Verifique as permissões.");
      }
    }
  };

  const handleToggleDestaque = async (imovel: Imovel) => {
    if (!profile?.tenantId) return;
    const currentDestaque = imovel.publicacao?.destaque || false;
    try {
      await PropertyService.updateProperty(profile.tenantId, imovel.id, {
        ...imovel,
        publicacao: {
          ...imovel.publicacao,
          destaque: !currentDestaque
        }
      });
      setProperties(prev => prev.map(p => p.id === imovel.id ? { 
        ...p, 
        publicacao: { ...p.publicacao, destaque: !currentDestaque } 
      } : p));
    } catch (err) {
      console.error("Erro ao alternar destaque:", err);
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
        await PropertyService.createProperty(profile.tenantId, { ...formData, slug, owner_uid: user.uid }, tempMedia);
      }
      setIsModalOpen(false);
      loadProperties();
    } catch (err: any) {
      console.error(err);
      setSaveError("Erro ao gravar. Verifique se preencheu os campos obrigatórios e se a ligação à base de dados está ativa.");
    } finally { setIsSaving(false); }
  };

  const handleAIGenerate = async () => {
    if (!formData.titulo) {
      setSaveError("Defina um título para o imóvel antes de gerar a descrição.");
      return;
    }
    setIsGeneratingAI(true);
    setSaveError(null);
    try {
      const result = await generatePropertyDescription(formData);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => addFiles(e.target.files);

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
          <div className="flex items-center gap-3 border-b pb-4"><h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">1. Identificação do Imóvel</h4></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Referência Interna</label><input className="admin-input" value={formData.ref} onChange={e => setFormData({...formData, ref: e.target.value})} placeholder="Ex: IMO-001" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título do Anúncio *</label><input className="admin-input" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ex: Apartamento com Vista Rio" required /></div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipo de Imóvel</label>
              <select className="admin-input" value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value as TipoImovel})}>
                <option value="apartamento">Apartamento</option><option value="moradia">Moradia</option><option value="casa_rustica">Casa Rústica</option><option value="ruina">Ruína</option><option value="escritorio">Escritório</option><option value="comercial">Comercial</option><option value="armazem">Armazém</option><option value="garagem">Garagem</option><option value="predio">Prédio</option><option value="terreno">Terreno</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipologia</label><select className="admin-input" value={formData.tipologia} onChange={e => setFormData({...formData, tipologia: e.target.value, tipology: e.target.value})}><option>T0</option><option>T1</option><option>T2</option><option>T3</option><option>T4</option><option>T5+</option></select></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Estado</label><select className="admin-input" value={formData.estado_conservacao} onChange={e => setFormData({...formData, estado_conservacao: e.target.value as any})}><option value="novo">Novo</option><option value="usado">Usado</option><option value="renovado">Renovado</option><option value="para_renovar">Para renovar</option></select></div>
            </div>
          </div>
        </div>
      );
      case 8: return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between bg-[#1c2d51] p-8 rounded-[3rem] text-white shadow-2xl">
            <div className="flex items-center gap-4"><Sparkles size={28} className="text-blue-400" /><div><h4 className="font-black text-xs uppercase tracking-widest">Descrição com IA</h4><p className="text-[10px] text-slate-400 font-bold uppercase">Gera textos persuasivos automaticamente em PT-PT.</p></div></div>
            <button onClick={handleAIGenerate} disabled={isGeneratingAI} className="bg-white text-[#1c2d51] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
               {isGeneratingAI ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16}/>} {isGeneratingAI ? 'A pensar...' : 'Gerar descrição'}
            </button>
          </div>
          <div className="space-y-6">
             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4">Descrição curta</label><textarea rows={2} className="admin-input" value={formData.descricao?.curta} onChange={e => setFormData({...formData, descricao: {...formData.descricao!, curta: e.target.value} as any})} /></div>
             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4">Descrição completa (markdown)</label><textarea rows={10} className="admin-input font-medium" value={formData.descricao?.completa_md} onChange={e => setFormData({...formData, descricao: {...formData.descricao!, completa_md: e.target.value} as any})} /></div>
          </div>
        </div>
      );
      case 9: return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 border-b pb-4"><h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">9. Galeria de Fotos</h4></div>
          <div 
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()} 
            className={`bg-slate-50 p-20 rounded-[3rem] border-2 border-dashed text-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-100'}`}
          >
            <UploadCloud className="mx-auto text-slate-300 mb-4" size={48}/>
            <p className="text-xs font-black text-[#1c2d51] uppercase tracking-widest">Clique para enviar ou arraste as fotos</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
            {tempMedia.map((m, idx) => (
              <div key={idx} className={`relative aspect-square rounded-[2rem] overflow-hidden group shadow-md border-2 ${m.is_cover ? 'border-emerald-500' : 'border-transparent'}`}>
                <img src={m.url} className="w-full h-full object-cover" />
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
              </div>
            ))}
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
        <button onClick={handleOpenCreate} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:scale-105 transition-all"><Plus size={20} /> Novo Imóvel</button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-12 py-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1c2d51]"><Building2 size={24}/></div>
                <div><h3 className="text-xl font-black text-[#1c2d51] tracking-tight">{editingId ? 'Editar Imóvel' : 'Novo Imóvel'}</h3><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Passo {currentStep} de 10</p></div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors p-3 bg-slate-50 rounded-2xl"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 bg-white">
              {saveError && (
                <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] flex items-center gap-4 text-sm font-bold mb-8 border border-red-100 animate-in shake">
                  <AlertCircle size={20} /> {saveError}
                </div>
              )}
              {renderStep()}
            </div>

            <div className="px-12 py-8 border-t bg-slate-50/50 flex items-center justify-between">
               <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1} className="text-slate-400 font-black uppercase text-[10px] tracking-widest disabled:opacity-0 flex items-center gap-2 transition-all"><ChevronLeft size={16}/> Anterior</button>
               <div className="flex gap-4">
                 {currentStep < 10 ? (
                   <button onClick={() => setCurrentStep(prev => prev + 1)} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl">Próximo Passo <ChevronRight size={16}/></button>
                 ) : (
                   <button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 text-white px-14 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl disabled:opacity-50">
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
                <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest italic">Nenhum imóvel registado.</td></tr>
              ) : properties.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                         <img src={p.media?.items?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100'} className="w-full h-full object-cover" />
                       </div>
                       <div><div className="font-black text-sm text-[#1c2d51]">{p.titulo}</div><div className="text-[10px] text-slate-400 font-bold uppercase">Ref: {p.ref}</div></div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-black text-[#1c2d51] text-sm">{formatCurrency((p.operacao === 'venda' ? p.financeiro?.preco_venda : p.financeiro?.preco_arrendamento) || 0)}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{p.localizacao?.concelho}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${p.publicacao?.publicar_no_site ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{p.publicacao?.publicar_no_site ? 'Online' : 'Oculto'}</span>
                  </td>
                  <td className="px-8 py-6 text-right flex justify-end gap-2">
                    <button onClick={() => handleToggleDestaque(p)} className={`p-3 rounded-xl transition-all ${p.publicacao?.destaque ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-500'}`}><Star size={18} fill={p.publicacao?.destaque ? "currentColor" : "none"} /></button>
                    <button onClick={() => handleEdit(p)} className="p-3 text-slate-300 hover:text-[#1c2d51] hover:bg-slate-100 rounded-xl transition-all"><Brush size={18}/></button>
                    <button onClick={() => handleDelete(p.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`.admin-input { width: 100%; padding: 1rem 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }.admin-input:focus { background: #fff; border-color: #1c2d51; } select.admin-input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.25rem center; background-size: 1rem; }`}</style>
    </div>
  );
};

export default AdminImoveis;
