
import React, { useState, useEffect, useRef } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Imovel, TipoImovel, ImovelMedia } from '../../types';
import { 
  Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Loader2, AlertCircle, 
  Building2, Zap, Sparkles, Check, 
  ChevronRight, ChevronLeft, Camera, Trash, Star,
  MoveUp, MoveDown, ShieldCheck, Euro, UploadCloud, MapPin, Bed, Square
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
  const totalSteps = 6;

  const initialFormState: Partial<Imovel> = {
    titulo: '',
    ref: '',
    tipo_imovel: 'apartamento',
    tipologia: 'T2',
    estado_conservacao: 'usado',
    operacao: 'venda',
    localizacao: {
      pais: 'PT', distrito: 'Lisboa', concelho: '', freguesia: '',
      codigo_postal: '', morada: '', porta: '', lat: null, lng: null, expor_morada: false
    },
    areas: { area_util_m2: null, area_bruta_m2: null, area_terreno_m2: null, pisos: 1, andar: '', elevador: false },
    divisoes: { quartos: 2, casas_banho: 1, garagem: { tem: false, lugares: 0 } },
    financeiro: { preco_venda: null, preco_arrendamento: null, negociavel: false, condominio_mensal: null, imi_anual: null, caucao_meses: null, despesas_incluidas: [] },
    descricao: { curta: '', completa_md: '', gerada_por_ia: false, ultima_geracao_ia_at: null },
    certificacao: { certificado_energetico: 'Em preparação', licenca_utilizacao: '', licenca_utilizacao_numero: '', licenca_utilizacao_data: '', isento_licenca_utilizacao: false },
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
    } finally {
      setIsLoading(false);
    }
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
    setFormData({ ...initialFormState, ...imovel });
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
      console.error(err);
      setSaveError(err.message?.includes("permission") ? "Erro de permissão no Firebase. Verifique se é o dono deste imóvel." : "Erro ao guardar alterações.");
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
        descricao: {
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
        <h1 className="text-2xl font-black text-[#1c2d51]">Gestão de Imóveis</h1>
        <button onClick={handleOpenCreate} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg"><Plus size={20} /> Novo Imóvel</button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-10 py-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-black text-[#1c2d51]">{editingId ? 'Editar Imóvel' : 'Novo Imóvel'}</h3>
              <div className="flex gap-2">
                 {[1,2,3,4,5,6].map(s => (
                   <div key={s} className={`w-8 h-1.5 rounded-full transition-all ${currentStep >= s ? 'bg-[#1c2d51]' : 'bg-slate-100'}`} />
                 ))}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
              {saveError && (
                <div className="bg-red-50 text-red-600 p-6 rounded-3xl flex items-center gap-4 text-sm font-bold mb-8 border border-red-100">
                  <AlertCircle size={20} /> {saveError}
                </div>
              )}

              {/* STEP 1: GERAL */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">1. Informação Geral</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Título do Anúncio</label><input className="admin-input" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ex: Apartamento T2 com Varanda" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Referência Interna</label><input className="admin-input" value={formData.ref} onChange={e => setFormData({...formData, ref: e.target.value})} placeholder="REF-001" /></div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">Tipo de Imóvel</label>
                      <select className="admin-input" value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value as any})}>
                        <option value="apartamento">Apartamento</option>
                        <option value="moradia">Moradia</option>
                        <option value="terreno">Terreno</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">Operação</label>
                      <div className="flex gap-2">
                        {['venda', 'arrendamento'].map(op => (
                          <button key={op} onClick={() => setFormData({...formData, operacao: op as any})} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.operacao === op ? 'bg-[#1c2d51] text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>{op}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCALIZAÇÃO */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">2. Localização</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Concelho</label><input className="admin-input" value={formData.localizacao?.concelho} onChange={e => setFormData({...formData, localizacao: {...formData.localizacao!, concelho: e.target.value}})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Freguesia</label><input className="admin-input" value={formData.localizacao?.freguesia} onChange={e => setFormData({...formData, localizacao: {...formData.localizacao!, freguesia: e.target.value}})} /></div>
                  </div>
                </div>
              )}

              {/* STEP 3: ÁREAS & DIVISÕES */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">3. Áreas & Divisões</h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Quartos</label><input type="number" className="admin-input" value={formData.divisoes?.quartos} onChange={e => setFormData({...formData, divisoes: {...formData.divisoes!, quartos: Number(e.target.value)}})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">WCs</label><input type="number" className="admin-input" value={formData.divisoes?.casas_banho} onChange={e => setFormData({...formData, divisoes: {...formData.divisoes!, casas_banho: Number(e.target.value)}})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Área Útil (m²)</label><input type="number" className="admin-input" value={formData.areas?.area_util_m2 || ''} onChange={e => setFormData({...formData, areas: {...formData.areas!, area_util_m2: Number(e.target.value)}})} /></div>
                  </div>
                </div>
              )}

              {/* STEP 4: FINANCEIRO */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">4. Financeiro</h4>
                  <div className="max-w-md space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400">Preço ({formData.operacao === 'venda' ? 'Venda' : 'Mensal'})</label>
                    <div className="relative">
                      <input type="number" className="admin-input pl-12" value={(formData.operacao === 'venda' ? formData.financeiro?.preco_venda : formData.financeiro?.preco_arrendamento) || ''} onChange={e => {
                        const val = Number(e.target.value);
                        setFormData({...formData, financeiro: {...formData.financeiro!, [formData.operacao === 'venda' ? 'preco_venda' : 'preco_arrendamento']: val}});
                      }} />
                      <Euro className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: CERTIFICAÇÃO */}
              {currentStep === 5 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">5. Certificação Energética</h4>
                  <div className="flex flex-wrap gap-3">
                    {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'Em preparação'].map(cat => (
                      <button key={cat} onClick={() => setFormData({...formData, certificacao: {...formData.certificacao!, certificado_energetico: cat}})} className={`px-6 py-4 rounded-2xl font-black text-xs transition-all ${formData.certificacao?.certificado_energetico === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>{cat}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: MARKETING & MEDIA */}
              {currentStep === 6 && (
                <div className="space-y-10 animate-in slide-in-from-right duration-300">
                   <div className="flex items-center justify-between bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100">
                     <div className="space-y-1">
                        <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest flex items-center gap-2"><Sparkles size={16} className="text-blue-500" /> Inteligência Artificial Gemini</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Crie descrições profissionais otimizadas em segundos</p>
                     </div>
                     <button onClick={handleAIGenerate} disabled={isGeneratingAI} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-95 disabled:opacity-50 transition-all">
                        {isGeneratingAI ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} {isGeneratingAI ? "A Processar..." : "Gerar com IA"}
                     </button>
                   </div>

                   <div className="grid grid-cols-1 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Descrição Curta (SEO)</label>
                        <textarea rows={2} className="admin-input" value={formData.descricao?.curta || ''} onChange={e => setFormData(prev => ({ ...prev, descricao: { ...(prev.descricao || {}), curta: e.target.value } as any }))} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Descrição Completa</label>
                        <textarea rows={8} className="admin-input" value={formData.descricao?.completa_md || ''} onChange={e => setFormData(prev => ({ ...prev, descricao: { ...(prev.descricao || {}), completa_md: e.target.value } as any }))} />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Galeria de Imagens</h4>
                      <div onClick={() => fileInputRef.current?.click()} className="bg-slate-50 p-16 rounded-[3rem] border-2 border-dashed border-slate-200 text-center cursor-pointer hover:bg-slate-100 transition-all group">
                        <UploadCloud className="mx-auto text-slate-300 mb-4 group-hover:scale-110 transition-transform" size={48}/>
                        <p className="text-xs font-black text-[#1c2d51] uppercase tracking-widest">Clique para carregar fotos</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {tempMedia.map((m, idx) => (
                          <div key={idx} className="relative aspect-[4/3] rounded-[2rem] overflow-hidden group shadow-sm">
                            <img src={m.url} className="w-full h-full object-cover" />
                            <button onClick={() => setTempMedia(tempMedia.filter((_, i) => i !== idx))} className="absolute top-4 right-4 bg-white/95 p-2 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-lg"><Trash size={16}/></button>
                            {m.is_cover && <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Capa</div>}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              )}
            </div>

            <div className="px-10 py-8 border-t bg-slate-50/50 flex items-center justify-between">
               <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1} className="text-slate-400 font-black uppercase text-[10px] disabled:opacity-0 flex items-center gap-2 hover:text-[#1c2d51] transition-colors"><ChevronLeft size={16}/> Anterior</button>
               
               <div className="flex gap-4">
                 {currentStep < 6 ? (
                   <button onClick={() => setCurrentStep(prev => prev + 1)} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#1c2d51]/20">Próximo <ChevronRight size={16}/></button>
                 ) : (
                   <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#1c2d51]/20">
                     {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16}/>} {editingId ? 'Guardar Imóvel' : 'Publicar Agora'}
                   </button>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest"><th className="px-8 py-5">Imóvel</th><th className="px-8 py-5">Localidade</th><th className="px-8 py-5 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" /></td></tr>
            ) : properties.length === 0 ? (
              <tr><td colSpan={3} className="py-20 text-center text-slate-300 font-black uppercase text-xs">Sem imóveis registados</td></tr>
            ) : properties.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-8 py-6 font-black text-sm text-[#1c2d51]">{p.titulo}</td>
                <td className="px-8 py-6 text-slate-400 font-bold text-xs uppercase tracking-widest">{p.localizacao?.concelho}</td>
                <td className="px-8 py-6 text-right"><button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-[#1c2d51] transition-colors"><Edit2 size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`.admin-input { width: 100%; padding: 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }.admin-input:focus { background: #fff; border-color: #1c2d51; shadow: 0 0 0 4px rgba(28,45,81,0.05); }`}</style>
    </div>
  );
};

export default AdminImoveis;
