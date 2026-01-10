
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// Fix: Using @firebase/firestore to resolve missing modular exports
import { collection, query, where, getDocs, limit } from "@firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel, CMSSection, MenuItem } from '../types';
import { 
  Loader2, Building2, ChevronRight, Mail, Phone, 
  ArrowRight, Search, Star, MapPin, Bed, Bath, Square, 
  Zap, ArrowUpRight, Instagram, Facebook, Linkedin, Home, Menu, X, MessageCircle
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
          const root = document.documentElement;
          root.style.setProperty('--primary', DEFAULT_TENANT.cor_primaria);
          root.style.setProperty('--secondary', DEFAULT_TENANT.cor_secundaria);
          setLoading(false);
        }, 800);
        return;
      }

      try {
        const tQuery = query(collection(db, "tenants"), where("slug", "==", slug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          
          const root = document.documentElement;
          root.style.setProperty('--primary', tData.cor_primaria);
          root.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);

          const pRef = collection(db, "tenants", tData.id, "properties");
          const pSnap = await getDocs(pRef);
          const allProps = pSnap.docs.map(propertyDoc => ({ 
            id: propertyDoc.id, 
            tenant_id: tData.id,
            ...(propertyDoc.data() as any) 
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
    
    // Se o path corresponder a uma página do CMS, redirecionamos para /p/
    const isCMSPage = tenant.cms?.pages?.some(p => p.slug === path.replace('/', ''));
    const prefix = isCMSPage ? '/p' : '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `/agencia/${tenant.slug}${prefix}${cleanPath}`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!tenant) return <div className="h-screen flex items-center justify-center font-brand font-black uppercase text-slate-300">Agência não encontrada</div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  const template = tenant.template_id || 'heritage';

  return (
    <div className={`min-h-screen flex flex-col ${template === 'prestige' ? 'bg-[#050505] text-white' : 'bg-white text-slate-900'} font-brand selection:bg-[var(--primary)] selection:text-white`}>
      <SEO 
        title={tenant.nome} 
        description={tenant.slogan || `Consulte os melhores imóveis da ${tenant.nome}. Especialistas em imobiliário em Portugal.`}
        overrideFullTitle={true}
      />
      
      <nav className={`h-20 px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl border-b ${template === 'prestige' ? 'bg-black/80 border-white/5' : 'bg-white/95 border-slate-50'}`}>
         <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" /> : <span className="font-black text-xl uppercase tracking-tighter text-[var(--primary)]">{tenant.nome}</span>}
         </Link>
         <div className="hidden md:flex gap-10">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={resolvePath(m.path)} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-[var(--primary)] ${template === 'prestige' ? 'text-white/40' : 'text-slate-400'}`}>{m.label}</Link>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <button className="bg-[var(--primary)] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105">Contactar</button>
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-slate-400"><Menu/></button>
         </div>
      </nav>

      <main className="flex-1">
        {cms.homepage_sections
          .filter(s => s.enabled && s.type !== 'services') // Ignorar secção services se existir no CMS para evitar duplicados
          .sort((a,b) => a.order - b.order)
          .map((section: CMSSection) => (
            <SectionRenderer key={section.id} section={section} tenant={tenant} properties={properties} template={template} />
          ))
        }

        {/* Formulário Padrão Institucional - Sempre visível no final de todas as templates */}
        <div className="bg-slate-50 border-t border-slate-100">
          <ContactSection 
            tenantId={tenant.id} 
            title="Fale Connosco" 
            subtitle="Estamos disponíveis para o ajudar a encontrar o investimento ideal ou vender o seu imóvel pelo melhor valor."
            isWhiteLabel={true}
          />
        </div>
      </main>

      <footer className={`py-24 px-10 border-t ${template === 'prestige' ? 'bg-black border-white/5' : 'bg-slate-50 border-slate-100'}`}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6">
               <h4 className="text-xl font-black tracking-tighter uppercase">{tenant.nome}</h4>
               <p className="text-sm font-medium leading-relaxed opacity-50">{tenant.slogan}</p>
            </div>
            <div className="space-y-6">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Links Rápidos</p>
               <div className="flex flex-col gap-3">
                  {cms.menus.main.map(m => <Link key={m.id} to={resolvePath(m.path)} className="text-sm font-bold hover:text-[var(--primary)] transition-colors">{m.label}</Link>)}
               </div>
            </div>
            <div className="space-y-6 text-right">
               <div className="flex justify-end gap-6 mb-8">
                  {cms.social?.instagram && <a href={cms.social.instagram} target="_blank"><Instagram size={20}/></a>}
                  {cms.social?.facebook && <a href={cms.social.facebook} target="_blank"><Facebook size={20}/></a>}
                  {cms.social?.linkedin && <a href={cms.social.linkedin} target="_blank"><Linkedin size={20}/></a>}
                  {cms.social?.whatsapp && <a href={cms.social.whatsapp} target="_blank"><MessageCircle size={20}/></a>}
               </div>
               <p className="text-xs font-bold opacity-40">{tenant.email} • {tenant.telefone}</p>
            </div>
         </div>
      </footer>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black p-10 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-top duration-300">
           <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white"><X size={32}/></button>
           {cms.menus.main.map(m => <Link key={m.id} to={resolvePath(m.path)} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-white">{m.label}</Link>)}
        </div>
      )}
    </div>
  );
};

const SectionRenderer: React.FC<{ section: CMSSection, tenant: Tenant, properties: Imovel[], template: string }> = ({ section, tenant, properties, template }) => {
  const featured = properties.filter(p => p.publicacao?.destaque).slice(0, 6);
  const recent = [...properties].sort((a,b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0)).slice(0, 4);

  switch (section.type) {
    case 'hero': return (
      <header className={`relative py-40 px-10 flex items-center justify-center overflow-hidden ${template === 'prestige' ? 'h-screen' : ''}`}>
        <div className="absolute inset-0 z-0">
           <img 
              src={tenant.hero_image_url || section.content.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600'} 
              className={`w-full h-full object-cover ${template === 'prestige' ? 'opacity-40 grayscale' : 'opacity-60'}`} 
           />
           <div className={`absolute inset-0 ${template === 'prestige' ? 'bg-gradient-to-b from-black via-transparent to-black' : 'bg-gradient-to-b from-white/20 via-white/50 to-white'}`} />
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
           <h1 className={`font-black tracking-tighter mb-8 ${template === 'prestige' ? 'text-7xl md:text-9xl uppercase italic' : 'text-5xl md:text-8xl text-[#1c2d51]'}`}>{section.content.title || tenant.nome}</h1>
           <p className="text-lg md:text-xl mb-12 font-medium opacity-60 max-w-xl mx-auto">{section.content.subtitle || tenant.slogan}</p>
           <div className="p-2 bg-white rounded-3xl shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2">
              <input className="flex-1 px-8 py-4 outline-none font-bold text-slate-600" placeholder="Pesquisar imóveis..." />
              <button className="bg-[var(--primary)] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs">Pesquisar</button>
           </div>
        </div>
      </header>
    );

    case 'featured':
    case 'recent':
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
      <section className={`py-32 px-10 ${template === 'prestige' ? 'bg-[#080808]' : 'bg-slate-50'}`}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
               <img src={section.content.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-8">
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{section.content.title || 'Quem Somos'}</h2>
               <p className="text-lg font-medium leading-relaxed opacity-60">{section.content.text || 'Líderes no mercado local.'}</p>
               <button className="bg-[var(--primary)] text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase">Conhecer Agência</button>
            </div>
         </div>
      </section>
    );

    case 'cta': return (
      <section className="max-w-7xl mx-auto py-24 px-10">
         <div className="bg-[#1c2d51] rounded-[4rem] p-24 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
               <h2 className="text-5xl font-black tracking-tighter mb-8">{section.content.title || 'Valorize o seu património'}</h2>
               <button className="bg-white text-[#1c2d51] px-12 py-6 rounded-2xl font-black uppercase text-sm">{section.content.button_text || 'Solicitar Avaliação'}</button>
            </div>
         </div>
      </section>
    );

    default: return null;
  }
};

export default PublicPortal;
