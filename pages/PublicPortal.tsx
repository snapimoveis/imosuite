
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { Search, MapPin, Bed, Bath, Square, Loader2, Phone, Mail, Globe, Facebook, Instagram, Zap, Star, Layout, Building2, Brush, ArrowRight } from 'lucide-react';
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

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200 mb-4" size={48} /><p className="font-brand font-black text-slate-400 uppercase tracking-widest text-xs text-center">A sintonizar portal...<br/><span className="text-[10px] opacity-50">ImoSuite EcoSystem</span></p></div>;
  if (!tenant) return <div className="h-screen flex flex-col items-center justify-center font-brand p-10 text-center"><Building2 size={48} className="text-slate-200 mb-4"/><h2 className="text-2xl font-black text-slate-900 mb-2">Portal Indisponível</h2><p className="text-slate-500">Não encontrámos nenhuma agência com este endereço.</p><Link to="/" className="mt-8 text-blue-600 font-bold underline">Voltar para o ImoSuite</Link></div>;

  const templateId = (tenant as any).template_id || 'heritage';
  const primaryColor = tenant.cor_primaria || '#1c2d51';

  const getTemplateStyles = () => {
    switch (templateId) {
      case 'prestige': return { bg: 'bg-slate-950 text-white', nav: 'border-white/5', card: 'bg-slate-900 border-white/5', hero: 'py-40 text-left px-12 md:px-32 bg-gradient-to-br from-slate-950 to-slate-900' };
      case 'canvas': return { bg: 'bg-white text-slate-900', nav: 'border-slate-100', card: 'bg-white border-slate-100 shadow-sm hover:shadow-xl', hero: 'py-24 text-center bg-slate-50' };
      case 'skyline': return { bg: 'bg-slate-50 text-slate-900', nav: 'bg-white shadow-sm border-none', card: 'bg-white border-none shadow-md hover:-translate-y-2', hero: 'py-32 px-12 text-center bg-[#10b981]/5' };
      case 'luxe': return { bg: 'bg-orange-50/20 text-slate-900', nav: 'bg-white/80 backdrop-blur-md', card: 'bg-white rounded-[3rem] border-none shadow-lg', hero: 'py-32 px-12 text-center relative overflow-hidden' };
      default: return { bg: 'bg-white text-slate-900', nav: 'border-slate-100', card: 'bg-white border-slate-100', hero: 'py-32 text-center px-8' };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className={`min-h-screen font-brand transition-colors duration-500 ${styles.bg}`}>
      <nav className={`h-20 border-b flex items-center justify-between px-8 sticky top-0 bg-inherit z-50 transition-all ${styles.nav}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg" style={{ backgroundColor: primaryColor }}>{tenant.nome.charAt(0)}</div>
          <span className="font-black text-xl tracking-tighter uppercase">{tenant.nome}</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest opacity-60">
          <a href="#" className="hover:opacity-100">Início</a>
          <a href="#" className="hover:opacity-100">Catálogo</a>
          <button className="px-6 py-2.5 rounded-full text-white shadow-md hover:scale-105 transition-all" style={{ backgroundColor: primaryColor }}>Contacto</button>
        </div>
      </nav>

      <header className={`${styles.hero} relative`}>
        <div className="max-w-5xl relative z-10 mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 opacity-60 text-[10px] font-black uppercase tracking-[0.3em]"><Zap size={12} className="text-blue-500" /> Especialistas imobiliários</div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">{(tenant as any).slogan || 'O seu destino imobiliário.'}</h1>
          <p className="text-xl md:text-2xl opacity-60 max-w-2xl mb-12 font-medium leading-relaxed">Transformamos a procura do seu novo lar numa experiência extraordinária.</p>
          <div className="max-w-3xl bg-white p-3 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row gap-3 border border-slate-100/50">
            <div className="flex-1 flex items-center px-6 py-4 gap-4 bg-slate-50 rounded-xl md:rounded-2xl">
               <Search className="text-slate-300" size={20} />
               <input type="text" placeholder="O que procura hoje?" className="bg-transparent outline-none w-full font-bold text-slate-900" />
            </div>
            <button className="px-12 py-5 rounded-xl md:rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all" style={{ backgroundColor: primaryColor }}>Procurar</button>
          </div>
        </div>
      </header>

      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <h2 className="text-4xl font-black tracking-tighter">Listagens Recentes</h2>
        </div>

        {properties.length === 0 ? (
          <div className="py-32 text-center bg-slate-50/50 rounded-[4rem] border border-dashed border-slate-200">
            <p className="font-black text-slate-300 uppercase tracking-widest text-xs">A aguardar novas propriedades em carteira</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {properties.map(p => (
              <Link to={`/agencia/${tenant.slug}/imovel/${p.slug}`} key={p.id} className={`group rounded-[2.5rem] overflow-hidden transition-all duration-500 border block ${styles.card}`}>
                <div className="h-72 relative overflow-hidden">
                   <img src={p.media[0]?.url || `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute top-6 left-6"><span className="bg-white/95 text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">{p.tipo_negocio}</span></div>
                   <div className="absolute bottom-6 right-6 bg-white text-slate-900 px-5 py-2.5 rounded-2xl font-black shadow-2xl">{formatCurrency(p.preco || p.preco_arrendamento)}</div>
                </div>
                <div className="p-10">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-4 opacity-50"><MapPin size={12} className="text-blue-500" /> {p.concelho}</div>
                  <h3 className="text-2xl font-black mb-8 line-clamp-1 tracking-tight">{p.titulo}</h3>
                  <div className="flex justify-between border-t border-slate-100/10 pt-8 opacity-50 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex flex-col items-center gap-2"><Bed size={16}/> {p.tipologia}</div>
                    <div className="flex flex-col items-center gap-2"><Bath size={16}/> {p.casas_banho}</div>
                    <div className="flex flex-col items-center gap-2"><Square size={16}/> {p.area_util_m2}m²</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PublicPortal;
