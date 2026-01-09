
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
    if (!profile?.tenantId || profile.tenantId === 'pending') {
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
    try {
      await PropertyService.updateProperty(profile.tenantId, imovel.id, {
        publicacao: { ...imovel.publicacao, publicar_no_site: !imovel.publicacao?.publicar_no_site }
      });
      loadProperties();
    } catch (error) { alert("Erro ao atualizar."); }
  };

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
    setFormData({ ...initialFormState, ...imovel });
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
      console.error("Save Error:", err);
      setSaveError(err.message?.includes("permissions") ? "Sem permissões para gravar. Verifique se o imóvel lhe pertence." : "Erro ao guardar no sistema.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    setSaveError(null);
    try {
      const result = await generatePropertyDescription(formData);
      setFormData(prev => ({ 
        ...prev, 
        // Fix: Added type assertion to bypass nested object requirement check in Partial state
        descricao: { 
          ...(prev.descricao || {}), 
          curta: result.curta,
          completa_md: result.completa,
          gerada_por_ia: true,
          ultima_geracao_ia_at: new Date()
        } as any
      }));
    } catch (error: any) {
      setSaveError("IA: " + error.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMedia: ImovelMedia = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          url: reader.result as string,
          storage_path: '',
          order: tempMedia.length,
          is_cover: tempMedia.length === 0,
          alt: formData.titulo || '',
          created_at: new Date()
        };
        setTempMedia(prev => [...prev, newMedia]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-6 font-brand">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#1c2d51]">Inventário</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{properties.length} Imóveis Disponíveis</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:opacity-90 shadow-xl shadow-slate-900/10"><Plus size={20} /> Novo Imóvel</button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-10 py-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-black text-[#1c2d51]">{editingId ? 'Editar Imóvel' : 'Novo Imóvel'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
              {saveError && (
                <div className="bg-red-50 text-red-600 p-6 rounded-3xl flex items-center gap-4 text-sm font-bold mb-8 border border-red-100">
                  <AlertCircle size={20} /> {saveError}
                </div>
              )}

              {currentStep === 1 && (
                 <div className="space-y-6 animate-in slide-in-from-right duration-300">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Título</label><input className="admin-input" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Referência</label><input className="admin-input" value={formData.ref} onChange={e => setFormData({...formData, ref: e.target.value})} /></div>
                   </div>
                   <button onClick={() => setCurrentStep(6)} className="text-blue-500 font-bold text-xs uppercase underline">Saltar para Marketing/Fotos</button>
                 </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                   <div className="flex items-center justify-between bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                     <div>
                        <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Marketing com IA</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Gere descrições automáticas otimizadas para Portugal</p>
                     </div>
                     <button onClick={handleAIGenerate} disabled={isGeneratingAI} className="flex items-center gap-2 bg-[#1c2d51] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all">
                        {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {isGeneratingAI ? "A Processar..." : "Gerar com IA Gemini"}
                     </button>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Descrição Curta (Resumo)</label>
                        {/* Fix: Added type assertion to bypass nested object requirement check in Partial state */}
                        <textarea rows={2} className="admin-input" value={formData.descricao?.curta || ''} onChange={e => setFormData(prev => ({ ...prev, descricao: { ...(prev.descricao || {}), curta: e.target.value } as any }))} placeholder="Ex: Apartamento T2 renovado no Chiado..."></textarea>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Descrição Completa</label>
                        {/* Fix: Added type assertion to bypass nested object requirement check in Partial state */}
                        <textarea rows={6} className="admin-input" value={formData.descricao?.completa_md || ''} onChange={e => setFormData(prev => ({ ...prev, descricao: { ...(prev.descricao || {}), completa_md: e.target.value } as any }))} placeholder="Descrição detalhada para o portal..."></textarea>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Galeria de Fotos</label>
                      <div onClick={() => fileInputRef.current?.click()} className="bg-slate-50 p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center cursor-pointer hover:bg-slate-100 transition-all">
                        <UploadCloud className="mx-auto text-slate-300 mb-2" size={40}/>
                        <p className="text-xs font-black text-[#1c2d51] uppercase">Carregar Imagens</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {tempMedia.map((m, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                            <img src={m.url} className="w-full h-full object-cover" />
                            <button onClick={() => setTempMedia(tempMedia.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={14}/></button>
                            {m.is_cover && <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Capa</div>}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              )}
            </div>

            <div className="px-10 py-8 border-t bg-slate-50/50 flex items-center justify-between">
               <button onClick={() => setCurrentStep(1)} disabled={currentStep === 1} className="text-slate-400 font-black uppercase text-[10px] disabled:opacity-0">Voltar</button>
               <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#1c2d51]/20">
                 {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16}/>} {editingId ? 'Guardar' : 'Publicar'}
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest"><th className="px-8 py-5">Imóvel</th><th className="px-8 py-5">Estado</th><th className="px-8 py-5 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" /></td></tr>
            ) : properties.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-6 font-black text-sm text-[#1c2d51]">{p.titulo}</td>
                <td className="px-8 py-6"><span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${p.publicacao?.publicar_no_site ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{p.publicacao?.publicar_no_site ? 'Online' : 'Oculto'}</span></td>
                <td className="px-8 py-6 text-right"><button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-[#1c2d51]"><Edit2 size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`.admin-input { width: 100%; padding: 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }.admin-input:focus { background: #fff; border-color: #1c2d51; }`}</style>
    </div>
  );
};

export default AdminImoveis;
