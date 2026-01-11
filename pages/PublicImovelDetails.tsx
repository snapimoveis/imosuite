
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel, ImovelMedia } from '../types';
import { LeadService } from '../services/leadService';
import { PropertyService } from '../services/propertyService';
import { 
  MapPin, Bed, Bath, Square, Loader2, ChevronLeft, 
  Send, Check, Menu, X, MessageCircle, Instagram, Facebook, Linkedin, Building2, Info, Camera
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import SEO from '../components/SEO';
import { DEFAULT_TENANT, DEFAULT_TENANT_CMS } from '../constants';
import { MOCK_IMOVEIS } from '../mocks';

const PublicImovelDetails: React.FC = () => {
  const { slug: agencySlug, imovelSlug } = useParams<{ slug: string; imovelSlug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [media, setMedia] = useState<ImovelMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!agencySlug || !imovelSlug) return;
      setLoading(true);

      if (agencySlug === 'demo-imosuite') {
        const found = MOCK_IMOVEIS.find(m => m.slug === imovelSlug);
        if (found) {
          setTenant(DEFAULT_TENANT);
          setImovel(found);
          setMedia(found.media.items || []);
        }
        setLoading(false);
        return;
      }

      try {
        const tQuery = query(collection(db, "tenants"), where("slug", "==", agencySlug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          document.documentElement.style.setProperty('--primary', tData.cor_primaria);

          const iQuery = query(collection(db, "tenants", tData.id, "properties"), where("slug", "==", imovelSlug), limit(1));
          const iSnap = await getDocs(iQuery);
          
          if (!iSnap.empty) {
            const data = { id: iSnap.docs[0].id, ...(iSnap.docs[0].data() as any) } as Imovel;
            setImovel(data);
            
            // BUSCA OBRIGATÓRIA DE TODAS AS FOTOS NA SUBCOLEÇÃO "media"
            const propertyMedia = await PropertyService.getPropertyMedia(tData.id, data.id);
            setMedia(propertyMedia);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agencySlug, imovelSlug]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !imovel || !gdprConsent) return;
    setIsSending(true);
    try {
      await LeadService.createLead(tenant.id, { 
        ...formData, 
        property_id: imovel.id, 
        property_ref: imovel.ref, 
        tipo: 'contacto', 
        gdpr_consent: gdprConsent,
        mensagem: formData.mensagem || `Olá, gostaria de obter mais informações sobre o imóvel "${imovel.titulo}" (Ref: ${imovel.ref}).`
      });
      setSent(true);
    } catch (err) {
      alert("Erro ao enviar pedido.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[var(--primary)]" size={48} /></div>;
  if (!imovel || !tenant) return <div className="h-screen flex items-center justify-center font-black text-slate-300 uppercase">Imóvel não encontrado</div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  
  // Lista de imagens final: Prioriza as fotos da subcoleção, fallback para cover_url
  const displayImages = media.length > 0 
    ? media 
    : (imovel.media as any)?.cover_url 
      ? [{ url: (imovel.media as any).cover_url, id: 'cover' }] 
      : [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', id: 'placeholder' }];

  return (
    <div className="min-h-screen flex flex-col bg-white font-brand selection:bg-[var(--primary)] selection:text-white">
      <SEO title={`${imovel.titulo} - ${tenant.nome}`} overrideFullTitle={true} />
      
      <nav className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-50">
         <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" alt={tenant.nome} /> : <span className="font-black text-xl uppercase tracking-tighter text-[var(--primary)]">{tenant.nome}</span>}
         </Link>
         <div className="hidden md:flex gap-10">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={m.path.startsWith('http') ? m.path : `/agencia/${tenant.slug}${m.path === '/' ? '' : '/p/' + m.path.replace('/', '')}`} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[var(--primary)] transition-colors">{m.label}</Link>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <button className="bg-[var(--primary)] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hidden sm:block">Contactar</button>
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-slate-400 p-2"><Menu/></button>
         </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full animate-in fade-in duration-700">
        <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10 hover:text-[var(--primary)] transition-all">
          <ChevronLeft size={16}/> Voltar à Listagem
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Coluna Galeria */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative aspect-[16/9] rounded-[3.5rem] overflow-hidden bg-slate-100 shadow-2xl group">
               <img src={displayImages[activeImage]?.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={imovel.titulo} />
               <div className="absolute top-8 left-8">
                  <span className="bg-white/90 backdrop-blur px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1c2d51] shadow-lg">
                    {imovel.operacao}
                  </span>
               </div>
               {displayImages.length > 1 && (
                 <div className="absolute bottom-8 right-8 bg-black/40 backdrop-blur text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2">
                    <Camera size={14}/> {activeImage + 1} / {displayImages.length}
                 </div>
               )}
            </div>
            
            {/* Miniaturas */}
            {displayImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {displayImages.map((img, idx) => (
                  <button 
                    key={img.id} 
                    onClick={() => setActiveImage(idx)} 
                    className={`w-32 aspect-video rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all duration-300 ${activeImage === idx ? 'border-[var(--primary)] scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                     <img src={img.url} className="w-full h-full object-cover" alt={`Miniatura ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-10 pt-6">
               <div>
                 <h1 className="text-4xl md:text-6xl font-black text-[#1c2d51] tracking-tighter leading-tight mb-4">{imovel.titulo}</h1>
                 <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <MapPin size={18} className="text-blue-500" /> {imovel.localizacao.concelho}, {imovel.localizacao.distrito}
                 </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpecBox icon={<Bed size={22}/>} label="Quartos" val={imovel.divisoes.quartos || 'N/A'} />
                  <SpecBox icon={<Bath size={22}/>} label="Banheiros" val={imovel.divisoes.casas_banho || 'N/A'} />
                  <SpecBox icon={<Square size={22}/>} label="Área Útil" val={imovel.areas.area_util_m2 ? `${imovel.areas.area_util_m2}m²` : 'Sob Consulta'} />
                  <SpecBox icon={<Building2 size={22}/>} label="Tipologia" val={imovel.tipologia} />
               </div>

               <div className="bg-slate-50/50 p-10 md:p-14 rounded-[4rem] border border-slate-100">
                  <h3 className="text-2xl font-black text-[#1c2d51] uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <Info size={28} className="text-blue-500" /> Descrição Completa
                  </h3>
                  <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-line text-lg">
                    {imovel.descricao.completa_md || imovel.descricao.curta || "Sem descrição disponível."}
                  </div>
               </div>
            </div>
          </div>

          {/* Coluna Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              <div className="bg-[#1c2d51] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-4">Valor de Mercado</p>
                 <h2 className="text-5xl font-black tracking-tighter leading-none">
                  {formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro.preco_venda : imovel.financeiro.preco_arrendamento) || 0)}
                 </h2>
                 {imovel.operacao === 'arrendamento' && <span className="text-sm font-bold text-blue-200 mt-2 block">/ mês</span>}
              </div>

              <div className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8">
                 <h3 className="font-black text-[#1c2d51] text-2xl tracking-tighter uppercase">Pedir Informações</h3>
                 
                 {sent ? (
                   <div className="py-12 text-center space-y-4 animate-in zoom-in-90">
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><Check size={40} strokeWidth={3} /></div>
                      <h3 className="text-xl font-black text-[#1c2d51] tracking-tight">Mensagem Enviada!</h3>
                      <button onClick={() => setSent(false)} className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 transition-colors">Enviar novo pedido</button>
                   </div>
                 ) : (
                   <form onSubmit={handleContact} className="space-y-4">
                      <input required placeholder="O seu nome" className="detail-input-v2" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                      <input required type="email" placeholder="O seu email" className="detail-input-v2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      <textarea 
                        required 
                        rows={5} 
                        placeholder="Mensagem" 
                        className="detail-input-v2 resize-none" 
                        value={formData.mensagem || `Olá, gostaria de obter mais informações sobre o imóvel "${imovel.titulo}" (Ref: ${imovel.ref}).`} 
                        onChange={e => setFormData({...formData, mensagem: e.target.value})} 
                      />
                      
                      <label className="flex items-start gap-4 cursor-pointer pt-4 group">
                         <input type="checkbox" required checked={gdprConsent} onChange={e => setGdprConsent(e.target.checked)} className="mt-1 w-5 h-5 rounded-lg border-slate-200 text-[#1c2d51] focus:ring-[#1c2d51]" />
                         <span className="text-[10px] font-medium text-slate-400 leading-relaxed group-hover:text-slate-600 transition-colors">
                           Aceito o tratamento dos meus dados para fins de contacto comercial conforme a <Link to="/privacidade" className="text-blue-500 underline">Política de Privacidade</Link>.
                         </span>
                      </label>

                      <button type="submit" disabled={isSending} className="w-full bg-[#1c2d51] text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 disabled:opacity-50">
                         {isSending ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>} Enviar Pedido
                      </button>
                   </form>
                 )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <style>{`
        .detail-input-v2 { width: 100%; padding: 1.25rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.875rem; }
        .detail-input-v2:focus { background: #fff; border-color: var(--primary); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-10 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-top duration-500">
           <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white p-4 hover:rotate-90 transition-transform"><X size={40}/></button>
           {cms.menus.main.map(m => (
             <Link key={m.id} to={`/agencia/${tenant.slug}${m.path}`} onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-white uppercase tracking-tighter hover:text-blue-400 transition-colors">{m.label}</Link>
           ))}
        </div>
      )}
    </div>
  );
};

const SpecBox = ({ icon, label, val }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
    <div className="text-blue-500 mb-4">{icon}</div>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className="text-base font-black text-[#1c2d51]">{val}</p>
  </div>
);

export default PublicImovelDetails;
