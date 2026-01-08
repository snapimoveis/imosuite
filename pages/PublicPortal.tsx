
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { 
  Search, MapPin, Bed, Bath, Square, Loader2, Building2, ArrowRight, 
  Heart, Instagram, Linkedin, ArrowUpRight, Menu, X, ChevronRight, 
  LayoutGrid, List, Sparkles, Filter, Quote, Camera, MessageSquare
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const PublicPortal: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        const tRef = collection(db, "tenants");
        const tQuery = query(tRef, where("slug", "==", slug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() } as Tenant;
          setTenant(tData);

          const pRef = collection(db, "tenants", tData.id, "properties");
          
          const highlightQuery = query(pRef, where("destaque", "==", true), where("publicado", "==", true), limit(9));
          let pSnap = await getDocs(highlightQuery);
          
          if (pSnap.empty) {
            const recentQuery = query(pRef, where("publicado", "==", true), orderBy("created_at", "desc"), limit(9));
            pSnap = await getDocs(recentQuery);
          }

          setProperties(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Imovel)));
        }
      } catch (err) {
        console.error("Erro ao carregar portal:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleContactClick = (e: React.MouseEvent, propertySlug: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/agencia/${tenant?.slug}/imovel/${propertySlug}?contact=true`);
  };

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200 mb-4" size={48} /><p className="font-brand font-black text-slate-400 uppercase tracking-widest text-[10px]">A sintonizar experiência...</p></div>;
  if (!tenant) return <div className="h-screen flex flex-col items-center justify-center p-10 text-center"><Building2 size={48} className="text-slate-200 mb-4"/><h2 className="text-2xl font-black text-slate-900 mb-2">Portal Indisponível</h2><Link to="/" className="text-blue-600 font-bold underline">Voltar para o ImoSuite</Link></div>;

  const templateId = tenant.template_id || 'heritage';

  // --- 1. LAYOUT HERITAGE ---
  const renderHeritage = () => (
    <div className="bg-[#FDFCFB] font-brand min-h-screen">
      <nav className="h-20 px-8 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-50">
        <span className="text-xl font-black text-[#1c2d51] tracking-tighter">{tenant.nome}</span>
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <a href="#" className="hover:text-[#1c2d51]">Início</a>
          <a href="#" className="hover:text-[#1c2d51]">Imóveis</a>
          <a href="#" className="hover:text-[#1c2d51]">Sobre</a>
        </div>
        <button className="bg-[#1c2d51] text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest">Contacto</button>
      </nav>
      <header className="py-24 px-8 text-center bg-slate-50 relative overflow-hidden border-b border-slate-100">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-[#1c2d51] mb-8 leading-tight tracking-tighter">{tenant.slogan || 'O seu próximo capítulo começa aqui.'}</h1>
          <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
             <div className="flex-1 px-6 py-4 text-left border-r border-slate-50">
                <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Onde procura?</p>
                <p className="text-sm font-bold text-[#1c2d51]">Todas as Localizações</p>
             </div>
             <button className="bg-[#1c2d51] text-white px-10 py-4 rounded-xl font-black uppercase text-xs">Pesquisar Agora</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-24 px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {properties.map(p => (
            <Link key={p.id} to={`/agencia/${tenant.slug}/imovel/${p.slug}`} className="bg-white rounded-3xl overflow-hidden border border-slate-100 group shadow-sm hover:shadow-2xl transition-all flex flex-col h-full">
              <div className="h-64 overflow-hidden relative">
                <img src={p.media[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[8px] font-black uppercase">{p.tipo_negocio}</div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-[#1c2d51] mb-4 flex-1">{p.titulo}</h3>
                <div className="flex justify-between items-center py-6 border-t border-slate-50">
                  <span className="text-xl font-black text-[#1c2d51]">{formatCurrency(p.preco || p.preco_arrendamento)}</span>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#1c2d51] group-hover:text-white transition-all"><ChevronRight size={18}/></div>
                </div>
                <button onClick={(e) => handleContactClick(e, p.slug)} className="w-full bg-slate-50 text-[#1c2d51] py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#1c2d51] hover:text-white transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={14} /> Contactar Agente
                </button>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );

  // --- 2. LAYOUT PRESTIGE ---
  const renderPrestige = () => (
    <div className="bg-[#080808] text-white font-heritage min-h-screen">
      <nav className="h-24 px-12 flex items-center justify-between absolute top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent">
        <span className="text-2xl font-bold tracking-[0.4em] uppercase italic">{tenant.nome}</span>
        <Menu className="cursor-pointer hover:opacity-50" size={32} />
      </nav>
      <header className="h-screen relative flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=2000" className="absolute inset-0 w-full h-full object-cover opacity-40 scale-110 animate-pulse-slow" />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center space-y-10 max-w-4xl px-12">
          <p className="text-xs font-black uppercase tracking-[0.8em] opacity-40">The Private Collection</p>
          <h1 className="text-7xl md:text-[9rem] font-bold leading-[0.8] tracking-tighter">{tenant.slogan || 'O Silêncio do Luxo.'}</h1>
          <div className="w-px h-32 bg-white/20 mx-auto"></div>
        </div>
      </header>
      <main className="py-40">
        <div className="max-w-screen-2xl mx-auto px-12 space-y-60">
           {properties.map((p, idx) => (
             <Link key={p.id} to={`/agencia/${tenant.slug}/imovel/${p.slug}`} className={`group flex flex-col ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-20 items-center`}>
                <div className="flex-1 aspect-[16/10] overflow-hidden bg-white/5 relative">
                   <img src={p.media[0]?.url || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                   <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 transition-all"></div>
                </div>
                <div className="flex-1 space-y-8">
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">{p.concelho} &bull; {p.tipologia}</span>
                   <h3 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">{p.titulo}</h3>
                   <p className="text-white/40 text-xl italic font-light max-w-md">Uma residência singular que redefine os limites da arquitetura contemporânea.</p>
                   <div className="pt-10 flex items-center gap-10">
                      <span className="text-4xl font-bold">{formatCurrency(p.preco || p.preco_arrendamento)}</span>
                      <button onClick={(e) => handleContactClick(e, p.slug)} className="p-4 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all">
                        <MessageSquare size={24} />
                      </button>
                      <ArrowUpRight size={40} strokeWidth={1} className="text-white/20 group-hover:text-white transition-all group-hover:translate-x-4" />
                   </div>
                </div>
             </Link>
           ))}
        </div>
      </main>
    </div>
  );

  // --- 3. LAYOUT SKYLINE ---
  const renderSkyline = () => (
    <div className="bg-slate-50 font-brand min-h-screen text-slate-900">
      <nav className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">S</div>
          <span className="font-black text-lg tracking-tighter">{tenant.nome}</span>
        </div>
        <div className="flex items-center gap-6">
           <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20">Entrar em Contacto</button>
        </div>
      </nav>
      <header className="bg-white border-b border-slate-100 px-6 py-16">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full">
                  <Sparkles size={12}/> Novidades no Mercado
               </div>
               <h1 className="text-6xl font-black text-slate-900 leading-none tracking-tighter">{tenant.slogan || 'Encontre a sua base na cidade.'}</h1>
               <div className="flex gap-2">
                  <input type="text" placeholder="Código Postal ou Bairro..." className="flex-1 bg-slate-100 border-none rounded-xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <button className="bg-slate-900 text-white px-8 rounded-xl font-black uppercase text-xs">Ir</button>
               </div>
            </div>
            <div className="flex-1 hidden md:block">
               <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800" className="rounded-[2.5rem] shadow-2xl rotate-2" />
            </div>
         </div>
      </header>
      <main className="max-w-7xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {properties.map(p => (
             <Link key={p.id} to={`/agencia/${tenant.slug}/imovel/${p.slug}`} className="bg-white rounded-2xl p-3 border border-slate-200 hover:border-blue-500 hover:shadow-2xl transition-all group flex flex-col">
                <div className="aspect-square rounded-xl overflow-hidden mb-4 relative">
                   <img src={p.media[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                   <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm font-black text-blue-600 text-xs">{formatCurrency(p.preco || p.preco_arrendamento)}</div>
                </div>
                <div className="px-2 space-y-1 flex-1">
                   <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{p.concelho}</p>
                   <h3 className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{p.titulo}</h3>
                   <div className="flex gap-4 pt-3 text-[10px] font-bold text-slate-400">
                      <span className="flex items-center gap-1"><Bed size={12}/> {p.quartos}</span>
                      <span className="flex items-center gap-1"><Square size={12}/> {p.area_util_m2}m²</span>
                   </div>
                </div>
                <button onClick={(e) => handleContactClick(e, p.slug)} className="mt-4 w-full bg-slate-50 text-[#1c2d51] py-2 rounded-lg font-black text-[9px] uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                  <MessageSquare size={12} /> Contactar Agente
                </button>
             </Link>
           ))}
        </div>
      </main>
    </div>
  );

  // --- 4. LAYOUT LUXE ---
  const renderLuxe = () => (
    <div className="bg-[#FAF9F6] text-[#2D2926] font-heritage min-h-screen">
      <nav className="h-24 px-12 flex items-center justify-between bg-transparent absolute top-0 w-full z-50">
        <Link to={`/agencia/${tenant.slug}`} className="text-2xl font-bold tracking-widest italic">{tenant.nome}</Link>
        <button className="text-[10px] font-black uppercase tracking-[0.4em] border-b border-[#2D2926] pb-1 hover:opacity-50">Privado</button>
      </nav>
      <header className="h-[90vh] relative flex items-center px-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-3/4 h-full">
           <img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=2000" className="w-full h-full object-cover opacity-80" />
           <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/20 to-transparent"></div>
        </div>
        <div className="max-w-4xl relative z-10 space-y-12">
           <div className="flex items-center gap-6 text-[#2D2926]/40 text-[9px] font-black uppercase tracking-[0.6em]"><div className="w-12 h-px bg-[#2D2926]/20"></div> Curadoria de Espaços</div>
           <h1 className="text-8xl md:text-[10rem] font-bold leading-[0.8] tracking-tighter">
             {tenant.slogan?.split(' ').slice(0, 2).join(' ') || 'Espaços'} <br/> 
             <span className="italic font-light opacity-60 ml-32">{tenant.slogan?.split(' ').slice(2).join(' ') || 'com Alma.'}</span>
           </h1>
           <p className="text-2xl italic text-[#2D2926]/60 max-w-lg leading-relaxed">Não vendemos casas. Oferecemos o cenário onde a sua vida será contada com beleza.</p>
        </div>
      </header>
      <main className="py-60 px-12">
        <div className="max-w-7xl mx-auto space-y-80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-32 items-start">
            {properties.map((p, idx) => (
              <Link key={p.id} to={`/agencia/${tenant.slug}/imovel/${p.slug}`} className={`group flex flex-col ${idx % 2 === 1 ? 'md:mt-60' : ''}`}>
                 <div className="aspect-[3/4] rounded-[4rem] overflow-hidden shadow-2xl relative mb-12">
                    <img src={p.media[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s]" />
                 </div>
                 <div className="px-6 space-y-6">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.5em] text-[#2D2926]/30"><span>{p.concelho} &bull; {p.tipologia}</span> <Heart size={14}/></div>
                    <h3 className="text-5xl font-bold tracking-tighter leading-tight group-hover:translate-x-4 transition-transform duration-700">{p.titulo}</h3>
                    <div className="pt-10 border-t border-[#2D2926]/5 flex justify-between items-center">
                       <span className="text-3xl font-bold">{formatCurrency(p.preco || p.preco_arrendamento)}</span>
                       <button onClick={(e) => handleContactClick(e, p.slug)} className="text-[10px] font-black uppercase tracking-widest italic border-b border-[#2D2926]/20 pb-1 hover:border-[#2D2926] transition-all">Solicitar Contacto</button>
                    </div>
                 </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );

  const renderTemplate = () => {
    switch (templateId) {
      case 'prestige': return renderPrestige();
      case 'skyline': return renderSkyline();
      case 'luxe': return renderLuxe();
      case 'heritage':
      default: return renderHeritage();
    }
  };

  return renderTemplate();
};

export default PublicPortal;
