
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { 
  Search, MapPin, Bed, Bath, Square, Loader2, Building2, ArrowRight, 
  Heart, Instagram, Linkedin, ArrowUpRight, Menu, X, ChevronRight, 
  LayoutGrid, List, Sparkles, Filter
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

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
        const tRef = collection(db, "tenants");
        const tQuery = query(tRef, where("slug", "==", slug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() } as Tenant;
          setTenant(tData);

          const pRef = collection(db, "tenants", tData.id, "properties");
          const pQuery = query(pRef, orderBy("created_at", "desc"));
          const pSnap = await getDocs(pQuery);
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

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200 mb-4" size={48} /><p className="font-brand font-black text-slate-400 uppercase tracking-widest text-[10px]">A carregar ecossistema...</p></div>;
  if (!tenant) return <div className="h-screen flex flex-col items-center justify-center p-10 text-center"><Building2 size={48} className="text-slate-200 mb-4"/><h2 className="text-2xl font-black text-slate-900 mb-2">Portal Indisponível</h2><Link to="/" className="text-blue-600 font-bold underline">Voltar</Link></div>;

  const templateId = tenant.template_id || 'heritage';

  // --- RENDERIZADORES DE LAYOUT ESPECÍFICOS ---

  // 1. HERITAGE: Tradicional, Centrado, Seguro
  const renderHeritage = () => (
    <div className="bg-[#FDFCFB] font-brand min-h-screen">
      <nav className="h-24 px-8 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-50">
        <span className="text-2xl font-black text-[#1c2d51]">{tenant.nome}</span>
        <div className="hidden md:flex gap-8 text-sm font-bold text-slate-600 uppercase tracking-widest">
          <a href="#" className="hover:text-[#1c2d51]">Início</a>
          <a href="#" className="hover:text-[#1c2d51]">Imóveis</a>
          <a href="#" className="hover:text-[#1c2d51]">Contactos</a>
        </div>
        <button className="bg-[#1c2d51] text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest">Ligar Agora</button>
      </nav>
      <header className="py-32 px-8 text-center bg-[#1c2d51] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"><img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600" className="w-full h-full object-cover" /></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">{tenant.slogan || 'Realizamos o seu sonho imobiliário.'}</h1>
          <div className="flex justify-center gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex-1 max-w-xs text-left border border-white/20">
               <p className="text-[10px] font-black uppercase mb-1 opacity-60">Localização</p>
               <p className="font-bold">Todos os distritos</p>
            </div>
            <button className="bg-white text-[#1c2d51] px-12 py-4 rounded-xl font-black uppercase text-sm">Pesquisar</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-24 px-8">
        <h2 className="text-3xl font-black text-[#1c2d51] mb-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-100"></div> Portefólio em Destaque <div className="h-px flex-1 bg-slate-100"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {properties.map(p => (
            <Link key={p.id} to={`/agencia/${tenant.slug}/imovel/${p.slug}`} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="h-64 overflow-hidden relative">
                 <img src={p.media[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute top-4 left-4 bg-[#1c2d51] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Destaque</div>
              </div>
              <div className="p-8">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{p.concelho} • {p.tipologia}</p>
                <h3 className="text-xl font-black text-[#1c2d51] mb-4">{p.titulo}</h3>
                <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                  <span className="text-2xl font-black text-[#1c2d51]">{formatCurrency(p.preco || p.preco_arrendamento)}</span>
                  <ChevronRight className="text-slate-300 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );

  // 2. PRESTIGE: Luxo, Escuro, Imersivo
  const renderPrestige = () => (
    <div className="bg-[#0a0a0a] text-white font-heritage min-h-screen selection:bg-white selection:text-black">
      <nav className="h-24 px-12 flex items-center justify-between absolute top-0 w-full z-50">
        <span className="text-3xl font-bold tracking-[0.3em] uppercase italic">{tenant.nome}</span>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:opacity-50 transition-opacity">
          {isMenuOpen ? <X size={32}/> : <Menu size={32}/>}
        </button>
      </nav>
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center gap-10 animate-in fade-in duration-500">
           <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-12"><X size={40}/></button>
           <a href="#" className="text-6xl font-bold hover:italic transition-all">Curadoria</a>
           <a href="#" className="text-6xl font-bold hover:italic transition-all">Manifesto</a>
           <a href="#" className="text-6xl font-bold hover:italic transition-all">Privado</a>
        </div>
      )}
      <header className="h-screen relative flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=2000" className="absolute inset-0 w-full h-full object-cover scale-110 animate-pulse-slow opacity-40" />
        <div className="relative z-10 text-center max-w-5xl px-12">
           <p className="text-xs font-black uppercase tracking-[0.8em] mb-10 opacity-60">Portugal Private Estates</p>
           <h1 className="text-7xl md:text-9xl font-bold leading-[0.8] mb-12 tracking-tighter">{tenant.slogan || 'O Silêncio do Luxo.'}</h1>
           <div className="w-px h-32 bg-white/20 mx-auto animate-bounce mt-20"></div>
        </div>
      </header>
      <main className="py-40 px-12">
        <div className="flex flex-col gap-40 max-w-7xl mx-auto">
          {properties.map((p, idx) => (
            <Link key={p.id} to={`/agencia/${tenant.slug}/imovel/${p.slug}`} className={`group grid grid-cols-1 md:grid-cols-12 gap-20 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
               <div className={`md:col-span-7 h-[700px] overflow-hidden ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                  <img src={p.media[0]?.url || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
               </div>
               <div className="md:col-span-5 space-y-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">{p.concelho}</span>
                  <h3 className="text-5xl font-bold leading-tight">{p.titulo}</h3>
                  <p className="text-white/50 italic text-xl leading-relaxed">Uma expressão arquitetónica singular no coração de Portugal.</p>
                  <div className="pt-8 flex items-center gap-10">
                     <span className="text-3xl font-bold">{formatCurrency(p.preco || p.preco_arrendamento)}</span>
                     <div className="flex-1 h-px bg-white/10 group-hover:bg-white/40 transition-colors"></div>
                     <ArrowUpRight size={32} strokeWidth={1} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                  </div>
               </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );

  // 3. SKYLINE: Urbano, Direto, Conversão
  const renderSkyline = () => (
    <div className="bg-slate-50 font-brand min-h-screen text-slate-900">
      <nav className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">S</div>
          <span className="font-black text-xl tracking-tighter text-blue-900">{tenant.nome}</span>
        </div>
        <div className="flex items-center gap-4">
           <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20">Procurar</button>
        </div>
      </nav>
      <header className="bg-white border-b border-slate-200 px-6 py-20 overflow-hidden relative">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                  <Sparkles size={14}/> Mercado de Oportunidade
               </div>
               <h1 className="text-6xl font-black text-blue-900 leading-[0.9] tracking-tighter">{tenant.slogan || 'Encontre a chave do seu novo estilo de vida.'}</h1>
               <p className="text-xl text-slate-400 font-medium max-w-lg">Aceda ao catálogo de imóveis mais dinâmico da região com tecnologia de ponta.</p>
               <div className="bg-slate-100 p-2 rounded-2xl flex flex-col md:flex-row gap-2 max-w-xl">
                  <div className="flex-1 flex items-center px-4 py-3 bg-white rounded-xl shadow-sm"><Search size={18} className="text-slate-300 mr-3"/><input type="text" placeholder="Onde quer viver?" className="bg-transparent outline-none w-full font-bold text-sm" /></div>
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-sm uppercase">Ir</button>
               </div>
            </div>
            <div className="flex-1 relative">
               <div className="aspect-square bg-blue-100 rounded-[4rem] rotate-6 absolute inset-0 -z-10 translate-x-10"></div>
               <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000" className="rounded-[4rem] shadow-2xl" />
            </div>
         </div>
      </header>
      <main className="max-w-7xl mx-auto py-20 px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-black text-blue-900 uppercase tracking-widest">Feed de Imóveis</h2>
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
             <button className="p-2 bg-blue-50 text-blue-600 rounded-lg"><LayoutGrid size={20}/></button>
             <button className="p-2 text-slate-300 hover:text-slate-600"><List size={20}/></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {properties.map(p => (
             <Link key={p.id} to={`/agencia/${tenant.slug}/imovel/${p.slug}`} className="bg-white rounded-3xl p-4 border border-slate-200 hover:border-blue-500 hover:shadow-2xl transition-all group overflow-hidden">
                <div className="h-60 rounded-2xl overflow-hidden mb-6 relative">
                   <img src={p.media[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg">
                        <span className="font-black text-blue-900">{formatCurrency(p.preco || p.preco_arrendamento)}</span>
                      </div>
                      <button className="w-10 h-10 bg-white/95 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Heart size={18}/></button>
                   </div>
                </div>
                <div className="space-y-2 px-2">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 tracking-widest"><MapPin size={12}/> {p.concelho}</div>
                   <h3 className="font-black text-blue-900 text-xl">{p.titulo}</h3>
                   <div className="flex items-center gap-6 pt-4 text-slate-400 font-bold text-xs uppercase">
                      <span className="flex items-center gap-1"><Bed size={14}/> {p.quartos}</span>
                      <span className="flex items-center gap-1"><Bath size={14}/> {p.casas_banho}</span>
                      <span className="flex items-center gap-1"><Square size={14}/> {p.area_util_m2}m²</span>
                   </div>
                </div>
             </Link>
           ))}
        </div>
      </main>
    </div>
  );

  // 4. LUXE: Editorial, Assimétrico, Lifestyle (Já implementado, mas melhorado estruturalmente)
  const renderLuxe = () => (
    <div className="bg-[#FAF9F6] text-[#2D2926] font-heritage min-h-screen">
      <nav className="z-50 px-12 h-24 flex items-center justify-between bg-transparent absolute top-0 w-full">
        <Link to={`/agencia/${tenant.slug}`} className="text-2xl font-bold tracking-widest italic">{tenant.nome}</Link>
        <div className="hidden md:flex items-center gap-12 text-sm italic">
           <a href="#" className="hover:opacity-40 transition-opacity underline-offset-8 hover:underline">Curadoria</a>
           <a href="#" className="hover:opacity-40 transition-opacity underline-offset-8 hover:underline">Viver Bem</a>
           <button className="bg-[#2D2926] text-white px-10 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-black shadow-xl">Contactar</button>
        </div>
      </nav>
      <header className="h-screen relative flex items-center overflow-hidden px-12">
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=2000" className="w-full h-full object-cover opacity-80 scale-105 animate-pulse-slow" style={{ animationDuration: '30s' }} />
           <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/40 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10 w-full animate-in fade-in slide-in-from-left duration-1000">
           <div className="max-w-3xl space-y-12">
              <div className="flex items-center gap-6 text-[#2D2926]/30 text-[10px] font-black uppercase tracking-[0.5em]"><div className="w-16 h-px bg-[#2D2926]/20"></div> Curadoria Imobiliária</div>
              <h1 className="text-7xl md:text-[9rem] font-bold leading-[0.8] tracking-tighter">
                {tenant.slogan?.split(' ').slice(0, 2).join(' ') || 'Espaços'} <br/> 
                <span className="italic font-light opacity-60 ml-32">{tenant.slogan?.split(' ').slice(2).join(' ') || 'com Alma.'}</span>
              </h1>
              <p className="text-2xl text-[#2D2926]/60 italic max-w-xl leading-relaxed">Onde a sua narrativa de vida encontra o cenário perfeito.</p>
           </div>
        </div>
      </header>
      <main className="py-60 px-12 bg-white">
        <div className="max-w-7xl mx-auto space-y-60">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-12 items-start">
              {properties.map((p, idx) => (
                <Link key={p.id} to={`/agencia/${tenant.slug}/imovel/${p.slug}`} className={`group flex flex-col ${idx % 2 === 1 ? 'md:mt-60' : ''}`}>
                   <div className="aspect-[3/4] rounded-[4rem] overflow-hidden shadow-2xl relative">
                      <img src={p.media[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s]" />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                   </div>
                   <div className="mt-16 space-y-6 px-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] text-[#2D2926]/30"><span>{p.concelho} • {p.tipologia}</span> <Heart size={16}/></div>
                      <h3 className="text-5xl font-bold leading-tight tracking-tighter group-hover:translate-x-4 transition-transform duration-700">{p.titulo}</h3>
                      <div className="pt-10 border-t border-[#2D2926]/5 flex justify-between items-center">
                         <span className="text-3xl font-bold">{formatCurrency(p.preco || p.preco_arrendamento)}</span>
                         <span className="text-sm italic opacity-40 group-hover:opacity-100 transition-opacity underline underline-offset-8 decoration-[#2D2926]/10">Ver Narrativa</span>
                      </div>
                   </div>
                </Link>
              ))}
           </div>
        </div>
      </main>
    </div>
  );

  // Renderizador principal com base no TemplateId
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
