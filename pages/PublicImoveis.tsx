import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel } from '../types';
import { Loader2, Menu, X, Building2, Search } from 'lucide-react';
import ImovelCard from '../components/ImovelCard';
import SEO from '../components/SEO';
import { DEFAULT_TENANT_CMS, DEFAULT_TENANT } from '../constants';
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
  if (!tenant) return <div className="h-screen flex items-center justify-center font-black">Agência não encontrada</div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  const tid = tenant.template_id || 'heritage';

  const getMenuLink = (path: string) => {
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, '');
    if (cleanPath === '' || cleanPath === '/') return `/agencia/${tenant.slug}`;
    if (cleanPath === 'imoveis') return `/agencia/${tenant.slug}/imoveis`;
    return `/agencia/${tenant.slug}/p/${cleanPath}`;
  };

  const renderLink = (item: any, className: string) => {
    if (item.path.startsWith('http')) return <a key={item.id} href={item.path} target="_blank" rel="noopener noreferrer" className={className}>{item.label}</a>;
    return <Link key={item.id} to={getMenuLink(item.path)} className={className}>{item.label}</Link>;
  };

  const styles: Record<string, any> = {
    heritage: { nav: "h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-50" },
    canvas: { nav: "h-24 bg-white/80 backdrop-blur-md border-b border-slate-50 flex items-center justify-between px-10 sticky top-0 z-50" },
    prestige: { nav: "h-20 bg-black text-white flex items-center justify-between px-10 sticky top-0 z-50" },
    skyline: { nav: "h-20 bg-[#2563eb] text-white flex items-center justify-between px-10 sticky top-0 z-50" },
    luxe: { nav: "h-28 bg-[#FDFBF7] flex items-center justify-between px-10 sticky top-0 z-50" }
  };
  const s = styles[tid] || styles.heritage;

  const filtered = imoveis.filter(i => i.titulo.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="font-brand min-h-screen flex flex-col bg-white">
      <SEO title={`Imóveis - ${tenant.nome}`} overrideFullTitle={true} />
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`}>{tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto" alt={tenant.nome}/> : <span className="font-black">{tenant.nome}</span>}</Link>
         <div className="hidden lg:flex gap-8">{cms.menus.main.map(m => renderLink(m, "text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"))}</div>
         <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2"><Menu size={28}/></button>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white p-8 flex flex-col animate-in slide-in-from-top">
           <div className="flex justify-between items-center mb-16"><span className="font-black">{tenant.nome}</span><button onClick={() => setIsMenuOpen(false)}><X size={32}/></button></div>
           <div className="flex flex-col gap-8">{cms.menus.main.map(m => renderLink(m, "text-3xl font-black uppercase tracking-tighter"))}</div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full animate-in fade-in">
        <h1 className="text-4xl md:text-6xl font-black text-[#1c2d51] tracking-tighter mb-12">Portfólio de Imóveis</h1>
        <div className="bg-slate-50 p-6 rounded-[2rem] mb-12 flex items-center gap-4"><Search className="text-slate-300" size={20}/><input placeholder="Procurar imóveis..." className="bg-transparent outline-none w-full font-bold text-slate-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filtered.map(i => <ImovelCard key={i.id} imovel={i} />)}
           {filtered.length === 0 && <div className="col-span-full py-20 text-center text-slate-300 font-bold uppercase tracking-widest">Nenhum imóvel encontrado.</div>}
        </div>
      </main>

      <footer className="py-20 px-10 text-white" style={{ backgroundColor: tenant.cor_primaria }}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6"><h4 className="text-xl font-black uppercase tracking-tight">{tenant.nome}</h4><p className="text-sm opacity-60 leading-relaxed">{tenant.slogan}</p></div>
            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Navegação</p>
               <div className="flex flex-col gap-2">{cms.menus.main.map(m => renderLink(m, "text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"))}</div>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Conformidade Legal</p>
               <div className="flex flex-col gap-2">{cms.menus.footer.map(m => renderLink(m, "text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"))}</div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-white/10 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">
            © {new Date().getFullYear()} {tenant.nome} • Software por ImoSuite
         </div>
      </footer>
    </div>
  );
};

export default PublicImoveis;