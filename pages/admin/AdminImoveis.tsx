import React, { useState, useEffect, useCallback } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Imovel, TipoImovel, ImovelMedia } from '../../types';
import { 
  Plus, X, Loader2, Sparkles, Check, ChevronRight, ChevronLeft, 
  Trash, UploadCloud, Building2, Star, MapPin, Edit3, Trash2, Camera, Info, Globe, 
  FileText, Bed, Bath, Square, Home, Shield, Euro, LayoutList
} from 'lucide-react';
import { formatCurrency, generateSlug, compressImage } from '../../lib/utils';
import { generatePropertyDescription } from '../../services/geminiService';

const DISTRICTS_DATA: Record<string, string[]> = {
  "Lisboa": ["Lisboa", "Cascais", "Sintra", "Loures", "Oeiras", "Amadora", "Odivelas", "Vila Franca de Xira", "Torres Vedras", "Mafra"],
  "Porto": ["Porto", "Vila Nova de Gaia", "Matosinhos", "Maia", "Gondomar", "Valongo", "Paredes", "Vila do Conde", "Póvoa de Varzim"],
  "Faro": ["Faro", "Loulé", "Albufeira", "Portimão", "Olhão", "Tavira", "Lagos", "Silves", "Quarteira"],
  "Setúbal": ["Setúbal", "Almada", "Seixal", "Barreiro", "Palmela", "Montijo", "Sesimbra"],
  "Braga": ["Braga", "Guimarães", "Vila Nova de Famalicão", "Barcelos", "Fafe", "Esposende"]
};

