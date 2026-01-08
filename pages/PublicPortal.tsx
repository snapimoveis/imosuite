
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { Search, MapPin, Bed, Bath, Square, Loader2, Phone, Mail, Globe, Facebook, Instagram } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
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
        // 1. Fetch Tenant
        const tRef = collection(db, "tenants");
        const tQuery = query(tRef, where("slug", "==", slug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() } as Tenant;
          setTenant(tData);

          // 2. Fetch Properties for this Tenant
          const pRef = collection(db, "tenants", tData.id, "properties");
          const pSnap = await getDocs(pRef);
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

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200 mb-4" size={48} /><p className="font-brand font-black text-slate-400 uppercase tracking-widest text-xs">A carregar portal imobiliário...</p></div>;
  if (!tenant) return <div className="h-screen flex items-center justify-center font-brand">Agência não encontrada.</div>;

  const templateId = (tenant as any).template_id || 'heritage';

  // Renderização condicional baseada no template
  return (
    <div className={`min-h-screen font-brand ${templateId === 'prestige' ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`} style={{ '--primary': tenant.cor_primaria } as any}>
      {/* Navbar do Portal */}
      <nav className="h-20 border-b border-slate-100/10 flex items-center justify-between px-8 sticky top-0 bg-inherit z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white" style={{ backgroundColor: tenant.cor_primaria }}>
            {tenant.nome.charAt(0)}
          </div>
          <span className="font-black text-xl tracking-tighter">{tenant.nome}</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold opacity-70">
          <a href="#" className="hover:opacity-100">Início</a>
          <a href="#" className="hover:opacity-100">Imóveis</a>
          <a href="#" className="hover:opacity-100">Sobre</a>
          <a href="#" className="bg-slate-900 text-white px-6 py-2 rounded-full" style={{ backgroundColor: tenant.cor_primaria }}>Contacto</a>
        </div>
      </nav>

      {/* Hero Dinâmico */}
      <header className={`relative py-32 px-8 text-center overflow-hidden ${templateId === 'canvas' ? 'bg-slate-50' : ''}`}>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[0.9]">
            {(tenant as any).slogan || 'Encontre o seu imóvel ideal.'}
          </h1>
          <p className="text-xl opacity-60 max-w-2xl mx-auto mb-12">
            O seu parceiro de confiança no mercado imobiliário em {properties[0]?.concelho || 'Portugal'}.
          </p>
          <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 border border-slate-100">
            <div className="flex-1 flex items-center px-6 py-4 gap-3 bg-slate-50 rounded-xl">
               <Search className="text-slate-300" size={20} />
               <input type="text" placeholder="Ex: Apartamento T2 em Lisboa..." className="bg-transparent outline-none w-full font-bold text-slate-900" />
            </div>
            <button className="px-10 py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs" style={{ backgroundColor: tenant.cor_primaria }}>Procurar</button>
          </div>
        </div>
      </header>

      {/* Listagem de Imóveis */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Imóveis em Destaque</h2>
            <div className="w-12 h-1.5 bg-blue-500 mt-2 rounded-full" style={{ backgroundColor: tenant.cor_primaria }}></div>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <p className="font-bold text-slate-400">Nenhum imóvel disponível de momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {properties.map(p => (
              <div key={p.id} className={`group rounded-[2rem] overflow-hidden border border-slate-100 transition-all hover:shadow-2xl ${templateId === 'prestige' ? 'bg-slate-900 border-white/5' : 'bg-white'}`}>
                <div className="h-64 relative overflow-hidden">
                   <img src={p.media[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-white text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{p.tipo_negocio}</span>
                   </div>
                   <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur text-slate-900 px-4 py-2 rounded-xl font-black shadow-lg">
                      {formatCurrency(p.preco || p.preco_arrendamento)}
                   </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3" style={{ color: tenant.cor_primaria }}>
                    <MapPin size={12} /> {p.concelho}, {p.distrito}
                  </div>
                  <h3 className="text-xl font-black mb-6 line-clamp-1">{p.titulo}</h3>
                  <div className="flex justify-between border-t border-slate-100/10 pt-6 opacity-60 text-xs font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Bed size={16}/> {p.tipologia || 'N/A'}</div>
                    <div className="flex items-center gap-2"><Bath size={16}/> {p.casas_banho || '0'}</div>
                    <div className="flex items-center gap-2"><Square size={16}/> {p.area_util_m2 || '0'}m²</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer do Portal */}
      <footer className={`py-20 px-8 border-t ${templateId === 'prestige' ? 'border-white/5' : 'border-slate-50'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
               <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs" style={{ backgroundColor: tenant.cor_primaria }}>{tenant.nome.charAt(0)}</div>
               <span className="font-black text-lg tracking-tighter">{tenant.nome}</span>
            </div>
            <p className="text-sm opacity-50 font-medium">Líder no mercado imobiliário local, focados em encontrar o espaço perfeito para a sua vida.</p>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-widest opacity-40 mb-6">Contacto</h4>
            <div className="space-y-4 text-sm font-bold">
               <div className="flex items-center gap-3"><Phone size={16}/> {tenant.telefone || '+351 900 000 000'}</div>
               <div className="flex items-center gap-3"><Mail size={16}/> {tenant.email}</div>
            </div>
          </div>
          <div className="flex gap-4">
             <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-900"><Facebook size={18}/></button>
             <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-900"><Instagram size={18}/></button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortal;
