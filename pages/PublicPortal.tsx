
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "@firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel, CMSSection } from '../types';
import { 
  Loader2, ChevronRight, ArrowRight, Search, Menu, X, 
  Instagram, Facebook, Linkedin, MessageCircle, Star, Sparkles,
  LayoutGrid, Building2
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

  return (
    <div className="min-h-screen flex flex-col bg-white font-brand selection:bg-[var(--primary)] selection:text-white">
      <SEO title={tenant.nome} description={tenant.slogan} overrideFullTitle={true} />
      
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

      <main className="flex-1">
        {cms.homepage_sections.filter(s => s.enabled).sort((a,b) => a.order - b.order).map(section => (
          <SectionRenderer key={section.id} section={section} tenant={tenant} properties={properties} />
        ))}
        <div className="bg-slate-50 border-t border-slate-100">
          <ContactSection tenantId={tenant.id} isWhiteLabel={true} />
        </div>
      </main>

      {/* FOOTER PADRONIZADO */}
      <footer className="py-24 px-10 border-t border-slate-100 bg-slate-50">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6">
               <h4 className="text-xl font-black tracking-tighter uppercase">{tenant.nome}</h4>
               <p className="text-sm font-medium leading-relaxed opacity-50">{tenant.slogan}</p>
               
               {/* LIVRO DE RECLAMAÇÕES - VERSÃO POSITIVA (Light BG) */}
               {cms.social?.complaints_book_link && (
                 <a 
                   href={cms.social.complaints_book_link} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="block w-fit mt-8 transition-opacity hover:opacity-80"
                 >
                   <img 
                     src="https://www.livroreclamacoes.pt/assets/img/logo_reclamacoes.png" 
                     alt="Livro de Reclamações Online" 
                     className="h-10 w-auto grayscale contrast-125"
                   />
                 </a>
               )}
            </div>
            <div className="space-y-6">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Links</p>
               <div className="flex flex-col gap-3">
                  {cms.menus.main.map(m => <Link key={m.id} to={m.path} className="text-sm font-bold hover:text-[var(--primary)]">{m.label}</Link>)}
               </div>
            </div>
            <div className="space-y-6 text-right">
               <div className="flex justify-end gap-6 mb-8">
                  {cms.social?.instagram && <a href={cms.social.instagram}><Instagram size={20}/></a>}
                  {cms.social?.facebook && <a href={cms.social.facebook}><Facebook size={20}/></a>}
                  {cms.social?.whatsapp && <a href={cms.social.whatsapp}><MessageCircle size={20}/></a>}
               </div>
               <p className="text-xs font-bold opacity-40">{tenant.email}</p>
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

const SectionRenderer: React.FC<{ section: CMSSection, tenant: Tenant, properties: Imovel[] }> = ({ section, tenant, properties }) => {
  const featured = properties.filter(p => p.publicacao?.destaque).slice(0, 6);
  const recent = [...properties].sort((a,b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0)).slice(0, 3);

  switch (section.type) {
    case 'hero': return (
      <header className="relative py-40 px-10 flex items-center justify-center overflow-hidden h-[85vh]">
        <div className="absolute inset-0 z-0">
           <img src={tenant.hero_image_url || section.content.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600'} className="w-full h-full object-cover opacity-60" />
           <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/50 to-white" />
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
           <h1 className="font-black tracking-tighter mb-8 text-5xl md:text-8xl text-[#1c2d51]">{section.content.title || tenant.nome}</h1>
           <p className="text-lg md:text-xl mb-12 font-medium opacity-60 max-w-xl mx-auto">{section.content.subtitle || tenant.slogan}</p>
           <div className="p-2 bg-white rounded-3xl shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2">
              <input className="flex-1 px-8 py-4 outline-none font-bold text-slate-600" placeholder="Cidade ou Tipologia..." />
              <button className="bg-[var(--primary)] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs">Pesquisar</button>
           </div>
        </div>
      </header>
    );
    case 'featured': case 'recent':
      const list = section.type === 'featured' ? featured : recent;
      return (
        <section className="py-32 px-10 max-w-7xl mx-auto">
           <div className="flex justify-between items-end mb-16">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{section.type === 'featured' ? 'Seleção Premium' : 'Novas Entradas'}</p>
                 <h2 className="text-4xl font-black tracking-tighter uppercase">{section.content.title || (section.type === 'featured' ? 'Destaques' : 'Recentes')}</h2>
              </div>
              <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:gap-4 transition-all">Ver todos <ArrowRight size={16}/></Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {list.map(p => <ImovelCard key={p.id} imovel={p} />)}
           </div>
        </section>
      );
    case 'about_mini': return (
      <section className="py-32 px-10 bg-slate-50">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
               <img src={section.content.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-8">
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{section.content.title || 'Quem Somos'}</h2>
               <p className="text-lg font-medium leading-relaxed opacity-60">{section.content.text || 'Líderes no mercado local.'}</p>
            </div>
         </div>
      </section>
    );
    default: return null;
  }
};

export default PublicPortal;
