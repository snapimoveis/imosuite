
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Imovel, TipoImovel, ImovelMedia } from '../../types';
import { 
  Plus, X, Loader2, AlertCircle, Sparkles, Check, ChevronRight, ChevronLeft, 
  Trash, UploadCloud, Building2, Star, Zap, Brush, MoveUp, MoveDown,
  Info, MapPin, Eye, FileText, Camera, Video, Layers, Map, Globe, Edit3
} from 'lucide-react';
import { formatCurrency, generateSlug, compressImage } from '../../lib/utils';
import { generatePropertyDescription } from '../../services/geminiService';

// Base de dados local completa de Distritos e Concelhos de Portugal (INE)
const DISTRICTS_DATA: Record<string, string[]> = {
  "Aveiro": ["Águeda", "Albergaria-a-Velha", "Anadia", "Arouca", "Aveiro", "Castelo de Paiva", "Espinho", "Estarreja", "Ílhavo", "Mealhada", "Murtosa", "Oliveira de Azeméis", "Oliveira do Bairro", "Ovar", "Santa Maria da Feira", "São João da Madeira", "Sever do Vouga", "Vagos", "Vale de Cambra"],
  "Beja": ["Aljustrel", "Almodôvar", "Alvito", "Barrancos", "Beja", "Castro Verde", "Cuba", "Ferreira do Alentejo", "Mértola", "Moura", "Odemira", "Ourique", "Serpa", "Vidigueira"],
  "Braga": ["Amares", "Barcelos", "Braga", "Cabeceiras de Basto", "Celorico de Basto", "Esposende", "Fafe", "Guimarães", "Póvoa de Lanhoso", "Terras de Bouro", "Vieira do Minho", "Vila Nova de Famalicão", "Vila Verde", "Vizela"],
  "Bragança": ["Alfândega da Fé", "Bragança", "Carrazeda de Ansiães", "Freixo de Espada à Cinta", "Macedo de Cavaleiros", "Miranda do Douro", "Mirandela", "Mogadouro", "Torre de Moncorvo", "Vila Flor", "Vimioso", "Vinhais"],
  "Castelo Branco": ["Belmonte", "Castelo Branco", "Covilhã", "Fundão", "Idanha-a-Nova", "Oleiros", "Penamacor", "Proença-a-Nova", "Sertã", "Vila de Rei", "Vila Velha de Ródão"],
  "Coimbra": ["Arganil", "Cantanhede", "Coimbra", "Condeixa-a-Nova", "Figueira da Foz", "Góis", "Lousã", "Mira", "Miranda do Corvo", "Montemor-o-Velho", "Oliveira do Hospital", "Pampilhosa da Serra", "Penacova", "Penela", "Soure", "Tábua", "Vila Nova de Poiares"],
  "Évora": ["Alandroal", "Arraiolos", "Borba", "Estremoz", "Évora", "Montemor-o-Novo", "Mora", "Mourão", "Portel", "Redondo", "Reguengos de Monsaraz", "Vendas Novas", "Viana do Alentejo", "Vila Viçosa"],
  "Faro": ["Albufeira", "Alcoutim", "Aljezur", "Castro Marim", "Faro", "Lagoa", "Lagos", "Loulé", "Monchique", "Olhão", "Portimão", "São Brás de Alportel", "Silves", "Tavira", "Vila do Bispo", "Vila Real de Santo António"],
  "Guarda": ["Aguiar da Beira", "Almeida", "Celorico da Beira", "Figueira de Castelo Rodrigo", "Fornos de Algodres", "Gouveia", "Guarda", "Manteigas", "Mêda", "Pinhel", "Sabugal", "Seia", "Trancoso", "Vila Nova de Foz Côa"],
  "Leiria": ["Alcobaça", "Alvaiázere", "Ansião", "Batalha", "Bombarral", "Caldas da Rainha", "Castanheira de Pêra", "Figueiró dos Vinhos", "Leiria", "Marinha Grande", "Nazaré", "Óbidos", "Pedrógão Grande", "Peniche", "Pombal", "Porto de Mós"],
  "Lisboa": ["Alenquer", "Arruda dos Vinhos", "Azambuja", "Cadaval", "Cascais", "Lisboa", "Loures", "Lourinhã", "Mafra", "Odivelas", "Oeiras", "Sintra", "Sobral de Monte Agraço", "Torres Vedras", "Vila Franca de Xira", "Amadora"],
  "Portalegre": ["Alter do Chão", "Arronches", "Avis", "Campo Maior", "Castelo de Vide", "Crato", "Elvas", "Fronteira", "Gavião", "Marvão", "Monforte", "Nisa", "Ponte de Sor", "Portalegre", "Sousel"],
  "Porto": ["Amarante", "Baião", "Felgueiras", "Gondomar", "Lousada", "Maia", "Marco de Canaveses", "Matosinhos", "Paços de Ferreira", "Paredes", "Penafiel", "Porto", "Póvoa de Varzim", "Santo Tirso", "Trofa", "Valongo", "Vila do Conde", "Vila Nova de Gaia"],
  "Santarém": ["Abrantes", "Alcanena", "Almeirim", "Alpiarça", "Benavente", "Cartaxo", "Chamusca", "Constância", "Coruche", "Entroncamento", "Ferreira do Zêzere", "Golegã", "Mação", "Ourém", "Rio Maior", "Salvaterra de Magos", "Santarém", "Sardoal", "Tomar", "Torres Novas", "Vila Nova da Barquinha"],
  "Setúbal": ["Alcochete", "Almada", "Barreiro", "Grândola", "Moita", "Montijo", "Palmela", "Santiago do Cacém", "Seixal", "Sesimbra", "Setúbal", "Sines"],
  "Viana do Castelo": ["Arcos de Valdevez", "Caminha", "Melgaço", "Monção", "Paredes de Coura", "Ponte da Barca", "Ponte do Lima", "Valença", "Viana do Castelo", "Vila Nova de Cerveira"],
  "Vila Real": ["Alijó", "Boticas", "Chaves", "Mesão Frio", "Mondim de Basto", "Montalegre", "Murça", "Peso da Régua", "Ribeira de Pena", "Sabrosa", "Santa Marta de Penaguião", "Valpaços", "Vila Pouca de Aguiar", "Vila Real"],
  "Viseu": ["Armamar", "Carregal do Sal", "Castro Daire", "Cinfães", "Lamego", "Mangualde", "Moimenta da Beira", "Mortágua", "Nelas", "Oliveira de Frades", "Penalva do Castelo", "Penedono", "Resende", "Santa Comba Dão", "São João da Pesqueira", "São Pedro do Sul", "Sátão", "Sernancelhe", "Tabuaço", "Tarouca", "Tondela", "Vila Nova de Paiva", "Viseu", "Vouzela"],
  "Ilha da Madeira": ["Calheta", "Câmara de Lobos", "Funchal", "Machico", "Ponta do Sol", "Porto Moniz", "Porto Santo", "Ribeira Brava", "Santa Cruz", "Santana", "São Vicente"],
  "Ilha de Santa Maria": ["Vila do Porto"],
  "Ilha de São Miguel": ["Lagoa", "Nordeste", "Ponta Delgada", "Povoação", "Ribeira Grande", "Vila Franca do Campo"],
  "Ilha Terceira": ["Angra do Heroísmo", "Praia da Vitória"],
  "Ilha da Graciosa": ["Santa Cruz da Graciosa"],
  "Ilha de São Jorge": ["Calheta", "Velas"],
  "Ilha do Pico": ["Lajes do Pico", "Madalena", "São Roque do Pico"],
  "Ilha do Faial": ["Horta"],
  "Ilha das Flores": ["Lajes das Flores", "Santa Cruz das Flores"],
  "Ilha do Corvo": ["Corvo"]
};

