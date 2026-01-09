
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { 
  Loader2, Building2, ChevronRight, Mail, Phone, 
  ArrowRight, Handshake, Key, Search, Star, MapPin, 
  Bed, Bath, Square, Heart, LayoutGrid, Zap, Brush, ArrowUpRight
} from 'lucide-react';
import ImovelCard from '../components/ImovelCard';
import { formatCurrency } from '../lib/utils';

const PublicPortal: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        const tQuery = query(collection(db, "tenants"), where("slug", "==", slug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          
          const root = document.documentElement;
          root.style.setProperty('--primary', tData.cor_primaria);

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
        console.error("Erro ao carregar portal:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-200 mb-4" size={48} />
      <p className="font-brand font-black text-slate-400 uppercase tracking-widest text-[10px]">A carregar portal...</p>
    </div>
  );

  if (!tenant) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center font-brand">
      <h2 className="text-3xl font-black text-[#1c2d51] mb-2 tracking-tighter">Portal não encontrado</h2>
      <Link to="/" className="text-blue-500 font-bold">Voltar ao Início</Link>
    </div>
  );

  // Router de Templates
  switch (tenant.template_id) {
    case 'canvas': return <CanvasTemplate tenant={tenant} properties={properties} />;
    case 'prestige': return <PrestigeTemplate tenant={tenant} properties={properties} />;
    case 'skyline': return <SkylineTemplate tenant={tenant} properties={properties} />;
    case 'luxe': return <LuxeTemplate tenant={tenant} properties={properties} />;
    case 'heritage':
    default: return <HeritageTemplate tenant={tenant} properties={properties} />;
  }
};

// --- 1. HERITAGE TEMPLATE (Classic & Formal) ---
const HeritageTemplate = ({ tenant, properties }: { tenant: Tenant, properties: Imovel[] }) => (
  <div className="bg-white font-brand text-slate-900 selection:bg-[var(--primary)] selection:text-white">
    <nav className="h-24 px-10 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
      <div className="flex items-center gap-4">
        {tenant.logo_url ? <img src={tenant.logo_url} className="h-12 w-auto" /> : <span className="text-2xl font-black text-[var(--primary)] tracking-tighter italic font-heritage">{tenant.nome}</span>}
      </div>
      <div className="hidden md:flex gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <span className="hover:text-[var(--primary)] cursor-pointer transition-colors">Início</span>
        <span className="hover:text-[var(--primary)] cursor-pointer transition-colors">Imóveis</span>
        <span className="hover:text-[var(--primary)] cursor-pointer transition-colors">Serviços</span>
      </div>
      <button className="bg-[var(--primary)] text-white px-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Contactar</button>
    </nav>

    <header className="py-32 px-10 text-center bg-slate-50 border-b border-slate-100 relative overflow-hidden">
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
       <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-6xl md:text-8xl font-black text-[var(--primary)] tracking-tighter leading-[0.95] mb-8 font-heritage italic">{tenant.slogan || 'Tradição e Confiança.'}</h1>
          <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto font-medium uppercase tracking-[0.2em]">Especialistas no mercado de luxo e investimento</p>
          <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-2xl mx-auto flex flex-col md:row gap-2 border border-slate-100">
             <div className="flex-1 bg-slate-50 rounded-xl px-8 py-4 text-left"><p className="text-[8px] font-black text-slate-300 uppercase mb-1">Onde procura?</p><p className="text-sm font-bold text-slate-400">Cidade ou Bairro...</p></div>
             <button className="bg-[var(--primary)] text-white px-12 py-5 rounded-xl font-black uppercase text-xs tracking-widest">Pesquisar</button>
          </div>
       </div>
    </header>

    <main className="max-w-7xl mx-auto py-32 px-10">
       <div className="flex justify-between items-end mb-20 border-b border-slate-100 pb-10">
          <div>
            <h2 className="text-4xl font-black text-[var(--primary)] tracking-tighter font-heritage italic">Destaques da Carteira</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Curadoria exclusiva {tenant.nome}</p>
          </div>
          <ChevronRight className="text-slate-200" size={40} />
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {properties.map(p => <ImovelCard key={p.id} imovel={p} />)}
       </div>
    </main>

    <footer className="bg-white border-t border-slate-100 py-20 px-10">
       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
          <div>
             <h4 className="font-heritage italic text-2xl font-black text-[var(--primary)] mb-6">{tenant.nome}</h4>
             <p className="text-slate-400 leading-relaxed font-medium uppercase text-[10px] tracking-widest">{tenant.slogan}</p>
          </div>
          <div className="space-y-4">
             <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-300">Contactos</p>
             <p className="font-bold text-slate-600 flex items-center gap-3"><Mail size={16}/> {tenant.email}</p>
             <p className="font-bold text-slate-600 flex items-center gap-3"><Phone size={16}/> {tenant.telefone}</p>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Powered by ImoSuite</span>
          </div>
       </div>
    </footer>
  </div>
);

