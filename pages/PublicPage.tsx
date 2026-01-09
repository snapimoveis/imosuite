
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
/* Fixed modular Firestore imports */
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, CMSPage, MenuItem } from '../types';
import { Loader2, Building2, ChevronLeft, Menu, X, Facebook, Instagram, Linkedin } from 'lucide-react';

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
        const tQuery = query(collection(db, "tenants"), where("slug", "==", slug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          
          const p = tData.cms?.pages?.find(p => p.slug === pageSlug);
          if (p) setPage(p);

          const root = document.documentElement;
          root.style.setProperty('--primary', tData.cor_primaria);
          root.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, pageSlug]);

  const resolvePath = (path: string) => {
    if (!tenant) return '/';
    if (path.startsWith('http')) return path;
    if (path === '/') return `/agencia/${tenant.slug}`;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/agencia/${tenant.slug}${cleanPath}`;
  };

  const getTemplateFont = (id: string) => {
    switch (id) {
      case 'heritage': return 'font-heritage';
      case 'canvas': return 'font-brand';
      case 'prestige': return 'font-brand tracking-tight';
      case 'skyline': return 'font-brand';
      case 'luxe': return 'font-heritage';
      default: return 'font-brand';
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-200" size={48} />
    </div>
  );

  if (!tenant || !page) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 font-brand"> 
      <Building2 size={48} className="text-slate-100 mb-4"/> 
      <h2 className="text-xl font-black text-slate-800 tracking-tighter">Página não encontrada.</h2> 
      <Link to={tenant ? `/agencia/${tenant.slug}` : "/"} className="text-blue-500 mt-4 font-bold underline">Voltar ao Início</Link>
    </div>
  );

  const template = tenant.template_id || 'heritage';

  return (
    <div className={`min-h-screen flex flex-col ${getTemplateFont(template)} ${template === 'prestige' ? 'bg-[#080808] text-white' : 'bg-white text-slate-900'} selection:bg-[var(--primary)] selection:text-white`}>
      
      {/* NAVBAR TEMPLATE-AWARE */}
      <nav className={`h-20 px-8 flex items-center justify-between border-b sticky top-0 z-50 transition-all ${template === 'prestige' ? 'bg-black/90 border-white/5' : 'bg-white/95 border-slate-50'} backdrop-blur-xl`}>
        <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} className="h-8 md:h-10 w-auto object-contain" alt={tenant.nome} />
            ) : (
              <span className={`text-xl font-black tracking-tighter uppercase ${template === 'prestige' ? 'italic' : ''}`}>{tenant.nome}</span>
            )}
        </Link>
        <div className="hidden md:flex gap-10">
           {tenant.cms.menus.main.map((m: MenuItem) => (
             <Link key={m.id} to={resolvePath(m.path)} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-[var(--primary)] ${template === 'prestige' ? 'text-white/40' : 'text-slate-400'}`}>{m.label}</Link>
           ))}
        </div>
        <div className="flex items-center gap-4">
            <button className={`bg-[var(--primary)] text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--primary)]/20 hover:scale-105 transition-all`}>Contactar</button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-400"><Menu/></button>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
         <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-[var(--primary)] mb-12 transition-all">
            <ChevronLeft size={16}/> Voltar ao Início
         </Link>
         
         <h1 className={`text-5xl md:text-7xl font-black tracking-tighter mb-16 ${template === 'prestige' ? 'italic' : 'text-[#1c2d51]'}`}>
           {page.title}
         </h1>

         <div className={`prose prose-lg max-w-none ${template === 'prestige' ? 'prose-invert' : 'prose-slate'}`}>
            <div className={`font-medium leading-relaxed whitespace-pre-line text-lg ${template === 'prestige' ? 'text-white/70' : 'text-slate-600'}`}>
               {page.content_md}
            </div>
         </div>
      </main>

      {/* FOOTER TEMPLATE-AWARE */}
      <footer className={`py-24 px-10 border-t ${template === 'prestige' ? 'bg-[#050505] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
         <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
               <h4 className={`text-2xl font-black tracking-tighter ${template === 'prestige' ? 'italic' : ''}`}>{tenant.nome}</h4>
               <p className={`text-sm font-medium leading-relaxed max-w-xs ${template === 'prestige' ? 'text-white/40' : 'text-slate-400'}`}>{tenant.slogan}</p>
            </div>
            <div className="flex flex-col md:items-end gap-6">
               <div className="flex gap-6">
                  {tenant.cms.social.facebook && <Facebook size={18} className="text-slate-300 hover:text-[var(--primary)] cursor-pointer" />}
                  {tenant.cms.social.instagram && <Instagram size={18} className="text-slate-300 hover:text-[var(--primary)] cursor-pointer" />}
                  {tenant.cms.social.linkedin && <Linkedin size={18} className="text-slate-300 hover:text-[var(--primary)] cursor-pointer" />}
               </div>
               <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">© {new Date().getFullYear()} {tenant.nome}</span>
            </div>
         </div>
      </footer>

      {/* MOBILE NAV TEMPLATE-AWARE */}
      {isMenuOpen && (
        <div className={`fixed inset-0 z-[100] p-10 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-top duration-300 md:hidden ${template === 'prestige' ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>
           <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-slate-400"><X size={32}/></button>
           {tenant.cms.menus.main.map(m => (
             <Link key={m.id} to={resolvePath(m.path)} onClick={() => setIsMenuOpen(false)} className={`text-2xl font-black transition-colors hover:text-[var(--primary)] ${template === 'prestige' ? 'text-white' : 'text-[#1c2d51]'}`}>{m.label}</Link>
           ))}
           <button className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-black uppercase text-sm tracking-widest mt-8 shadow-xl">Contactar</button>
        </div>
      )}
    </div>
  );
};

export default PublicPage;