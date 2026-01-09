
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy, doc, getDoc } from 'firebase/firestore';
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
        let tData: Tenant | null = null;
        
        // 1. Tentar procurar por SLUG
        const tRef = collection(db, "tenants");
        const tQuery = query(tRef, where("slug", "==", slug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
        } else {
          // 2. Fallback para ID
          const docRef = doc(db, "tenants", slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            tData = { id: docSnap.id, ...(docSnap.data() as any) } as Tenant;
          }
        }
        
        if (tData) {
          setTenant(tData);

          // Aplicar cores do tenant ao portal
          const root = document.documentElement;
          root.style.setProperty('--primary', tData.cor_primaria);
          root.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);

          const pRef = collection(db, "tenants", tData.id, "properties");
          const highlightQuery = query(pRef, where("publicacao.destaque", "==", true), where("publicacao.publicar_no_site", "==", true), limit(9));
          let pSnap = await getDocs(highlightQuery);
          
          if (pSnap.empty) {
            const recentQuery = query(pRef, where("publicacao.publicar_no_site", "==", true), orderBy("created_at", "desc"), limit(9));
            pSnap = await getDocs(recentQuery);
          }

          setProperties(pSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Imovel)));
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
    navigate(`/agencia/${tenant?.slug || tenant?.id}/imovel/${propertySlug}?contact=true`);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-200 mb-4" size={48} />
      <p className="font-brand font-black text-slate-400 uppercase tracking-widest text-[10px]">A preparar o seu portal...</p>
    </div>
  );

  if (!tenant) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center font-brand">
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
        <Building2 size={40} className="text-slate-200"/>
      </div>
      <h2 className="text-3xl font-black text-[#1c2d51] mb-2 tracking-tighter">Portal Indisponível</h2>
      <p className="text-slate-400 mb-8 max-w-xs font-medium">A agência não existe ou o link está incorreto.</p>
      <Link to="/" className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all">
        Voltar ao Início
      </Link>
    </div>
  );

  return (
    <div className="bg-[#FDFCFB] font-brand min-h-screen pb-20" style={{ '--primary': tenant.cor_primaria } as any}>
      <nav className="h-20 px-8 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} className="h-10 w-auto object-contain" alt={tenant.nome} />
          ) : (
            <span className="text-xl font-black text-[var(--primary)] tracking-tighter">{tenant.nome}</span>
          )}
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <a href="#" className="hover:text-[var(--primary)]">Início</a>
          <a href="#" className="hover:text-[var(--primary)]">Imóveis</a>
          <a href="#" className="hover:text-[var(--primary)]">Contacto</a>
        </div>
        <button className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10">Menu</button>
      </nav>
      
      <header className="py-28 px-8 text-center bg-slate-50 relative overflow-hidden border-b border-slate-100 min-h-[60vh] flex flex-col justify-center items-center">
        {/* Hero Background personalizada */}
        <div className="absolute inset-0 z-0">
           <img 
             src={tenant.hero_image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600'} 
             className="w-full h-full object-cover opacity-10" 
             alt="Hero"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-8xl font-black text-[#1c2d51] mb-8 leading-tight tracking-tighter animate-in slide-in-from-bottom duration-700">
            {tenant.slogan || 'O seu próximo capítulo começa aqui.'}
          </h1>
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-300">
             <div className="flex-1 px-6 py-4 text-left border-r border-slate-50">
                <p className="text-[8px] font-black text-slate-300 uppercase mb-1">O que procura?</p>
                <p className="text-sm font-bold text-[#1c2d51]">Localidade ou Tipologia</p>
             </div>
             <button className="bg-[var(--primary)] text-white px-10 py-4 rounded-xl font-black uppercase text-xs shadow-xl">Pesquisar</button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-24 px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Imóveis em Destaque</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">A nossa seleção exclusiva em {tenant.nome}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {properties.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest border-2 border-dashed border-slate-100 rounded-[3rem]">
              Sem imóveis disponíveis no momento.
            </div>
          ) : properties.map(p => (
            <Link key={p.id} to={`/agencia/${tenant.slug || tenant.id}/imovel/${p.slug}`} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 group shadow-sm hover:shadow-2xl transition-all flex flex-col h-full">
              <div className="h-64 overflow-hidden relative bg-slate-100">
                <img src={p.media?.items?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-sm border border-slate-100 text-[#1c2d51]">{p.operacao}</div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-[#1c2d51] mb-4 flex-1 line-clamp-2 leading-tight">{p.titulo}</h3>
                <div className="flex justify-between items-center py-6 border-t border-slate-50 mb-6">
                  <span className="text-2xl font-black text-[#1c2d51]">{formatCurrency((p.operacao === 'venda' ? p.financeiro?.preco_venda : p.financeiro?.preco_arrendamento) || 0)}</span>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[var(--primary)] group-hover:text-white transition-all"><ChevronRight size={18}/></div>
                </div>
                <button onClick={(e) => handleContactClick(e, p.slug)} className="w-full bg-[var(--primary)] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={14} /> Contactar Consultor
                </button>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PublicPortal;
