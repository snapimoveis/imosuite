import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel } from '../types';
import { 
  Loader2, ChevronRight, ArrowRight, Menu, X, 
  Instagram, Facebook, Linkedin, MessageCircle,
  LayoutGrid, Building2, ArrowUpRight
} from 'lucide-react';
import { Logo } from '../components/Logo';
import ImovelCard from '../components/ImovelCard';
import ContactSection from '../components/ContactSection';
import SEO from '../components/SEO';
import { DEFAULT_TENANT_CMS, DEFAULT_TENANT } from '../constants';
import { MOCK_IMOVEIS } from '../mocks';

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

        if (slug === 'demo-imosuite') {
          tData = DEFAULT_TENANT;
          pData = MOCK_IMOVEIS;
        } else {
          const tSnap = await getDocs(query(collection(db, "tenants"), where("slug", "==", slug), limit(1)));
          if (!tSnap.empty) {
            tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
            const pSnap = await getDocs(query(collection(db, "tenants", tData.id, "properties"), where("publicacao.publicar_no_site", "==", true)));
            pData = pSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Imovel));
          }
        }

        if (tData) {
          setTenant(tData);
          setImoveis(pData);
          document.documentElement.style.setProperty('--primary', tData.cor_primaria);
          document.documentElement.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[var(--primary)]" size={48} /></div>;
  if (!tenant) return <div className="h-screen flex flex-col items-center justify-center p-10 font-brand"><Building2 size={48} className="text-slate-100 mb-4"/><h2 className="text-xl font-black text-slate-800 tracking-tighter">Agência não encontrada.</h2><Link to="/" className="text-blue-500 mt-4 font-bold underline">Voltar</Link></div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  const tid = tenant.template_id || 'heritage';

  const getMenuLink = (path: string) => {
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, '');
    if (cleanPath === '' || cleanPath === '/') return `/agencia/${tenant.slug}`;
    if (cleanPath === 'imoveis') return `/agencia/${tenant.slug}/imoveis`;
    // Se for um slug de página, usa o prefixo /p/
    return `/agencia/${tenant.slug}/p/${cleanPath}`;
  };

  const styles: Record<string, any> = {
    heritage: { nav: "h-20 md:h-28 px-6 md:px-10 sticky top-0 z-50 bg-white border-b border-slate-100 flex items-center justify-between", navText: "font-heritage italic text-[#1c2d51]", heading: "font-heritage italic text-[#1c2d51]", footer: "py-20 px-8 bg-[var(--primary)] text-white" },
    canvas: { nav: "h-20 md:h-32 px-6 md:px-12 sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50 flex items-center justify-between", navText: "font-black tracking-tight text-[#1c2d51]", heading: "font-black text-[#1c2d51] tracking-tight", footer: "py-20 px-8 bg-[var(--primary)] text-white" },
    prestige: { nav: "h-20 md:h-28 px-6 md:px-10 sticky top-0 z-50 bg-black text-white border-b border-white/5 flex items-center justify-between", navText: "font-black italic", heading: "font-black italic uppercase text-white", footer: "py-20 px-8 bg-[var(--primary)] text-white" },
    skyline: { nav: "h-20 md:h-28 px-6 md:px-10 sticky top-0 z-50 bg-[var(--primary)] text-white flex items-center justify-between", navText: "font-black uppercase", heading: "font-black uppercase text-[#1c2d51]", footer: "py-20 px-8 bg-[var(--primary)] text-white" },
    luxe: { nav: "h-24 md:h-32 px-6 md:px-12 sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm flex items-center justify-between", navText: "font-black text-[#2D2926]", heading: "font-black text-[#2D2926] tracking-widest", footer: "py-20 px-8 bg-[var(--primary)] text-white" }
  };
  const s = styles[tid] || styles.heritage;

  return (
    <div className={`font-brand min-h-screen flex flex-col bg-white selection:bg-[var(--primary)] selection:text-white`}>
      <SEO title={tenant.nome} description={tenant.slogan} overrideFullTitle={true} />
      
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`}>
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-12 md:h-20 w-auto object-contain" alt={tenant.nome} /> : <span className={`text-xl md:text-2xl ${s.navText}`}>{tenant.nome}</span>}
         </Link>
         
         <div className="hidden lg:flex gap-10">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={getMenuLink(m.path)} className={`text-[10px] font-black uppercase tracking-widest transition-all ${tid === 'prestige' ? 'text-white hover:text-blue-400' : 'text-slate-400 hover:text-[var(--primary)]'}`}>{m.label}</Link>
            ))}
         </div>

         <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-slate-400">
            <Menu size={28} />
         </button>
      </nav>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white p-8 flex flex-col animate-in slide-in-from-top duration-300">
           <div className="flex justify-between items-center mb-16">
              <Logo size="sm" />
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-[#1c2d51]"><X size={32}/></button>
           </div>
           <div className="flex flex-col gap-8">
              {cms.menus.main.map(m => (
                <Link key={m.id} to={getMenuLink(m.path)} onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-[#1c2d51] tracking-tighter uppercase">{m.label}</Link>
              ))}
           </div>
        </div>
      )}

      <main className="flex-1 animate-in fade-in duration-700 overflow-x-hidden">
        {cms.homepage_sections.filter(sec => sec.enabled).sort((a,b) => a.order - b.order).map((section) => {
          if (section.type === 'hero') return (
            <section key={section.id} className="relative h-[70vh] md:h-[85vh] flex items-center overflow-hidden">
               <div className="absolute inset-0">
                  <img src={section.content.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600'} className="w-full h-full object-cover" alt="Hero" />
                  <div className="absolute inset-0 bg-black/40" />
               </div>
               <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full text-white text-center">
                  <h1 className="text-4xl md:text-8xl font-black mb-4 md:mb-6 tracking-tighter leading-none">{section.content.title}</h1>
                  <p className="text-base md:text-xl opacity-80 mb-10 max-w-2xl mx-auto font-medium">{section.content.subtitle}</p>
                  <Link to={`/agencia/${tenant.slug}/imoveis`} className="bg-white text-[#1c2d51] px-10 py-5 md:px-14 md:py-6 rounded-2xl font-black text-xs md:text-base uppercase shadow-2xl inline-block hover:-translate-y-1 transition-all">Ver Propriedades</Link>
               </div>
            </section>
          );
          if (section.type === 'featured') return (
            <section key={section.id} className="py-20 md:py-24 max-w-7xl mx-auto px-6">
               <h2 className={`text-3xl md:text-4xl mb-10 md:mb-12 ${s.heading}`}>{section.content.title}</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {imoveis.filter(i => i.publicacao.destaque).slice(0, 3).map(i => <ImovelCard key={i.id} imovel={i} />)}
               </div>
            </section>
          );
          if (section.type === 'about_mini') return (
            <section key={section.id} className="py-20 md:py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center">
               <div className={`aspect-square overflow-hidden shadow-2xl ${tid === 'luxe' ? 'rounded-[3rem] md:rounded-[4rem]' : tid === 'canvas' ? 'rounded-[2rem] md:rounded-[3rem]' : 'rounded-none'}`}>
                  <img src={section.content.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'} className="w-full h-full object-cover" alt="About" />
               </div>
               <div className="space-y-6">
                  <h2 className={`text-3xl md:text-4xl ${s.heading}`}>{section.content.title}</h2>
                  <p className="text-base md:text-lg text-slate-500 leading-relaxed">{section.content.text}</p>
                  <Link to={`/agencia/${tenant.slug}/p/quem-somos`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)] border-b-2 border-current pb-1 hover:opacity-70 transition-all">Saber Mais</Link>
               </div>
            </section>
          );
          return null;
        })}
        <ContactSection tenantId={tenant.id} isWhiteLabel={true} />
      </main>

      <footer className={s.footer}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-20 text-center md:text-left">
            <div className="space-y-6">
               <h4 className="text-xl font-black uppercase">{tenant.nome}</h4>
               <p className="text-sm opacity-70 max-w-xs mx-auto md:mx-0">{tenant.slogan}</p>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase opacity-50 tracking-widest">Menu</p>
               <div className="flex flex-col gap-2">
                  {cms.menus.main.map(m => <Link key={m.id} to={getMenuLink(m.path)} className="text-sm font-bold hover:opacity-100 opacity-70 transition-opacity">{m.label}</Link>)}
               </div>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase opacity-50 tracking-widest">Legal</p>
               <div className="flex flex-col gap-2">
                  {cms.menus.footer.map(m => <Link key={m.id} to={getMenuLink(m.path)} className="text-sm font-bold hover:opacity-100 opacity-70 transition-opacity">{m.label}</Link>)}
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default PublicPortal;