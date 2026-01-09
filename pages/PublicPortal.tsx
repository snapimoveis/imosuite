
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { 
  Loader2, Building2, ChevronRight, Mail, Phone, 
  ArrowRight, Handshake, Key
} from 'lucide-react';
import ImovelCard from '../components/ImovelCard';

const PublicPortal: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        let tData: Tenant | null = null;
        
        // 1. Encontrar Agência
        const tRef = collection(db, "tenants");
        const tQuery = query(tRef, where("slug", "==", slug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
        } else {
          const docRef = doc(db, "tenants", slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            tData = { id: docSnap.id, ...(docSnap.data() as any) } as Tenant;
          }
        }
        
        if (tData) {
          setTenant(tData);
          const root = document.documentElement;
          root.style.setProperty('--primary', tData.cor_primaria);
          root.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);

          // 2. Carregar todos os imóveis da agência (mais resiliente)
          const pRef = collection(db, "tenants", tData.id, "properties");
          const pSnap = await getDocs(pRef);
          
          const allProps = pSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Imovel));
          
          // 3. Filtrar e Ordenar em JavaScript (Garante funcionamento sem índices compostos)
          const processed = allProps
            .filter(p => p.publicacao?.publicar_no_site === true)
            .sort((a, b) => {
              // Destaques primeiro
              const destA = a.publicacao?.destaque ? 1 : 0;
              const destB = b.publicacao?.destaque ? 1 : 0;
              if (destA !== destB) return destB - destA;
              
              // Depois por data (mais recentes primeiro)
              const dateA = a.created_at?.seconds || 0;
              const dateB = b.created_at?.seconds || 0;
              return dateB - dateA;
            })
            .slice(0, 9); // Limitar a 9 na homepage

          setProperties(processed);
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
      <p className="font-brand font-black text-slate-400 uppercase tracking-widest text-[10px]">A carregar portal imobiliário...</p>
    </div>
  );

  if (!tenant) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center font-brand">
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6"><Building2 size={40} className="text-slate-200"/></div>
      <h2 className="text-3xl font-black text-[#1c2d51] mb-2 tracking-tighter">Portal não encontrado</h2>
      <Link to="/" className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl">Voltar ao Início</Link>
    </div>
  );

  return (
    <div className="bg-white font-brand min-h-screen flex flex-col" style={{ '--primary': tenant.cor_primaria } as any}>
      {/* Navegação */}
      <nav className="h-20 px-8 flex items-center justify-between border-b border-slate-50 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" alt={tenant.nome} /> : <span className="text-xl font-black text-[var(--primary)] tracking-tighter">{tenant.nome}</span>}
        </div>
        <div className="hidden md:flex gap-10 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Início</a>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Imóveis</a>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Vender</a>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Serviços</a>
        </div>
        <button className="bg-[var(--primary)] text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95 transition-all">Contactar</button>
      </nav>
      
      {/* Hero */}
      <header className="py-24 px-8 text-center bg-slate-50 relative overflow-hidden flex flex-col justify-center items-center min-h-[60vh]">
        <div className="absolute inset-0 z-0">
           <img src={tenant.hero_image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600'} className="w-full h-full object-cover opacity-[0.1]" alt="Hero" />
           <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-8xl font-black text-[#1c2d51] mb-8 leading-[1.1] tracking-tighter animate-in slide-in-from-bottom duration-700">
            {tenant.slogan || 'Entre, a casa é sua!'}
          </h1>
          <div className="bg-white p-2 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto border border-slate-100">
             <div className="flex-1 px-8 py-4 text-left border-r border-slate-50">
                <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Localização</p>
                <p className="text-sm font-bold text-[#1c2d51]">Onde quer viver?</p>
             </div>
             <div className="flex-1 px-8 py-4 text-left border-r border-slate-50">
                <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Tipo de Imóvel</p>
                <p className="text-sm font-bold text-[#1c2d51]">Apartamento ou Moradia</p>
             </div>
             <button className="bg-[var(--primary)] text-white px-12 py-5 rounded-2xl font-black uppercase text-xs shadow-xl hover:opacity-90 transition-all">Pesquisar</button>
          </div>
        </div>
      </header>
      
      {/* Imóveis em Destaque */}
      <main className="max-w-7xl mx-auto py-32 px-8 flex-1 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter">Imóveis em Destaque</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Seleção especial das melhores oportunidades do mercado</p>
          </div>
          <button className="flex items-center gap-2 px-8 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Ver todos os imóveis <ChevronRight size={14}/></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {properties.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Nenhum imóvel em destaque no momento.</p>
            </div>
          ) : (
            properties.map(p => (
              <ImovelCard key={p.id} imovel={p} />
            ))
          )}
        </div>
      </main>

      {/* Secção de Serviços */}
      <section className="py-32 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter mb-4">Os Nossos Serviços</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-20">Acompanhamento personalizado em todas as fases do seu projeto imobiliário</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <ServiceCard icon={<Building2 size={32}/>} title="Compra de Imóveis" desc="Encontramos o imóvel perfeito para si, seja para habitação própria ou investimento. Análise de mercado e negociação incluídas." />
            <ServiceCard icon={<Key size={32}/>} title="Arrendamento" desc="Gestão completa de arrendamento, desde a seleção de inquilinos até à elaboração de contratos e cobrança de rendas." />
            <ServiceCard icon={<Handshake size={32}/>} title="Venda de Imóveis" desc="Valorização e promoção do seu imóvel para uma venda rápida e ao melhor preço de mercado." />
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <section className="py-32 bg-[var(--primary)] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
           <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">Quer vender ou arrendar o seu imóvel?</h2>
           <p className="text-xl text-white/70 font-medium mb-12 max-w-2xl mx-auto">Contacte-nos para uma avaliação gratuita e descubra como podemos ajudá-lo a obter o melhor resultado.</p>
           <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-[#1c2d51] text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:-translate-y-1 transition-all">Fale Connosco <ArrowRight size={18}/></button>
              <button className="bg-white text-[#1c2d51] px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Saber Mais</button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-white text-slate-400 border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-8">
              {tenant.logo_url ? <img src={tenant.logo_url} className="h-12 w-auto object-contain" alt={tenant.nome} /> : <span className="text-2xl font-black text-[#1c2d51] tracking-tighter">{tenant.nome}</span>}
            </div>
            <p className="text-lg max-w-sm font-medium leading-relaxed text-slate-400">{tenant.slogan || 'Especialistas no mercado imobiliário.'}</p>
          </div>
          <div>
            <h4 className="font-black text-[#1c2d51] mb-8 uppercase tracking-widest text-[10px]">Links Rápidos</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Catálogo de Imóveis</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Venda o seu Imóvel</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Área de Cliente</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-[#1c2d51] mb-8 uppercase tracking-widest text-[10px]">Contactos</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li className="flex items-center gap-3"><Mail size={16}/> {tenant.email}</li>
              <li className="flex items-center gap-3"><Phone size={16}/> {tenant.telefone}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pt-16 mt-16 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest flex justify-between items-center text-slate-300">
          <span>&copy; {new Date().getFullYear()} {tenant.nome}.</span>
          <span className="flex items-center gap-1.5 opacity-40">Powered by <Building2 size={12}/> ImoSuite</span>
        </div>
      </footer>
    </div>
  );
};

const ServiceCard = ({ icon, title, desc }: any) => (
  <div className="bg-white p-12 rounded-[2.5rem] text-left border border-slate-50 shadow-sm hover:shadow-xl transition-all">
    <div className="w-16 h-16 bg-blue-50 text-[#1c2d51] rounded-2xl flex items-center justify-center mb-8">{icon}</div>
    <h3 className="text-2xl font-black text-[#1c2d51] mb-4 tracking-tighter">{title}</h3>
    <p className="text-slate-400 font-medium leading-relaxed text-sm">{desc}</p>
  </div>
);

export default PublicPortal;
