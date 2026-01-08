
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { 
  Search, MapPin, Bed, Bath, Square, Loader2, Building2, Zap, ArrowRight, 
  ShieldCheck, Award, Users2, Phone, Mail, ChevronDown, Sparkles, Star, 
  Crown, ChevronRight, Globe, Activity, TrendingUp, Layers, MousePointer2,
  Quote, Heart, Sparkles as SparkleIcon, Instagram, Linkedin, ArrowUpRight
} from 'lucide-react';
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

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-[#FAF9F6]"><Loader2 className="animate-spin text-slate-200 mb-4" size={48} /><p className="font-heritage italic text-[#2D2926]/40 text-sm">Curando a sua experiência...</p></div>;
  if (!tenant) return <div className="h-screen flex flex-col items-center justify-center font-brand p-10 text-center bg-white"><Building2 size={48} className="text-slate-200 mb-4"/><h2 className="text-2xl font-black text-slate-900 mb-2">Portal Indisponível</h2><Link to="/" className="mt-8 text-blue-600 font-bold underline">Voltar para o ImoSuite</Link></div>;

  const templateId = (tenant as any).template_id || 'heritage';
  const isLuxe = templateId === 'luxe';

  const getTemplateStyles = () => {
    switch (templateId) {
      case 'heritage': return { bg: 'bg-[#FDFCFB] text-slate-900', nav: 'bg-white border-b', title: 'font-heritage text-[#1c2d51]' };
      case 'prestige': return { bg: 'bg-[#0a0a0a] text-white', nav: 'bg-transparent border-b border-white/10', title: 'font-heritage text-white tracking-widest' };
      case 'skyline': return { bg: 'bg-slate-50 text-slate-900', nav: 'bg-white border-b', title: 'font-brand font-black text-blue-900' };
      case 'canvas': return { bg: 'bg-white text-slate-900', nav: 'bg-white/80 backdrop-blur-md', title: 'font-brand font-black' };
      case 'luxe': return { 
        bg: 'bg-[#FAF9F6] text-[#2D2926]', 
        nav: 'bg-transparent absolute top-0 w-full z-50', 
        title: 'font-heritage italic text-[#2D2926]' 
      };
      default: return { bg: 'bg-white text-slate-900', nav: 'bg-white', title: 'font-brand' };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${styles.bg}`}>
      {/* NAVEGAÇÃO LUXE */}
      <nav className={`px-12 h-24 flex items-center justify-between ${styles.nav}`}>
        <Link to={`/agencia/${tenant.slug}`} className={`text-3xl font-heritage font-bold ${isLuxe ? 'tracking-tighter italic' : ''}`}>
           {tenant.logo_url ? <img src={tenant.logo_url} className="h-10" /> : tenant.nome}
        </Link>
        <div className={`hidden md:flex items-center gap-12 font-heritage italic text-lg ${isLuxe ? 'text-[#2D2926]' : ''}`}>
           <a href="#" className="hover:opacity-40 transition-opacity">A Coleção</a>
           <a href="#" className="hover:opacity-40 transition-opacity">Manifesto</a>
           <button className={`px-10 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-xl ${isLuxe ? 'bg-[#2D2926] text-white hover:bg-black' : 'bg-primary text-white'}`}>Contactar Especialista</button>
        </div>
      </nav>

      {/* HERO LUXE (Editorial) */}
      {isLuxe ? (
        <header className="h-screen relative flex items-center overflow-hidden bg-[#FAF9F6]">
          <div className="absolute top-0 right-0 w-1/2 h-full z-0">
             <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000" className="w-full h-full object-cover scale-105 animate-pulse-slow" style={{ animationDuration: '40s' }} />
             <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#FAF9F6]"></div>
          </div>
          <div className="max-w-7xl mx-auto px-12 relative z-10 w-full">
             <div className="max-w-2xl space-y-12 animate-in slide-in-from-left duration-1000">
                <div className="flex items-center gap-4 text-[#2D2926]/40 text-[10px] font-black uppercase tracking-[0.6em]">
                   <div className="w-12 h-px bg-[#2D2926]/20"></div> Curadoria de Autor
                </div>
                <h1 className="text-7xl md:text-[9rem] font-heritage font-bold leading-[0.8] tracking-tighter text-[#2D2926]">
                  {tenant.slogan?.split(' ').slice(0, 2).join(' ') || 'Espaços'} <br/> 
                  <span className="italic font-light opacity-60 ml-24">{tenant.slogan?.split(' ').slice(2).join(' ') || 'com Alma.'}</span>
                </h1>
                <p className="text-2xl text-[#2D2926]/50 font-heritage italic max-w-lg leading-relaxed pt-4">
                   Onde a arquitetura encontra a emoção. Uma seleção privada de refúgios urbanos e propriedades de design em Portugal.
                </p>
                <div className="pt-10">
                   <button className="group flex items-center gap-8 font-heritage italic text-3xl hover:gap-12 transition-all">
                      Descobrir Propriedades <ArrowRight size={40} strokeWidth={1} className="text-[#2D2926]/20 group-hover:text-[#2D2926] transition-colors" />
                   </button>
                </div>
             </div>
          </div>
          <div className="absolute bottom-12 left-12 flex items-center gap-6 text-[#2D2926]/20 text-[10px] font-black uppercase tracking-[0.4em] vertical-rl h-40">
             <span className="rotate-180">Digital Estate Agency</span>
             <div className="w-px h-full bg-[#2D2926]/10"></div>
          </div>
        </header>
      ) : (
        <header className="py-40 px-12 bg-white">
           <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#1c2d51]">{tenant.slogan || 'Onde a sua nova história começa.'}</h1>
        </header>
      )}

      {/* MANIFESTO LUXE */}
      {isLuxe && (
        <section className="py-60 bg-[#FAF9F6]">
           <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-2 gap-40 items-center">
              <div className="relative group">
                 <div className="aspect-[4/5] bg-slate-200 overflow-hidden rounded-[5rem] shadow-2xl relative z-10">
                    <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                 </div>
                 <div className="absolute -top-10 -left-10 w-full h-full border border-[#2D2926]/5 rounded-[5rem] -z-0"></div>
                 <div className="absolute -bottom-10 -right-10 bg-white p-12 rounded-[3rem] shadow-2xl z-20 max-w-xs animate-bounce-slow">
                    <Quote className="text-[#2D2926]/10 mb-6" size={40} />
                    <p className="font-heritage italic text-lg text-[#2D2926]/60 leading-relaxed">
                       "A casa deve ser o tesouro da vida, um cenário onde a luz e o silêncio são os protagonistas."
                    </p>
                 </div>
              </div>
              <div className="space-y-16">
                 <h2 className="text-7xl font-heritage font-bold tracking-tight text-[#2D2926] leading-none">O Manifesto <br/><span className="italic font-light">da Curadoria.</span></h2>
                 <p className="text-2xl text-[#2D2926]/40 font-heritage italic leading-relaxed">
                    Não listamos imóveis; selecionamos espaços que inspiram. A nossa equipa de curadoria avalia cada detalhe, desde a incidência solar à harmonia dos materiais, para garantir que o seu novo lar seja uma extensão da sua identidade.
                 </p>
                 <div className="grid grid-cols-1 gap-10">
                    <div className="flex items-center gap-8 border-b border-[#2D2926]/10 pb-8 group cursor-default">
                       <span className="font-heritage italic text-4xl text-[#2D2926]/20 group-hover:text-[#2D2926] transition-colors">01</span>
                       <div>
                          <h4 className="font-heritage font-bold text-2xl">Consultoria de Design</h4>
                          <p className="text-sm font-heritage italic text-[#2D2926]/40">Análise estética completa de cada ambiente.</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-8 border-b border-[#2D2926]/10 pb-8 group cursor-default">
                       <span className="font-heritage italic text-4xl text-[#2D2926]/20 group-hover:text-[#2D2926] transition-colors">02</span>
                       <div>
                          <h4 className="font-heritage font-bold text-2xl">Concierge Private</h4>
                          <p className="text-sm font-heritage italic text-[#2D2926]/40">Atendimento personalizado e ultra-confidencial.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* LISTAGEM EDITORIAL (LUXE) */}
      <section className={`py-60 ${isLuxe ? 'bg-white' : ''}`}>
        <div className="max-w-7xl mx-auto px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-40 gap-10">
            <div className="space-y-8">
              <h2 className={`text-7xl font-heritage font-bold tracking-tighter ${isLuxe ? 'text-[#2D2926]' : ''}`}>
                {isLuxe ? 'A Coleção.' : 'Imóveis em Destaque'}
              </h2>
              {isLuxe && <p className="text-2xl font-heritage italic text-[#2D2926]/30">Exclusividade e estética em cada m².</p>}
            </div>
            {isLuxe && (
              <div className="flex gap-12 font-heritage italic text-xl text-[#2D2926]/40">
                 <button className="hover:text-[#2D2926] transition-colors pb-2 border-b border-transparent hover:border-[#2D2926]">Todas</button>
                 <button className="hover:text-[#2D2926] transition-colors pb-2 border-b border-transparent hover:border-[#2D2926]">Residências</button>
                 <button className="hover:text-[#2D2926] transition-colors pb-2 border-b border-transparent hover:border-[#2D2926]">Retiros</button>
              </div>
            )}
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-32 gap-y-60 ${isLuxe ? 'items-start' : 'lg:grid-cols-3'}`}>
            {properties.map((p, idx) => (
              <Link 
                to={`/agencia/${tenant.slug}/imovel/${p.slug}`} 
                key={p.id} 
                className={`group flex flex-col ${isLuxe && idx % 2 === 1 ? 'md:mt-80' : ''}`}
              >
                <div className={`${isLuxe ? 'aspect-[3/4] rounded-[5rem]' : 'h-64'} relative overflow-hidden bg-slate-50 shadow-2xl transition-all duration-1000 group-hover:shadow-3xl`}>
                   <img src={p.media[0]?.url || `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&q=80`} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" />
                   {isLuxe && (
                     <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                   )}
                   <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-md w-16 h-16 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-all duration-500 shadow-xl">
                      <ArrowUpRight size={24} className="text-[#2D2926]" />
                   </div>
                </div>
                <div className={isLuxe ? 'mt-16 space-y-6' : 'p-8 space-y-4 bg-white border border-slate-100'}>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] text-[#2D2926]/30">
                    <span>{p.concelho} &bull; {p.tipologia}</span>
                    <Heart size={16} className="group-hover:text-red-400 transition-colors" />
                  </div>
                  <h3 className={`text-5xl font-heritage font-bold leading-tight group-hover:translate-x-2 transition-transform duration-700 ${isLuxe ? 'text-[#2D2926]' : 'text-slate-900'}`}>{p.titulo}</h3>
                  <div className="pt-10 border-t border-[#2D2926]/5 flex justify-between items-center">
                    <span className="text-3xl font-heritage font-bold text-[#2D2926]">{formatCurrency(p.preco || p.preco_arrendamento)}</span>
                    {isLuxe && <span className="text-sm font-heritage italic text-[#2D2926]/40 underline underline-offset-8 decoration-transparent group-hover:decoration-[#2D2926]/20 transition-all">Explorar Narrativa</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER LUXE (Minimalista & Poético) */}
      <footer className={`py-60 px-12 ${isLuxe ? 'bg-[#FAF9F6] border-t border-[#2D2926]/5 text-[#2D2926]' : 'bg-slate-900 text-white'}`}>
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-32">
              <div className="space-y-12">
                 <h4 className="text-4xl font-heritage font-bold italic tracking-tighter">{tenant.nome}</h4>
                 <p className="font-heritage italic text-xl text-[#2D2926]/40 max-w-xs leading-relaxed">Redefinindo a experiência imobiliária através do design, luz e silêncio.</p>
                 <div className="flex gap-8">
                    <div className="w-14 h-14 rounded-full border border-[#2D2926]/10 flex items-center justify-center hover:bg-[#2D2926] hover:text-white transition-all cursor-pointer"><Instagram size={24}/></div>
                    <div className="w-14 h-14 rounded-full border border-[#2D2926]/10 flex items-center justify-center hover:bg-[#2D2926] hover:text-white transition-all cursor-pointer"><Linkedin size={24}/></div>
                 </div>
              </div>
              
              <div className="space-y-12">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#2D2926]/30">Privacidade</h4>
                 <div className="space-y-6 font-heritage italic text-xl opacity-60">
                    <p className="hover:opacity-100 transition-opacity cursor-pointer">{tenant.email}</p>
                    <p className="hover:opacity-100 transition-opacity cursor-pointer">{tenant.telefone || '+351 900 000 000'}</p>
                    <p className="pt-12 text-sm not-italic font-black uppercase tracking-[0.4em]">{tenant.morada || 'Lisboa, Portugal'}</p>
                 </div>
              </div>

              <div className="space-y-12 text-right">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#2D2926]/30">Sitemap</h4>
                 <ul className="space-y-8 font-heritage italic text-3xl">
                    <li className="hover:-translate-x-4 transition-transform cursor-pointer">Coleções</li>
                    <li className="hover:-translate-x-4 transition-transform cursor-pointer">Manifesto</li>
                    <li className="hover:-translate-x-4 transition-transform cursor-pointer">Privacidade</li>
                 </ul>
              </div>
           </div>
           
           <div className="mt-60 pt-12 border-t border-[#2D2926]/5 flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black uppercase tracking-[0.6em] opacity-20">
              <span>© {new Date().getFullYear()} {tenant.nome} &bull; Curated Estates</span>
              <span>Luxe Engine by ImoSuite SaaS v1.0.5</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortal;
