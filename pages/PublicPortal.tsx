
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

const PublicPortal: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      if (slug === 'demo-imosuite') {
        setTimeout(() => {
          setTenant(DEFAULT_TENANT);
          setProperties(MOCK_IMOVEIS);
          document.documentElement.style.setProperty('--primary', DEFAULT_TENANT.cor_primaria);
          document.documentElement.style.setProperty('--secondary', DEFAULT_TENANT.cor_secundaria);
          setLoading(false);
        }, 800);
        return;
      }
      try {
        const tSnap = await getDocs(query(collection(db, "tenants"), where("slug", "==", slug), limit(1)));
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          document.documentElement.style.setProperty('--primary', tData.cor_primaria);
          document.documentElement.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);
          const pSnap = await getDocs(collection(db, "tenants", tData.id, "properties"));
          setProperties(pSnap.docs.map(d => ({ id: d.id, tenant_id: tData.id, ...d.data() } as Imovel)).filter(p => p.publicacao?.publicar_no_site));
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!tenant) return <div className="h-screen flex items-center justify-center font-black uppercase text-slate-300">Não encontrada</div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  const tid = tenant.template_id || 'heritage';

  // Configuração de Estilos por Template
  const styles: Record<string, any> = {
    heritage: {
      wrapper: "font-brand",
      nav: "h-28 px-8 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-slate-100",
      navText: "font-heritage italic text-[#1c2d51]",
      footer: "py-24 px-10 bg-[var(--primary)] text-white",
      footerText: "text-white font-heritage italic",
      button: "bg-[var(--primary)] text-white px-8 py-3 rounded-none font-bold uppercase tracking-widest",
      cardType: "classic"
    },
    canvas: {
      wrapper: "font-brand bg-white",
      nav: "h-32 px-12 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50",
      navText: "font-black tracking-tight text-[#1c2d51]",
      footer: "py-24 px-12 bg-[var(--primary)] text-white",
      footerText: "text-white font-black",
      button: "bg-[var(--primary)] text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs shadow-lg",
      cardType: "modern"
    },
    prestige: {
      wrapper: "font-brand bg-black text-white",
      nav: "h-28 px-10 flex items-center justify-between sticky top-0 z-50 bg-black text-white uppercase tracking-[0.2em] border-b border-white/5",
      navText: "font-black italic",
      footer: "py-24 px-10 bg-[var(--primary)] text-white border-t border-white/5",
      footerText: "text-white font-black italic",
      button: "bg-white text-black px-10 py-3 rounded-none font-black uppercase text-[10px]",
      cardType: "luxury"
    },
    skyline: {
      wrapper: "font-brand",
      nav: "h-28 px-8 flex items-center justify-between sticky top-0 z-50 bg-[var(--primary)] text-white shadow-xl",
      navText: "font-black uppercase tracking-tighter",
      footer: "py-24 px-10 bg-[var(--primary)] text-white",
      footerText: "text-white font-black uppercase",
      button: "bg-white text-[var(--primary)] px-8 py-3 rounded-xl font-black uppercase text-xs shadow-xl",
      cardType: "urban"
    },
    luxe: {
      wrapper: "font-brand bg-[#FDFBF7]",
      nav: "h-32 px-12 flex items-center justify-between sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm",
      navText: "font-black text-[#2D2926] tracking-widest",
      footer: "py-24 px-12 bg-[var(--primary)] text-white",
      footerText: "text-white font-black tracking-widest",
      button: "bg-[#2D2926] text-white px-10 py-4 rounded-[2rem] font-bold text-xs uppercase tracking-widest shadow-2xl",
      cardType: "artistic"
    }
  };

  const s = styles[tid] || styles.heritage;
  const isBusiness = tenant.subscription?.plan_id === 'business';

  return (
    <div className={`${s.wrapper} min-h-screen flex flex-col selection:bg-[var(--primary)] selection:text-white`}>
      <SEO title={tenant.nome} description={tenant.slogan} overrideFullTitle={true} />
      
      {/* NAVBAR DINÂMICA */}
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-20 w-auto object-contain drop-shadow-md" /> : <span className={`text-2xl ${s.navText}`}>{tenant.nome}</span>}
         </Link>
         <div className="hidden md:flex gap-10">
            {cms.menus.main.map(m => (
              <Link 
                key={m.id} 
                to={m.path === '/' ? `/agencia/${tenant.slug}` : `/agencia/${tenant.slug}/p/${m.path.replace('/', '')}`} 
                className={`text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all ${tid === 'prestige' || tid === 'skyline' ? 'text-white' : 'text-slate-500'}`}
              >
                {m.label}
              </Link>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <button className={s.button}>Contactar</button>
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-slate-400"><Menu/></button>
         </div>
      </nav>

      <main className="flex-1">
        {cms.homepage_sections.filter(s => s.enabled).sort((a,b) => a.order - b.order).map(section => (
          <SectionRenderer key={section.id} section={section} tenant={tenant} properties={properties} templateStyles={s} />
        ))}
        {/* SECÇÃO DE CONTACTO COM COR SECUNDÁRIA */}
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
                   <img 
                     src="https://www.livroreclamacoes.pt/assets/img/logo_reclamacoes_white.png" 
                     alt="Livro de Reclamações Online" 
                     className="h-10 w-auto brightness-0 invert"
                   />
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
               <div className="flex md:justify-end gap-6 mb-8">
                  {cms.social?.instagram && <a href={cms.social.instagram} className="opacity-80 hover:opacity-100"><Instagram size={20}/></a>}
                  {cms.social?.facebook && <a href={cms.social.facebook} className="opacity-80 hover:opacity-100"><Facebook size={20}/></a>}
                  {cms.social?.whatsapp && <a href={cms.social.whatsapp} className="opacity-80 hover:opacity-100"><MessageCircle size={20}/></a>}
               </div>
               <p className="text-xs font-bold opacity-60">{tenant.professional_email || tenant.email}</p>
               <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 block pt-10">
                 © {new Date().getFullYear()} {tenant.nome} • {isBusiness ? 'Real Estate' : 'Powered by ImoSuite'}
               </span>
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

const SectionRenderer: React.FC<{ section: CMSSection, tenant: Tenant, properties: Imovel[], templateStyles: any }> = ({ section, tenant, properties, templateStyles }) => {
  const featured = properties.filter(p => p.publicacao?.destaque).slice(0, 6);
  const recent = [...properties].sort((a,b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0)).slice(0, 3);
  const tid = tenant.template_id;

  switch (section.type) {
    case 'hero': return (
      <header className={`relative py-40 px-10 flex items-center justify-center overflow-hidden h-[90vh] ${tid === 'prestige' ? 'bg-black' : tid === 'skyline' ? 'bg-[var(--primary)]' : ''}`}>
        <div className="absolute inset-0 z-0">
           <img src={tenant.hero_image_url || section.content.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600'} className={`w-full h-full object-cover ${tid === 'prestige' ? 'opacity-40 grayscale' : 'opacity-60'}`} />
           <div className={`absolute inset-0 ${tid === 'prestige' ? 'bg-gradient-to-b from-transparent via-black/20 to-black' : tid === 'skyline' ? 'bg-gradient-to-b from-transparent to-[var(--primary)]' : 'bg-gradient-to-b from-white/10 via-white/50 to-white'}`} />
        </div>
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
           <h1 className={`font-black tracking-tighter mb-8 leading-[0.9] ${tid === 'prestige' ? 'text-8xl italic text-white uppercase' : tid === 'skyline' ? 'text-8xl text-white uppercase' : 'text-5xl md:text-8xl text-[#1c2d51]'}`}>
              {section.content.title || tenant.nome}
           </h1>
           <p className={`text-lg md:text-xl mb-12 font-medium opacity-60 max-w-xl mx-auto ${tid === 'prestige' || tid === 'skyline' ? 'text-white' : 'text-slate-600'}`}>
              {section.content.subtitle || tenant.slogan}
           </p>
           <div className="p-2 bg-white rounded-3xl shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2">
              <input className="flex-1 px-8 py-4 outline-none font-bold text-slate-600 bg-transparent" placeholder="Cidade ou Tipologia..." />
              <button className={templateStyles.button}>Pesquisar</button>
           </div>
        </div>
      </header>
    );
    case 'featured': case 'recent':
      const list = section.type === 'featured' ? featured : recent;
      return (
        <section className={`py-32 px-10 max-w-7xl mx-auto ${tid === 'prestige' ? 'bg-black' : ''}`}>
           <div className="flex justify-between items-end mb-16 border-b pb-10 border-slate-100/10">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{section.type === 'featured' ? 'Seleção Premium' : 'Novas Entradas'}</p>
                 <h2 className={`text-4xl font-black tracking-tighter uppercase ${tid === 'prestige' ? 'italic text-white' : 'text-[#1c2d51]'}`}>{section.content.title || (section.type === 'featured' ? 'Destaques' : 'Recentes')}</h2>
              </div>
              <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:gap-4 transition-all">Ver todos <ArrowRight size={16}/></Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {list.map(p => <ImovelCard key={p.id} imovel={p} />)}
           </div>
        </section>
      );
    case 'about_mini': return (
      <section className={`py-32 px-10 ${tid === 'prestige' ? 'bg-neutral-900 text-white' : tid === 'luxe' ? 'bg-[#EAE3D9]/30' : 'bg-slate-50'}`}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className={`aspect-[4/5] overflow-hidden shadow-2xl ${tid === 'luxe' ? 'rounded-[4rem]' : 'rounded-[3rem]'}`}>
               <img src={section.content.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'} className={`w-full h-full object-cover ${tid === 'prestige' ? 'grayscale contrast-125' : ''}`} />
            </div>
            <div className="space-y-8">
               <h2 className={`text-4xl md:text-6xl font-black tracking-tighter uppercase ${tid === 'prestige' ? 'italic' : ''}`}>{section.content.title || 'Quem Somos'}</h2>
               <p className="text-lg font-medium leading-relaxed opacity-60">{section.content.text || 'Líderes no mercado local.'}</p>
               <button className={templateStyles.button}>Saber Mais</button>
            </div>
         </div>
      </section>
    );
    default: return null;
  }
};

export default PublicPortal;