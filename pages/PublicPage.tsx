import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, CMSPage } from '../types';
import { Loader2, Menu, X, Building2, ChevronLeft } from 'lucide-react';
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
        if (slug === 'demo-imosuite') tData = DEFAULT_TENANT;
        else {
          const tSnap = await getDocs(query(collection(db, "tenants"), where("slug", "==", slug), limit(1)));
          if (!tSnap.empty) tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
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
  if (!tenant || !page) return <div className="h-screen flex flex-col items-center justify-center p-10 font-brand"><Building2 size={48} className="text-slate-100 mb-4"/><h2 className="text-xl font-black">Página não encontrada.</h2><Link to={`/agencia/${slug}`} className="text-blue-500 mt-4 underline">Voltar</Link></div>;

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
    heritage: { nav: "h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-50", footer: "bg-[#1c2d51] text-white py-20 px-10", heading: "font-heritage italic text-[#1c2d51]" },
    canvas: { nav: "h-24 bg-white/80 backdrop-blur-md border-b border-slate-50 flex items-center justify-between px-10 sticky top-0 z-50", footer: "bg-slate-50 text-[#1c2d51] py-20 px-10 border-t border-slate-100", heading: "font-black tracking-tight" },
    prestige: { nav: "h-20 bg-black text-white flex items-center justify-between px-10 sticky top-0 z-50", footer: "bg-neutral-950 text-white/60 py-20 px-10", heading: "font-black italic uppercase" },
    skyline: { nav: "h-20 bg-[#2563eb] text-white flex items-center justify-between px-10 sticky top-0 z-50", footer: "bg-[#1c2d51] text-white py-20 px-10", heading: "font-black uppercase" },
    luxe: { nav: "h-28 bg-[#FDFBF7] flex items-center justify-between px-10 sticky top-0 z-50", footer: "bg-[#2D2926] text-[#EAE3D9] py-20 px-10", heading: "font-serif italic" }
  };
  const s = styles[tid] || styles.heritage;

  return (
    <div className={`min-h-screen flex flex-col bg-white selection:bg-[var(--primary)] font-brand`}>
      <SEO title={`${page.title} - ${tenant.nome}`} overrideFullTitle={true} />
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`}>
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto" alt={tenant.nome} /> : <span className="text-xl font-black">{tenant.nome}</span>}
         </Link>
         <div className="hidden lg:flex gap-8">
            {cms.menus.main.map(m => renderLink(m, "text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"))}
         </div>
         <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2"><Menu size={28} /></button>
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

      <main className="flex-1 w-full animate-in fade-in py-16 md:py-24">
         <div className="max-w-4xl mx-auto px-6">
            <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all mb-10"><ChevronLeft size={16}/> Voltar</Link>
            <h1 className={`text-4xl md:text-7xl leading-tight mb-12 ${s.heading}`}>{page.title}</h1>
            <div className="prose prose-slate max-w-none text-lg leading-relaxed whitespace-pre-line text-slate-600 font-medium">
               {page.content_md}
            </div>
         </div>
         {pageSlug === 'contactos' && <div className="mt-24 bg-slate-50"><ContactSection tenantId={tenant.id} isWhiteLabel={true} /></div>}
      </main>

      <footer className={s.footer}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6"><h4 className="text-xl font-black uppercase">{tenant.nome}</h4><p className="text-sm opacity-60 leading-relaxed">{tenant.slogan}</p></div>
            <div className="space-y-4"><p className="text-[10px] font-black uppercase tracking-widest opacity-40">Navegação</p><div className="flex flex-col gap-2">{cms.menus.main.map(m => renderLink(m, "text-sm font-bold opacity-70 hover:opacity-100"))}</div></div>
            <div className="space-y-4"><p className="text-[10px] font-black uppercase tracking-widest opacity-40">Conformidade</p><div className="flex flex-col gap-2">{cms.menus.footer.map(m => renderLink(m, "text-sm font-bold opacity-70 hover:opacity-100"))}</div></div>
         </div>
      </footer>
    </div>
  );
};

export default PublicPage;