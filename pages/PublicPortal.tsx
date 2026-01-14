import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel, CMSSection } from '../types';
import { 
  Loader2, ChevronRight, ArrowRight, Search, Menu, X, 
  Instagram, Facebook, Linkedin, MessageCircle, Star, Sparkles,
  LayoutGrid, Building2, MapPin
} from 'lucide-react';
import ImovelCard from '../components/ImovelCard';
import ContactSection from '../components/ContactSection';
import SEO from '../components/SEO';
import { DEFAULT_TENANT_CMS, DEFAULT_TENANT } from '../constants';
import { MOCK_IMOVEIS } from '../mocks';

const ComplaintsBookSVG = () => (
  <svg 
    id="Camada_1" 
    data-name="Camada 1" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 140 58" 
    className="h-12 w-auto"
  >
    <image 
      width="140" 
      height="58" 
      href="data:image/png;base64,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" 
    />
  </svg>
);

const PublicPortal: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      
      try {
        let tData: Tenant | null = null;
        let pData: Imovel[] = [];

        // Demo special case
        if (slug === 'demo-imosuite') {
          tData = DEFAULT_TENANT;
          pData = MOCK_IMOVEIS;
        } else {
          const tQuery = query(collection(db, "tenants"), where("slug", "==", slug), limit(1));
          const tSnap = await getDocs(tQuery);
          
          if (!tSnap.empty) {
            tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
            const pQuery = query(collection(db, "tenants", tData.id, "properties"), where("publicacao.publicar_no_site", "==", true));
            const pSnap = await getDocs(pQuery);
            pData = pSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Imovel));
          }
        }

        if (tData) {
          setTenant(tData);
          setImoveis(pData);
          // Appy branding
          document.documentElement.style.setProperty('--primary', tData.cor_primaria);
          document.documentElement.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);
        }
      } catch (err) {
        console.error("Erro ao carregar portal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[var(--primary)]" size={48} /></div>;
  if (!tenant) return <div className="h-screen flex flex-col items-center justify-center p-10 font-brand"><Building2 size={48} className="text-slate-100 mb-4"/><h2 className="text-xl font-black text-slate-800 tracking-tighter">Agência não encontrada.</h2><Link to="/" className="text-blue-500 mt-4 font-bold underline">Voltar à ImoSuite</Link></div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  const tid = tenant.template_id || 'heritage';

  // Configuração de estilos por template
  const styles: Record<string, any> = {
    heritage: {
      wrapper: "font-brand bg-white",
      nav: "h-28 px-8 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-slate-100",
      navText: "font-heritage italic text-[#1c2d51]",
      button: "bg-[var(--primary)] text-white px-8 py-4 rounded-none font-black uppercase text-xs",
      heading: "font-heritage italic text-[#1c2d51]",
      footer: "py-24 px-10 bg-[var(--primary)] text-white",
      footerText: "text-white font-heritage italic"
    },
    canvas: {
      wrapper: "font-brand bg-white",
      nav: "h-32 px-12 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50",
      navText: "font-black tracking-tight text-[#1c2d51]",
      button: "bg-[var(--primary)] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg",
      heading: "font-black text-[#1c2d51] tracking-tight",
      footer: "py-24 px-12 bg-[var(--primary)] text-white",
      footerText: "text-white font-black"
    },
    prestige: {
      wrapper: "font-brand bg-black text-white",
      nav: "h-28 px-10 flex items-center justify-between sticky top-0 z-50 bg-black text-white border-b border-white/5 uppercase tracking-widest",
      navText: "font-black italic",
      button: "bg-white text-black px-10 py-4 rounded-none font-black uppercase text-[10px]",
      heading: "font-black italic uppercase text-white",
      footer: "py-24 px-10 bg-[var(--primary)] text-white border-t border-white/5",
      footerText: "text-white font-black italic"
    },
    skyline: {
      wrapper: "font-brand bg-white",
      nav: "h-28 px-8 flex items-center justify-between sticky top-0 z-50 bg-[var(--primary)] text-white",
      navText: "font-black uppercase",
      button: "bg-white text-[var(--primary)] px-8 py-3 rounded-xl font-black uppercase text-xs shadow-xl",
      heading: "font-black uppercase text-[#1c2d51]",
      footer: "py-24 px-10 bg-[var(--primary)] text-white",
      footerText: "text-white font-black uppercase"
    },
    luxe: {
      wrapper: "font-brand bg-[#FDFBF7] text-[#2D2926]",
      nav: "h-32 px-12 flex items-center justify-between sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm",
      navText: "font-black text-[#2D2926]",
      button: "bg-[#2D2926] text-white px-10 py-5 rounded-[2.5rem] font-bold text-xs uppercase shadow-2xl",
      heading: "font-black text-[#2D2926] tracking-widest",
      footer: "py-24 px-12 bg-[var(--primary)] text-white",
      footerText: "text-white font-black tracking-widest"
    }
  };

  const s = styles[tid] || styles.heritage;
  const isBusiness = tenant.subscription?.plan_id === 'business';

  return (
    <div className={`${s.wrapper} min-h-screen flex flex-col selection:bg-[var(--primary)] selection:text-white`}>
      <SEO title={tenant.nome} description={tenant.slogan} overrideFullTitle={true} />
      
      {/* NAVEGAÇÃO DINÂMICA */}
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-20 w-auto object-contain drop-shadow-md" alt={tenant.nome} /> : <span className={`text-2xl ${s.navText}`}>{tenant.nome}</span>}
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

      {/* RENDERIZAÇÃO DE SECÇÕES DA HOMEPAGE */}
      <main className="flex-1 animate-in fade-in duration-700">
        {cms.homepage_sections.filter(sec => sec.enabled).sort((a,b) => a.order - b.order).map((section) => {
          
          if (section.type === 'hero') return (
            <section key={section.id} className="relative h-[90vh] flex items-center overflow-hidden">
               <div className="absolute inset-0">
                  <img src={section.content.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600'} className={`w-full h-full object-cover ${tid === 'prestige' ? 'grayscale brightness-50' : ''}`} alt="Hero" />
                  <div className={`absolute inset-0 ${tid === 'prestige' ? 'bg-black/40' : 'bg-black/30'}`} />
               </div>
               <div className="relative z-10 max-w-7xl mx-auto px-10 w-full text-white">
                  <div className="max-w-3xl space-y-8">
                     <h1 className={`text-5xl md:text-8xl leading-tight ${tid === 'prestige' ? 'font-black italic' : 'font-black'}`}>{section.content.title}</h1>
                     <p className="text-xl md:text-2xl font-medium opacity-80 max-w-xl">{section.content.subtitle}</p>
                     <div className="pt-6">
                        <Link to="/imoveis" className={`${s.button} text-lg py-6 px-12 inline-flex items-center gap-3`}>Ver Propriedades <ArrowRight size={20}/></Link>
                     </div>
                  </div>
               </div>
            </section>
          );

          if (section.type === 'featured') return (
            <section key={section.id} className="py-32 max-w-7xl mx-auto px-6">
               <div className="flex justify-between items-end mb-16">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Seleção Exclusiva</p>
                    <h2 className={`text-4xl md:text-6xl ${s.heading}`}>{section.content.title}</h2>
                  </div>
                  <Link to="/imoveis" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[var(--primary)] transition-colors">Catálogo Completo <ChevronRight size={14}/></Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {imoveis.filter(i => i.publicacao.destaque).slice(0, 3).map(imovel => (
                    <ImovelCard key={imovel.id} imovel={imovel} />
                  ))}
               </div>
            </section>
          );

          if (section.type === 'about_mini') return (
            <section key={section.id} className={`py-32 ${tid === 'prestige' ? 'bg-neutral-900' : tid === 'luxe' ? 'bg-[#EAE3D9]/30' : 'bg-slate-50'}`}>
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <div className={`aspect-[4/5] overflow-hidden shadow-2xl ${tid === 'luxe' ? 'rounded-[4rem]' : tid === 'canvas' ? 'rounded-[3rem]' : 'rounded-none'}`}>
                     <img src={section.content.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'} className={`w-full h-full object-cover ${tid === 'prestige' ? 'grayscale contrast-125' : ''}`} alt="About" />
                  </div>
                  <div className="space-y-8">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">A Nossa História</p>
                     <h2 className={`text-4xl md:text-6xl leading-tight ${s.heading}`}>{section.content.title}</h2>
                     <p className="text-lg font-medium text-slate-500 leading-relaxed whitespace-pre-line">{section.content.text}</p>
                     <div className="pt-6">
                        <Link to="/quem-somos" className={`inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${tid === 'prestige' ? 'text-white' : 'text-[#1c2d51]'} border-b-2 border-current pb-2`}>Conhecer Agência <ArrowUpRight size={16}/></Link>
                     </div>
                  </div>
               </div>
            </section>
          );

          if (section.type === 'cta') return (
            <section key={section.id} className="py-20 px-6">
               <div className={`max-w-7xl mx-auto p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl ${tid === 'luxe' ? 'bg-[#2D2926] rounded-[4rem]' : tid === 'prestige' ? 'bg-neutral-950 rounded-none border border-white/5' : 'bg-[#1c2d51] rounded-[3rem]'}`}>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--secondary)] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                  <h2 className={`text-4xl md:text-6xl mb-6 tracking-tighter relative z-10 ${tid === 'prestige' ? 'italic' : ''}`}>{section.content.title}</h2>
                  <p className="text-xl opacity-70 mb-12 relative z-10">{section.content.subtitle}</p>
                  <button className={`${s.button} bg-white text-black scale-110 relative z-10`}>{section.content.button_text}</button>
               </div>
            </section>
          );

          return null;
        })}

        {/* LISTAGEM GERAL DE IMÓVEIS (SEM SER APENAS DESTAQUE) */}
        <section className="py-32 max-w-7xl mx-auto px-6 border-t border-slate-50">
           <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
              <h2 className={`text-4xl md:text-5xl ${s.heading}`}>Explorar Portfolio</h2>
              <div className="flex gap-4">
                 {/* Filtros simples visuais */}
                 <div className="bg-slate-50 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-[#1c2d51] cursor-pointer hover:bg-slate-100 transition-all border border-slate-100 flex items-center gap-2"><LayoutGrid size={14}/> Apartamentos</div>
                 <div className="bg-slate-50 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-[#1c2d51] cursor-pointer hover:bg-slate-100 transition-all border border-slate-100 flex items-center gap-2"><Building2 size={14}/> Moradias</div>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {imoveis.map(imovel => (
                <ImovelCard key={imovel.id} imovel={imovel} />
              ))}
           </div>
        </section>

        {/* ÁREA DE CONTACTO COM COR SECUNDÁRIA */}
        <div className="bg-[var(--secondary)] text-white">
          <ContactSection tenantId={tenant.id} isWhiteLabel={true} />
        </div>
      </main>

      {/* FOOTER DINÂMICO COM COR PRIMÁRIA */}
      <footer className={s.footer}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6">
               <h4 className={`text-xl font-black uppercase tracking-tighter ${s.footerText}`}>{tenant.nome}</h4>
               <p className="text-sm font-medium leading-relaxed opacity-70">{tenant.slogan}</p>
               
               {cms.social?.complaints_book_link && (
                 <a href={cms.social.complaints_book_link} target="_blank" rel="noopener noreferrer" className="block w-fit mt-8 transition-opacity hover:opacity-80">
                   <ComplaintsBookSVG />
                 </a>
               )}
            </div>
            <div className="space-y-6">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Navegação</p>
               <div className="flex flex-col gap-3">
                  {cms.menus.main.map(m => <Link key={m.id} to={m.path} className="text-sm font-bold opacity-80 hover:opacity-100 transition-all">{m.label}</Link>)}
               </div>
            </div>
            <div className="space-y-6 md:text-right">
               <div className="flex flex-col md:items-end gap-3">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Redes Sociais</p>
                  <div className="flex gap-6">
                     {cms.social.instagram && <a href={cms.social.instagram} className="hover:scale-110 transition-transform"><Instagram size={20}/></a>}
                     {cms.social.facebook && <a href={cms.social.facebook} className="hover:scale-110 transition-transform"><Facebook size={20}/></a>}
                     {cms.social.linkedin && <a href={cms.social.linkedin} className="hover:scale-110 transition-transform"><Linkedin size={20}/></a>}
                     {cms.social.whatsapp && <a href={`https://wa.me/${cms.social.whatsapp}`} className="hover:scale-110 transition-transform"><MessageCircle size={20}/></a>}
                  </div>
               </div>
               <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 block pt-10">
                 © {new Date().getFullYear()} {tenant.nome} • {isBusiness ? 'Real Estate' : 'Powered by ImoSuite'}
               </span>
            </div>
         </div>
      </footer>

      {/* MOBILE MENU MODAL */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black p-10 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-top duration-300">
           <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white"><X size={32}/></button>
           {cms.menus.main.map(m => <Link key={m.id} to={m.path} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-white">{m.label}</Link>)}
        </div>
      )}
    </div>
  );
};

// Fix: Adding the missing default export
export default PublicPortal;