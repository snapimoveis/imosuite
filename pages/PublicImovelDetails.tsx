
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { LeadService } from '../services/leadService';
import { 
  MapPin, Bed, Bath, Square, Loader2, ChevronLeft, 
  Send, Share2, Heart, Phone, Mail, Car, Zap, Check, ArrowRight, Building2, Calendar
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import ImovelCard from '../components/ImovelCard';

const PublicImovelDetails: React.FC = () => {
  const { slug: agencySlug, imovelSlug } = useParams<{ slug: string; imovelSlug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  
  useEffect(() => {
    const fetchData = async () => {
      if (!agencySlug || !imovelSlug) return;
      setLoading(true);
      try {
        // 1. Localizar agência para isolar o ambiente (Tenant Isolation)
        const tQuery = query(collection(db, "tenants"), where("slug", "==", agencySlug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          const root = document.documentElement;
          root.style.setProperty('--primary', tData.cor_primaria);

          // 2. Localizar imóvel DENTRO da agência específica
          const iQuery = query(collection(db, "tenants", tData.id, "properties"), where("slug", "==", imovelSlug), limit(1));
          const iSnap = await getDocs(iQuery);
          
          if (!iSnap.empty) {
            const data = { id: iSnap.docs[0].id, ...(iSnap.docs[0].data() as any) } as Imovel;
            setImovel(data);
            setFormData(prev => ({
              ...prev,
              mensagem: `Olá, gostaria de obter mais informações sobre o imóvel "${data.titulo}" (Ref: ${data.ref}).`
            }));

            // 3. Imóveis Sugeridos (Relacionados)
            const rQuery = query(
              collection(db, "tenants", tData.id, "properties"), 
              where("publicacao.publicar_no_site", "==", true),
              limit(10)
            );
            const rSnap = await getDocs(rQuery);
            const related = rSnap.docs
              .map(doc => ({ id: doc.id, ...(doc.data() as any) } as Imovel))
              .filter(p => p.id !== data.id)
              .slice(0, 3);
            setRelatedProperties(related);
          }
        }
      } catch (err) {
        console.error("Erro no carregamento:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agencySlug, imovelSlug]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !imovel) return;
    setIsSending(true);
    try {
      await LeadService.createLead(tenant.id, {
        ...formData,
        property_id: imovel.id,
        property_ref: imovel.ref,
        tipo: 'contacto'
      });
      setSent(true);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-200 mb-4" size={48} />
      <p className="font-brand font-black text-slate-400 uppercase tracking-widest text-[10px]">A sincronizar...</p>
    </div>
  );

  if (!imovel || !tenant) return (
    <div className="h-screen flex flex-col items-center justify-center font-brand p-10 text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-200"><Building2 size={32}/></div>
      <h2 className="text-xl font-black text-[#1c2d51] mb-2 tracking-tight">Imóvel não encontrado.</h2>
      <p className="text-slate-400 text-sm mb-6">O link pode ter expirado ou o imóvel foi removido.</p>
      <Link to={`/agencia/${agencySlug}`} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-bold text-sm">Explorar Catálogo</Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-brand text-slate-900 pb-20">
      {/* Navbar replicada */}
      <nav className="h-20 px-8 flex items-center justify-between border-b border-slate-50 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" alt={tenant.nome} /> : <span className="text-xl font-black text-[var(--primary)] tracking-tighter">{tenant.nome}</span>}
        </div>
        <div className="hidden md:flex gap-10 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <Link to={`/agencia/${tenant.slug}`} className="hover:text-[var(--primary)] transition-colors">Início</Link>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Imóveis</a>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Vender</a>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Serviços</a>
        </div>
        <button className="bg-[var(--primary)] text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">Contactar</button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-8">
        {/* Voltar ao catálogo */}
        <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1c2d51] font-bold text-xs mb-8 transition-colors">
          <ChevronLeft size={16}/> Voltar ao catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Coluna Esquerda: Galeria e Conteúdo */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-4">
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-100 shadow-sm">
                <img src={imovel.media?.items?.[activeImage]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200'} className="w-full h-full object-cover" alt={imovel.titulo} />
                <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-black">
                  {activeImage + 1} / {imovel.media?.items?.length || 1}
                </div>
              </div>
              
              {/* Miniaturas */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                {imovel.media?.items?.map((m, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === i ? 'border-[#1c2d51] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={m.url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <div className="bg-[#1c2d51] text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">{imovel.operacao}</div>
                <div className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">{imovel.tipo_imovel}</div>
                <div className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">{imovel.tipologia}</div>
              </div>
              
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-[#1c2d51] tracking-tighter leading-tight mb-2">{imovel.titulo}</h1>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <MapPin size={14} className="text-slate-300"/> {imovel.localizacao.concelho}, {imovel.localizacao.distrito}
                </div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-3">Ref: {imovel.ref}</p>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-6 border-t border-slate-50 pt-10">
              <h3 className="text-lg font-black text-[#1c2d51] uppercase tracking-widest">Descrição</h3>
              <div className="text-slate-500 leading-relaxed text-base font-medium">
                {imovel.descricao.completa_md || imovel.descricao.curta}
              </div>
            </div>

            {/* Detalhes (Table-like grid) */}
            <div className="space-y-8 border-t border-slate-50 pt-10">
               <h3 className="text-lg font-black text-[#1c2d51] uppercase tracking-widest">Detalhes</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
                  <DetailLine label="Tipo de Imóvel" value={imovel.tipo_imovel} />
                  <DetailLine label="Tipologia" value={imovel.tipologia} />
                  <DetailLine label="Área Bruta" value={`${imovel.areas.area_bruta_m2 || '--'} m²`} />
                  <DetailLine label="Área Útil" value={`${imovel.areas.area_util_m2 || '--'} m²`} />
                  <DetailLine label="Ano de Construção" value={imovel.ano_construcao || '---'} icon={<Calendar size={14}/>} />
                  <DetailLine label="Certificado Energético" value={imovel.certificacao.certificado_energetico} icon={<Zap size={14}/>} />
               </div>
            </div>

            {/* Características */}
            <div className="space-y-6 border-t border-slate-50 pt-10">
              <h3 className="text-lg font-black text-[#1c2d51] uppercase tracking-widest">Características</h3>
              <div className="flex flex-wrap gap-2">
                {imovel.caracteristicas?.map((c, i) => (
                  <span key={i} className="bg-[#1c2d51] text-white px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-tight shadow-sm">{c}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-50">
               <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1c2d51] hover:bg-slate-50 transition-all"><Share2 size={16}/> Partilhar</button>
               <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1c2d51] hover:bg-slate-50 transition-all"><Heart size={16}/> Guardar</button>
            </div>
          </div>

          {/* Coluna Direita: Sticky Sidebar */}
          <div className="lg:col-span-4">
             <div className="sticky top-28 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/5 border border-slate-50 space-y-8">
                   <div className="text-3xl font-black text-[#1c2d51] tracking-tight">
                     {formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro.preco_venda : imovel.financeiro.preco_arrendamento) || 0)}
                   </div>
                   
                   <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                      <Attribute icon={<Bed size={18}/>} label="Quartos" value={imovel.divisoes.quartos} />
                      <Attribute icon={<Bath size={18}/>} label="WC" value={imovel.divisoes.casas_banho} />
                      <Attribute icon={<Square size={18}/>} label="Área" value={`${imovel.areas.area_util_m2} m²`} />
                      <Attribute icon={<Car size={18}/>} label="Garagem" value={imovel.divisoes.garagem.lugares || (imovel.divisoes.garagem.tem ? 1 : 0)} />
                   </div>

                   <hr className="border-slate-50" />

                   <div className="space-y-6">
                      <h4 className="font-black text-[#1c2d51] uppercase text-[10px] tracking-[0.1em]">Interessado neste imóvel?</h4>
                      {sent ? (
                        <div className="p-6 bg-emerald-50 rounded-2xl text-center border border-emerald-100">
                           <p className="text-xs font-black text-emerald-700 uppercase">Mensagem enviada!</p>
                        </div>
                      ) : (
                        <form onSubmit={handleContact} className="space-y-3">
                           <input required placeholder="Nome *" className="w-full px-5 py-3.5 bg-slate-50 rounded-xl outline-none font-bold text-xs focus:bg-white border border-transparent focus:border-slate-200 transition-all" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                           <input required type="email" placeholder="Email *" className="w-full px-5 py-3.5 bg-slate-50 rounded-xl outline-none font-bold text-xs focus:bg-white border border-transparent focus:border-slate-200 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                           <input placeholder="Telefone" className="w-full px-5 py-3.5 bg-slate-50 rounded-xl outline-none font-bold text-xs focus:bg-white border border-transparent focus:border-slate-200 transition-all" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                           <textarea required rows={3} className="w-full px-5 py-3.5 bg-slate-50 rounded-xl outline-none font-bold text-xs focus:bg-white border border-transparent focus:border-slate-200 transition-all resize-none" value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})} />
                           <button disabled={isSending} className="w-full bg-[#357fb2] hover:bg-[#1c2d51] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50">
                             {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Enviar Mensagem
                           </button>
                           <p className="text-[7px] text-slate-400 text-center uppercase tracking-tight">Ao enviar, concorda com a nossa <span className="underline">política de privacidade</span>.</p>
                        </form>
                      )}
                   </div>

                   <div className="space-y-4 pt-6 border-t border-slate-50">
                      <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Ou contacte diretamente:</p>
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-xs font-black text-[#1c2d51]"><Phone size={14} className="text-slate-300"/> {tenant.telefone}</div>
                         <div className="flex items-center gap-2 text-xs font-black text-[#1c2d51]"><Mail size={14} className="text-slate-300"/> {tenant.email}</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Imóveis Sugeridos */}
        {relatedProperties.length > 0 && (
          <section className="mt-32 pt-20 border-t border-slate-50">
             <div className="mb-12">
                <h2 className="text-2xl font-black text-[#1c2d51] tracking-tighter">Imóveis Relacionados</h2>
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Mais opções para si</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {relatedProperties.map(p => (
                  <ImovelCard key={p.id} imovel={p} />
                ))}
             </div>
          </section>
        )}
      </main>

      {/* Footer replicado */}
      <footer className="py-20 bg-white text-slate-400 border-t border-slate-50 mt-20">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" alt={tenant.nome} /> : <span className="text-xl font-black text-[#1c2d51]">{tenant.nome}</span>}
            </div>
            <p className="text-sm max-w-sm font-medium leading-relaxed">{tenant.slogan || 'Sua imobiliária de confiança.'}</p>
          </div>
          <div>
            <h4 className="font-black text-[#1c2d51] mb-6 uppercase tracking-widest text-[9px]">Links Rápidos</h4>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-tight">
              <li><Link to={`/agencia/${tenant.slug}`} className="hover:text-[var(--primary)] transition-colors">Início</Link></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Catálogo de Imóveis</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-[#1c2d51] mb-6 uppercase tracking-widest text-[9px]">Contactos</h4>
            <ul className="space-y-3 text-xs font-bold leading-relaxed">
              <li className="flex items-center gap-2"><Mail size={14}/> {tenant.email}</li>
              <li className="flex items-center gap-2"><Phone size={14}/> {tenant.telefone}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pt-10 mt-10 border-t border-slate-50 text-[9px] font-black uppercase tracking-widest flex justify-between items-center text-slate-300">
          <span>&copy; {new Date().getFullYear()} {tenant.nome}.</span>
          <span className="flex items-center gap-1 opacity-40">Powered by <Building2 size={10}/> ImoSuite</span>
        </div>
      </footer>
    </div>
  );
};

const DetailLine = ({ label, value, icon }: any) => (
  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
     <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tight">
        {icon} <span>{label}</span>
     </div>
     <div className="font-black text-[#1c2d51] text-xs">{value}</div>
  </div>
);

const Attribute = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-3">
     <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-[#1c2d51] shrink-0">{icon}</div>
     <div>
        <p className="text-xs font-black text-[#1c2d51] leading-none mb-0.5">{value}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
     </div>
  </div>
);

export default PublicImovelDetails;