// --- 2. CANVAS TEMPLATE (Modern & Clean) ---
const CanvasTemplate = ({ tenant, properties }: { tenant: Tenant, properties: Imovel[] }) => (
  <div className="bg-white font-brand text-slate-900">
     <nav className="h-20 px-8 flex items-center justify-between border-b border-slate-50 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-black">C</div>
           <span className="font-black text-xl tracking-tighter">{tenant.nome}</span>
        </div>
        <div className="hidden md:flex gap-10 font-bold text-xs text-slate-400"><span>Catálogo</span><span>Vender</span><span>Agência</span></div>
        <button className="bg-slate-900 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Entrar</button>
     </nav>

     <header className="grid grid-cols-1 lg:grid-cols-2 gap-20 p-10 md:p-20 items-center bg-slate-50/50">
        <div className="space-y-10 animate-in slide-in-from-left duration-700">
           <div className="inline-block bg-[var(--primary)]/10 text-[var(--primary)] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Real Estate Platform</div>
           <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.85]">{tenant.nome}.</h1>
           <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-sm">{tenant.slogan || 'Minimalist approach to property search.'}</p>
           <button className="bg-[var(--primary)] text-white px-12 py-5 rounded-3xl font-black text-sm shadow-2xl shadow-[var(--primary)]/20 active:scale-95 transition-all">Explorar Inventário</button>
        </div>
        <div className="relative aspect-square bg-slate-100 rounded-[5rem] overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-1000 shadow-2xl group">
           <img src={tenant.hero_image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        </div>
     </header>

     <main className="p-10 md:p-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {properties.map(p => (
             <div key={p.id} className="bg-white p-4 rounded-[3rem] border border-slate-100 hover:shadow-2xl transition-all group">
                <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-6"><img src={p.media?.items?.[0]?.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                <div className="px-6 pb-6">
                  <h4 className="font-black text-xl text-slate-900 mb-2 leading-tight">{p.titulo}</h4>
                  <div className="flex justify-between items-center"><span className="text-[var(--primary)] font-black text-lg">{formatCurrency(p.financeiro?.preco_venda || p.financeiro?.preco_arrendamento || 0)}</span><span className="text-slate-300 font-bold text-[9px] uppercase tracking-widest">Ref: {p.ref}</span></div>
                </div>
             </div>
           ))}
        </div>
     </main>
  </div>
);

