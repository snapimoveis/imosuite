import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel } from '../types';
import { Loader2, Building2, ChevronLeft, Menu, X, Search, SlidersHorizontal } from 'lucide-react';
import ImovelCard from '../components/ImovelCard';
import SEO from '../components/SEO';
import { DEFAULT_TENANT, DEFAULT_TENANT_CMS } from '../constants';
import { MOCK_IMOVEIS } from '../mocks';

const PublicImoveis: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        let tData: Tenant | null = null;
        let pData: Imovel[] = [];

        if (slug === 'demo-imosuite') {
          tData = DEFAULT_TENANT;
          pData = MOCK_IMOVEIS;
        } else {
          const tSnap = await getDocs(query(collection(db, "tenants"), where("slug", "==", slug), limit(1)));
          if (!tSnap.empty) {
            tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
            const pSnap = await getDocs(query(collection(db, "tenants", tData.id, "properties"), where("publicacao.publicar_no_site", "==", true)));
            pData = pSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Imovel));
          }
        }

        if (tData) {
          setTenant(tData);
          setImoveis(pData);
          document.documentElement.style.setProperty('--primary', tData.cor_primaria);
          document.documentElement.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[var(--primary)]" size={48} /></div>;
  if (!tenant) return <div className="h-screen flex flex-col items-center justify-center p-10"><h2 className="text-xl font-black">Agência não encontrada.</h2><Link to="/" className="text-blue-500 mt-4 underline">Voltar</Link></div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  const tid = tenant.template_id || 'heritage';

  const getMenuLink = (path: string) => {
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, '');
    if (cleanPath === '' || cleanPath === '/') return `/agencia/${tenant.slug}`;
    if (cleanPath === 'imoveis') return `/agencia/${tenant.slug}/imoveis`;
    return `/agencia/${tenant.slug}/p/${cleanPath}`;
  };

  const filteredImoveis = imoveis.filter(i => 
    i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.localizacao.concelho.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-brand min-h-screen flex flex-col bg-white overflow-x-hidden selection:bg-[var(--primary)] selection:text-white">
      <SEO title={`Imóveis - ${tenant.nome}`} overrideFullTitle={true} />
      
      <nav className="h-20 md:h-28 px-6 md:px-10 sticky top-0 z-50 bg-white border-b border-slate-100 flex items-center justify-between">
         <Link to={`/agencia/${tenant.slug}`}>
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 md:h-16 w-auto object-contain" alt={tenant.nome} /> : <span className="text-xl font-black">{tenant.nome}</span>}
         </Link>
         <div className="hidden lg:flex gap-8">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={getMenuLink(m.path)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[var(--primary)] transition-all">{m.label}</Link>
            ))}
         </div>
         <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-slate-400"><Menu size={28} /></button>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white p-8 flex flex-col animate-in slide-in-from-top duration-300">
           <div className="flex justify-between items-center mb-16">
              <span className="font-black text-[#1c2d51]">{tenant.nome}</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-[#1c2d51]"><X size={32}/></button>
           </div>
           <div className="flex flex-col gap-8">
              {cms.menus.main.map(m => (
                <Link key={m.id} to={getMenuLink(m.path)} onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-[#1c2d51] uppercase tracking-tighter">{m.label}</Link>
              ))}
           </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 w-full animate-in fade-in">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-[#1c2d51] tracking-tighter mb-4">O Nosso Portfólio</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Encontre a sua próxima morada</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-3xl mb-12 flex flex-col md:flex-row gap-4">
           <div className="flex-1 bg-white rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm border border-slate-100">
              <Search className="text-slate-300" size={20} />
              <input 
                placeholder="Pesquise por localização ou título..." 
                className="bg-transparent outline-none w-full font-bold text-[#1c2d51]"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="bg-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase text-[#1c2d51] border border-slate-100 shadow-sm">
              <SlidersHorizontal size={16}/> Filtros
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredImoveis.map(i => <ImovelCard key={i.id} imovel={i} />)}
           {filteredImoveis.length === 0 && (
             <div className="col-span-full py-32 text-center">
                <Building2 size={48} className="mx-auto text-slate-200 mb-6" />
                <p className="text-slate-400 font-bold uppercase tracking-widest">Nenhum imóvel encontrado.</p>
             </div>
           )}
        </div>
      </main>

      <footer className="py-20 bg-slate-50 text-center border-t border-slate-100 mt-20">
         <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">© {new Date().getFullYear()} {tenant.nome}</p>
      </footer>
    </div>
  );
};

export default PublicImoveis;