const TABS = ['Vivos', 'Destaques', 'Rascunhos', 'Arquivo'];

const AdminImoveis: React.FC = () => {
  const { profile } = useAuth();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [editingImovel, setEditingImovel] = useState<Imovel | null>(null);
  const [tempMedia, setTempMedia] = useState<ImovelMedia[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const initialFormData: Partial<Imovel> = {
    titulo: '',
    ref: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    tipo_imovel: 'apartamento',
    tipologia: 'T2',
    estado_conservacao: 'usado',
    operacao: 'venda',
    district: '',
    municipality: '',
    localizacao: {
      pais: 'Portugal',
      distrito: '',
      concelho: '',
      freguesia: '',
      codigo_postal: '',
      morada: '',
      porta: '',
      lat: null,
      lng: null,
      expor_morada: false
    },
    areas: { area_util_m2: null, area_bruta_m2: null, area_terreno_m2: null, pisos: 1, andar: null, elevador: false },
    divisoes: { quartos: 2, casas_banho: 1, garagem: { tem: false, lugares: 0 }, varanda: false, arrecadacao: false, piscina: false, jardim: false },
    financeiro: { preco_venda: null, preco_arrendamento: null, negociavel: false, comissao_incluida: true, condominio_mensal: null, imi_anual: null, caucao_meses: null, despesas_incluidas: [] },
    descricao: { curta: '', completa_md: '', gerada_por_ia: false, ultima_geracao_ia_at: null },
    publicacao: { estado: 'publicado', publicar_no_site: true, destaque: false, badges: [], data_publicacao: null },
    caracteristicas: []
  };

  const [formData, setFormData] = useState<Partial<Imovel>>(initialFormData);

  const loadImoveis = useCallback(async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    try {
      const data = await PropertyService.getProperties(profile.tenantId);
      setImoveis(data);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }, [profile?.tenantId]);

  useEffect(() => { loadImoveis(); }, [loadImoveis]);

  const openNewModal = () => {
    setEditingImovel(null);
    setFormData(initialFormData);
    setTempMedia([]);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const openEditModal = async (imovel: Imovel) => {
    setEditingImovel(imovel);
    setFormData({ ...imovel });
    setCurrentStep(1);
    setIsModalOpen(true);
    if (profile?.tenantId) {
      const media = await PropertyService.getPropertyMedia(profile.tenantId, imovel.id);
      setTempMedia(media);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !profile?.tenantId) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64, 1200, 1200, 0.7);
        const newMedia: ImovelMedia = {
          id: crypto.randomUUID(),
          type: 'image',
          url: compressed,
          storage_path: '',
          order: tempMedia.length + i,
          is_cover: tempMedia.length === 0 && i === 0,
          alt: formData.titulo || 'Imagem do imóvel',
          created_at: new Date().toISOString()
        };
        setTempMedia(prev => [...prev, newMedia]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.titulo || isGeneratingAI) return;
    setIsGeneratingAI(true);
    try {
      const res = await generatePropertyDescription(formData);
      setFormData(prev => ({
        ...prev,
        descricao: {
          ...prev.descricao!,
          curta: res.curta,
          completa_md: res.completa,
          gerada_por_ia: true,
          ultima_geracao_ia_at: new Date()
        }
      }));
    } catch (err) {
      alert("Erro ao gerar descrição com IA.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    setIsSaving(true);
    try {
      const finalData = {
        ...formData,
        slug: generateSlug(formData.titulo || 'imovel'),
      };

      if (editingImovel) {
        await PropertyService.updateProperty(profile.tenantId, editingImovel.id, finalData, tempMedia);
      } else {
        await PropertyService.createProperty(profile.tenantId, finalData, tempMedia);
      }
      await loadImoveis();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao guardar imóvel.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!profile?.tenantId || !window.confirm("Apagar este imóvel?")) return;
    try {
      await PropertyService.deleteProperty(profile.tenantId, id);
      await loadImoveis();
    } catch (err) { alert("Erro ao apagar."); }
  };

  return (
    <div className="space-y-8 font-brand animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Gestão de Imóveis</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Controle total do seu portfólio</p>
        </div>
        <button onClick={openNewModal} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:-translate-y-1 transition-all">
          <Plus size={20} /> Novo Imóvel
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Imóvel / Referência</th>
                <th className="px-8 py-5">Tipo / Zona</th>
                <th className="px-8 py-5">Preço</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : imoveis.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest italic">Nenhum imóvel encontrado.</td></tr>
              ) : imoveis.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                        <img src={(i.media as any)?.cover_url || i.media?.items?.[0]?.url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <div className="font-black text-[#1c2d51] text-sm truncate max-w-[200px]">{i.titulo}</div>
                        <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{i.ref}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-bold text-slate-600 capitalize">{i.tipo_imovel}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{i.localizacao.concelho}, {i.localizacao.distrito}</div>
                  </td>
                  <td className="px-8 py-6 font-black text-sm text-[#1c2d51]">
                    {formatCurrency(i.operacao === 'venda' ? i.financeiro.preco_venda : i.financeiro.preco_arrendamento)}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${i.publicacao.publicar_no_site ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {i.publicacao.publicar_no_site ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => openEditModal(i)} className="p-2 bg-white text-slate-400 hover:text-[#1c2d51] border border-slate-100 rounded-xl transition-all"><Edit3 size={18}/></button>
                       <button onClick={() => handleDelete(i.id)} className="p-2 bg-white text-slate-400 hover:text-red-500 border border-slate-100 rounded-xl transition-all"><Trash size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MULTI-STEP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1c2d51]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1c2d51]">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#1c2d51] tracking-tighter">{editingImovel ? 'Editar Imóvel' : 'Novo Imóvel'}</h2>
                    <div className="flex gap-1 mt-1">
                       {[1,2,3,4,5].map(step => (
                         <div key={step} className={`h-1.5 w-6 rounded-full transition-all ${currentStep >= step ? 'bg-[#1c2d51]' : 'bg-slate-100'}`}></div>
                       ))}
                    </div>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-slate-50 text-slate-300 hover:text-slate-900 rounded-full flex items-center justify-center transition-all">
                  <X size={24} />
               </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
               {/* STEP 1: DADOS BÁSICOS */}
               {currentStep === 1 && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título do Anúncio</label>
                          <input required className="admin-input" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ex: Apartamento T2 com varanda e vista" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Referência Interna</label>
                          <input className="admin-input" value={formData.ref} onChange={e => setFormData({...formData, ref: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipo de Imóvel</label>
                          <select className="admin-input" value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value as TipoImovel})}>
                             <option value="apartamento">Apartamento</option>
                             <option value="moradia">Moradia</option>
                             <option value="casa_rustica">Casa Rústica / Quinta</option>
                             <option value="terreno">Terreno</option>
                             <option value="comercial">Comercial / Escritório</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Operação</label>
                          <select className="admin-input" value={formData.operacao} onChange={e => setFormData({...formData, operacao: e.target.value as any})}>
                             <option value="venda">Venda</option>
                             <option value="arrendamento">Arrendamento</option>
                             <option value="venda_arrendamento">Ambos</option>
                          </select>
                       </div>
                    </div>
                 </div>
               )}

               {/* STEP 2: CARACTERÍSTICAS E ÁREAS */}
               {currentStep === 2 && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipologia</label>
                          <select className="admin-input" value={formData.tipologia} onChange={e => setFormData({...formData, tipologia: e.target.value})}>
                             {['T0','T1','T2','T3','T4','T5','T6+','V1','V2','V3','V4','V5'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Área Útil (m²)</label>
                          <input type="number" className="admin-input" value={formData.areas?.area_util_m2 || ''} onChange={e => setFormData({...formData, areas: {...formData.areas!, area_util_m2: Number(e.target.value)}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Quartos</label>
                          <input type="number" className="admin-input" value={formData.divisoes?.quartos || 0} onChange={e => setFormData({...formData, divisoes: {...formData.divisoes!, quartos: Number(e.target.value)}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Casas de Banho</label>
                          <input type="number" className="admin-input" value={formData.divisoes?.casas_banho || 0} onChange={e => setFormData({...formData, divisoes: {...formData.divisoes!, casas_banho: Number(e.target.value)}})} />
                       </div>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-4">
                       <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-slate-200" checked={formData.divisoes?.piscina} onChange={e => setFormData({...formData, divisoes: {...formData.divisoes!, piscina: e.target.checked}})} /> <span className="text-xs font-bold text-slate-600">Piscina</span></label>
                       <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-slate-200" checked={formData.divisoes?.jardim} onChange={e => setFormData({...formData, divisoes: {...formData.divisoes!, jardim: e.target.checked}})} /> <span className="text-xs font-bold text-slate-600">Jardim</span></label>
                       <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-slate-200" checked={formData.divisoes?.garagem.tem} onChange={e => setFormData({...formData, divisoes: {...formData.divisoes!, garagem: {...formData.divisoes!.garagem, tem: e.target.checked}}})} /> <span className="text-xs font-bold text-slate-600">Garagem</span></label>
                       <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-slate-200" checked={formData.areas?.elevador} onChange={e => setFormData({...formData, areas: {...formData.areas!, elevador: e.target.checked}})} /> <span className="text-xs font-bold text-slate-600">Elevador</span></label>
                    </div>
                 </div>
               )}

               {/* STEP 3: LOCALIZAÇÃO - CAMPOS ATUALIZADOS */}
               {currentStep === 3 && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Distrito</label>
                          <select 
                            required
                            className="admin-input" 
                            value={formData.district} 
                            onChange={e => {
                               const dist = e.target.value;
                               setFormData({
                                 ...formData, 
                                 district: dist,
                                 municipality: '', // Limpa concelho ao mudar distrito
                                 localizacao: {
                                   ...formData.localizacao!,
                                   distrito: dist,
                                   concelho: ''
                                 }
                               });
                            }}
                          >
                             <option value="">Selecionar Distrito...</option>
                             {Object.keys(DISTRICTS_DATA).sort().map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Concelho</label>
                          <select 
                            required
                            disabled={!formData.district}
                            className="admin-input disabled:bg-slate-100 disabled:cursor-not-allowed" 
                            value={formData.municipality} 
                            onChange={e => {
                               const m = e.target.value;
                               setFormData({
                                 ...formData, 
                                 municipality: m,
                                 localizacao: {
                                   ...formData.localizacao!,
                                   concelho: m
                                 }
                               });
                            }}
                          >
                             <option value="">Selecionar Concelho...</option>
                             {formData.district && DISTRICTS_DATA[formData.district as string]?.sort().map(m => (
                               <option key={m} value={m}>{m}</option>
                             ))}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Freguesia</label>
                          <input className="admin-input" value={formData.localizacao?.freguesia || ''} onChange={e => setFormData({...formData, localizacao: {...formData.localizacao!, freguesia: e.target.value}})} placeholder="Introduza a freguesia manualmente" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Código Postal</label>
                          <input className="admin-input" value={formData.localizacao?.codigo_postal || ''} onChange={e => setFormData({...formData, localizacao: {...formData.localizacao!, codigo_postal: e.target.value}})} placeholder="0000-000" />
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Morada Completa</label>
                          <input className="admin-input" value={formData.localizacao?.morada || ''} onChange={e => setFormData({...formData, localizacao: {...formData.localizacao!, morada: e.target.value}})} />
                       </div>
                    </div>
                 </div>
               )}

               {/* STEP 4: FOTOS E MEDIA */}
               {currentStep === 4 && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div onClick={() => document.getElementById('media-upload')?.click()} className="h-64 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-all">
                       <UploadCloud size={48} strokeWidth={1} className="mb-4" />
                       <p className="font-black text-xs uppercase tracking-widest">Arraste fotos ou clique para carregar</p>
                       <input type="file" id="media-upload" multiple className="hidden" accept="image/*" onChange={handleMediaUpload} />
                    </div>
                    {tempMedia.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                         {tempMedia.map((m, idx) => (
                           <div key={m.id} className="group relative aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                              <img src={m.url} className="w-full h-full object-cover" alt="" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                 <button onClick={() => setTempMedia(prev => prev.filter(item => item.id !== m.id))} className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center"><Trash size={14}/></button>
                                 <button onClick={() => setTempMedia(prev => prev.map((item, i) => ({...item, is_cover: i === idx})))} className={`w-8 h-8 ${m.is_cover ? 'bg-amber-500' : 'bg-white/20'} text-white rounded-lg flex items-center justify-center`}><Star size={14} fill={m.is_cover ? 'currentColor' : 'none'}/></button>
                              </div>
                              {m.is_cover && <div className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Capa</div>}
                           </div>
                         ))}
                      </div>
                    )}
                 </div>
               )}

               {/* STEP 5: DESCRIÇÃO E VALORES */}
               {currentStep === 5 && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Descrição Comercial</label>
                            <button onClick={handleGenerateDescription} disabled={isGeneratingAI} className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 hover:text-blue-700 transition-colors">
                              {isGeneratingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12}/>} Gerar com IA
                            </button>
                          </div>
                          <textarea rows={12} className="admin-input font-medium leading-relaxed" value={formData.descricao?.completa_md || ''} onChange={e => setFormData({...formData, descricao: {...formData.descricao!, completa_md: e.target.value}})}></textarea>
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Preço de {formData.operacao === 'venda' ? 'Venda' : 'Arrendamento'} (€)</label>
                            <input type="number" className="admin-input text-2xl" value={(formData.operacao === 'venda' ? formData.financeiro?.preco_venda : formData.financeiro?.preco_arrendamento) || ''} onChange={e => setFormData({...formData, financeiro: {...formData.financeiro!, [formData.operacao === 'venda' ? 'preco_venda' : 'preco_arrendamento']: Number(e.target.value)}})} />
                          </div>
                          <div className="bg-slate-50 p-8 rounded-3xl space-y-4">
                             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Publicação</h4>
                             <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-xs font-bold text-slate-700">Publicar no Site</span>
                                <input type="checkbox" className="w-5 h-5 rounded border-slate-200" checked={formData.publicacao?.publicar_no_site} onChange={e => setFormData({...formData, publicacao: {...formData.publicacao!, publicar_no_site: e.target.checked}})} />
                             </label>
                             <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-xs font-bold text-slate-700">Destacar Imóvel</span>
                                <input type="checkbox" className="w-5 h-5 rounded border-slate-200" checked={formData.publicacao?.destaque} onChange={e => setFormData({...formData, publicacao: {...formData.publicacao!, destaque: e.target.checked}})} />
                             </label>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center shrink-0">
               <button 
                 onClick={() => setCurrentStep(prev => prev - 1)} 
                 disabled={currentStep === 1}
                 className="px-8 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-[#1c2d51] transition-all disabled:opacity-0"
               >
                  <div className="flex items-center gap-2"><ChevronLeft size={18}/> Anterior</div>
               </button>

               <div className="flex gap-4">
                  {currentStep < 5 ? (
                    <button 
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      Próximo <ChevronRight size={18}/>
                    </button>
                  ) : (
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Check size={18}/>} Guardar Imóvel
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-input { width: 100%; padding: 1.1rem 1.4rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.875rem; }
        .admin-input:focus { background: #fff; border-color: #357fb2; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AdminImoveis;
