import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// Modular Firestore imports for tenant and property lookup
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tenant, Imovel, CMSSection, MenuItem } from '../types';
import { 
  Loader2, Building2, ChevronRight, Mail, Phone, 
  ArrowRight, Search, Star, MapPin, Bed, Bath, Square, 
  Zap, ArrowUpRight, Instagram, Facebook, Linkedin, Home, Menu, X
} from 'lucide-react';
import ImovelCard from '../components/ImovelCard';
import { formatCurrency } from '../lib/utils';
import { DEFAULT_TENANT_CMS } from '../constants';

const PublicPortal: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        const tQuery = query(collection(db, "tenants"), where("slug", "==", slug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          
          // Injeção de Identidade Visual Dinâmica
          const root = document.documentElement;
          root.style.setProperty('--primary', tData.cor_primaria);
          root.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);

          // Carregamento isolado de Imóveis deste Tenant
          const pRef = collection(db, "tenants", tData.id, "properties");
          const pSnap = await getDocs(pRef);
          const allProps = pSnap.docs.map(doc => ({ 
            id: doc.id, 
            tenant_id: tData.id,
            ...(doc.data() as any) 
          } as Imovel));
          
          setProperties(allProps.filter(p => p.publicacao?.publicar_no_site === true));
        }
      } catch (err) {
        console.error("Portal Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const resolvePath = (path: string) => {
    if (!tenant) return '/';
    if (path.startsWith('http')) return path;
    if (path === '/') return `/agencia/${tenant.slug}`;
    // Garante que o link interno comece com /agencia/slug
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/agencia/${tenant.slug}${cleanPath}`;
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-200 mb-4" size={48} />
      <p className="font-brand font-black text-slate-400 uppercase tracking-widest text-[10px]">A carregar site da agência...</p>
    </div>
  );

  if (!tenant) return <div className="h-screen flex flex-col items-center justify-center p-10 font-brand"> <Building2 size={48} className="text-slate-100 mb-4"/> <h2 className="text-xl font-black text-slate-800 tracking-tighter">Site indisponível ou em manutenção.</h2> </div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  const template = tenant.template_id || 'heritage';

  return (
    <div className={`selection:bg-[var(--primary)] selection:text-white min-h-screen flex flex-col ${getTemplateFont(template)} ${template === 'prestige' ? 'bg-[#080808] text-white' : 'bg-white text-slate-900'}`}>
      
      {/* NAVBAR DINÂMICA */}
      <nav className={`h-20 px-8 flex items-center justify-between sticky top-0 z-50 transition-all ${template === 'prestige' ? 'bg-black/90 border-b border-white/5' : 'bg-white/95 border-b border-slate-50'} backdrop-blur-xl`}>
         <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} className="h-8 md:h-10 w-auto object-contain" alt={tenant.nome} />
            ) : (
              <span className={`text-xl font-black tracking-tighter uppercase ${template === 'prestige' ? 'italic' : ''}`}>{tenant.nome}</span>
            )}
         </Link>

         <div className="hidden md:flex gap-10">
            {cms.menus.main.map((m: MenuItem) => (
              <Link key={m.id} to={resolvePath(m.path)} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-[var(--primary)] ${template === 'prestige' ? 'text-white/40' : 'text-slate-400'}`}>{m.label}</Link>
            ))}
         </div>

         <div className="flex items-center gap-4">
            <button className={`bg-[var(--primary)] text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--primary)]/20 hover:scale-105 transition-all`}>Contactar</button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-400"><Menu/></button>
         </div>
      </nav>

      {/* RENDERIZADOR DE HOMEPAGE CMS */}
      <main className="flex-1">
        {cms.homepage_sections
          .filter(s => s.enabled)
          .sort((a,b) => a.order - b.order)
          .map((section: CMSSection) => (
            <SectionRenderer 
              key={section.id} 
              section={section} 
              tenant={tenant} 
              properties={properties} 
              template={template}
            />
          ))
        }
      </main>

      {/* FOOTER CMS */}
      <footer className={`py-24 px-10 border-t ${template === 'prestige' ? 'bg-[#050505] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
            <div className="md:col-span-2 space-y-6">
               <h4 className={`text-2xl font-black tracking-tighter ${template === 'prestige' ? 'italic' : ''}`}>{tenant.nome}</h4>
               <p className={`text-sm font-medium leading-relaxed max-w-sm ${template === 'prestige' ? 'text-white/40' : 'text-slate-400'}`}>{tenant.slogan}</p>
               <div className="flex gap-4">
                  {cms.social.facebook && <Facebook size={18} className="text-slate-300 hover:text-[var(--primary)] cursor-pointer" />}
                  {cms.social.instagram && <Instagram size={18} className="text-slate-300 hover:text-[var(--primary)] cursor-pointer" />}
                  {cms.social.linkedin && <Linkedin size={18} className="text-slate-300 hover:text-[var(--primary)] cursor-pointer" />}
               </div>
            </div>
            <div className="space-y-6">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Páginas</p>
               <div className="flex flex-col gap-3">
                  {cms.menus.footer.map(m => (
                    <Link key={m.id} to={resolvePath(m.path)} className={`text-xs font-bold transition-colors hover:text-[var(--primary)] ${template === 'prestige' ? 'text-white/60' : 'text-slate-600'}`}>{m.label}</Link>
                  ))}
               </div>
            </div>
            <div className="space-y-6 text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Suporte</p>
               <div className="text-xs font-bold text-slate-400 space-y-2">
                  <p>{tenant.email}</p>
                  <p>{tenant.telefone}</p>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-200/10 text-center">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">Powered by ImoSuite SaaS</span>
         </div>
      </footer>

      {/* MOBILE NAV */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white p-10 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-top duration-300 md:hidden">
           <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-slate-400"><X size={32}/></button>
           {cms.menus.main.map(m => (
             <Link key={m.id} to={resolvePath(m.path)} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-[#1c2d51]">{m.label}</Link>
           ))}
        </div>
      )}
    </div>
  );
};

const SectionRenderer: React.FC<{ section: CMSSection, tenant: Tenant, properties: Imovel[], template: string }> = ({ section, tenant, properties, template }) => {
  const featured = properties.filter(p => p.publicacao?.destaque).slice(0, 6);

  switch (section.type) {
    case 'hero': return (
      <header className={`relative flex items-center justify-center overflow-hidden ${template === 'prestige' ? 'h-[100vh]' : 'py-32 px-10'}`}>
        {template === 'prestige' && <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20 z-10" />}
        {template === 'prestige' && (
          <img src={tenant.hero_image_url || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600'} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 -z-0" alt="Hero" />
        )}
        
        <div className="relative z-20 text-center max-w-5xl mx-auto">
           {template === 'luxe' && <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)] mb-6 opacity-60">Real Estate Curation</p>}
           <h1 className={`font-black tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 ${template === 'prestige' ? 'text-8xl md:text-[10rem] italic leading-[0.85]' : 'text-6xl md:text-8xl leading-[0.95] text-[#1c2d51]'}`}>
              {section.content.title || tenant.nome}
           </h1>
           <p className={`text-lg mb-12 max-w-xl mx-auto font-medium leading-relaxed ${template === 'prestige' ? 'text-white/50 uppercase tracking-[0.4em]' : 'text-slate-400'}`}>
              {section.content.subtitle || tenant.slogan}
           </p>
           
           <div className={`p-2 rounded-2xl shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2 border ${template === 'prestige' ? 'bg-white/10 backdrop-blur-xl border-white/10' : 'bg-white border-slate-100'}`}>
              <div className="flex-1 px-8 py-4 text-left flex items-center gap-3">
                 <Search size={18} className="text-slate-400" />
                 <input className={`flex-1 bg-transparent border-none outline-none font-bold text-sm ${template === 'prestige' ? 'text-white placeholder:text-white/30' : 'text-slate-600'}`} placeholder="Cidade, Bairro ou Ref..." />
              </div>
              <button className="bg-[var(--primary)] text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all">Pesquisar</button>
           </div>
        </div>
      </header>
    );

    case 'featured': return (
      <section className={`py-32 px-10 max-w-7xl mx-auto ${template === 'prestige' ? 'border-t border-white/5' : ''}`}>
         <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{template === 'prestige' ? 'Private Selection' : 'Oportunidades'}</p>
               <h2 className={`text-4xl md:text-5xl font-black tracking-tighter ${template === 'prestige' ? 'italic' : 'text-[#1c2d51]'}`}>{section.content.title || 'Destaques'}</h2>
            </div>
            <Link to={`/agencia/${tenant.slug}/imoveis`} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:gap-3 ${template === 'prestige' ? 'text-white/40 hover:text-white' : 'text-[#1c2d51]'}`}>Ver Portefólio Completo <ArrowRight size={16}/></Link>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {featured.map(p => <ImovelCard key={p.id} imovel={p} />)}
         </div>
      </section>
    );

    case 'cta': return (
      <section className="max-w-7xl mx-auto py-24 px-10">
         <div className={`rounded-[4rem] p-16 md:p-24 text-center shadow-2xl relative overflow-hidden ${template === 'prestige' ? 'bg-white text-black' : 'bg-[#1c2d51] text-white'}`}>
            <div className="relative z-10 max-w-2xl mx-auto">
               <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8">{section.content.title || 'Pronto para o próximo passo?'}</h2>
               <p className={`text-lg font-medium mb-12 opacity-70 ${template === 'prestige' ? 'text-black/60' : 'text-slate-300'}`}>{section.content.subtitle}</p>
               <button className={`px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all ${template === 'prestige' ? 'bg-black text-white' : 'bg-white text-[#1c2d51]'}`}>
                  {section.content.button_text || 'Contactar Agente'}
               </button>
            </div>
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 ${template === 'prestige' ? 'bg-black/5' : 'bg-blue-400/20'}`} />
         </div>
      </section>
    );

    case 'about_mini': return (
      <section className={`py-32 px-10 ${template === 'prestige' ? 'bg-[#0c0c0c]' : 'bg-slate-50'}`}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className={`aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl ${template === 'prestige' ? 'grayscale opacity-60' : ''}`}>
               <img src={tenant.hero_image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'} className="w-full h-full object-cover" alt="Agência" />
            </div>
            <div className="space-y-8">
               <h2 className={`text-4xl md:text-6xl font-black tracking-tighter ${template === 'prestige' ? 'italic' : 'text-[#1c2d51]'}`}>{section.content.title || 'Sobre a Agência'}</h2>
               <p className={`text-lg font-medium leading-relaxed ${template === 'prestige' ? 'text-white/40' : 'text-slate-500'}`}>{section.content.text || 'Líderes no mercado local com anos de experiência em realizar sonhos.'}</p>
               <div className="flex gap-4">
                  <div className="bg-[var(--primary)] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Saiba Mais</div>
               </div>
            </div>
         </div>
      </section>
    );

    default: return null;
  }
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

export default PublicPortal;