const AdminImoveis: React.FC = () => {
  const { profile } = useAuth();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingImovel, setEditingImovel] = useState<Partial<Imovel> | null>(null);
  const [mediaItems, setMediaItems] = useState<ImovelMedia[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProperties = useCallback(async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    setLoading(true);
    try {
      const data = await PropertyService.getProperties(profile.tenantId);
      setImoveis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [profile?.tenantId]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const openModal = async (imovel: Imovel | null) => {
    setCurrentStep(1);
    if (imovel) {
      // Garante que o objeto tem a estrutura mínima para evitar erros de undefined na IA
      setEditingImovel({ 
        ...imovel,
        descricao: imovel.descricao || { curta: '', completa_md: '', gerada_por_ia: false, ultima_geracao_ia_at: null },
        localizacao: imovel.localizacao || { pais: 'Portugal', distrito: 'Lisboa', concelho: 'Lisboa', freguesia: '', codigo_postal: '', morada: '', porta: '', lat: null, lng: null, expor_morada: false },
        financeiro: imovel.financeiro || { preco_venda: 0, preco_arrendamento: null, negociavel: true, comissao_incluida: true, condominio_mensal: null, imi_anual: null, caucao_meses: null, despesas_incluidas: [] },
        areas: imovel.areas || { area_util_m2: 0, area_bruta_m2: null, area_terreno_m2: null, pisos: 1, andar: null, elevador: false },
        divisoes: imovel.divisoes || { quartos: 2, casas_banho: 1, garagem: { tem: false, lugares: 0 }, varanda: false, arrecadacao: false, piscina: false, jardim: false }
      });
      const media = await PropertyService.getPropertyMedia(profile!.tenantId, imovel.id);
      setMediaItems(media);
    } else {
      setEditingImovel({
        titulo: '',
        ref: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        tipo_imovel: 'apartamento',
        operacao: 'venda',
        tipologia: 'T2',
        estado_conservacao: 'usado',
        publicacao: { estado: 'publicado', publicar_no_site: true, destaque: false, badges: [], data_publicacao: new Date() },
        localizacao: { pais: 'Portugal', distrito: 'Lisboa', concelho: 'Lisboa', freguesia: '', codigo_postal: '', morada: '', porta: '', lat: null, lng: null, expor_morada: false },
        financeiro: { preco_venda: 0, preco_arrendamento: null, negociavel: true, comissao_incluida: true, condominio_mensal: null, imi_anual: null, caucao_meses: null, despesas_incluidas: [] },
        divisoes: { quartos: 2, casas_banho: 1, garagem: { tem: false, lugares: 0 }, varanda: false, arrecadacao: false, piscina: false, jardim: false },
        areas: { area_util_m2: 0, area_bruta_m2: null, area_terreno_m2: null, pisos: 1, andar: null, elevador: false },
        descricao: { curta: '', completa_md: '', gerada_por_ia: false, ultima_geracao_ia_at: null },
        caracteristicas: []
      });
      setMediaItems([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!profile?.tenantId || !editingImovel) return;
    setIsSaving(true);
    try {
      if (editingImovel.id) {
        await PropertyService.updateProperty(profile.tenantId, editingImovel.id, editingImovel, mediaItems);
      } else {
        const slug = generateSlug(editingImovel.titulo || '');
        await PropertyService.createProperty(profile.tenantId, { ...editingImovel, slug, owner_uid: profile.id }, mediaItems);
      }
      setIsModalOpen(false);
      loadProperties();
    } catch (err) {
      console.error(err);
      alert("Erro ao guardar imóvel.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!editingImovel) return;
    setIsGenerating(true);
    try {
      const desc = await generatePropertyDescription(editingImovel);
      setEditingImovel(prev => ({
        ...prev!,
        descricao: {
          ...(prev?.descricao || { gerada_por_ia: false, ultima_geracao_ia_at: null }),
          curta: desc.curta,
          completa_md: desc.completa,
          gerada_por_ia: true,
          ultima_geracao_ia_at: new Date()
        }
      }));
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar descrição com IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newMedia: ImovelMedia[] = [];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      const promise = new Promise<void>((resolve) => {
        reader.onloadend = async () => {
          const compressed = await compressImage(reader.result as string, 1200, 1200, 0.7);
          newMedia.push({
            id: crypto.randomUUID(),
            type: 'image',
            url: compressed,
            storage_path: '',
            order: mediaItems.length + newMedia.length,
            is_cover: mediaItems.length === 0 && newMedia.length === 0,
            alt: editingImovel?.titulo || 'Imagem do imóvel',
            created_at: new Date()
          });
          resolve();
        };
        reader.readAsDataURL(files[i]);
      });
      await promise;
    }
    setMediaItems([...mediaItems, ...newMedia]);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 10));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const filteredImoveis = imoveis.filter(i => 
    i.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Inventário Imobiliário</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gestão centralizada da sua carteira</p>
        </div>
        <button onClick={() => openModal(null)} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
          <Plus size={18}/> Novo Imóvel
        </button>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
         <div className="flex-1 px-4 py-2 bg-slate-50 rounded-xl flex items-center gap-3">
            <Globe className="text-slate-300" size={18} />
            <input 
              placeholder="Pesquisar por título ou referência..." 
              className="bg-transparent outline-none w-full font-bold text-sm text-[#1c2d51]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
             <Loader2 className="animate-spin text-[#1c2d51]" size={32} />
             <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">A carregar imóveis...</p>
          </div>
        ) : filteredImoveis.length === 0 ? (
          <div className="col-span-full bg-white p-20 rounded-[3rem] text-center border border-dashed border-slate-200">
             <Building2 className="mx-auto text-slate-200 mb-4" size={48} />
             <p className="font-black text-slate-300 uppercase text-xs tracking-widest">Sem imóveis listados.</p>
          </div>
        ) : (
          filteredImoveis.map(imovel => (
            <div key={imovel.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500">
              <div className="relative h-48 overflow-hidden">
                 <img src={imovel.media?.cover_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={imovel.titulo} />
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[8px] font-black uppercase text-[#1c2d51]">{imovel.ref}</div>
                 <div className="absolute bottom-4 right-4 flex gap-2">
                    <button onClick={() => openModal(imovel)} className="p-2 bg-white rounded-xl text-[#1c2d51] shadow-lg hover:scale-110 transition-all"><Edit3 size={16}/></button>
                    <button onClick={() => { if(window.confirm("Apagar imóvel?")) PropertyService.deleteProperty(profile!.tenantId, imovel.id).then(loadProperties) }} className="p-2 bg-white rounded-xl text-red-500 shadow-lg hover:scale-110 transition-all"><Trash2 size={16}/></button>
                 </div>
              </div>
              <div className="p-6">
                 <h4 className="font-black text-[#1c2d51] line-clamp-1">{imovel.titulo}</h4>
                 <p className="text-[9px] font-black uppercase text-slate-400 mt-1">{imovel.localizacao.concelho}, {imovel.localizacao.distrito}</p>
                 <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                    <span className="font-black text-[#1c2d51]">{formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro?.preco_venda : imovel.financeiro?.preco_arrendamento) || 0)}</span>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${imovel.publicacao?.publicar_no_site ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                       {imovel.publicacao?.publicar_no_site ? 'Online' : 'Offline'}
                    </span>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 10 PASSOS */}
      {isModalOpen && editingImovel && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="p-8 border-b flex items-center justify-between shrink-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1c2d51]"><Building2 size={24}/></div>
                <div>
                   <h3 className="text-xl font-black text-[#1c2d51] tracking-tight">{editingImovel.id ? 'Editar Imóvel' : 'Adicionar Imóvel'}</h3>
                   <div className="flex gap-1.5 mt-1">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${currentStep > i ? 'bg-[#357fb2]' : 'bg-slate-100'}`}></div>
                      ))}
                   </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={28}/></button>
            </div>

            {/* Body Modal */}
            <div className="flex-1 overflow-y-auto p-10">
               {/* PASSO 1: INFORMAÇÃO BASE */}
               {currentStep === 1 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Info size={16} className="text-blue-500"/> Passo 1: Informação Base</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="admin-label">Título do Anúncio</label>
                          <input className="admin-input-v3" value={editingImovel.titulo || ''} onChange={e => setEditingImovel({...editingImovel, titulo: e.target.value})} placeholder="Ex: Apartamento T2 com Varanda em Lisboa" />
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Referência</label>
                          <input className="admin-input-v3" value={editingImovel.ref || ''} onChange={e => setEditingImovel({...editingImovel, ref: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Tipo de Imóvel</label>
                          <select className="admin-input-v3" value={editingImovel.tipo_imovel} onChange={e => setEditingImovel({...editingImovel, tipo_imovel: e.target.value as TipoImovel})}>
                             <option value="apartamento">Apartamento</option>
                             <option value="moradia">Moradia</option>
                             <option value="terreno">Terreno</option>
                             <option value="loja">Loja / Comercial</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Operação</label>
                          <select className="admin-input-v3" value={editingImovel.operacao} onChange={e => setEditingImovel({...editingImovel, operacao: e.target.value as any})}>
                             <option value="venda">Venda</option>
                             <option value="arrendamento">Arrendamento</option>
                          </select>
                       </div>
                    </div>
                 </div>
               )}

               {/* PASSO 2: PREÇO */}
               {currentStep === 2 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Euro size={16} className="text-blue-500"/> Passo 2: Condições Financeiras</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="admin-label">Preço ({editingImovel.operacao === 'venda' ? '€' : '€/mês'})</label>
                          <input type="number" className="admin-input-v3" value={(editingImovel.operacao === 'venda' ? editingImovel.financeiro?.preco_venda : editingImovel.financeiro?.preco_arrendamento) || ''} 
                            onChange={e => setEditingImovel({...editingImovel, financeiro: {...editingImovel.financeiro!, preco_venda: editingImovel.operacao === 'venda' ? parseFloat(e.target.value) : null, preco_arrendamento: editingImovel.operacao === 'arrendamento' ? parseFloat(e.target.value) : null}})} 
                          />
                       </div>
                       <div className="flex items-center gap-4 mt-10">
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" className="w-5 h-5 rounded" checked={editingImovel.financeiro?.negociavel} onChange={e => setEditingImovel({...editingImovel, financeiro: {...editingImovel.financeiro!, negociavel: e.target.checked}})} />
                             <span className="text-xs font-bold text-slate-600 uppercase">Preço Negociável</span>
                          </label>
                       </div>
                    </div>
                 </div>
               )}

               {/* PASSO 3: LOCALIZAÇÃO */}
               {currentStep === 3 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> Passo 3: Localização</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="admin-label">Distrito</label>
                          <select className="admin-input-v3" value={editingImovel.localizacao?.distrito} onChange={e => setEditingImovel({...editingImovel, localizacao: {...editingImovel.localizacao!, distrito: e.target.value, concelho: DISTRICTS_DATA[e.target.value]?.[0] || ''}})}>
                             {Object.keys(DISTRICTS_DATA).map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Concelho</label>
                          <select className="admin-input-v3" value={editingImovel.localizacao?.concelho} onChange={e => setEditingImovel({...editingImovel, localizacao: {...editingImovel.localizacao!, concelho: e.target.value}})}>
                             {DISTRICTS_DATA[editingImovel.localizacao?.distrito || 'Lisboa']?.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="admin-label">Morada / Rua</label>
                          <input className="admin-input-v3" value={editingImovel.localizacao?.morada || ''} onChange={e => setEditingImovel({...editingImovel, localizacao: {...editingImovel.localizacao!, morada: e.target.value}})} placeholder="Ex: Av. da República" />
                       </div>
                    </div>
                 </div>
               )}

               {/* PASSO 4: ÁREAS */}
               {currentStep === 4 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Square size={16} className="text-blue-500"/> Passo 4: Áreas e Pisos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="admin-label">Área Útil (m²)</label>
                          <input type="number" className="admin-input-v3" value={editingImovel.areas?.area_util_m2 || ''} onChange={e => setEditingImovel({...editingImovel, areas: {...editingImovel.areas!, area_util_m2: parseFloat(e.target.value)}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Área Bruta (m²)</label>
                          <input type="number" className="admin-input-v3" value={editingImovel.areas?.area_bruta_m2 || ''} onChange={e => setEditingImovel({...editingImovel, areas: {...editingImovel.areas!, area_bruta_m2: parseFloat(e.target.value)}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Andar</label>
                          <input className="admin-input-v3" value={editingImovel.areas?.andar || ''} onChange={e => setEditingImovel({...editingImovel, areas: {...editingImovel.areas!, andar: e.target.value}})} placeholder="Ex: 3º Esq" />
                       </div>
                    </div>
                 </div>
               )}

               {/* PASSO 5: DIVISÕES */}
               {currentStep === 5 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Home size={16} className="text-blue-500"/> Passo 5: Divisões</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       <DivBox label="Quartos" val={editingImovel.divisoes?.quartos || 0} icon={<Bed size={18}/>} onInc={() => setEditingImovel({...editingImovel, divisoes: {...editingImovel.divisoes!, quartos: (editingImovel.divisoes?.quartos || 0) + 1}})} onDec={() => setEditingImovel({...editingImovel, divisoes: {...editingImovel.divisoes!, quartos: Math.max(0, (editingImovel.divisoes?.quartos || 0) - 1)}})} />
                       <DivBox label="Casas de Banho" val={editingImovel.divisoes?.casas_banho || 0} icon={<Bath size={18}/>} onInc={() => setEditingImovel({...editingImovel, divisoes: {...editingImovel.divisoes!, casas_banho: (editingImovel.divisoes?.casas_banho || 0) + 1}})} onDec={() => setEditingImovel({...editingImovel, divisoes: {...editingImovel.divisoes!, casas_banho: Math.max(0, (editingImovel.divisoes?.casas_banho || 0) - 1)}})} />
                    </div>
                 </div>
               )}

               {/* PASSO 6: DESCRIÇÃO E IA */}
               {currentStep === 6 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="flex justify-between items-center">
                       <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><FileText size={16} className="text-blue-500"/> Passo 6: Descrição</h4>
                       <button onClick={handleGenerateAI} disabled={isGenerating} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-100 disabled:opacity-50">
                          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14}/>} Gerar com Gemini IA
                       </button>
                    </div>
                    <textarea rows={10} className="admin-input-v3 font-medium leading-relaxed" value={editingImovel.descricao?.completa_md || ''} onChange={e => setEditingImovel({...editingImovel, descricao: {...editingImovel.descricao!, completa_md: e.target.value}})} placeholder="Escreva a descrição detalhada do imóvel..." />
                 </div>
               )}

               {/* PASSO 7: CARACTERÍSTICAS */}
               {currentStep === 7 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><LayoutList size={16} className="text-blue-500"/> Passo 7: Características</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {['Ar Condicionado', 'Varanda', 'Piscina', 'Jardim', 'Elevador', 'Garagem', 'Lareira', 'Mobilado', 'Cozinha Equipada', 'Portaria'].map(feat => (
                         <button key={feat} onClick={() => {
                            const current = editingImovel.caracteristicas || [];
                            const next = current.includes(feat) ? current.filter(c => c !== feat) : [...current, feat];
                            setEditingImovel({...editingImovel, caracteristicas: next});
                         }} className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${editingImovel.caracteristicas?.includes(feat) ? 'border-[#1c2d51] bg-[#1c2d51] text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                           {feat}
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {/* PASSO 8: CERTIFICAÇÃO */}
               {currentStep === 8 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Shield size={16} className="text-blue-500"/> Passo 8: Certificação Energética</h4>
                    <div className="flex flex-wrap gap-3">
                       {['A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'Isento'].map(grade => (
                         <button key={grade} onClick={() => setEditingImovel({...editingImovel, certificacao: {...editingImovel.certificacao!, certificado_energetico: grade}})} className={`w-14 h-14 rounded-xl border-2 font-black transition-all flex items-center justify-center ${editingImovel.certificacao?.certificado_energetico === grade ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-slate-100 text-slate-400'}`}>
                           {grade}
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {/* PASSO 9: GALERIA */}
               {currentStep === 9 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Camera size={16} className="text-blue-500"/> Passo 9: Galeria de Fotos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                       {mediaItems.map((img, idx) => (
                         <div key={img.id} className="relative aspect-video rounded-2xl overflow-hidden group border border-slate-100 shadow-sm">
                            <img src={img.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                               <button onClick={() => setMediaItems(mediaItems.map((m, i) => ({...m, is_cover: i === idx})))} className={`p-1.5 rounded-lg ${img.is_cover ? 'bg-amber-500 text-white' : 'bg-white text-slate-400'}`}><Star size={14}/></button>
                               <button onClick={() => setMediaItems(mediaItems.filter(m => m.id !== img.id))} className="p-1.5 bg-white text-red-500 rounded-lg"><Trash size={14}/></button>
                            </div>
                         </div>
                       ))}
                       <label className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:bg-slate-100">
                          <UploadCloud size={24}/>
                          <span className="text-[8px] font-black uppercase mt-1">Upload</span>
                          <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
                       </label>
                    </div>
                 </div>
               )}

               {/* PASSO 10: PUBLICAÇÃO */}
               {currentStep === 10 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Globe size={16} className="text-blue-500"/> Passo 10: Publicação</h4>
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-6">
                       <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-6 h-6 rounded-lg" checked={editingImovel.publicacao?.publicar_no_site} onChange={e => setEditingImovel({...editingImovel, publicacao: {...editingImovel.publicacao!, publicar_no_site: e.target.checked}})} />
                          <span className="text-sm font-black text-[#1c2d51] uppercase">Publicar Ativamente no Website</span>
                       </label>
                       <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-6 h-6 rounded-lg" checked={editingImovel.publicacao?.destaque} onChange={e => setEditingImovel({...editingImovel, publicacao: {...editingImovel.publicacao!, destaque: e.target.checked}})} />
                          <span className="text-sm font-black text-[#1c2d51] uppercase">Marcar como Destaque (Homepage)</span>
                       </label>
                    </div>
                 </div>
               )}
            </div>

            {/* Footer Modal */}
            <div className="p-8 border-t bg-slate-50/50 flex justify-between shrink-0">
               <button onClick={prevStep} disabled={currentStep === 1} className="px-6 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-[#1c2d51] disabled:opacity-0 transition-all flex items-center gap-2">
                  <ChevronLeft size={18}/> Anterior
               </button>
               {currentStep < 10 ? (
                 <button onClick={nextStep} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all">
                    Próximo <ChevronRight size={18}/>
                 </button>
               ) : (
                 <button onClick={handleSave} disabled={isSaving} className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50">
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18}/>} Finalizar e Gravar
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-label { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; margin-left: 0.5rem; margin-bottom: 0.5rem; letter-spacing: 0.1em; }
        .admin-input-v3 { width: 100%; padding: 1.15rem 1.4rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.875rem; }
        .admin-input-v3:focus { background: #fff; border-color: #357fb2; box-shadow: 0 0 0 4px rgba(53, 127, 178, 0.05); }
      `}</style>
    </div>
  );
};

const DivBox = ({ label, val, icon, onInc, onDec }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center space-y-4 shadow-sm">
     <div className="text-blue-500">{icon}</div>
     <p className="text-[9px] font-black uppercase text-slate-400 leading-tight">{label}</p>
     <div className="flex items-center gap-4">
        <button onClick={onDec} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center font-black text-[#1c2d51] hover:bg-slate-100">-</button>
        <span className="font-black text-xl text-[#1c2d51]">{val}</span>
        <button onClick={onInc} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center font-black text-[#1c2d51] hover:bg-slate-100">+</button>
     </div>
  </div>
);

export default AdminImoveis;