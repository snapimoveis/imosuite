
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel, ImovelMedia } from '../types';
import { LeadService } from '../services/leadService';
import { PropertyService } from '../services/propertyService';
import { 
  MapPin, Bed, Bath, Square, Loader2, ChevronLeft, ChevronRight,
  Send, Check, Menu, X, MessageCircle, Instagram, Facebook, Linkedin, Building2, Info, Camera,
  Mail, Phone
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import SEO from '../components/SEO';
import { DEFAULT_TENANT, DEFAULT_TENANT_CMS } from '../constants';
import { MOCK_IMOVEIS } from '../mocks';

// Definido fora para evitar erro de inicialização 'U'
const SpecBox = ({ icon, label, val, tid }: any) => (
  <div className={`p-8 border shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md ${tid === 'prestige' ? 'bg-neutral-900 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'} ${tid === 'luxe' ? 'rounded-[2.5rem]' : tid === 'canvas' ? 'rounded-[2rem]' : 'rounded-none'}`}>
    <div className="text-blue-500 mb-4">{icon}</div>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className={`text-base font-black ${tid === 'prestige' ? 'italic' : ''}`}>{val}</p>
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

  const displayImages = media.length > 0 
    ? media 
    : (imovel?.media as any)?.cover_url 
      ? [{ url: (imovel?.media as any).cover_url, id: 'cover' }] 
      : [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', id: 'placeholder' }];

  const nextPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (displayImages.length === 0) return;
    setActiveImage(prev => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (displayImages.length === 0) return;
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
    heritage: {
      wrapper: "font-brand bg-white",
      nav: "h-20 px-8 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-slate-100",
      navText: "font-heritage italic text-[#1c2d51]",
      button: "bg-[var(--primary)] text-white px-8 py-4 rounded-none font-black uppercase text-xs",
      heading: "font-heritage italic text-[#1c2d51]",
      footer: "py-24 px-10 border-t border-slate-100 bg-slate-50",
      footerText: "text-[#1c2d51] font-heritage italic"
    },
    canvas: {
      wrapper: "font-brand bg-white",
      nav: "h-24 px-12 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50",
      navText: "font-black tracking-tight text-[#1c2d51]",
      button: "bg-[var(--primary)] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg",
      heading: "font-black text-[#1c2d51] tracking-tight",
      footer: "py-24 px-12 border-t border-slate-50 bg-white",
      footerText: "text-[#1c2d51] font-black"
    },
    prestige: {
      wrapper: "font-brand bg-black text-white",
      nav: "h-20 px-10 flex items-center justify-between sticky top-0 z-50 bg-black text-white border-b border-white/5 uppercase tracking-widest",
      navText: "font-black italic",
      button: "bg-white text-black px-10 py-4 rounded-none font-black uppercase text-[10px]",
      heading: "font-black italic uppercase text-white",
      footer: "py-24 px-10 border-t border-white/5 bg-black text-white",
      footerText: "text-white font-black italic"
    },
    skyline: {
      wrapper: "font-brand bg-white",
      nav: "h-20 px-8 flex items-center justify-between sticky top-0 z-50 bg-[var(--primary)] text-white",
      navText: "font-black uppercase",
      button: "bg-[var(--primary)] text-white px-8 py-4 rounded-xl font-black uppercase text-xs shadow-xl",
      heading: "font-black uppercase text-[#1c2d51]",
      footer: "py-24 px-10 bg-slate-900 text-white",
      footerText: "text-white font-black uppercase"
    },
    luxe: {
      wrapper: "font-brand bg-[#FDFBF7] text-[#2D2926]",
      nav: "h-24 px-12 flex items-center justify-between sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm",
      navText: "font-black text-[#2D2926]",
      button: "bg-[#2D2926] text-white px-10 py-5 rounded-[2.5rem] font-bold text-xs uppercase shadow-2xl",
      heading: "font-black text-[#2D2926] tracking-widest",
      footer: "py-24 px-12 border-t border-[#EAE3D9] bg-[#FDFBF7] text-[#2D2926]",
      footerText: "text-[#2D2926] font-black tracking-widest"
    }
  };

  const s = styles[tid] || styles.heritage;
  const isBusiness = tenant.subscription?.plan_id === 'business';

  return (
    <div className={`${s.wrapper} min-h-screen flex flex-col selection:bg-[var(--primary)] selection:text-white`}>
      <SEO title={`${imovel.titulo} - ${tenant.nome}`} overrideFullTitle={true} />
      
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" alt={tenant.nome} /> : <span className={`text-2xl ${s.navText}`}>{tenant.nome}</span>}
         </Link>
         <div className="hidden md:flex gap-10">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={m.path.startsWith('http') ? m.path : `/agencia/${tenant.slug}${m.path === '/' ? '' : '/p/' + m.path.replace('/', '')}`} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${tid === 'prestige' ? 'text-white' : 'text-slate-400 hover:text-[var(--primary)]'}`}>{m.label}</Link>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <button className={s.button}>Contactar</button>
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-slate-400 p-2"><Menu/></button>
         </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full animate-in fade-in duration-700">
        <Link to={`/agencia/${tenant.slug}`} className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-10 transition-all ${tid === 'prestige' ? 'text-white opacity-40 hover:opacity-100' : 'text-slate-400 hover:text-[var(--primary)]'}`}>
          <ChevronLeft size={16}/> Voltar à Listagem
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div onClick={() => setIsLightboxOpen(true)} className={`relative aspect-[16/9] overflow-hidden shadow-2xl group cursor-zoom-in ${tid === 'luxe' ? 'rounded-[4rem]' : tid === 'canvas' ? 'rounded-[3rem]' : 'rounded-none'}`}>
               <img src={displayImages[activeImage]?.url} className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${tid === 'prestige' ? 'grayscale contrast-125' : ''}`} alt={imovel.titulo} />
               
               {displayImages.length > 1 && (
                 <>
                   <button onClick={(e) => prevPhoto(e)} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/90 hover:text-[#1c2d51] text-white p-4 rounded-full group-hover:opacity-100 transition-all z-10"><ChevronLeft size={28} /></button>
                   <button onClick={(e) => nextPhoto(e)} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/90 hover:text-[#1c2d51] text-white p-4 rounded-full group-hover:opacity-100 transition-all z-10"><ChevronRight size={28} /></button>
                 </>
               )}

               <div className="absolute top-8 left-8">
                  <span className="bg-white/90 backdrop-blur px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1c2d51] shadow-lg">{imovel.operacao}</span>
               </div>
               
               {displayImages.length > 1 && (
                 <div className="absolute bottom-8 right-8 bg-black/40 backdrop-blur text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2"><Camera size={14}/> {activeImage + 1} / {displayImages.length}</div>
               )}
            </div>
            
            {displayImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {displayImages.map((img, idx) => (
                  <button key={img.id} onClick={() => setActiveImage(idx)} className={`w-32 aspect-video overflow-hidden flex-shrink-0 border-4 transition-all duration-300 ${activeImage === idx ? 'border-[var(--primary)] scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'} ${tid === 'luxe' ? 'rounded-2xl' : 'rounded-none'}`}><img src={img.url} className={`w-full h-full object-cover ${tid === 'prestige' ? 'grayscale' : ''}`} alt={`Miniatura ${idx + 1}`} /></button>
                ))}
              </div>
            )}

            <div className="space-y-10 pt-6">
               <div>
                 <h1 className={`text-4xl md:text-6xl mb-4 ${s.heading}`}>{imovel.titulo}</h1>
                 <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <MapPin size={18} className="text-blue-500" /> {imovel.localizacao.concelho.toUpperCase()}, {imovel.localizacao.distrito.toUpperCase()}
                 </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpecBox icon={<Bed size={22}/>} label="Quartos" val={imovel.divisoes.quartos || 'N/A'} tid={tid} />
                  <SpecBox icon={<Bath size={22}/>} label="Banhos" val={imovel.divisoes.casas_banho || 'N/A'} tid={tid} />
                  <SpecBox icon={<Square size={22}/>} label="Área Útil" val={imovel.areas.area_util_m2 ? `${imovel.areas.area_util_m2}m²` : 'Sob Consulta'} tid={tid} />
                  <SpecBox icon={<Building2 size={22}/>} label="Tipologia" val={imovel.tipologia} tid={tid} />
               </div>

               <div className={`p-10 md:p-14 border ${tid === 'prestige' ? 'bg-neutral-900 border-white/5' : 'bg-slate-50/50 border-slate-100'} ${tid === 'luxe' ? 'rounded-[4rem]' : tid === 'canvas' ? 'rounded-[3rem]' : 'rounded-none'}`}>
                  <h3 className={`text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3 ${tid === 'prestige' ? 'italic' : ''}`}><Info size={28} className="text-blue-500" /> Descrição</h3>
                  <div className={`prose prose-slate max-w-none font-medium leading-relaxed whitespace-pre-line text-lg ${tid === 'prestige' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {imovel.descricao.completa_md || imovel.descricao.curta || "Sem descrição disponível."}
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              <div className={`p-12 text-white shadow-2xl relative overflow-hidden group ${tid === 'prestige' ? 'bg-neutral-900 border border-white/5' : tid === 'skyline' ? 'bg-[var(--primary)]' : 'bg-[#1c2d51]'} ${tid === 'luxe' ? 'rounded-[3rem]' : tid === 'canvas' ? 'rounded-[3rem]' : 'rounded-none'}`}>
                 <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-4">Valor de Mercado</p>
                 <h2 className={`text-5xl font-black tracking-tighter leading-none ${tid === 'prestige' ? 'italic' : ''}`}>
                  {formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro.preco_venda : imovel.financeiro.preco_arrendamento) || 0)}
                 </h2>
                 {imovel.operacao === 'arrendamento' && <span className="text-sm font-bold text-blue-200 mt-2 block">/ mês</span>}
              </div>

              <div className={`p-10 md:p-12 border shadow-xl space-y-8 ${tid === 'prestige' ? 'bg-neutral-950 border-white/5 text-white' : 'bg-white border-slate-100'} ${tid === 'luxe' ? 'rounded-[3rem]' : tid === 'canvas' ? 'rounded-[3rem]' : 'rounded-none'}`}>
                 <h3 className={`text-2xl tracking-tighter uppercase ${s.heading}`}>Pedir Informações</h3>
                 
                 {sent ? (
                   <div className="py-12 text-center space-y-4 animate-in zoom-in-90">
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><Check size={40} strokeWidth={3} /></div>
                      <h3 className={`text-xl font-black tracking-tight ${tid === 'prestige' ? 'text-white' : 'text-[#1c2d51]'}`}>Mensagem Enviada!</h3>
                   </div>
                 ) : (
                   <form onSubmit={handleContact} className="space-y-4">
                      <input required placeholder="O seu nome" className={`detail-input-v2 ${tid === 'prestige' ? 'bg-white/5 text-white border-white/10' : ''}`} value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                      <input required type="email" placeholder="O seu email" className={`detail-input-v2 ${tid === 'prestige' ? 'bg-white/5 text-white border-white/10' : ''}`} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      <textarea required rows={4} placeholder="Mensagem" className={`detail-input-v2 resize-none ${tid === 'prestige' ? 'bg-white/5 text-white border-white/10' : ''}`} value={formData.mensagem || `Olá, gostaria de obter mais informações sobre o imóvel "${imovel.titulo}" (Ref: ${imovel.ref}).`} onChange={e => setFormData({...formData, mensagem: e.target.value})} />
                      
                      <button type="submit" disabled={isSending} className={s.button + " w-full flex items-center justify-center gap-3 transition-all hover:-translate-y-1 disabled:opacity-50"}>
                         {isSending ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>} Enviar Pedido
                      </button>
                   </form>
                 )}

                 {/* Contactos da Agência Adicionados */}
                 <div className={`pt-8 border-t space-y-4 ${tid === 'prestige' ? 'border-white/5' : 'border-slate-50'}`}>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contactos da Agência</p>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 text-xs font-bold opacity-80">
                          <Phone size={14} className="text-blue-500" /> {tenant.telefone || 'Contactar via Email'}
                       </div>
                       <div className="flex items-center gap-3 text-xs font-bold opacity-80">
                          <Mail size={14} className="text-blue-500" /> {tenant.email}
                       </div>
                       {tenant.morada && (
                         <div className="flex items-start gap-3 text-xs font-bold opacity-80">
                            <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" /> {tenant.morada}
                         </div>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER DINÂMICO ADICIONADO */}
      <footer className={s.footer}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6">
               <h4 className={`text-xl font-black uppercase tracking-tighter ${s.footerText}`}>{tenant.nome}</h4>
               <p className="text-sm font-medium leading-relaxed opacity-50">{tenant.slogan}</p>
               
               {cms.social?.complaints_book_link && (
                 <a href={cms.social.complaints_book_link} target="_blank" rel="noopener noreferrer" className="block w-fit mt-8 transition-opacity hover:opacity-80">
                   <img 
                     src={tid === 'prestige' || tid === 'skyline' ? "https://www.livroreclamacoes.pt/assets/img/logo_reclamacoes_white.png" : "https://www.livroreclamacoes.pt/assets/img/logo_reclamacoes.png"} 
                     alt="Livro de Reclamações Online" 
                     className="h-10 w-auto grayscale contrast-125"
                   />
                 </a>
               )}
            </div>
            <div className="space-y-6">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Navegação</p>
               <div className="flex flex-col gap-3">
                  {cms.menus.main.map(m => <Link key={m.id} to={m.path} className="text-sm font-bold opacity-60 hover:opacity-100 transition-all">{m.label}</Link>)}
               </div>
            </div>
            <div className="space-y-6 md:text-right">
               <div className="flex md:justify-end gap-6 mb-8">
                  {cms.social?.instagram && <a href={cms.social.instagram} className="opacity-60 hover:opacity-100"><Instagram size={20}/></a>}
                  {cms.social?.facebook && <a href={cms.social.facebook} className="opacity-60 hover:opacity-100"><Facebook size={20}/></a>}
                  {cms.social?.whatsapp && <a href={cms.social.whatsapp} className="opacity-60 hover:opacity-100"><MessageCircle size={20}/></a>}
               </div>
               <p className="text-xs font-bold opacity-40">{tenant.email}</p>
               <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20 block pt-10">
                 © {new Date().getFullYear()} {tenant.nome} • {isBusiness ? 'Real Estate' : 'Powered by ImoSuite'}
               </span>
            </div>
         </div>
      </footer>
      
      <style>{`
        .detail-input-v2 { width: 100%; padding: 1.15rem 1.4rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.875rem; }
        .detail-input-v2:focus { background: #fff; border-color: var(--primary); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PublicImovelDetails;
