import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, CMSPage } from '../types';
import { 
  Loader2, Building2, ChevronLeft, Menu, X, Facebook, Instagram, 
  Linkedin, MessageCircle, Target, Star, Eye, Mail, Phone,
  User
} from 'lucide-react';
import SEO from '../components/SEO';
import { DEFAULT_TENANT_CMS, DEFAULT_TENANT } from '../constants';
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
      setLoading(true);
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

  const getMenuLink = (path: string) => {
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, '');
    if (cleanPath === '' || cleanPath === '/') return `/agencia/${tenant.slug}`;
    if (cleanPath === 'imoveis') return `/agencia/${tenant.slug}/imoveis`;
    return `/agencia/${tenant.slug}/p/${cleanPath}`;
  };

  const styles: Record<string, any> = {
    heritage: { wrapper: "font-brand bg-white", nav: "h-20 md:h-24 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-slate-100", navText: "font-heritage italic text-[#1c2d51]", footer: "py-20 px-8 bg-[var(--primary)] text-white", heading: "font-heritage italic text-[#1c2d51]", card: "bg-white border border-slate-100", badge: "bg-slate-50 text-slate-400" },
    canvas: { wrapper: "font-brand bg-white", nav: "h-20 md:h-28 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50", navText: "font-black tracking-tight text-[#1c2d51]", footer: "py-20 px-8 bg-[var(--primary)] text-white", heading: "font-black text-[#1c2d51] tracking-tight", card: "bg-white border border-slate-50 rounded-[2rem]", badge: "bg-blue-50 text-[#357fb2]" },
    prestige: { wrapper: "font-brand bg-black text-white", nav: "h-20 md:h-24 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 bg-black text-white border-b border-white/5", navText: "font-black italic", footer: "py-20 px-8 bg-[var(--primary)] text-white border-t border-white/5", heading: "font-black italic uppercase text-white", card: "bg-neutral-900 border border-white/5", badge: "bg-white/5 text-white/40" }
  };
  const s = styles[tid] || styles.heritage;

  return (
    <div className={`${s.wrapper} min-h-screen flex flex-col selection:bg-[var(--primary)] selection:text-white overflow-x-hidden`}>
      <SEO title={`${page.title} - ${tenant.nome}`} overrideFullTitle={true} />
      
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`}>
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 md:h-14 w-auto object-contain" alt={tenant.nome} /> : <span className={`text-xl md:text-2xl ${s.navText}`}>{tenant.nome}</span>}
         </Link>
         
         <div className="hidden lg:flex gap-10">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={getMenuLink(m.path)} className={`text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all ${tid === 'prestige' ? 'text-white' : 'text-slate-400'}`}>{m.label}</Link>
            ))}
         </div>

         <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-slate-400"><Menu size={28} /></button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white p-8 flex flex-col animate-in slide-in-from-top duration-300">
           <div className="flex justify-between items-center mb-16">
              {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto" alt="Logo" /> : <span className="font-black text-[#1c2d51]">{tenant.nome}</span>}
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-[#1c2d51]"><X size={32}/></button>
           </div>
           <div className="flex flex-col gap-8">
              {cms.menus.main.map(m => (
                <Link key={m.id} to={getMenuLink(m.path)} onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-[#1c2d51] tracking-tighter uppercase">{m.label}</Link>
              ))}
           </div>
        </div>
      )}

      <main className="flex-1 w-full animate-in fade-in duration-700">
         <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
            <Link to={`/agencia/${tenant.slug}`} className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-10 opacity-40 hover:opacity-100 transition-all ${tid === 'prestige' ? 'text-white' : 'text-slate-400'}`}>
               <ChevronLeft size={16}/> Voltar
            </Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-start">
               <div className="lg:col-span-7 space-y-8 md:space-y-12">
                  <h1 className={`text-4xl md:text-8xl leading-tight md:leading-[0.9] ${s.heading}`}>{page.title}</h1>
                  <div className={`prose prose-slate max-w-none font-medium leading-relaxed whitespace-pre-line text-base md:text-xl ${tid === 'prestige' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {page.content_md}
                  </div>
               </div>

               <div className="lg:col-span-5">
                  {page.galeria_fotos && page.galeria_fotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                       {page.galeria_fotos.map((img, i) => (
                         <div key={i} className={`overflow-hidden shadow-xl ${i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'} ${tid === 'luxe' ? 'rounded-[2rem]' : tid === 'canvas' ? 'rounded-[1.5rem]' : 'rounded-none'}`}>
                           <img src={img} className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${tid === 'prestige' ? 'grayscale' : ''}`} alt={`Galeria ${i}`} />
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Seção Contactos injetada se o slug for 'contactos' */}
         {pageSlug === 'contactos' && (
           <div className="bg-slate-50">
             <ContactSection 
               tenantId={tenant.id} 
               isWhiteLabel={true} 
               title="Estamos ao seu dispor" 
               subtitle="Preencha o formulário abaixo e entraremos em contacto brevemente."
             />
           </div>
         )}

         {/* Restantes blocos (Missão, Equipa, etc) */}
         {(page.missao || page.visao || (page.valores && page.valores.length > 0)) && (
            <div className={`py-20 md:py-32 ${tid === 'prestige' ? 'bg-neutral-900/50' : 'bg-slate-50'}`}>
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                  {page.missao && (
                    <div className="space-y-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.badge}`}><Target size={28}/></div>
                       <h3 className="text-2xl font-black uppercase tracking-tight">Nossa Missão</h3>
                       <p className="text-sm md:text-base font-medium leading-relaxed opacity-70">{page.missao}</p>
                    </div>
                  )}
                  {page.visao && (
                    <div className="space-y-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.badge}`}><Eye size={28}/></div>
                       <h3 className="text-2xl font-black uppercase tracking-tight">Nossa Visão</h3>
                       <p className="text-sm md:text-base font-medium leading-relaxed opacity-70">{page.visao}</p>
                    </div>
                  )}
                  {page.valores && page.valores.length > 0 && (
                    <div className="space-y-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.badge}`}><Star size={28}/></div>
                       <h3 className="text-2xl font-black uppercase tracking-tight">Nossos Valores</h3>
                       <ul className="space-y-3">
                          {page.valores.map((v, i) => <li key={i} className="text-sm md:text-base font-bold flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></div> {v}</li>)}
                       </ul>
                    </div>
                  )}
               </div>
            </div>
         )}

         {page.equipa && page.equipa.length > 0 && (
           <div className="py-24 md:py-32 max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-12 md:mb-16">Nossa Equipa</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {page.equipa.map((member) => (
                   <div key={member.id} className={`${s.card} overflow-hidden group shadow-sm`}>
                      <div className="aspect-[4/5] bg-slate-100 overflow-hidden relative">
                         {member.avatar_url && <img src={member.avatar_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={member.name} />}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 gap-3">
                            {member.email && <a href={`mailto:${member.email}`} className="bg-white text-[#1c2d51] p-3 rounded-xl flex items-center justify-center"><Mail size={18}/></a>}
                         </div>
                      </div>
                      <div className="p-8">
                         <h4 className="text-xl font-black">{member.name}</h4>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{member.role}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
         )}
      </main>

      <footer className={s.footer}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-20 text-center md:text-left">
            <div className="space-y-6">
               <h4 className="text-xl font-black uppercase tracking-tighter">{tenant.nome}</h4>
               <p className="text-sm opacity-70 max-w-xs mx-auto md:mx-0">{tenant.slogan}</p>
            </div>
            <div className="md:col-span-2 flex items-end justify-center md:justify-end">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">© {new Date().getFullYear()} {tenant.nome}</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default PublicPage;