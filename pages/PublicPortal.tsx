
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel } from '../types';
import { Loader2, Menu, X, Building2 } from 'lucide-react';
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
          
          // Injeção do Google Analytics se configurado
          if (tData.seo_settings?.google_analytics_id) {
             const script1 = document.createElement('script');
             script1.async = true;
             script1.src = `https://www.googletagmanager.com/gtag/js?id=${tData.seo_settings.google_analytics_id}`;
             document.head.appendChild(script1);

             const script2 = document.createElement('script');
             script2.innerHTML = `
               window.dataLayer = window.dataLayer || [];
               function gtag(){dataLayer.push(arguments);}
               gtag('js', new Date());
               gtag('config', '${tData.seo_settings.google_analytics_id}');
             `;
             document.head.appendChild(script2);
          }
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[var(--primary)]" size={48} /></div>;
  if (!tenant) return <div className="h-screen flex flex-col items-center justify-center p-10 font-brand"><Building2 size={48} className="text-slate-100 mb-4"/><h2 className="text-xl font-black">Agência não encontrada.</h2><Link to="/" className="text-blue-500 mt-4 underline">Voltar</Link></div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  const tid = tenant.template_id || 'heritage';

  const getMenuLink = (path: string) => {
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, '');
    if (cleanPath === '' || cleanPath === '/') return `/agencia/${tenant.slug}`;
    if (cleanPath === 'imoveis') return `/agencia/${tenant.slug}/imoveis`;
    return `/agencia/${tenant.slug}/p/${cleanPath}`;
  };

  const renderLink = (item: any, className: string) => {
    if (item.path.startsWith('http')) return <a key={item.id} href={item.path} target="_blank" rel="noopener noreferrer" className={className}>{item.label}</a>;
    return <Link key={item.id} to={getMenuLink(item.path)} className={className}>{item.label}</Link>;
  };

  const styles: Record<string, any> = {
    heritage: { nav: "h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-50", heading: "font-heritage italic text-[#1c2d51]" },
    canvas: { nav: "h-24 bg-white/80 backdrop-blur-md border-b border-slate-50 flex items-center justify-between px-10 sticky top-0 z-50", heading: "font-black tracking-tight" },
    prestige: { nav: "h-20 bg-black text-white flex items-center justify-between px-10 sticky top-0 z-50", heading: "font-black italic uppercase" },
    skyline: { nav: "h-20 bg-[#2563eb] text-white flex items-center justify-between px-10 sticky top-0 z-50", heading: "font-black uppercase" },
    luxe: { nav: "h-28 bg-[#FDFBF7] flex items-center justify-between px-10 sticky top-0 z-50", heading: "font-serif italic" }
  };
  const s = styles[tid] || styles.heritage;

  return (
    <div className="font-brand min-h-screen flex flex-col bg-white selection:bg-[var(--primary)] selection:text-white">
      <SEO 
        title={tenant.seo_settings?.meta_title || tenant.nome} 
        description={tenant.seo_settings?.meta_description || tenant.slogan} 
        overrideFullTitle={true} 
      />
      
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`}>
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 md:h-14 w-auto object-contain" alt={tenant.nome} /> : <span className="text-xl font-black">{tenant.nome}</span>}
         </Link>
         <div className="hidden lg:flex gap-8">
            {cms.menus.main.map(m => renderLink(m, "text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"))}
         </div>
         <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-slate-400"><Menu size={28} /></button>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white p-8 flex flex-col animate-in slide-in-from-top">
           <div className="flex justify-between items-center mb-16">
              <span className="font-black">{tenant.nome}</span>
              <button onClick={() => setIsMenuOpen(false)}><X size={32}/></button>
           </div>
           <div className="flex flex-col gap-8">
              {cms.menus.main.map(m => renderLink(m, "text-3xl font-black uppercase tracking-tighter"))}
           </div>
        </div>
      )}

      <main className="flex-1 animate-in fade-in duration-700">
        {cms.homepage_sections.filter(sec => sec.enabled).sort((a,b) => a.order - b.order).map((section) => {
          if (section.type === 'hero') return (
            <section key={section.id} className="relative h-[80vh] flex items-center justify-center text-center px-6 overflow-hidden">
               <div className="absolute inset-0 z-0"><img src={section.content.image_url} className="w-full h-full object-cover" alt="Hero"/><div className="absolute inset-0 bg-black/40"/></div>
               <div className="relative z-10 text-white max-w-4xl">
                  <h1 className="text-4xl md:text-8xl font-black mb-6 leading-tight tracking-tighter">{section.content.title}</h1>
                  <p className="text-lg md:text-xl opacity-80 mb-10">{section.content.subtitle}</p>
                  <Link to={`/agencia/${tenant.slug}/imoveis`} className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase text-xs shadow-2xl">Ver Imóveis</Link>
               </div>
            </section>
          );
          if (section.type === 'featured') return (
            <section key={section.id} className="py-24 max-w-7xl mx-auto px-6">
               <h2 className={`text-3xl md:text-4xl mb-12 ${s.heading}`}>{section.content.title}</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {imoveis.filter(i => i.publicacao.destaque).slice(0, 3).map(i => <ImovelCard key={i.id} imovel={i} />)}
               </div>
            </section>
          );
          if (section.type === 'about_mini') return (
            <section key={section.id} className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden"><img src={section.content.image_url} className="w-full h-full object-cover" /></div>
               <div className="space-y-6">
                  <h2 className={`text-3xl md:text-4xl ${s.heading}`}>{section.content.title}</h2>
                  <p className="text-lg text-slate-500 leading-relaxed">{section.content.text}</p>
                  <Link to={`/agencia/${tenant.slug}/p/quem-somos`} className="text-xs font-black uppercase tracking-widest text-[var(--primary)] border-b-2 border-current pb-1">Saber Mais</Link>
               </div>
            </section>
          );
          return null;
        })}
        <ContactSection tenantId={tenant.id} isWhiteLabel={true} />
      </main>

      <footer className="py-20 px-10 text-white" style={{ backgroundColor: tenant.cor_primaria }}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6">
               <h4 className="text-xl font-black uppercase tracking-tight">{tenant.nome}</h4>
               <p className="text-sm opacity-60 leading-relaxed">{tenant.slogan}</p>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Menu</p>
               <div className="flex flex-col gap-2">
                  {cms.menus.main.map(m => renderLink(m, "text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"))}
               </div>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Conformidade Legal</p>
               <div className="flex flex-col gap-2">
                  {cms.menus.footer.map(m => renderLink(m, "text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"))}
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-white/10 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">
            © {new Date().getFullYear()} {tenant.nome} • Software por ImoSuite
         </div>
      </footer>
    </div>
  );
};

export default PublicPortal;
