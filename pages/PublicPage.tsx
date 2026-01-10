
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "@firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, CMSPage } from '../types';
import { Loader2, Building2, ChevronLeft, Menu, X, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { DEFAULT_TENANT_CMS } from '../constants';

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
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug, pageSlug]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!tenant || !page) return <div className="h-screen flex flex-col items-center justify-center p-10 font-brand"><Building2 size={48} className="text-slate-100 mb-4"/><h2 className="text-xl font-black text-slate-800 tracking-tighter">Página não encontrada.</h2><Link to="/" className="text-blue-500 mt-4 font-bold underline">Voltar</Link></div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;

  return (
    <div className="min-h-screen flex flex-col bg-white font-brand selection:bg-[var(--primary)] selection:text-white">
      <SEO title={`${page.title} - ${tenant.nome}`} overrideFullTitle={true} />
      
      {/* NAVBAR PADRONIZADA */}
      <nav className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-50">
         <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" /> : <span className="font-black text-xl uppercase tracking-tighter text-[var(--primary)]">{tenant.nome}</span>}
         </Link>
         <div className="hidden md:flex gap-10">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={m.path === '/' ? `/agencia/${tenant.slug}` : `/agencia/${tenant.slug}/p/${m.path.replace('/', '')}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[var(--primary)] transition-colors">{m.label}</Link>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <button className="bg-[var(--primary)] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105">Contactar</button>
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-slate-400"><Menu/></button>
         </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full animate-in fade-in duration-500">
         <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-[var(--primary)] mb-12">
            <ChevronLeft size={16}/> Início
         </Link>
         <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-16 text-[#1c2d51]">{page.title}</h1>
         <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-line text-lg">
           {page.content_md}
         </div>
      </main>

      {/* FOOTER PADRONIZADO */}
      <footer className="py-24 px-10 border-t border-slate-100 bg-slate-50">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6">
               <h4 className="text-xl font-black tracking-tighter uppercase">{tenant.nome}</h4>
               <p className="text-sm font-medium leading-relaxed opacity-50">{tenant.slogan}</p>
            </div>
            <div className="space-y-6 text-right">
               <div className="flex justify-end gap-6 mb-8">
                  {cms.social?.instagram && <a href={cms.social.instagram}><Instagram size={20}/></a>}
                  {cms.social?.facebook && <a href={cms.social.facebook}><Facebook size={20}/></a>}
                  {cms.social?.whatsapp && <a href={cms.social.whatsapp}><MessageCircle size={20}/></a>}
               </div>
               <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20 block pt-10">© {new Date().getFullYear()} {tenant.nome} • Powered by ImoSuite</span>
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