// --- 3. PRESTIGE TEMPLATE (Luxury & Minimalist) ---
const PrestigeTemplate = ({ tenant, properties }: { tenant: Tenant, properties: Imovel[] }) => (
  <div className="bg-[#080808] text-white font-brand selection:bg-white selection:text-black">
     <nav className="h-24 px-12 flex items-center justify-between absolute w-full z-50">
        <span className="text-2xl font-black tracking-[0.5em] uppercase italic">{tenant.nome}</span>
        <div className="flex gap-16 text-[9px] font-black uppercase tracking-[0.5em] opacity-40 hover:opacity-100 transition-opacity cursor-pointer"><span>Collection</span><span>About</span><span>Contact</span></div>
     </nav>

     <header className="h-screen flex items-center justify-center text-center px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10"></div>
        <img src={tenant.hero_image_url || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600'} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 scale-105" />
        <div className="relative z-20 space-y-12 animate-in fade-in zoom-in-95 duration-1000">
           <p className="text-[10px] font-black uppercase tracking-[1em] opacity-40">Exclusive Assets Only</p>
           <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-[0.75] opacity-90 uppercase italic">Luxury.</h1>
           <div className="w-px h-32 bg-white/20 mx-auto mt-20"></div>
           <p className="text-white/40 text-sm font-light uppercase tracking-[0.5em] mt-10">{tenant.slogan || 'The Art of Living'}</p>
        </div>
     </header>

     <main className="py-60 px-12 max-w-7xl mx-auto space-y-80">
        {properties.map((p, i) => (
          <div key={p.id} className={`flex flex-col md:flex-row items-center gap-32 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
             <div className="flex-1 aspect-[4/5] bg-white/5 overflow-hidden group relative">
                <img src={p.media?.items?.[0]?.url} className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                <div className="absolute bottom-10 left-10 text-[9px] font-black uppercase tracking-widest bg-white text-black px-4 py-2">Premium</div>
             </div>
             <div className="flex-1 space-y-10">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">{p.localizacao.concelho} &bull; Estate</span>
                <h3 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">{p.titulo}</h3>
                <p className="text-white/40 text-xl font-light italic leading-relaxed">A architectural masterpiece defining the new standard of modern elegance.</p>
                <div className="flex items-center gap-6"><div className="w-20 h-px bg-white/20"></div><span className="font-black text-2xl tracking-widest">{formatCurrency(p.financeiro?.preco_venda || 0)}</span></div>
                <Link to={`/agencia/${tenant.slug}/imovel/${p.slug}`} className="inline-block border border-white/20 px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all">View Details</Link>
             </div>
          </div>
        ))}
     </main>
  </div>
);

// --- 4. SKYLINE TEMPLATE (Urban & Tech) ---
const SkylineTemplate = ({ tenant, properties }: { tenant: Tenant, properties: Imovel[] }) => (
  <div className="bg-[#f4f7f9] font-brand text-[#1a2b3c]">
     <nav className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-[var(--primary)]/30">S</div>
           <span className="font-black text-2xl tracking-tighter">Skyline</span>
        </div>
        <button className="bg-[var(--primary)] text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20 active:scale-95 transition-all">Contactar Agência</button>
     </nav>

     <header className="bg-white border-b border-slate-100 py-32 px-8 flex flex-col items-center text-center relative overflow-hidden">
        <div className="max-w-4xl space-y-10 relative z-10">
           <div className="bg-blue-50 text-blue-600 text-[9px] font-black px-4 py-2 rounded-full uppercase inline-block shadow-sm">High-Tech Real Estate Portfolio</div>
           <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.95] text-[#1a2b3c]">{tenant.slogan || 'The Future of Living.'}</h1>
           <div className="p-2 bg-slate-100 rounded-2xl flex gap-2 shadow-inner max-w-xl mx-auto w-full">
              <input type="text" placeholder="Código Postal, Cidade ou Ref..." className="flex-1 bg-transparent border-none outline-none px-6 font-bold text-sm" />
              <button className="bg-white p-4 rounded-xl shadow-md text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Search size={20}/></button>
           </div>
        </div>
     </header>

     <main className="p-8 md:p-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
        {properties.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-xl hover:-translate-y-2 transition-all group">
             <div className="aspect-video bg-slate-50 rounded-[1.5rem] mb-6 overflow-hidden relative">
                <img src={p.media?.items?.[0]?.url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur text-[var(--primary)] px-3 py-1 rounded-full text-[8px] font-black uppercase">Urban Unit</div>
             </div>
             <h4 className="font-black text-sm mb-1 line-clamp-1">{p.titulo}</h4>
             <p className="text-slate-400 text-[9px] font-bold uppercase mb-4 tracking-widest">{p.localizacao.concelho}</p>
             <div className="flex justify-between items-center border-t border-slate-50 pt-5">
                <span className="text-[var(--primary)] font-black text-lg">{formatCurrency(p.financeiro?.preco_venda || 0)}</span>
                <Link to={`/agencia/${tenant.slug}/imovel/${p.slug}`} className="bg-slate-50 p-3 rounded-xl text-slate-300 group-hover:bg-[var(--primary)] group-hover:text-white transition-all"><ArrowUpRight size={18}/></Link>
             </div>
          </div>
        ))}
     </main>
  </div>
);

// --- 5. LUXE TEMPLATE (Artistic & Lifestyle) ---
const LuxeTemplate = ({ tenant, properties }: { tenant: Tenant, properties: Imovel[] }) => (
  <div className="bg-[#FAF9F6] text-[#2D2926] font-heritage selection:bg-[#2D2926] selection:text-white min-h-screen">
     <nav className="h-24 px-12 flex items-center justify-between absolute w-full z-50">
        <span className="text-3xl font-black tracking-widest italic">{tenant.nome}</span>
        <div className="flex gap-16 text-[9px] font-black uppercase tracking-[0.5em] opacity-30"><span>Curated</span><span>Spaces</span><span>Atelier</span></div>
     </nav>

     <header className="h-screen flex items-center px-10 md:px-24 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-full md:w-3/4 h-full bg-slate-100 z-0 overflow-hidden">
           <img src={tenant.hero_image_url || 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200'} className="w-full h-full object-cover opacity-90 scale-105" />
        </div>
        <div className="relative z-10 space-y-12 max-w-4xl">
           <div className="flex items-center gap-6 text-[#2D2926]/40 text-[9px] font-black uppercase tracking-[0.6em]">
              <div className="w-20 h-px bg-[#2D2926]/20"></div> Estética Imobiliária
           </div>
           <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.8]">{tenant.slogan || 'Espaços com Alma.'}</h1>
           <p className="text-xl text-[#2D2926]/60 font-medium leading-relaxed max-w-sm ml-0 md:ml-40">Uma curadoria artesanal de imóveis que contam histórias.</p>
           <button className="ml-0 md:ml-40 bg-[#2D2926] text-white px-14 py-6 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Ver Coleção</button>
        </div>
     </header>

     <main className="py-60 px-8 md:px-24 grid grid-cols-1 md:grid-cols-2 gap-40 items-start max-w-7xl mx-auto">
        {properties.map((p, i) => (
          <div key={p.id} className={`flex flex-col ${i % 2 !== 0 ? 'md:mt-60' : ''}`}>
             <div className="aspect-[3/4] rounded-[5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] mb-12 relative group cursor-pointer">
                <img src={p.media?.items?.[0]?.url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-2000" />
                <div className="absolute inset-0 bg-[#2D2926]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
             <div className="px-10 space-y-6">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.5em] text-[#2D2926]/30">
                   <span>{p.localizacao.concelho} &bull; House</span>
                   <Heart size={16} strokeWidth={1} />
                </div>
                <Link to={`/agencia/${tenant.slug}/imovel/${p.slug}`} className="text-5xl font-black tracking-tighter italic leading-none hover:opacity-60 transition-opacity">{p.titulo}</Link>
                <div className="w-16 h-0.5 bg-[#2D2926]/10"></div>
                <p className="text-3xl font-light text-[#2D2926]/80">{formatCurrency(p.financeiro?.preco_venda || 0)}</p>
             </div>
          </div>
        ))}
     </main>
  </div>
);

export default PublicPortal;
