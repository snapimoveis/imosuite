
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "@firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, CMSPage, TeamMember } from '../types';
import { 
  Loader2, Building2, ChevronLeft, Menu, X, Facebook, Instagram, 
  Linkedin, MessageCircle, Target, Star, Eye, Mail, Phone, Camera,
  User, ArrowRight
} from 'lucide-react';
import SEO from '../components/SEO';
import { DEFAULT_TENANT_CMS } from '../constants';
import ContactSection from '../components/ContactSection';

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
        const tSnap = await getDocs(query(collection(db, "tenants"), where("slug", "==", slug), limit(1)));
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          const p = tData.cms?.pages?.find(p => p.slug === pageSlug);
          if (p) setPage(p);
          document.documentElement.style.setProperty('--primary', tData.cor_primaria);
          document.documentElement.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug, pageSlug]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!tenant || !page) return <div className="h-screen flex flex-col items-center justify-center p-10 font-brand"><Building2 size={48} className="text-slate-100 mb-4"/><h2 className="text-xl font-black text-slate-800 tracking-tighter">Página não encontrada.</h2><Link to="/" className="text-blue-500 mt-4 font-bold underline">Voltar</Link></div>;

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
