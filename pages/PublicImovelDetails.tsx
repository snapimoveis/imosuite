import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel, ImovelMedia } from '../types';
import { LeadService } from '../services/leadService';
import { PropertyService } from '../services/propertyService';
import { 
  MapPin, Bed, Bath, Square, Loader2, ChevronLeft, ChevronRight,
  Send, Check, Menu, X, Building2, Info, Camera,
  Mail, Phone, Maximize2, ArrowUpRight
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import SEO from '../components/SEO';
import ContactSection from '../components/ContactSection';
import { DEFAULT_TENANT, DEFAULT_TENANT_CMS } from '../constants';
import { MOCK_IMOVEIS } from '../mocks';

const COMPLAINTS_BOOK_BASE64 = "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";

const SpecBox = ({ icon, label, val, tid }: any) => (
  <div className={`p-6 md:p-8 border shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md ${tid === 'prestige' ? 'bg-neutral-900 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'} ${tid === 'luxe' ? 'rounded-[1.5rem] md:rounded-[2.5rem]' : tid === 'canvas' ? 'rounded-[1.5rem] md:rounded-[2rem]' : 'rounded-none'}`}>
    <div className="text-blue-500 mb-2 md:mb-4">{icon}</div>
    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className={`text-sm md:text-base font-black ${tid === 'prestige' ? 'italic' : ''}`}>{val}</p>
  </div>
);

const PublicImovelDetails: React.FC = () => {
  const { slug: agencySlug, imovelSlug } = useParams<{ slug: string; imovelSlug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [media, setMedia] = useState<ImovelMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!agencySlug || !imovelSlug) return;
      setLoading(true);
      setActiveImage(0);

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
          document.documentElement.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);

          const iQuery = query(collection(db, "tenants", tData.id, "properties"), where("slug", "==", imovelSlug), limit(1));
          const iSnap = await getDocs(iQuery);
          
          if (!iSnap.empty) {
            const data = { id: iSnap.docs[0].id, ...(iSnap.docs[0].data() as any) } as Imovel;
            setImovel(data);
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

  const displayImages = useMemo(() => {
    if (media.length > 0) return media;
    if (imovel?.media?.cover_url) return [{ url: imovel.media.cover_url, id: 'cover' }];
    return [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', id: 'placeholder' }];
  }, [media, imovel?.media?.cover_url]);

  const nextPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (displayImages.length <= 1) return;
    setActiveImage(prev => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (displayImages.length <= 1) return;
    setActiveImage(prev => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !imovel) return;
    setIsSending(true);
    try {
      await LeadService.createLead(tenant.id, { 
        ...formData, 
        property_id: imovel.id, 
        property_ref: imovel.ref, 
        tipo: 'contacto', 
        gdpr_consent: true,
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
  const tid = tenant.template_id || 'heritage';

  const styles: Record<string, any> = {
    heritage: { wrapper: "font-brand bg-white", nav: "h-20 md:h-28 px-6 md:px-8 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-slate-100", navText: "font-heritage italic text-[#1c2d51]", button: "bg-[var(--primary)] text-white px-8 py-4 font-black uppercase text-xs", heading: "font-heritage italic text-[#1c2d51]", footer: "py-20 md:py-24 px-6 md:px-10 bg-[var(--primary)] text-white", footerText: "text-white font-heritage italic" },
    canvas: { wrapper: "font-brand bg-white", nav: "h-20 md:h-32 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50", navText: "font-black tracking-tight text-[#1c2d51]", button: "bg-[var(--primary)] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg", heading: "font-black text-[#1c2d51] tracking-tight", footer: "py-20 md:py-24 px-6 md:px-12 bg-[var(--primary)] text-white", footerText: "text-white font-black" },
    prestige: { wrapper: "font-brand bg-black text-white", nav: "h-20 md:h-28 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 bg-black text-white border-b border-white/5 uppercase tracking-widest", navText: "font-black italic", button: "bg-white text-black px-10 py-4 font-black uppercase text-[10px]", heading: "font-black italic uppercase text-white", footer: "py-20 md:py-24 px-6 md:px-10 bg-[var(--primary)] text-white border-t border-white/5", footerText: "text-white font-black italic" },
    skyline: { wrapper: "font-brand bg-white", nav: "h-20 md:h-28 px-6 md:px-8 flex items-center justify-between sticky top-0 z-50 bg-[var(--primary)] text-white", navText: "font-black uppercase", button: "bg-white text-[var(--primary)] px-8 py-3 rounded-xl font-black uppercase text-xs shadow-xl", heading: "font-black uppercase text-[#1c2d51]", footer: "py-20 md:py-24 px-6 md:px-10 bg-[var(--primary)] text-white", footerText: "text-white font-black uppercase" },
    luxe: { wrapper: "font-brand bg-[#FDFBF7] text-[#2D2926]", nav: "h-24 md:h-32 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm", navText: "font-black text-[#2D2926]", button: "bg-[#2D2926] text-white px-10 py-5 rounded-[2.5rem] font-bold text-xs uppercase shadow-2xl", heading: "font-black text-[#2D2926] tracking-widest", footer: "py-20 md:py-24 px-6 md:px-12 bg-[var(--primary)] text-white", footerText: "text-white font-black tracking-widest" }
  };

  const s = styles[tid] || styles.heritage;

  return (
    <div className={`${s.wrapper} min-h-screen flex flex-col selection:bg-[var(--primary)] selection:text-white overflow-x-hidden`}>
      <SEO title={`${imovel.titulo} - ${tenant.nome}`} overrideFullTitle={true} />
      
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`}>
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-12 md:h-20 w-auto object-contain" alt={tenant.nome} /> : <span className={`text-xl md:text-2xl ${s.navText}`}>{tenant.nome}</span>}
         </Link>
         
         <div className="hidden lg:flex gap-10">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={m.path.startsWith('http') ? m.path : `/agencia/${tenant.slug}${m.path === '/' ? '' : '/p/' + m.path.replace('/', '')}`} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${tid === 'prestige' ? 'text-white' : 'text-slate-400 hover:text-[var(--primary)]'}`}>{m.label}</Link>
            ))}
         </div>

         <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-slate-400">
            <Menu size={24} />
         </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white p-8 flex flex-col animate-in slide-in-from-top duration-300">
           <div className="flex justify-between items-center mb-12">
              {tenant.logo_url ? <img src={tenant.logo_url} className="h-12 w-auto" alt="Logo" /> : <span className="font-black text-[#1c2d51]">{tenant.nome}</span>}
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-[#1c2d51]"><X size={28}/></button>
           </div>
           <div className="flex flex-col gap-6">
              {cms.menus.main.map(m => (
                <Link key={m.id} to={m.path.startsWith('http') ? m.path : `/agencia/${tenant.slug}${m.path === '/' ? '' : '/p/' + m.path.replace('/', '')}`} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-[#1c2d51] tracking-tighter uppercase">{m.label}</Link>
              ))}
           </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 md:py-12 w-full animate-in fade-in duration-700">
        <Link to={`/agencia/${tenant.slug}`} className={`inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-6 md:mb-10 transition-all ${tid === 'prestige' ? 'text-white opacity-40 hover:opacity-100' : 'text-slate-400 hover:text-[var(--primary)]'}`}>
          <ChevronLeft size={14}/> Voltar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className={`relative aspect-[16/9] overflow-hidden shadow-2xl group ${tid === 'luxe' ? 'rounded-[2rem] md:rounded-[4rem]' : tid === 'canvas' ? 'rounded-[1.5rem] md:rounded-[3rem]' : 'rounded-none'}`}>
               <img 
                 src={displayImages[activeImage]?.url} 
                 className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${tid === 'prestige' ? 'grayscale contrast-125' : ''}`} 
                 alt={imovel.titulo} 
               />
               
               {displayImages.length > 1 && (
                 <>
                   <button onClick={(e) => prevPhoto(e)} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md hover:bg-white text-white hover:text-[#1c2d51] p-3 md:p-4 rounded-full transition-all z-10"><ChevronLeft size={20} className="md:w-7 md:h-7" /></button>
                   <button onClick={(e) => nextPhoto(e)} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md hover:bg-white text-white hover:text-[#1c2d51] p-3 md:p-4 rounded-full transition-all z-10"><ChevronRight size={20} className="md:w-7 md:h-7" /></button>
                 </>
               )}

               <div className="absolute top-4 md:top-8 left-4 md:left-8 flex gap-2">
                  <span className="bg-white/90 backdrop-blur px-3 py-1.5 md:px-5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#1c2d51] shadow-lg">{imovel.operacao}</span>
               </div>

               <button 
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute top-4 md:top-8 right-4 md:right-8 bg-black/40 backdrop-blur-md text-white p-2 md:p-3 rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-[#1c2d51]"
               >
                  <Maximize2 size={16} className="md:w-5 md:h-5" />
               </button>
            </div>
            
            {displayImages.length > 1 && (
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {displayImages.map((img, idx) => (
                  <button 
                    key={img.id || idx} 
                    onClick={() => setActiveImage(idx)} 
                    className={`w-20 md:w-32 aspect-video overflow-hidden flex-shrink-0 border-2 md:border-4 transition-all duration-300 ${activeImage === idx ? 'border-[var(--primary)] scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'} ${tid === 'luxe' ? 'rounded-xl' : 'rounded-none'}`}
                  >
                    <img src={img.url} className={`w-full h-full object-cover ${tid === 'prestige' ? 'grayscale' : ''}`} alt={`Miniatura ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-8 md:space-y-10 pt-4 md:pt-6">
               <div>
                 <h1 className={`text-3xl md:text-6xl mb-3 md:mb-4 ${s.heading} leading-tight`}>{imovel.titulo}</h1>
                 <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                    <MapPin size={16} className="text-blue-500" /> {imovel.localizacao.concelho.toUpperCase()}, {imovel.localizacao.distrito.toUpperCase()}
                 </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpecBox icon={<Bed size={20}/>} label="Quartos" val={imovel.divisoes.quartos || 'N/A'} tid={tid} />
                  <SpecBox icon={<Bath size={20}/>} label="Banhos" val={imovel.divisoes.casas_banho || 'N/A'} tid={tid} />
                  <SpecBox icon={<Square size={20}/>} label="Área Útil" val={imovel.areas.area_util_m2 ? `${imovel.areas.area_util_m2}m²` : 'Sob Consulta'} tid={tid} />
                  <SpecBox icon={<Building2 size={20}/>} label="Tipologia" val={imovel.tipologia} tid={tid} />
               </div>

               <div className={`p-8 md:p-14 border ${tid === 'prestige' ? 'bg-neutral-900 border-white/5' : 'bg-slate-50/50 border-slate-100'} ${tid === 'luxe' ? 'rounded-[2rem] md:rounded-[4rem]' : tid === 'canvas' ? 'rounded-[1.5rem] md:rounded-[3rem]' : 'rounded-none'}`}>
                  <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tighter mb-6 md:mb-8 flex items-center gap-3 ${tid === 'prestige' ? 'italic' : ''}`}><Info size={24} className="text-blue-500" /> Descrição</h3>
                  <div className={`prose prose-slate max-w-none font-medium leading-relaxed whitespace-pre-line text-base md:text-lg ${tid === 'prestige' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {imovel.descricao.completa_md || imovel.descricao.curta || "Sem descrição disponível."}
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              <div className={`p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group ${tid === 'prestige' ? 'bg-neutral-900 border border-white/5' : tid === 'skyline' ? 'bg-[var(--primary)]' : 'bg-[#1c2d51]'} ${tid === 'luxe' ? 'rounded-[2rem] md:rounded-[3rem]' : tid === 'canvas' ? 'rounded-[1.5rem] md:rounded-[3rem]' : 'rounded-none'}`}>
                 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-300 mb-3 md:mb-4">Valor de Mercado</p>
                 <h2 className={`text-4xl md:text-5xl font-black tracking-tighter leading-none ${tid === 'prestige' ? 'italic' : ''}`}>
                  {formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro.preco_venda : imovel.financeiro.preco_arrendamento) || 0)}
                 </h2>
                 {imovel.operacao === 'arrendamento' && <span className="text-xs md:text-sm font-bold text-blue-200 mt-2 block">/ mês</span>}
              </div>

              <div className={`p-8 md:p-12 border shadow-xl space-y-6 md:space-y-8 ${tid === 'prestige' ? 'bg-neutral-950 border-white/5 text-white' : 'bg-white border-slate-100'} ${tid === 'luxe' ? 'rounded-[2rem] md:rounded-[3rem]' : tid === 'canvas' ? 'rounded-[1.5rem] md:rounded-[3rem]' : 'rounded-none'}`}>
                 <h3 className={`text-xl md:text-2xl tracking-tighter uppercase ${s.heading}`}>Pedir Informações</h3>
                 
                 {sent ? (
                   <div className="py-8 md:py-12 text-center space-y-4 animate-in zoom-in-90">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-500 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-inner"><Check size={32} md:size={40} strokeWidth={3} /></div>
                      <h3 className={`text-lg md:text-xl font-black tracking-tight ${tid === 'prestige' ? 'text-white' : 'text-[#1c2d51]'}`}>Mensagem Enviada!</h3>
                   </div>
                 ) : (
                   <form onSubmit={handleContact} className="space-y-4">
                      <input required placeholder="O seu nome" className={`detail-input-v2 ${tid === 'prestige' ? 'bg-white/5 text-white border-white/10' : ''}`} value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                      <input required type="email" placeholder="O seu email" className={`detail-input-v2 ${tid === 'prestige' ? 'bg-white/5 text-white border-white/10' : ''}`} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      <textarea required rows={4} placeholder="Mensagem" className={`detail-input-v2 resize-none ${tid === 'prestige' ? 'bg-white/5 text-white border-white/10' : ''}`} value={formData.mensagem || `Olá, gostaria de obter mais informações sobre o imóvel "${imovel.titulo}" (Ref: ${imovel.ref}).`} onChange={e => setFormData({...formData, mensagem: e.target.value})} />
                      
                      <button type="submit" disabled={isSending} className="w-full bg-[#1c2d51] text-white py-4 md:py-6 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 disabled:opacity-50">
                         {isSending ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>} Enviar Pedido
                      </button>
                   </form>
                 )}

                 <div className={`pt-6 md:pt-8 border-t space-y-4 ${tid === 'prestige' ? 'border-white/5' : 'border-slate-50'}`}>
                    <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Contactos da Agência</p>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 text-xs font-bold opacity-80">
                          <Phone size={14} className="text-blue-500" /> {tenant.telefone || 'Contactar via Email'}
                       </div>
                       <div className="flex items-center gap-3 text-xs font-bold opacity-80">
                          <Mail size={14} className="text-blue-500" /> {tenant.professional_email || tenant.email}
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={s.footer}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
            <div className="space-y-6 text-center md:text-left">
               <h4 className={`text-lg md:text-xl font-black uppercase tracking-tighter ${s.footerText}`}>{tenant.nome}</h4>
               <p className="text-xs md:text-sm font-medium leading-relaxed opacity-70">{tenant.slogan}</p>
            </div>
            <div className="space-y-6 text-center md:text-right md:col-span-2">
               <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 block pt-10">
                 © {new Date().getFullYear()} {tenant.nome}
               </span>
            </div>
         </div>
      </footer>
      
      <style>{`
        .detail-input-v2 { width: 100%; padding: 1.15rem 1.4rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.875rem; }
        .detail-input-v2:focus { background: #fff; border-color: var(--primary); }
      `}</style>
    </div>
  );
};

export default PublicImovelDetails;