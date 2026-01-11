import React, { useState, useEffect, useCallback } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Imovel, TipoImovel, ImovelMedia } from '../../types';
import { 
  Plus, X, Loader2, AlertCircle, Sparkles, Check, ChevronRight, ChevronLeft, 
  Trash, UploadCloud, Building2, Star, Zap, Brush, MapPin, Edit3, Trash2, Camera, Info, Globe, ShieldCheck,
  FileText
} from 'lucide-react';
import { formatCurrency, generateSlug, compressImage } from '../../lib/utils';
import { generatePropertyDescription } from '../../services/geminiService';

const DISTRICTS_DATA: Record<string, string[]> = {
  "Aveiro": ["Águeda", "Albergaria-a-Velha", "Anadia", "Arouca", "Aveiro", "Castelo de Paiva", "Espinho", "Estarreja", "Ílhavo", "Mealhada", "Murtosa", "Oliveira de Azeméis", "Oliveira do Bairro", "Ovar", "Santa Maria da Feira", "São João da Madeira", "Sever do Vouga", "Vagos", "Vale de Cambra"],
  "Beja": ["Aljustrel", "Almodôvar", "Alvito", "Barrancos", "Beja", "Castro Verde", "Cuba", "Ferreira do Alentejo", "Mértola", "Moura", "Odemira", "Ourique", "Serpa", "Vidigueira"],
  "Braga": ["Amares", "Barcelos", "Braga", "Cabeceiras de Basto", "Celorico de Basto", "Esposende", "Fafe", "Guimarães", "Póvoa de Lanhoso", "Terras de Bouro", "Vieira do Minho", "Vila Nova de Famalicão", "Vila Verde", "Vizela"],
  "Bragança": ["Alfândega da Fé", "Bragança", "Carrazeda de Ansiães", "Freixo de Espada à Cinta", "Macedo de Cavaleiros", "Miranda do Douro", "Mirandela", "Mogadouro", "Torre de Moncorvo", "Vila Flor", "Vimioso", "Vinhais"],
  "Castelo Branco": ["Belmonte", "Castelo Branco", "Covilhã", "Fundão", "Idanha-a-Nova", "Oleiros", "Penamacor", "Proença-a-Nova", "Sertã", "Vila de Rei", "Vila Velha de Ródão"],
  "Coimbra": ["Arganil", "Cantanhede", "Coimbra", "Condeixa-a-Nova", "Figueira da Foz", "Góis", "Lousã", "Mira", "Miranda do Corvo", "Montemor-o-Velho", "Oliveira do Hospital", "Pampilhosa da Serra", "Penacova", "Penela", "Soure", "Tábua", "Vila Nova de Poiares"],
  "Évora": ["Alandroal", "Arraiolos", "Borba", "Estremoz", "Évora", "Montemor-o-Novo", "Mora", "Mourão", "Portel", "Redondo", "Reguengos de Monsaraz", "Vendas Novas", "Viana do Alentejo", "Vila Viçosa"],
  "Faro": ["Albufeira", "Alcoutim", "Aljezur", "Castro Marim", "Faro", "Lagoa", "Lagos", "Loulé", "Monchique", "Olhão", "Portimão", "São Brás de Alportel", "Silves", "Tavira", "Vila do Bispo", "Vila Real de Santo António"],
  "Guarda": ["Aguiar da Beira", "Almeida", "Celorico da Beira", "Figueira de Castelo Rodrigo", "Fornos de Algodres", "Gouveia", "Guarda", "Manteigas", "Mêda", "Pinhel", "Sabugal", "Seia", "Trancoso", "Vila Nova de foz Côa"],
  "Leiria": ["Alcobaça", "Alvaiázere", "Ansião", "Batalha", "Bombarral", "Caldas da Rainha", "Castanheira de Pêra", "Figueiró dos Vinhos", "Leiria", "Marinha Grande", "Nazaré", "Óbidos", "Pedrógão Grande", "Peniche", "Pombal", "Porto de Mós"],
  "Lisboa": ["Alenquer", "Arruda dos Vinhos", "Azambuja", "Cadaval", "Cascais", "Lisboa", "Loures", "Lourinhã", "Mafra", "Odivelas", "Oeiras", "Sintra", "Sobral de Monte Agraço", "Torres Vedras", "Vila Franca de Xira", "Amadora"],
  "Portalegre": ["Alter do Chão", "Arronches", "Avis", "Campo Maior", "Castelo de Vide", "Crato", "Elvas", "Fronteira", "Gavião", "Marvão", "Monforte", "Nisa", "Ponte de Sor", "Portalegre", "Sousel"],
  "Porto": ["Amarante", "Baião", "Felgueiras", "Gondomar", "Lousada", "Maia", "Marco de Canaveses", "Matosinhos", "Paços de Ferreira", "Paredes", "Penafiel", "Porto", "Póvoa de Varzim", "Santo Tirso", "Trofa", "Valongo", "Vila do Conde", "Vila Nova de Gaia"],
  "Santarém": ["Abrantes", "Alcanena", "Almeirim", "Alpiarça", "Benavente", "Cartaxo", "Chamusca", "Constância", "Coruche", "Entroncamento", "Ferreira do Zêzere", "Golegã", "Mação", "Ourém", "Rio Maior", "Salvaterra de Magos", "Santarém", "Sardoal", "Tomar", "Torres Novas", "Vila Nova da Barquinha"],
  "Setúbal": ["Alcochete", "Almada", "Barreiro", "Grândola", "Moita", "Montijo", "Palmela", "Santiago do Cacém", "Seixal", "Sesimbra", "Setúbal", "Sines"],
  "Viana do Castelo": ["Arcos de Valdevez", "Caminha", "Melgaço", "Monção", "Paredes de Coura", "Ponte da Barca", "Ponte do Lima", "Valença", "Viana do Castelo", "Vila Nova de Cerveira"],
  "Vila Real": ["Alijó", "Boticas", "Chaves", "Mesão Frio", "Mondim de Basto", "Montalegre", "Murça", "Peso da Engenharia", "Ribeira de Pena", "Sabrosa", "Santa Marta de Penaguião", "Valpaços", "Vila Pouca de Aguiar", "Vila Real"],
  "Viseu": ["Armamar", "Carregal do Sal", "Castro Daire", "Cinfães", "Lamego", "Mangualde", "Moimenta da Beira", "Mortágua", "Nelas", "Oliveira de Frades", "Penalva do Castelo", "Penedono", "Resende", "Santa Comba Dão", "São João da Pesqueira", "São Pedro do Sul", "Sátão", "Sernancelhe", "Tabuaço", "Tarouca", "Tondela", "Vila Nova de Paiva", "Viseu", "Vouzela"]
};

