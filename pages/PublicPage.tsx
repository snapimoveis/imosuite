import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, CMSPage, TeamMember } from '../types';
import { 
  Loader2, Building2, ChevronLeft, Menu, X, Facebook, Instagram, 
  Linkedin, MessageCircle, Target, Star, Eye, Mail, Phone, Camera,
  User, ArrowRight
} from 'lucide-react';
import SEO from '../components/SEO';
import { DEFAULT_TENANT_CMS, DEFAULT_TENANT } from '../constants';
import ContactSection from '../components/ContactSection';

const ComplaintsBookSVG = ({ variant = 'light' }: { variant?: 'light' | 'dark' }) => (
  <svg id="Camada_1" data-name="Camada 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 140 58" className={`h-12 w-auto ${variant === 'light' ? 'brightness-0 invert' : ''}`}>
    <image width="140" height="58" xlink:href="data:image/png;base64,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"/>
  </svg>
);

const PublicPage: React.FC = () => {
  const { slug, pageSlug } = useParams<{ slug: string; pageSlug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [page, setPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug || !pageSlug) return;
      try {
        let tData: Tenant | null = null;
        
        if (slug === 'demo-imosuite') {
          tData = DEFAULT_TENANT;
        } else {
          const tSnap = await getDocs(query(collection(db, "tenants"), where("slug", "==", slug), limit(1)));
          if (!tSnap.empty) {
            tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          }
        }

        if (tData) {
          setTenant(tData);
          const p = (tData.cms?.pages || DEFAULT_TENANT_CMS.pages).find(p => p.slug === pageSlug);
          if (p) setPage(p);
          document.documentElement.style.setProperty('--primary', tData.cor_primaria);
          document.documentElement.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug, pageSlug]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!tenant || !page) return <div className="h-screen flex flex-col items-center justify-center p-10 font-brand"><Building2 size={48} className="text-slate-100 mb-4"/><h2 className="text-xl font-black text-slate-800 tracking-tighter">Página não encontrada.</h2><Link to={`/agencia/${slug}`} className="text-blue-500 mt-4 font-bold underline">Voltar</Link></div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  const tid = tenant.template_id || 'heritage';

  const styles: Record<string, any> = {
    heritage: {
      wrapper: "font-brand bg-white",
      nav: "h-24 px-8 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-slate-100",
      navText: "font-heritage italic text-[#1c2d51]",
      button: "bg-[var(--primary)] text-white px-8 py-3 rounded-none font-bold uppercase tracking-widest",
      footer: "py-24 px-10 bg-[var(--primary)] text-white",
      heading: "font-heritage italic text-[#1c2d51]",
      card: "bg-white border border-slate-100 rounded-none shadow-sm",
      badge: "bg-slate-50 text-slate-400"
    },
    canvas: {
      wrapper: "font-brand bg-white",
      nav: "h-28 px-12 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50",
      navText: "font-black tracking-tight text-[#1c2d51]",
      button: "bg-[var(--primary)] text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs shadow-lg",
      footer: "py-24 px-12 bg-[var(--primary)] text-white",
      heading: "font-black text-[#1c2d51] tracking-tight",
      card: "bg-white border border-slate-50 rounded-[2rem] shadow-md",
      badge: "bg-blue-50 text-[#357fb2]"
    },
    prestige: {
      wrapper: "font-brand bg-black text-white",
      nav: "h-24 px-10 flex items-center justify-between sticky top-0 z-50 bg-black text-white border-b border-white/5 uppercase",
      navText: "font-black italic",
      button: "bg-white text-black px-10 py-3 rounded-none font-black uppercase text-[10px]",
      footer: "py-24 px-10 bg-[var(--primary)] text-white border-t border-white/5",
      heading: "font-black italic uppercase text-white",
      card: "bg-neutral-900 border border-white/5 rounded-none",
      badge: "bg-white/5 text-white/40"
    },
    skyline: {
      wrapper: "font-brand bg-white",
      nav: "h-24 px-8 flex items-center justify-between sticky top-0 z-50 bg-[var(--primary)] text-white",
      navText: "font-black uppercase",
      button: "bg-white text-[var(--primary)] px-8 py-3 rounded-xl font-black uppercase text-xs shadow-xl",
      footer: "py-24 px-10 bg-[var(--primary)] text-white",
      heading: "font-black uppercase text-[#1c2d51]",
      card: "bg-white border border-slate-100 rounded-3xl shadow-xl",
      badge: "bg-blue-50 text-blue-600"
    },
    luxe: {
      wrapper: "font-brand bg-[#FDFBF7]",
      nav: "h-28 px-12 flex items-center justify-between sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm",
      navText: "font-black text-[#2D2926]",
      button: "bg-[#2D2926] text-white px-10 py-4 rounded-[2rem] font-bold text-xs uppercase tracking-widest shadow-2xl",
      footer: "py-24 px-12 bg-[var(--primary)] text-white",
      heading: "font-black text-[#2D2926] tracking-widest",
      card: "bg-white border border-[#EAE3D9] rounded-[3.5rem] shadow-sm",
      badge: "bg-[#EAE3D9]/30 text-[#2D2926]"
    }
  };

  const s = styles[tid] || styles.heritage;

  return (
    <div className={`${s.wrapper} min-h-screen flex flex-col selection:bg-[var(--primary)] selection:text-white`}>
      <SEO title={`${page.title} - ${tenant.nome}`} overrideFullTitle={true} />
      
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-14 w-auto object-contain" alt={tenant.nome} /> : <span className={`text-2xl ${s.navText}`}>{tenant.nome}</span>}
         </Link>
         <div className="hidden md:flex gap-10">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={m.path === '/' ? `/agencia/${tenant.slug}` : `/agencia/${tenant.slug}/p/${m.path.replace('/', '')}`} className={`text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all ${tid === 'prestige' ? 'text-white' : 'text-slate-400'}`}>{m.label}</Link>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <button className={s.button}>Contactar</button>
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-slate-400 p-2"><Menu/></button>
         </div>
      </nav>

      <main className="flex-1 w-full animate-in fade-in duration-700">
         {/* CONTEÚDO PRINCIPAL E GALERIA */}
         <div className="max-w-7xl mx-auto px-6 py-20">
            <Link to={`/agencia/${tenant.slug}`} className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-12 opacity-40 hover:opacity-100 transition-all ${tid === 'prestige' ? 'text-white' : 'text-slate-400'}`}>
               <ChevronLeft size={16}/> Início
            </Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
               <div className="lg:col-span-7 space-y-12">
                  <h1 className={`text-5xl md:text-8xl leading-[0.9] ${s.heading}`}>{page.title}</h1>
                  <div className={`prose prose-slate max-w-none font-medium leading-relaxed whitespace-pre-line text-lg ${tid === 'prestige' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {page.content_md}
                  </div>
               </div>

               <div className="lg:col-span-5">
                  {page.galeria_fotos && page.galeria_fotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                       {page.galeria_fotos.map((img, i) => (
                         <div key={i} className={`overflow-hidden shadow-xl ${i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'} ${tid === 'luxe' ? 'rounded-[2.5rem]' : tid === 'canvas' ? 'rounded-[2rem]' : 'rounded-none'}`}>
                           <img src={img} className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${tid === 'prestige' ? 'grayscale' : ''}`} alt={`Galeria ${i}`} />
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* SECÇÃO MVV (MISSÃO, VISÃO, VALORES) */}
         {(page.missao || page.visao || (page.valores && page.valores.length > 0)) && (
           <div className={`py-24 ${tid === 'prestige' ? 'bg-neutral-900/50' : tid === 'luxe' ? 'bg-[#EAE3D9]/20' : 'bg-slate-50'}`}>
              <div className="max-w-7xl mx-auto px-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {page.missao && (
                      <div className="space-y-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.badge}`}><Target size={28}/></div>
                         <h3 className={`text-2xl font-black uppercase tracking-tight ${tid === 'prestige' ? 'italic' : ''}`}>Nossa Missão</h3>
                         <p className="text-sm font-medium leading-relaxed opacity-70">{page.missao}</p>
                      </div>
                    )}
                    {page.visao && (
                      <div className="space-y-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.badge}`}><Eye size={28}/></div>
                         <h3 className={`text-2xl font-black uppercase tracking-tight ${tid === 'prestige' ? 'italic' : ''}`}>Nossa Visão</h3>
                         <p className="text-sm font-medium leading-relaxed opacity-70">{page.visao}</p>
                      </div>
                    )}
                    {page.valores && page.valores.length > 0 && (
                      <div className="space-y-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.badge}`}><Star size={28}/></div>
                         <h3 className={`text-2xl font-black uppercase tracking-tight ${tid === 'prestige' ? 'italic' : ''}`}>Nossos Valores</h3>
                         <ul className="space-y-3">
                            {page.valores.map((v, i) => (
                              <li key={i} className="text-sm font-bold flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></div> {v}
                              </li>
                            ))}
                         </ul>
                      </div>
                    )}
                 </div>
              </div>
           </div>
         )}

         {/* SECÇÃO EQUIPA */}
         {page.equipa && page.equipa.length > 0 && (
           <div className="py-32 max-w-7xl mx-auto px-6">
              <div className="mb-16">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Capital Humano</p>
                 <h2 className={`text-4xl md:text-5xl font-black tracking-tighter uppercase ${tid === 'prestige' ? 'italic' : ''}`}>Conheça a nossa Equipa</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {page.equipa.map((member) => (
                   <div key={member.id} className={`${s.card} overflow-hidden group`}>
                      <div className={`aspect-[4/5] bg-slate-100 overflow-hidden relative`}>
                         {member.avatar_url ? (
                           <img src={member.avatar_url} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${tid === 'prestige' ? 'grayscale group-hover:grayscale-0' : ''}`} alt={member.name} />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-200"><User size={64}/></div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 space-y-3">
                            {member.email && <a href={`mailto:${member.email}`} className="bg-white/20 backdrop-blur-md p-3 rounded-xl text-white hover:bg-white hover:text-black transition-all flex items-center justify-center"><Mail size={18}/></a>}
                            {member.phone && <a href={`tel:${member.phone}`} className="bg-white/20 backdrop-blur-md p-3 rounded-xl text-white hover:bg-white hover:text-black transition-all flex items-center justify-center"><Phone size={18}/></a>}
                         </div>
                      </div>
                      <div className="p-8">
                         <h4 className={`text-xl font-black ${tid === 'prestige' ? 'italic' : ''}`}>{member.name}</h4>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{member.role}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
         )}

         {/* ÁREA DE CONTACTO COM COR SECUNDÁRIA */}
         <div className="bg-[var(--secondary)] text-white">
           <ContactSection tenantId={tenant.id} isWhiteLabel={true} />
         </div>
      </main>

      {/* FOOTER COM COR PRIMÁRIA */}
      <footer className={s.footer}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6">
               <h4 className={`text-xl font-black uppercase tracking-tighter ${tid === 'prestige' ? 'italic' : ''}`}>{tenant.nome}</h4>
               <p className="text-sm font-medium leading-relaxed opacity-70">{tenant.slogan}</p>
               
               {cms.social?.complaints_book_link && (
                 <a href={cms.social.complaints_book_link} target="_blank" rel="noopener noreferrer" className="block w-fit mt-8 transition-opacity hover:opacity-80">
                   <ComplaintsBookSVG variant="light" />
                 </a>
               )}
            </div>
            <div className="space-y-6 md:text-right">
               <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 block pt-10">© {new Date().getFullYear()} {tenant.nome}</span>
            </div>
         </div>
      </footer>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black p-10 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-top duration-300">
           <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white"><X size={32}/></button>
           {cms.menus.main.map(m => <Link key={m.id} to={m.path} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-white">{m.label}</Link>)}
        </div>
      )}
    </div>
  );
};

export default PublicPage;