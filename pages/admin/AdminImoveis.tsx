
import React, { useState, useEffect, useCallback } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { Imovel, TipoImovel, ImovelMedia } from '../../types';
import { Link } from 'react-router-dom';
import { 
  Plus, X, Loader2, Sparkles, Check, ChevronRight, ChevronLeft, 
  Trash, UploadCloud, Building2, Star, MapPin, Edit3, Trash2, Camera, Info, Globe, 
  FileText, Bed, Bath, Square, Home, Shield, Euro, LayoutList, Zap, Lock, Eye, Calendar
} from 'lucide-react';
import { formatCurrency, generateSlug, compressImage } from '../../lib/utils';
import { generatePropertyDescription } from '../../services/geminiService';

const DISTRICTS_DATA: Record<string, string[]> = {
  "Aveiro": ["Aveiro", "Águeda", "Albergaria-a-Velha", "Anadia", "Arouca", "Castelo de Paiva", "Espinho", "Estarreja", "Ílhavo", "Mealhada", "Murtosa", "Oliveira de Azeméis", "Oliveira do Bairro", "Ovar", "Santa Maria da Feira", "São João da Madeira", "Sever do Vouga", "Vagos", "Vale de Cambra"],
  "Beja": ["Beja", "Aljustrel", "Almodôvar", "Alvito", "Barrancos", "Castro Verde", "Cuba", "Ferreira do Alentejo", "Mértola", "Moura", "Odemira", "Ourique", "Serpa", "Vidigueira"],
  "Braga": ["Braga", "Barcelos", "Esposende", "Fafe", "Guimarães", "Póvoa de Lanhoso", "Terras de Bouro", "Vieira do Minho", "Vila Nova de Famalicão", "Vila Verde", "Vizela", "Amares", "Cabeceiras de Basto", "Celorico de Basto"],
  "Bragança": ["Bragança", "Alfândega da Fé", "Carrazeda de Ansiães", "Fregenal", "Macedo de Cavaleiros", "Miranda do Douro", "Mirandela", "Mogadouro", "Torre de Moncorvo", "Vila Flor", "Vimioso", "Vinhais"],
  "Castelo Branco": ["Castelo Branco", "Belmonte", "Covilhã", "Fundão", "Idanha-a-Nova", "Oleiros", "Penamacor", "Proença-a-Nova", "Sertã", "Vila de Rei", "Vila Velha de Ródão"],
  "Coimbra": ["Coimbra", "Arganil", "Cantanhede", "Figueira da Foz", "Góis", "Lousã", "Mira", "Miranda do Corvo", "Montemor-o-Velho", "Oliveira do Hospital", "Pampilhosa da Serra", "Penacova", "Penela", "Soure", "Tábua", "Vila Nova de Poiares"],
  "Évora": ["Évora", "Alandroal", "Arraiolos", "Borba", "Estremoz", "Montemor-o-Novo", "Mora", "Mourão", "Portel", "Redondo", "Reguengos de Monsaraz", "Vendas Novas", "Viana do Alentejo", "Vila Viçosa"],
  "Faro": ["Faro", "Albufeira", "Alcoutim", "Aljezur", "Castro Marim", "Lagoa", "Lagos", "Loulé", "Monchique", "Olhão", "Portimão", "São Brás de Alportel", "Silves", "Tavira", "Vila do Bispo", "Vila Real de Santo António"],
  "Guarda": ["Guarda", "Aguiar da Beira", "Almeida", "Celorico da Beira", "Figueira de Castelo Rodrigo", "Fornos de Algodres", "Gouveia", "Manteigas", "Mêda", "Pinhel", "Sabugal", "Seia", "Trancoso", "Vila Nova de Foz Côa"],
  "Leiria": ["Leiria", "Alcobaça", "Alvaiázere", "Ansião", "Batalha", "Bombarral", "Caldas da Rainha", "Castanheira de Pêra", "Figueiró dos Vinhos", "Marinha Grande", "Nazaré", "Óbidos", "Pedrógão Grande", "Peniche", "Pombal", "Porto de Mós"],
  "Lisboa": ["Lisboa", "Alenquer", "Arruda dos Vinhos", "Azambuja", "Cadaval", "Cascais", "Loures", "Lourinhã", "Mafra", "Odivelas", "Oeiras", "Sintra", "Sobral de Monte Agraço", "Torres Vedras", "Vila Franca de Xira", "Amadora"],
  "Portalegre": ["Portalegre", "Alter do Chão", "Arronches", "Avis", "Campo Maior", "Castelo de Vide", "Crato", "Elvas", "Fronteira", "Gavião", "Maranhão", "Monforte", "Nisa", "Ponte de Sor", "Sousel"],
  "Porto": ["Porto", "Amarante", "Baião", "Felgueiras", "Gondomar", "Lousada", "Maia", "Marco de Canaveses", "Matosinhos", "Paços de Ferreira", "Paredes", "Penafiel", "Póvoa de Varzim", "Santo Tirso", "Trofa", "Valongo", "Vila do Conde", "Vila Nova de Gaia"],
  "Santarém": ["Santarém", "Abrantes", "Alcanena", "Almeirim", "Alpiarça", "Benavente", "Cartaxo", "Chamusca", "Constância", "Coruche", "Entroncamento", "Ferreira do Zêzere", "Golegã", "Mação", "Ourém", "Rio Maior", "Salvaterra de Magos", "Sardoal", "Tomar", "Torres Novas", "Vila Nova da Barquinha"],
  "Setúbal": ["Setúbal", "Alcácer do Sal", "Alcochete", "Almada", "Barreiro", "Grândola", "Moita", "Montijo", "Palmela", "Santiago do Cacém", "Seixal", "Sesimbra", "Sines"],
  "Viana do Castelo": ["Viana do Castelo", "Arcos de Valdevez", "Caminha", "Melgaço", "Monção", "Paredes de Coura", "Ponte da Barca", "Ponte de Lima", "Valença", "Vila Nova de Cerveira"],
  "Vila Real": ["Vila Real", "Alijó", "Boticas", "Chaves", "Mesão Frio", "Mondim de Basto", "Montalegre", "Murça", "Peso da Régua", "Ribeira de Pena", "Sabrosa", "Santa Marta de Penaguião", "Valpaços", "Vila Pouca de Aguiar"],
  "Viseu": ["Viseu", "Armamar", "Carregal do Sal", "Castro Daire", "Cinfães", "Lamego", "Mangualde", "Moimenta da Beira", "Mortágua", "Nelas", "Oliveira de Frades", "Penalva do Castelo", "Penedono", "Resende", "Santa Comba Dão", "São João da Pesqueira", "São Pedro do Sul", "Sátão", "Sernancelhe", "Tabuaço", "Tarouca", "Tondela", "Vila Nova de Paiva", "Vouzela"],
  "Açores": ["Angra do Heroísmo", "Calheta", "Corvo", "Horta", "Lagoa", "Lajes das Flores", "Lajes do Pico", "Madalena", "Nordeste", "Ponta Delgada", "Povoação", "Praia da Vitória", "Ribeira Grande", "Santa Cruz da Graciosa", "Santa Cruz das Flores", "São Roque do Pico", "Velas", "Vila do Porto", "Vila Franca do Campo"],
  "Madeira": ["Funchal", "Calheta", "Câmara de Lobos", "Machico", "Ponta do Sol", "Porto Moniz", "Porto Santo", "Ribeira Brava", "Santa Cruz", "Santana", "São Vicente"]
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

const AdminImoveis: React.FC = () => {
  const { profile } = useAuth();
  const { tenant } = useTenant();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingImovel, setEditingImovel] = useState<Partial<Imovel> | null>(null);
  const [mediaItems, setMediaItems] = useState<ImovelMedia[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isBusiness = tenant.subscription?.plan_id === 'business' || profile?.email === 'snapimoveis@gmail.com';
  const propertyLimit = isBusiness ? 9999 : 50;
  const reachedLimit = imoveis.length >= propertyLimit;

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
    if (!imovel && reachedLimit) return;
    setCurrentStep(1);
    if (imovel) {
      setEditingImovel({ 
        ...imovel,
        descricao: imovel.descricao || { curta: '', completa_md: '', gerada_por_ia: false, ultima_geracao_ia_at: null },
        localizacao: imovel.localizacao || { pais: 'Portugal', distrito: 'Lisboa', concelho: 'Lisboa', freguesia: '', codigo_postal: '', morada: '', porta: '', lat: null, lng: null, expor_morada: false },
        financeiro: imovel.financeiro || { preco_venda: 0, preco_arrendamento: null, negociavel: true, comissao_incluida: true, condominio_mensal: null, imi_anual: null, caucao_meses: null, despesas_incluidas: [] },
        areas: imovel.areas || { area_util_m2: 0, area_bruta_m2: null, area_terreno_m2: null, pisos: 1, andar: null, elevador: false },
        divisoes: imovel.divisoes || { quartos: 2, casas_banho: 1, garagem: { tem: false, lugares: 0 }, varanda: false, arrecadacao: false, piscina: false, jardim: false },
        certificacao: imovel.certificacao || { certificado_energetico: 'A', licenca_utilizacao: '', licenca_utilizacao_numero: '', licenca_utilizacao_data: '', isento_licenca_utilizacao: false, estado_licenca: 'sim' },
        publicacao: imovel.publicacao || { estado: 'publicado', publicar_no_site: true, destaque: false, badges: [], data_publicacao: new Date() }
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
        ano_construcao: new Date().getFullYear(),
        publicacao: { estado: 'rascunho', publicar_no_site: true, destaque: false, badges: [], data_publicacao: new Date() },
        localizacao: { pais: 'Portugal', distrito: 'Lisboa', concelho: 'Lisboa', freguesia: '', codigo_postal: '', morada: '', porta: '', lat: null, lng: null, expor_morada: false },
        financeiro: { preco_venda: 0, preco_arrendamento: null, negociavel: true, comissao_incluida: true, condominio_mensal: null, imi_anual: null, caucao_meses: null, despesas_incluidas: [] },
        divisoes: { quartos: 2, casas_banho: 1, garagem: { tem: false, lugares: 0 }, varanda: false, arrecadacao: false, piscina: false, jardim: false },
        areas: { area_util_m2: 0, area_bruta_m2: null, area_terreno_m2: null, pisos: 1, andar: null, elevador: false },
        certificacao: { certificado_energetico: 'A', licenca_utilizacao: '', licenca_utilizacao_numero: '', licenca_utilizacao_data: '', isento_licenca_utilizacao: false, estado_licenca: 'sim' },
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

  const processFiles = async (files: FileList) => {
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
    setMediaItems(prev => [...prev, ...newMedia]);
  };

  // Added handleImageUpload to handle the onChange event of the file input
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
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
          <div className="flex items-center gap-2 mt-1">
             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Controlo de carteira</p>
             {!isBusiness && (
               <div className="bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                     <div className="bg-[#1c2d51] h-full" style={{ width: `${(imoveis.length / propertyLimit) * 100}%` }}></div>
                  </div>
                  <span className="text-[8px] font-black text-[#1c2d51]">{imoveis.length} / {propertyLimit}</span>
               </div>
             )}
          </div>
        </div>
        
        {reachedLimit ? (
          <Link to="/planos" className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all">
            <Zap size={18} fill="currentColor"/> Limite Atingido - Upgrade
          </Link>
        ) : (
          <button onClick={() => openModal(null)} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
            <Plus size={18}/> Novo Imóvel
          </button>
        )}
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

      {isModalOpen && editingImovel && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
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

            <div className="flex-1 overflow-y-auto p-10">
               {/* STEP 1: IDENTIFICAÇÃO */}
               {currentStep === 1 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Info size={16} className="text-blue-500"/> Passo 1: Identificação</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="admin-label">Referência Interna</label>
                          <input className="admin-input-v3" value={editingImovel.ref || ''} onChange={e => setEditingImovel({...editingImovel, ref: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Título do Anúncio</label>
                          <input className="admin-input-v3" value={editingImovel.titulo || ''} onChange={e => setEditingImovel({...editingImovel, titulo: e.target.value})} placeholder="Ex: Moradia T3 com Piscina em Cascais" />
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Tipo de Imóvel</label>
                          <select className="admin-input-v3" value={editingImovel.tipo_imovel} onChange={e => setEditingImovel({...editingImovel, tipo_imovel: e.target.value as TipoImovel})}>
                             <option value="apartamento">Apartamento</option>
                             <option value="moradia">Moradia</option>
                             <option value="casa_rustica">Casa Rústica</option>
                             <option value="ruina">Ruína</option>
                             <option value="escritorio">Escritório</option>
                             <option value="comercial">Espaço comercial / Armazém</option>
                             <option value="garagem">Lugar de garagem</option>
                             <option value="arrecadacao">Arrecadação</option>
                             <option value="predio">Prédio</option>
                             <option value="terreno">Terreno</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Tipologia</label>
                          <select className="admin-input-v3" value={editingImovel.tipologia} onChange={e => setEditingImovel({...editingImovel, tipologia: e.target.value})}>
                             {['T0','T1','T2','T3','T4','T5+'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Estado do Imóvel</label>
                          <select className="admin-input-v3" value={editingImovel.estado_conservacao} onChange={e => setEditingImovel({...editingImovel, estado_conservacao: e.target.value as any})}>
                             <option value="novo">Novo</option>
                             <option value="usado">Usado</option>
                             <option value="renovado">Renovado</option>
                             <option value="para_renovar">Para renovar</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Ano de Construção</label>
                          <input type="number" className="admin-input-v3" value={editingImovel.ano_construcao || ''} onChange={e => setEditingImovel({...editingImovel, ano_construcao: parseInt(e.target.value) || null})} />
                       </div>
                    </div>
                 </div>
               )}

               {/* STEP 2: OPERAÇÃO / REGIME */}
               {currentStep === 2 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Zap size={16} className="text-blue-500"/> Passo 2: Operação / Regime</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="admin-label">Tipo de Operação</label>
                          <select className="admin-input-v3" value={editingImovel.operacao} onChange={e => setEditingImovel({...editingImovel, operacao: e.target.value as any})}>
                             <option value="venda">Venda</option>
                             <option value="arrendamento">Arrendamento</option>
                          </select>
                       </div>
                       {editingImovel.operacao === 'arrendamento' && (
                         <>
                           <div className="space-y-2">
                              <label className="admin-label">Tipo de Arrendamento</label>
                              <select className="admin-input-v3" value={editingImovel.arrendamento_tipo || 'residencial'} onChange={e => setEditingImovel({...editingImovel, arrendamento_tipo: e.target.value as any})}>
                                 <option value="residencial">Residencial (Habitação permanente)</option>
                                 <option value="temporario">Temporário (Estudos, Trabalho)</option>
                                 <option value="ferias">Férias / Alojamento Turístico</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="admin-label">Duração Mínima (Meses)</label>
                              <input type="number" className="admin-input-v3" value={editingImovel.arrendamento_duracao_min_meses || ''} onChange={e => setEditingImovel({...editingImovel, arrendamento_duracao_min_meses: parseInt(e.target.value)})} />
                           </div>
                         </>
                       )}
                       <div className="space-y-2 flex items-end">
                          <label className="flex items-center gap-3 cursor-pointer pb-4">
                             <input type="checkbox" className="w-5 h-5 rounded border-slate-200 text-[#1c2d51]" checked={editingImovel.disponivel_imediato} onChange={e => setEditingImovel({...editingImovel, disponivel_imediato: e.target.checked})} />
                             <span className="text-xs font-bold uppercase text-slate-600">Disponibilidade Imediata</span>
                          </label>
                       </div>
                    </div>
                 </div>
               )}

               {/* STEP 3: LOCALIZAÇÃO */}
               {currentStep === 3 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> Passo 3: Localização</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="admin-label">Distrito</label>
                          <select className="admin-input-v3" value={editingImovel.localizacao?.distrito} onChange={e => setEditingImovel({...editingImovel, localizacao: {...editingImovel.localizacao!, distrito: e.target.value, concelho: DISTRICTS_DATA[e.target.value]?.[0] || ''}})}>
                             {Object.keys(DISTRICTS_DATA).sort().map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Concelho</label>
                          <select className="admin-input-v3" value={editingImovel.localizacao?.concelho} onChange={e => setEditingImovel({...editingImovel, localizacao: {...editingImovel.localizacao!, concelho: e.target.value}})}>
                             {(DISTRICTS_DATA[editingImovel.localizacao?.distrito || 'Lisboa'] || []).sort().map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Freguesia</label>
                          <input className="admin-input-v3" value={editingImovel.localizacao?.freguesia || ''} onChange={e => setEditingImovel({...editingImovel, localizacao: {...editingImovel.localizacao!, freguesia: e.target.value}})} placeholder="Nome da freguesia" />
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Código Postal</label>
                          <input className="admin-input-v3" value={editingImovel.localizacao?.codigo_postal || ''} onChange={e => setEditingImovel({...editingImovel, localizacao: {...editingImovel.localizacao!, codigo_postal: e.target.value}})} placeholder="0000-000" />
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="admin-label">Morada Completa</label>
                          <input className="admin-input-v3" value={editingImovel.localizacao?.morada || ''} onChange={e => setEditingImovel({...editingImovel, localizacao: {...editingImovel.localizacao!, morada: e.target.value}})} placeholder="Rua, Número, Andar..." />
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-5 h-5 rounded border-slate-200 text-[#1c2d51]" checked={editingImovel.localizacao?.expor_morada} onChange={e => setEditingImovel({...editingImovel, localizacao: {...editingImovel.localizacao!, expor_morada: e.target.checked}})} />
                             <span className="text-xs font-bold uppercase text-slate-600">Expor morada publicamente no site</span>
                          </label>
                       </div>
                    </div>
                 </div>
               )}

               {/* STEP 4: ÁREAS E DIMENSÕES */}
               {currentStep === 4 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Square size={16} className="text-blue-500"/> Passo 4: Áreas e Dimensões</h4>
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
                          <label className="admin-label">Área Terreno (m²)</label>
                          <input type="number" className="admin-input-v3" value={editingImovel.areas?.area_terreno_m2 || ''} onChange={e => setEditingImovel({...editingImovel, areas: {...editingImovel.areas!, area_terreno_m2: parseFloat(e.target.value)}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Número de Pisos</label>
                          <input type="number" className="admin-input-v3" value={editingImovel.areas?.pisos || ''} onChange={e => setEditingImovel({...editingImovel, areas: {...editingImovel.areas!, pisos: parseInt(e.target.value)}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Andar</label>
                          <input className="admin-input-v3" value={editingImovel.areas?.andar || ''} onChange={e => setEditingImovel({...editingImovel, areas: {...editingImovel.areas!, andar: e.target.value}})} placeholder="Ex: 3º Esq" />
                       </div>
                       <div className="space-y-2 flex items-end">
                          <label className="flex items-center gap-3 cursor-pointer pb-4">
                             <input type="checkbox" className="w-5 h-5 rounded border-slate-200 text-[#1c2d51]" checked={editingImovel.areas?.elevador} onChange={e => setEditingImovel({...editingImovel, areas: {...editingImovel.areas!, elevador: e.target.checked}})} />
                             <span className="text-xs font-bold uppercase text-slate-600">Tem Elevador</span>
                          </label>
                       </div>
                    </div>
                 </div>
               )}

               {/* STEP 5: CARACTERÍSTICAS */}
               {currentStep === 5 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Home size={16} className="text-blue-500"/> Passo 5: Características</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                       <DivBox label="Quartos" val={editingImovel.divisoes?.quartos || 0} icon={<Bed size={18}/>} onInc={() => setEditingImovel({...editingImovel, divisoes: {...editingImovel.divisoes!, quartos: (editingImovel.divisoes?.quartos || 0) + 1}})} onDec={() => setEditingImovel({...editingImovel, divisoes: {...editingImovel.divisoes!, quartos: Math.max(0, (editingImovel.divisoes?.quartos || 0) - 1)}})} />
                       <DivBox label="Casas de Banho" val={editingImovel.divisoes?.casas_banho || 0} icon={<Bath size={18}/>} onInc={() => setEditingImovel({...editingImovel, divisoes: {...editingImovel.divisoes!, casas_banho: (editingImovel.divisoes?.casas_banho || 0) + 1}})} onDec={() => setEditingImovel({...editingImovel, divisoes: {...editingImovel.divisoes!, casas_banho: Math.max(0, (editingImovel.divisoes?.casas_banho || 0) - 1)}})} />
                       <DivBox label="Lugares Garagem" val={editingImovel.divisoes?.garagem?.lugares || 0} icon={<div className="w-5 h-5 border-2 border-current rounded-md"></div>} onInc={() => setEditingImovel({...editingImovel, divisoes: {...editingImovel.divisoes!, garagem: { tem: true, lugares: (editingImovel.divisoes?.garagem?.lugares || 0) + 1 }}})} onDec={() => setEditingImovel({...editingImovel, divisoes: {...editingImovel.divisoes!, garagem: { tem: (editingImovel.divisoes?.garagem?.lugares || 0) > 1, lugares: Math.max(0, (editingImovel.divisoes?.garagem?.lugares || 0) - 1) }}})} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="admin-label">Estruturas Adicionais</label>
                          <div className="grid grid-cols-2 gap-3">
                             {['Varanda / Terraço', 'Arrecadação', 'Piscina', 'Jardim'].map(item => {
                               const keyMap: any = { 'Varanda / Terraço': 'varanda', 'Arrecadação': 'arrecadacao', 'Piscina': 'piscina', 'Jardim': 'jardim' };
                               const key = keyMap[item];
                               return (
                                 <button key={item} onClick={() => setEditingImovel({...editingImovel, divisoes: {...editingImovel.divisoes!, [key]: !editingImovel.divisoes?.[key as keyof typeof editingImovel.divisoes]}})} className={`p-4 rounded-xl border text-[10px] font-black uppercase transition-all ${(editingImovel.divisoes as any)?.[key] ? 'border-[#1c2d51] bg-[#1c2d51] text-white' : 'border-slate-100 text-slate-400'}`}>
                                    {item}
                                 </button>
                               );
                             })}
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="admin-label">Lista de Extras</label>
                          <div className="grid grid-cols-2 gap-3">
                             {['Ar condicionado', 'Aquecimento central', 'Painéis solares', 'Lareira', 'Cozinha equipada', 'Mobilado', 'Vista mar', 'Vista rio', 'Vista cidade'].map(feat => (
                               <button key={feat} onClick={() => {
                                  const current = editingImovel.caracteristicas || [];
                                  const next = current.includes(feat) ? current.filter(c => c !== feat) : [...current, f];
                                  setEditingImovel({...editingImovel, caracteristicas: next});
                               }} className={`p-4 rounded-xl border text-[10px] font-black uppercase transition-all ${editingImovel.caracteristicas?.includes(feat) ? 'border-[#357fb2] bg-[#357fb2] text-white shadow-sm' : 'border-slate-100 text-slate-400 hover:border-blue-100'}`}>
                                  {feat}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {/* STEP 6: CERTIFICAÇÃO E LEGALIDADE */}
               {currentStep === 6 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Shield size={16} className="text-blue-500"/> Passo 6: Certificação e Legalidade</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="admin-label">Certificado Energético</label>
                          <select className="admin-input-v3" value={editingImovel.certificacao?.certificado_energetico} onChange={e => setEditingImovel({...editingImovel, certificacao: {...editingImovel.certificacao!, certificado_energetico: e.target.value}})}>
                             {['A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'G', 'Isento', 'Em preparação'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Licença de Utilização</label>
                          <select className="admin-input-v3" value={editingImovel.certificacao?.estado_licenca || 'sim'} onChange={e => setEditingImovel({...editingImovel, certificacao: {...editingImovel.certificacao!, estado_licenca: e.target.value as any}})}>
                             <option value="sim">Sim</option>
                             <option value="processo">Em processo</option>
                             <option value="isento">Isento</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">IMI Anual Estimado (€)</label>
                          <input type="number" className="admin-input-v3" value={editingImovel.financeiro?.imi_anual || ''} onChange={e => setEditingImovel({...editingImovel, financeiro: {...editingImovel.financeiro!, imi_anual: parseFloat(e.target.value)}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Condomínio Mensal (€)</label>
                          <input type="number" className="admin-input-v3" value={editingImovel.financeiro?.condominio_mensal || ''} onChange={e => setEditingImovel({...editingImovel, financeiro: {...editingImovel.financeiro!, condominio_mensal: parseFloat(e.target.value)}})} />
                       </div>
                    </div>
                 </div>
               )}

               {/* STEP 7: PREÇO E CONDIÇÕES */}
               {currentStep === 7 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Euro size={16} className="text-blue-500"/> Passo 7: Preço e Condições</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="admin-label">Preço {editingImovel.operacao === 'venda' ? 'de Venda' : 'de Arrendamento'} (€)</label>
                          <input type="number" className="admin-input-v3" value={(editingImovel.operacao === 'venda' ? editingImovel.financeiro?.preco_venda : editingImovel.financeiro?.preco_arrendamento) || ''} 
                            onChange={e => setEditingImovel({...editingImovel, financeiro: {...editingImovel.financeiro!, preco_venda: editingImovel.operacao === 'venda' ? parseFloat(e.target.value) : null, preco_arrendamento: editingImovel.operacao === 'arrendamento' ? parseFloat(e.target.value) : null}})} 
                          />
                       </div>
                       <div className="space-y-4 pt-8">
                          <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-5 h-5 rounded border-slate-200 text-[#1c2d51]" checked={editingImovel.financeiro?.negociavel} onChange={e => setEditingImovel({...editingImovel, financeiro: {...editingImovel.financeiro!, negociavel: e.target.checked}})} />
                             <span className="text-xs font-bold uppercase text-slate-600">Negociável</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-5 h-5 rounded border-slate-200 text-[#1c2d51]" checked={editingImovel.financeiro?.comissao_incluida} onChange={e => setEditingImovel({...editingImovel, financeiro: {...editingImovel.financeiro!, comissao_incluida: e.target.checked}})} />
                             <span className="text-xs font-bold uppercase text-slate-600">Comissão Incluída</span>
                          </label>
                       </div>
                       {editingImovel.operacao === 'arrendamento' && (
                         <>
                           <div className="space-y-2">
                              <label className="admin-label">Caução Exigida (€)</label>
                              <input type="number" className="admin-input-v3" value={editingImovel.financeiro?.caucao_meses || ''} onChange={e => setEditingImovel({...editingImovel, financeiro: {...editingImovel.financeiro!, caucao_meses: parseFloat(e.target.value)}})} />
                           </div>
                           <div className="space-y-4">
                              <label className="admin-label">Despesas Incluídas</label>
                              <div className="flex flex-wrap gap-2">
                                 {['Água', 'Luz', 'Gás', 'Internet', 'TV'].map(d => (
                                   <button key={d} onClick={() => {
                                      const current = editingImovel.financeiro?.despesas_incluidas || [];
                                      const next = current.includes(d) ? current.filter(x => x !== d) : [...current, d];
                                      setEditingImovel({...editingImovel, financeiro: {...editingImovel.financeiro!, despesas_incluidas: next}});
                                   }} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase border transition-all ${editingImovel.financeiro?.despesas_incluidas?.includes(d) ? 'border-[#357fb2] bg-[#357fb2] text-white' : 'border-slate-100 text-slate-400'}`}>
                                      {d}
                                   </button>
                                 ))}
                              </div>
                           </div>
                         </>
                       )}
                    </div>
                 </div>
               )}

               {/* STEP 8: DESCRIÇÃO (COM IA) */}
               {currentStep === 8 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="flex justify-between items-center">
                       <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><FileText size={16} className="text-blue-500"/> Passo 8: Descrição do Imóvel</h4>
                       <button onClick={handleGenerateAI} disabled={isGenerating} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-100 disabled:opacity-50 shadow-sm">
                          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14}/>} Gerar descrição com IA
                       </button>
                    </div>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="admin-label">Descrição Curta (Slogan do anúncio)</label>
                          <input className="admin-input-v3" value={editingImovel.descricao?.curta || ''} onChange={e => setEditingImovel({...editingImovel, descricao: {...editingImovel.descricao!, curta: e.target.value}})} placeholder="Uma frase impactante para o catálogo" />
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">Descrição Completa (Suporta Markdown)</label>
                          <textarea rows={12} className="admin-input-v3 font-medium leading-relaxed" value={editingImovel.descricao?.completa_md || ''} onChange={e => setEditingImovel({...editingImovel, descricao: {...editingImovel.descricao!, completa_md: e.target.value}})} placeholder="Conte a história do imóvel..." />
                       </div>
                    </div>
                 </div>
               )}

               {/* STEP 9: MEDIA */}
               {currentStep === 9 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Camera size={16} className="text-blue-500"/> Passo 9: Media e Visual</h4>
                    
                    <div 
                      className={`h-64 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center transition-all ${isDragging ? 'border-[#357fb2] bg-blue-50/50 scale-[0.99]' : 'border-slate-100 bg-slate-50/30'}`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) processFiles(e.dataTransfer.files); }}
                    >
                       <UploadCloud size={48} className="text-slate-200 mb-4" />
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Arraste as fotos para aqui</p>
                       <p className="text-[9px] text-slate-300 font-bold mt-2 mb-6">ou clique no botão abaixo</p>
                       <label className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform">
                          Escolher Ficheiros
                          <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
                       </label>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                       {mediaItems.map((item, idx) => (
                         <div key={item.id} className="group relative aspect-square bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
                            <img src={item.url} className="w-full h-full object-cover" alt={item.alt} />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                               <button onClick={() => setMediaItems(prev => prev.map((m, i) => ({...m, is_cover: i === idx})))} className={`p-2 rounded-lg transition-all ${item.is_cover ? 'bg-amber-400 text-white' : 'bg-white text-slate-400 hover:text-amber-400'}`}>
                                  <Star size={16} fill={item.is_cover ? 'currentColor' : 'none'} />
                               </button>
                               <button onClick={() => setMediaItems(prev => prev.filter((_, i) => i !== idx))} className="p-2 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform">
                                  <Trash2 size={16} />
                               </button>
                            </div>
                            {item.is_cover && <div className="absolute top-3 left-3 bg-amber-400 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase">Capa</div>}
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* STEP 10: PUBLICAÇÃO */}
               {currentStep === 10 && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Globe size={16} className="text-blue-500"/> Passo 10: Publicação</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-slate-50 p-8 rounded-[3rem] space-y-6">
                          <div className="space-y-2">
                             <label className="admin-label">Estado do Imóvel</label>
                             <select className="admin-input-v3" value={editingImovel.publicacao?.estado} onChange={e => setEditingImovel({...editingImovel, publicacao: {...editingImovel.publicacao!, estado: e.target.value as any}})}>
                                <option value="rascunho">Rascunho</option>
                                <option value="publicado">Publicado</option>
                                <option value="reservado">Reservado</option>
                                <option value="vendido">Vendido</option>
                                <option value="arrendado">Arrendado</option>
                             </select>
                          </div>
                          <div className="space-y-4">
                             <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-6 h-6 rounded border-slate-200 text-blue-500" checked={editingImovel.publicacao?.destaque} onChange={e => setEditingImovel({...editingImovel, publicacao: {...editingImovel.publicacao!, destaque: e.target.checked}})} />
                                <span className="text-xs font-black uppercase text-[#1c2d51]">Destaque na Homepage</span>
                             </label>
                             <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-6 h-6 rounded border-slate-200 text-emerald-500" checked={editingImovel.publicacao?.publicar_no_site} onChange={e => setEditingImovel({...editingImovel, publicacao: {...editingImovel.publicacao!, publicar_no_site: e.target.checked}})} />
                                <span className="text-xs font-black uppercase text-[#1c2d51]">Publicar no site público</span>
                             </label>
                          </div>
                       </div>
                       <div className="bg-slate-50 p-8 rounded-[3rem] space-y-6">
                          <div className="space-y-2">
                             <label className="admin-label">Data de Publicação</label>
                             <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input type="date" className="admin-input-v3 pl-12" value={editingImovel.publicacao?.data_publicacao ? new Date(editingImovel.publicacao.data_publicacao).toISOString().split('T')[0] : ''} onChange={e => setEditingImovel({...editingImovel, publicacao: {...editingImovel.publicacao!, data_publicacao: new Date(e.target.value)}})} />
                             </div>
                          </div>
                          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                             <Info className="text-blue-500 shrink-0" size={20} />
                             <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase">Ao marcar como Publicado, o imóvel ficará visível para todos os visitantes do seu site.</p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            <div className="p-8 border-t bg-slate-50/50 flex justify-between items-center shrink-0">
               <div className="flex gap-3">
                  <button onClick={prevStep} disabled={currentStep === 1} className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-[#1c2d51] disabled:opacity-30">
                     <ChevronLeft size={18} className="inline mr-1"/> Anterior
                  </button>
               </div>
               <div className="flex gap-4">
                  {currentStep < 10 ? (
                    <button onClick={nextStep} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl hover:-translate-y-1 transition-all">
                       Seguinte <ChevronRight size={18}/>
                    </button>
                  ) : (
                    <button onClick={handleSave} disabled={isSaving} className="bg-emerald-500 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:scale-105 transition-all">
                       {isSaving ? <Loader2 className="animate-spin" /> : <><Check size={20}/> Guardar e Concluir</>}
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-label { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; margin-left: 0.5rem; margin-bottom: 0.5rem; letter-spacing: 0.15em; }
        .admin-input-v3 { width: 100%; padding: 1.15rem 1.4rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.9rem; }
        .admin-input-v3:focus { background: #fff; border-color: #357fb2; box-shadow: 0 4px 20px -5px rgba(53, 127, 178, 0.1); }
      `}</style>
    </div>
  );
};

export default AdminImoveis;
