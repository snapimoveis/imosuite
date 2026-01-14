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
import ImovelCard from '../components/ImovelCard';
import ContactSection from '../components/ContactSection';
import SEO from '../components/SEO';
import { DEFAULT_TENANT_CMS, DEFAULT_TENANT } from '../constants';
import { MOCK_IMOVEIS } from '../mocks';

const COMPLAINTS_BOOK_BASE64 = "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";

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
    if (path === '/') return `/agencia/${tenant.slug}`;
    if (path === '/imoveis' || path === 'imoveis') return `/agencia/${tenant.slug}/imoveis`;
    // Se o path não tiver barra inicial, assume-se que é o slug de uma página interna
    const cleanPath = path.replace(/^\//, '');
    return `/agencia/${tenant.slug}/p/${cleanPath}`;
  };

  const styles: Record<string, any> = {
    heritage: { nav: "h-28 px-8 sticky top-0 z-50 bg-white border-b border-slate-100 flex items-center justify-between", navText: "font-heritage italic text-[#1c2d51]", button: "bg-[var(--primary)] text-white px-8 py-4 font-black uppercase text-xs", heading: "font-heritage italic text-[#1c2d51]", footer: "py-24 px-10 bg-[var(--primary)] text-white" },
    canvas: { nav: "h-32 px-12 sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50 flex items-center justify-between", navText: "font-black tracking-tight text-[#1c2d51]", button: "bg-[var(--primary)] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg", heading: "font-black text-[#1c2d51] tracking-tight", footer: "py-24 px-12 bg-[var(--primary)] text-white" },
    prestige: { nav: "h-28 px-10 sticky top-0 z-50 bg-black text-white border-b border-white/5 flex items-center justify-between", navText: "font-black italic", button: "bg-white text-black px-10 py-4 font-black uppercase text-[10px]", heading: "font-black italic uppercase text-white", footer: "py-24 px-10 bg-[var(--primary)] text-white border-t border-white/5" },
    skyline: { nav: "h-28 px-8 sticky top-0 z-50 bg-[var(--primary)] text-white flex items-center justify-between", navText: "font-black uppercase", button: "bg-white text-[var(--primary)] px-8 py-3 rounded-xl font-black uppercase text-xs shadow-xl", heading: "font-black uppercase text-[#1c2d51]", footer: "py-24 px-10 bg-[var(--primary)] text-white" },
    luxe: { nav: "h-32 px-12 sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm flex items-center justify-between", navText: "font-black text-[#2D2926]", button: "bg-[#2D2926] text-white px-10 py-5 rounded-[2.5rem] font-bold text-xs uppercase shadow-2xl", heading: "font-black text-[#2D2926] tracking-widest", footer: "py-24 px-12 bg-[var(--primary)] text-white" }
  };
  const s = styles[tid] || styles.heritage;

  return (
    <div className={`font-brand min-h-screen flex flex-col bg-white selection:bg-[var(--primary)] selection:text-white`}>
      <SEO title={tenant.nome} description={tenant.slogan} overrideFullTitle={true} />
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`}>
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-20 w-auto object-contain" alt={tenant.nome} /> : <span className={`text-2xl ${s.navText}`}>{tenant.nome}</span>}
         </Link>
         <div className="hidden md:flex gap-8">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={getMenuLink(m.path)} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${tid === 'prestige' ? 'text-white' : 'text-slate-400 hover:text-[var(--primary)]'}`}>{m.label}</Link>
            ))}
         </div>
         <button className={s.button}>Contactar</button>
      </nav>

      <main className="flex-1 animate-in fade-in duration-700">
        {cms.homepage_sections.filter(sec => sec.enabled).sort((a,b) => a.order - b.order).map((section) => {
          if (section.type === 'hero') return (
            <section key={section.id} className="relative h-[85vh] flex items-center overflow-hidden">
               <div className="absolute inset-0">
                  <img src={section.content.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600'} className="w-full h-full object-cover" alt="Hero" />
                  <div className="absolute inset-0 bg-black/40" />
               </div>
               <div className="relative z-10 max-w-7xl mx-auto px-10 w-full text-white text-center">
                  <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">{section.content.title}</h1>
                  <p className="text-xl opacity-80 mb-10 max-w-2xl mx-auto font-medium">{section.content.subtitle}</p>
                  <Link to={`/agencia/${tenant.slug}/imoveis`} className={s.button + " py-5 px-10 text-base"}>Ver Propriedades</Link>
               </div>
            </section>
          );
          if (section.type === 'featured') return (
            <section key={section.id} className="py-24 max-w-7xl mx-auto px-6">
               <h2 className={`text-4xl mb-12 ${s.heading}`}>{section.content.title}</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {imoveis.filter(i => i.publicacao.destaque).slice(0, 3).map(i => <ImovelCard key={i.id} imovel={i} />)}
               </div>
            </section>
          );
          if (section.type === 'about_mini') return (
            <section key={section.id} className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
               <div className={`aspect-square overflow-hidden shadow-2xl ${tid === 'luxe' ? 'rounded-[4rem]' : tid === 'canvas' ? 'rounded-[3rem]' : ''}`}>
                  <img src={section.content.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'} className="w-full h-full object-cover" alt="About" />
               </div>
               <div className="space-y-6">
                  <h2 className={`text-4xl ${s.heading}`}>{section.content.title}</h2>
                  <p className="text-lg text-slate-500 leading-relaxed">{section.content.text}</p>
                  <Link to={`/agencia/${tenant.slug}/p/quem-somos`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)] border-b-2 border-current pb-1">Saber Mais</Link>
               </div>
            </section>
          );
          return null;
        })}
        <ContactSection tenantId={tenant.id} isWhiteLabel={true} />
      </main>

      <footer className={s.footer}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6">
               <h4 className="text-xl font-black uppercase">{tenant.nome}</h4>
               <p className="text-sm opacity-70">{tenant.slogan}</p>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase opacity-50">Menu</p>
               <div className="flex flex-col gap-2">
                  {cms.menus.main.map(m => <Link key={m.id} to={getMenuLink(m.path)} className="text-sm font-bold hover:opacity-100 opacity-70">{m.label}</Link>)}
               </div>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase opacity-50">Legal</p>
               <div className="flex flex-col gap-2">
                  {cms.menus.footer.map(m => <Link key={m.id} to={getMenuLink(m.path)} className="text-sm font-bold hover:opacity-100 opacity-70">{m.label}</Link>)}
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default PublicPortal;