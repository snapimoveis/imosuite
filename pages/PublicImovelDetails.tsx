
import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { LeadService } from '../services/leadService';
import { 
  MapPin, Bed, Bath, Square, Loader2, ChevronLeft, 
  Send, Share2, Heart, Phone, Mail, Car, Zap, Check, ArrowRight, Building2
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
        // 1. Encontrar agência pelo slug
        const tQuery = query(collection(db, "tenants"), where("slug", "==", agencySlug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          
          // Aplicar cores dinâmicas
          const root = document.documentElement;
          root.style.setProperty('--primary', tData.cor_primaria);

          // 2. Encontrar imóvel pelo slug dentro da agência
          const iQuery = query(collection(db, "tenants", tData.id, "properties"), where("slug", "==", imovelSlug), limit(1));
          const iSnap = await getDocs(iQuery);
          
          if (!iSnap.empty) {
            const data = { id: iSnap.docs[0].id, ...(iSnap.docs[0].data() as any) } as Imovel;
            setImovel(data);
            setFormData(prev => ({
              ...prev,
              mensagem: `Olá, gostaria de obter mais informações sobre o imóvel "${data.titulo}" (Ref: ${data.ref}).`
            }));

            // 3. Buscar Imóveis Relacionados (mesmo tipo ou mesma zona)
            const rQuery = query(
              collection(db, "tenants", tData.id, "properties"), 
              where("publicacao.publicar_no_site", "==", true),
              limit(4)
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
        console.error("Erro ao carregar detalhes:", err);
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
    } catch (err) {
      console.error("Erro ao enviar lead:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-200 mb-4" size={48} />
      <p className="font-brand font-black text-slate-400 uppercase tracking-widest text-[10px]">A preparar detalhes do imóvel...</p>
    </div>
  );

  if (!imovel || !tenant) return (
    <div className="h-screen flex flex-col items-center justify-center font-brand">
      <h2 className="text-2xl font-black text-[#1c2d51] mb-4">Imóvel não encontrado.</h2>
      <Link to={`/agencia/${agencySlug}`} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-bold">Voltar à Agência</Link>
    </div>
  );

  const mainImage = imovel.media?.items?.[activeImage]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200';

  return (
    <div className="bg-[#fcfcfc] min-h-screen font-brand text-slate-900 pb-24">
      {/* Navegação da Agência */}
      <nav className="h-20 px-8 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" alt={tenant.nome} /> : <span className="text-xl font-black text-[var(--primary)] tracking-tighter">{tenant.nome}</span>}
        </div>
        <div className="hidden md:flex gap-10 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <Link to={`/agencia/${tenant.slug}`} className="hover:text-[var(--primary)] transition-colors">Início</Link>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Imóveis</a>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Vender</a>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Serviços</a>
        </div>
        <button className="bg-[var(--primary)] text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Contactar</button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* Link Voltar */}
        <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1c2d51] font-bold text-sm mb-10 transition-colors">
          <ChevronLeft size={18}/> Voltar ao catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Coluna Esquerda: Media e Descrição */}
          <div className="lg:col-span-2 space-y-12">
            {/* Galeria Principal */}
            <div className="space-y-6">
              <div className="relative h-[550px] rounded-[2rem] overflow-hidden bg-slate-100 shadow-xl border border-slate-50">
                <img src={mainImage} className="w-full h-full object-cover" alt={imovel.titulo} />
                <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {activeImage + 1} / {imovel.media?.items?.length || 1}
                </div>
              </div>
              
              {/* Miniaturas */}
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {imovel.media?.items?.map((m, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`relative w-28 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === i ? 'border-[#1c2d51] scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={m.url} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Cabeçalho de Texto */}
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <div className="bg-[#1c2d51] text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">{imovel.operacao === 'venda' ? 'Venda' : 'Arrendamento'}</div>
                <div className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{imovel.tipo_imovel}</div>
                <div className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{imovel.tipologia}</div>
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter leading-[1.1] mb-3">{imovel.titulo}</h1>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  <MapPin size={16} className="text-slate-300"/> {imovel.localizacao.concelho}, {imovel.localizacao.distrito}
                </div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-4">Ref: {imovel.ref}</p>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-[#1c2d51] tracking-tight">Descrição</h3>
              <div className="text-slate-500 leading-relaxed text-lg whitespace-pre-line font-medium prose max-w-none">
                {imovel.descricao.completa_md || imovel.descricao.curta}
              </div>
            </div>

            {/* Detalhes / Grelha de Atributos */}
            <div className="space-y-8 pt-8 border-t border-slate-100">
               <h3 className="text-xl font-black text-[#1c2d51] tracking-tight">Detalhes</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <DetailRow label="Tipo de Imóvel" value={imovel.tipo_imovel} />
                  <DetailRow label="Tipologia" value={imovel.tipologia} />
                  <DetailRow label="Área Bruta" value={`${imovel.areas.area_bruta_m2 || '--'} m²`} />
                  <DetailRow label="Área Útil" value={`${imovel.areas.area_util_m2 || '--'} m²`} />
                  <DetailRow label="Ano de Construção" value={imovel.ano_construcao || '---'} icon={<CalendarIcon/>} />
                  <DetailRow label="Certificado Energético" value={imovel.certificacao.certificado_energetico} icon={<EnergyIcon/>} />
               </div>
            </div>

            {/* Características / Tags */}
            <div className="space-y-8 pt-8 border-t border-slate-100">
              <h3 className="text-xl font-black text-[#1c2d51] tracking-tight">Características</h3>
              <div className="flex flex-wrap gap-3">
                {imovel.caracteristicas?.map((c, i) => (
                  <span key={i} className="bg-[#1c2d51] text-white px-5 py-3 rounded-xl text-[11px] font-bold tracking-tight shadow-sm">{c}</span>
                ))}
              </div>
            </div>

            {/* Ações Inferiores */}
            <div className="flex gap-4 pt-10">
               <button className="flex items-center gap-3 px-8 py-4 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-[#1c2d51] hover:bg-slate-50 transition-all"><Share2 size={18}/> Partilhar</button>
               <button className="flex items-center gap-3 px-8 py-4 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-[#1c2d51] hover:bg-slate-50 transition-all"><Heart size={18}/> Guardar</button>
            </div>
          </div>

          {/* Coluna Direita: Preço e Contacto (Sticky) */}
          <div className="lg:col-span-1">
             <div className="sticky top-32 space-y-8">
                {/* Preço e Atributos Rápidos */}
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-50 space-y-10">
                   <div className="text-4xl font-black text-[#1c2d51] tracking-tight">
                     {formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro.preco_venda : imovel.financeiro.preco_arrendamento) || 0)}
                   </div>
                   
                   <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                      <IconBox icon={<Bed size={20}/>} label="Quartos" value={imovel.divisoes.quartos} />
                      <IconBox icon={<Bath size={20}/>} label="WCs" value={imovel.divisoes.casas_banho} />
                      <IconBox icon={<Square size={20}/>} label="Área" value={`${imovel.areas.area_util_m2} m²`} />
                      <IconBox icon={<Car size={20}/>} label="Garagem" value={imovel.divisoes.garagem.lugares || (imovel.divisoes.garagem.tem ? 1 : 0)} />
                   </div>

                   <hr className="border-slate-50" />

                   <div className="space-y-6">
                      <h4 className="font-black text-[#1c2d51] uppercase text-[11px] tracking-widest">Interessado neste imóvel?</h4>
                      {sent ? (
                        <div className="p-8 bg-emerald-50 rounded-[2rem] text-center space-y-3 border border-emerald-100 animate-in zoom-in-95">
                           <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><Check size={24}/></div>
                           <p className="text-sm font-black text-emerald-700 uppercase tracking-tighter">Mensagem enviada com sucesso!</p>
                           <p className="text-[10px] font-bold text-emerald-600/60 uppercase leading-none">A agência entrará em contacto brevemente.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleContact} className="space-y-4">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-300 ml-4">Nome *</label>
                             <input required placeholder="O seu nome" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-300 ml-4">Email *</label>
                             <input required type="email" placeholder="email@exemplo.com" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-300 ml-4">Telefone</label>
                             <input placeholder="+351 900 000 000" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-300 ml-4">Mensagem *</label>
                             <textarea required rows={4} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all resize-none" value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})} />
                           </div>
                           <button disabled={isSending} className="w-full bg-[#357fb2] hover:bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50">
                             {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Enviar Mensagem
                           </button>
                           <p className="text-[8px] text-slate-400 text-center font-bold uppercase tracking-tight leading-relaxed">Ao enviar, concorda com a nossa <span className="underline cursor-pointer">política de privacidade</span>.</p>
                        </form>
                      )}
                   </div>

                   <hr className="border-slate-50" />

                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Ou contacte-nos diretamente:</p>
                      <div className="space-y-3">
                         <div className="flex items-center gap-3 text-sm font-black text-[#1c2d51]"><Phone size={16} className="text-slate-300"/> {tenant.telefone}</div>
                         <div className="flex items-center gap-3 text-sm font-black text-[#1c2d51]"><Mail size={16} className="text-slate-300"/> {tenant.email}</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Imóveis Relacionados */}
        {relatedProperties.length > 0 && (
          <section className="mt-40 border-t border-slate-100 pt-24">
             <div className="flex justify-between items-end mb-16">
                <div>
                  <h2 className="text-4xl font-black text-[#1c2d51] tracking-tighter">Imóveis Relacionados</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Sugestões baseadas nas suas preferências</p>
                </div>
                <Link to={`/agencia/${tenant.slug}`} className="hidden md:flex items-center gap-2 px-8 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Ver catálogo <ArrowRight size={14}/></Link>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {relatedProperties.map(p => (
                  <ImovelCard key={p.id} imovel={p} />
                ))}
             </div>
          </section>
        )}
      </main>

      {/* Footer Branded */}
      <footer className="py-24 bg-white text-slate-400 border-t border-slate-50 mt-32">
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
              <li><Link to={`/agencia/${tenant.slug}`} className="hover:text-[var(--primary)] transition-colors">Catálogo de Imóveis</Link></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Venda o seu Imóvel</a></li>
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

const DetailRow = ({ label, value, icon }: any) => (
  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
     <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
        {icon} <span>{label}</span>
     </div>
     <div className="font-black text-[#1c2d51] text-sm">{value}</div>
  </div>
);

const IconBox = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4">
     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#1c2d51] shrink-0">{icon}</div>
     <div>
        <p className="text-[11px] font-black text-[#1c2d51] leading-none mb-0.5">{value}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
     </div>
  </div>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

const EnergyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

export default PublicImovelDetails;