const AdminImoveis: React.FC = () => {
  const { profile } = useAuth();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const openEditModal = async (imovel: Imovel | null) => {
    if (imovel) {
      setEditingImovel({ ...imovel });
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja apagar permanentemente este imóvel?") || !profile?.tenantId) return;
    try {
      await PropertyService.deleteProperty(profile.tenantId, id);
      loadProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAI = async () => {
    if (!editingImovel) return;
    setIsGenerating(true);
    try {
      const desc = await generatePropertyDescription(editingImovel);
      setEditingImovel({
        ...editingImovel,
        descricao: {
          ...editingImovel.descricao!,
          curta: desc.curta,
          completa_md: desc.completa,
          gerada_por_ia: true,
          ultima_geracao_ia_at: new Date()
        }
      });
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
          const base64 = reader.result as string;
          const compressed = await compressImage(base64, 1200, 1200, 0.7);
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

  const filteredImoveis = imoveis.filter(i => 
    i.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-brand animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Gestão de Inventário</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Total de {imoveis.length} imóveis na carteira</p>
        </div>
        <button onClick={() => openEditModal(null)} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
          <Plus size={18}/> Adicionar Imóvel
        </button>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
         <div className="flex-1 px-4 py-2 bg-slate-50 rounded-xl flex items-center gap-3 border border-transparent focus-within:border-blue-100 focus-within:bg-white transition-all">
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
             <p className="font-black text-slate-300 uppercase text-xs tracking-widest">Nenhum imóvel encontrado.</p>
          </div>
        ) : (
          filteredImoveis.map(imovel => (
            <div key={imovel.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500 flex flex-col">
              <div className="relative h-48 overflow-hidden bg-slate-50">
                 <img src={imovel.media?.cover_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={imovel.titulo} />
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[8px] font-black uppercase text-[#1c2d51] shadow-sm">{imovel.ref}</div>
                 <div className="absolute bottom-4 right-4 flex gap-2">
                    <button onClick={() => openEditModal(imovel)} className="p-2 bg-white rounded-xl text-[#1c2d51] shadow-lg hover:bg-slate-50 transition-all"><Edit3 size={16}/></button>
                    <button onClick={() => handleDelete(imovel.id)} className="p-2 bg-white rounded-xl text-red-500 shadow-lg hover:bg-red-50 transition-all"><Trash2 size={16}/></button>
                 </div>
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                 <div>
                    <h4 className="font-black text-[#1c2d51] line-clamp-1 leading-tight">{imovel.titulo}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{imovel.tipo_imovel} • {imovel.operacao}</p>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                    <span className="font-black text-lg text-[#1c2d51]">{formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro?.preco_venda : imovel.financeiro?.preco_arrendamento) || 0)}</span>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${imovel.publicacao?.publicar_no_site ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                       {imovel.publicacao?.publicar_no_site ? 'Online' : 'Rascunho'}
                    </div>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && editingImovel && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1c2d51] text-white rounded-xl flex items-center justify-center"><Building2 size={20}/></div>
                <h3 className="text-xl font-black text-[#1c2d51] tracking-tight">{editingImovel.id ? 'Editar Imóvel' : 'Novo Imóvel'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                     <Info size={14} className="text-blue-500" /> Informação Base
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título do Anúncio</label>
                        <input className="admin-input-v2" value={editingImovel.titulo || ''} onChange={e => setEditingImovel({...editingImovel, titulo: e.target.value})} placeholder="Ex: Apartamento T2 no centro de Lisboa" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Referência</label>
                        <input className="admin-input-v2" value={editingImovel.ref || ''} onChange={e => setEditingImovel({...editingImovel, ref: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipo de Imóvel</label>
                        <select className="admin-input-v2 appearance-none" value={editingImovel.tipo_imovel || 'apartamento'} onChange={e => setEditingImovel({...editingImovel, tipo_imovel: e.target.value as TipoImovel})}>
                           <option value="apartamento">Apartamento</option>
                           <option value="moradia">Moradia</option>
                           <option value="terreno">Terreno</option>
                           <option value="loja">Loja</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Operação</label>
                        <select className="admin-input-v2 appearance-none" value={editingImovel.operacao || 'venda'} onChange={e => setEditingImovel({...editingImovel, operacao: e.target.value as any})}>
                           <option value="venda">Venda</option>
                           <option value="arrendamento">Arrendamento</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Preço ({editingImovel.operacao === 'venda' ? '€' : '€/mês'})</label>
                        <input type="number" className="admin-input-v2" value={(editingImovel.operacao === 'venda' ? editingImovel.financeiro?.preco_venda : editingImovel.financeiro?.preco_arrendamento) || ''} onChange={e => {
                           const val = parseFloat(e.target.value);
                           setEditingImovel({
                             ...editingImovel,
                             financeiro: {
                               ...editingImovel.financeiro!,
                               preco_venda: editingImovel.operacao === 'venda' ? val : null,
                               preco_arrendamento: editingImovel.operacao === 'arrendamento' ? val : null
                             }
                           });
                        }} />
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                     <MapPin size={14} className="text-blue-500" /> Localização
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Distrito</label>
                        <select className="admin-input-v2 appearance-none" value={editingImovel.localizacao?.distrito || ''} onChange={e => setEditingImovel({
                           ...editingImovel,
                           localizacao: { ...editingImovel.localizacao!, distrito: e.target.value, concelho: DISTRICTS_DATA[e.target.value]?.[0] || '' }
                        })}>
                           {Object.keys(DISTRICTS_DATA).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Concelho</label>
                        <select className="admin-input-v2 appearance-none" value={editingImovel.localizacao?.concelho || ''} onChange={e => setEditingImovel({
                           ...editingImovel,
                           localizacao: { ...editingImovel.localizacao!, concelho: e.target.value }
                        })}>
                           {DISTRICTS_DATA[editingImovel.localizacao?.distrito || 'Lisboa']?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                     <Camera size={14} className="text-blue-500" /> Galeria de Imagens
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                     {mediaItems.map((img, idx) => (
                        <div key={img.id} className="relative aspect-video rounded-2xl overflow-hidden group shadow-sm">
                           <img src={img.url} className="w-full h-full object-cover" alt={`Imagem ${idx}`} />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button onClick={() => setMediaItems(mediaItems.map((m, i) => ({...m, is_cover: i === idx})))} className={`p-1.5 rounded-lg ${img.is_cover ? 'bg-amber-500 text-white' : 'bg-white text-slate-400'}`} title="Usar como capa"><Star size={14}/></button>
                              <button onClick={() => setMediaItems(mediaItems.filter((_, i) => i !== idx))} className="p-1.5 bg-white text-red-500 rounded-lg"><Trash size={14}/></button>
                           </div>
                        </div>
                     ))}
                     <label className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:bg-slate-100 transition-all">
                        <UploadCloud size={24}/>
                        <span className="text-[8px] font-black uppercase mt-1">Upload</span>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
                     </label>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                      <FileText size={14} className="text-blue-500" /> Descrição do Imóvel
                    </h4>
                    <button onClick={handleGenerateAI} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50">
                       {isGenerating ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>} Gerar com IA
                    </button>
                  </div>
                  <div className="space-y-4">
                     <textarea rows={8} className="admin-input-v2 font-medium leading-relaxed" value={editingImovel.descricao?.completa_md || ''} onChange={e => setEditingImovel({
                        ...editingImovel,
                        descricao: { ...editingImovel.descricao!, completa_md: e.target.value }
                     })} placeholder="Escreva a descrição completa do imóvel..." />
                  </div>
               </div>
            </div>

            <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-4">
               <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-[#1c2d51] font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-all">Cancelar</button>
               <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Check size={18}/>} Gravar Imóvel
               </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-input-v2 { width: 100%; padding: 1.15rem 1.4rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.875rem; }
        .admin-input-v2:focus { background: #fff; border-color: #357fb2; }
        .admin-input-v2::placeholder { color: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default AdminImoveis;
