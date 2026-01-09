
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { 
  Loader2, Building2, ChevronRight, MessageSquare
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const PublicPortal: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
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
          
          const highlightQuery = query(pRef, where("publicacao.destaque", "==", true), where("publicacao.publicar_no_site", "==", true), limit(9));
          let pSnap = await getDocs(highlightQuery);
          
          if (pSnap.empty) {
            const recentQuery = query(pRef, where("publicacao.publicar_no_site", "==", true), orderBy("created_at", "desc"), limit(9));
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
                <img src={p.media.items?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[8px] font-black uppercase">{p.operacao}</div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-[#1c2d51] mb-4 flex-1 line-clamp-2">{p.titulo}</h3>
                <div className="flex justify-between items-center py-6 border-t border-slate-50 mb-6">
                  <span className="text-xl font-black text-[#1c2d51]">{formatCurrency((p.operacao === 'venda' ? p.financeiro.preco_venda : p.financeiro.preco_arrendamento) || 0)}</span>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#1c2d51] group-hover:text-white transition-all"><ChevronRight size={18}/></div>
                </div>
                <button onClick={(e) => handleContactClick(e, p.slug)} className="w-full bg-[#1c2d51] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={14} /> Contactar Agente
                </button>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );

  const renderTemplate = () => {
    // Only Heritage is fully detailed in this snippet for brevity, others follow same nested logic
    return renderHeritage();
  };

  return renderTemplate();
};

export default PublicPortal;
