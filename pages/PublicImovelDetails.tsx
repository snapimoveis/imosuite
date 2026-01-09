
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// Correcting modular Firestore imports for version 9+
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tenant, Imovel } from '../types';
import { LeadService } from '../services/leadService';
import { 
  MapPin, Bed, Bath, Square, Loader2, ChevronLeft, 
  Send, Share2, Heart, Phone, Mail, Car, Zap, Check, ArrowRight, Building2, Calendar, Info, ShieldCheck,
  Star
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
          
          // Injeção de Identidade Visual
          const root = document.documentElement;
          root.style.setProperty('--primary', tData.cor_primaria);
          root.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);

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

            // 3. Imóveis Sugeridos (Relacionados) do mesmo Tenant
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
      <p className="font-brand font-black text-slate-400 uppercase tracking-widest text-[10px]">A sincronizar dados...</p>
    </div>
  );

  if (!imovel || !tenant) return (
    <div className="h-screen flex flex-col items-center justify-center font-brand p-10 text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-200"><Building2 size={32}/></div>
      <h2 className="text-xl font-black text-[#1c2d51] mb-2 tracking-tight">Imóvel não encontrado.</h2>
      <p className="text-slate-400 text-sm mb-6">O link pode ter expirado ou o imóvel foi removido pela agência.</p>
      <Link to={`/agencia/${agencySlug}`} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-bold text-sm">Explorar Catálogo</Link>
    </div>
  );

  const images = imovel.media?.items || [];
  const mainImage = images[activeImage]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200';

  return (
    <div className="bg-white min-h-screen font-brand text-slate-900 pb-20">
      {/* Navbar replicada do Tenant */}
      <nav className="h-20 px-8 flex items-center justify-between border-b border-slate-50 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} className="h-10 w-auto object-contain" alt={tenant.nome} />
            ) : (
              <span className="text-xl font-black text-[var(--primary)] tracking-tighter uppercase">{tenant.nome}</span>
            )}
          </Link>
        </div>
        <div className="hidden md:flex gap-10 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <Link to={`/agencia/${tenant.slug}`} className="hover:text-[var(--primary)] transition-colors">Início</Link>
          <Link to={`/agencia/${tenant.slug}`} className="hover:text-[var(--primary)] transition-colors">Imóveis</Link>
        </div>
        <button className="bg-[var(--primary)] text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--primary)]/20 hover:scale-105 transition-all">Contactar</button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-[var(--primary)] transition-colors mb-8">
           <ChevronLeft size={16}/> Voltar à Listagem
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* COLUNA ESQUERDA: GALERIA E INFO */}
          <div className="lg:col-span-8 space-y-10">
            {/* Galeria Premium */}
            <div className="space-y-4">
               <div className="aspect-[16/9] rounded-[3rem] overflow-hidden bg-slate-100 shadow-2xl relative group">
                  <img src={mainImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={imovel.titulo} />
                  <div className="absolute top-6 left-6 flex gap-3">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--primary)] shadow-xl">
                      {imovel.operacao}
                    </div>
                    {imovel.publicacao?.destaque && (
                      <div className="bg-amber-400 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <Star size={14} fill="currentColor" /> Destaque
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Foto {activeImage + 1} de {images.length || 1}
                  </div>
               </div>
               
               {images.length > 1 && (
                 <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                   {images.map((img, idx) => (
                     <button 
                       key={img.id} 
                       onClick={() => setActiveImage(idx)}
                       className={`w-32 aspect-video rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${activeImage === idx ? 'border-[var(--primary)] scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                     >
                       <img src={img.url} className="w-full h-full object-cover" alt="" />
                     </button>
                   ))}
                 </div>
               )}
            </div>

            {/* Título e Tags Rápidas */}
            <div className="space-y-6">
               <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter leading-[1.1] mb-2">{imovel.titulo}</h1>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                       <MapPin size={16} className="text-blue-500" /> {imovel.localizacao.morada}, {imovel.localizacao.concelho}
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><Heart size={20}/></button>
                     <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"><Share2 size={20}/></button>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpecBox icon={<Bed size={20}/>} label="Quartos" val={imovel.divisoes.quartos} />
                  <SpecBox icon={<Bath size={20}/>} label="WCs" val={imovel.divisoes.casas_banho} />
                  <SpecBox icon={<Square size={20}/>} label="Área Útil" val={`${imovel.areas.area_util_m2} m²`} />
                  <SpecBox icon={<Building2 size={20}/>} label="Tipo" val={imovel.tipo_imovel} />
               </div>
            </div>

            {/* Descrição */}
            <div className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100 space-y-6">
               <h3 className="text-xl font-black text-[#1c2d51] uppercase tracking-widest flex items-center gap-3">
                 <Info size={24} className="text-blue-500" /> Descrição do Imóvel
               </h3>
               <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-lg">
                    {imovel.descricao.completa_md || imovel.descricao.curta}
                  </p>
               </div>
               
               {imovel.caracteristicas.length > 0 && (
                 <div className="pt-8 border-t border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Características Adicionais</p>
                    <div className="flex flex-wrap gap-2">
                       {imovel.caracteristicas.map(feat => (
                         <span key={feat} className="bg-white border border-slate-100 px-4 py-2 rounded-xl text-xs font-black text-[#1c2d51] flex items-center gap-2 shadow-sm">
                           <Check size={14} className="text-emerald-500" /> {feat}
                         </span>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            {/* Ficha Técnica Detalhada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-4">
                  <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 border-b pb-4">Detalhes Técnicos</h4>
                  <div className="space-y-3">
                     <DetailRow label="Referência" val={imovel.ref} />
                     <DetailRow label="Estado" val={imovel.estado_conservacao} />
                     <DetailRow label="Ano de Construção" val={imovel.ano_construcao || 'N/A'} />
                     <DetailRow label="Certificado Energético" val={imovel.certificacao.certificado_energetico} />
                  </div>
               </div>
               <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-4">
                  <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 border-b pb-4">Áreas</h4>
                  <div className="space-y-3">
                     <DetailRow label="Área Útil" val={`${imovel.areas.area_util_m2 || 0} m²`} />
                     <DetailRow label="Área Bruta" val={`${imovel.areas.area_bruta_m2 || 0} m²`} />
                     <DetailRow label="Andar" val={imovel.areas.andar || 'R/C'} />
                     <DetailRow label="Elevador" val={imovel.areas.elevador ? 'Sim' : 'Não'} />
                  </div>
               </div>
            </div>
          </div>

          {/* COLUNA DIREITA: PREÇO E FORMULÁRIO */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              {/* Card de Preço */}
              <div className="bg-[#1c2d51] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2">Valor de Mercado</p>
                 <h2 className="text-5xl font-black tracking-tighter mb-4">
                   {formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro.preco_venda : imovel.financeiro.preco_arrendamento) || 0)}
                 </h2>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Zap size={14} className="text-amber-400" />
                    <span>Oportunidade {imovel.operacao}</span>
                 </div>
              </div>

              {/* Formulário de Contacto */}
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                 {sent ? (
                   <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-500">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                        <Check size={32} />
                      </div>
                      <h3 className="text-xl font-black text-[#1c2d51]">Pedido Enviado!</h3>
                      <p className="text-xs text-slate-400 font-medium">A nossa equipa entrará em contacto consigo muito brevemente.</p>
                      <button onClick={() => setSent(false)} className="text-[10px] font-black uppercase text-blue-500 tracking-widest hover:underline">Enviar outra mensagem</button>
                   </div>
                 ) : (
                   <>
                    <div className="space-y-2">
                       <h3 className="font-black text-[#1c2d51] text-lg">Solicitar Informação</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Respondemos em menos de 24h</p>
                    </div>
                    <form onSubmit={handleContact} className="space-y-4">
                       <input 
                         required 
                         placeholder="O seu nome" 
                         className="detail-input" 
                         value={formData.nome} 
                         onChange={e => setFormData({...formData, nome: e.target.value})} 
                       />
                       <input 
                         required 
                         type="email" 
                         placeholder="Endereço de email" 
                         className="detail-input" 
                         value={formData.email} 
                         onChange={e => setFormData({...formData, email: e.target.value})} 
                       />
                       <input 
                         placeholder="Telefone (opcional)" 
                         className="detail-input" 
                         value={formData.telefone} 
                         onChange={e => setFormData({...formData, telefone: e.target.value})} 
                       />
                       <textarea 
                         rows={4} 
                         placeholder="A sua mensagem..." 
                         className="detail-input resize-none" 
                         value={formData.mensagem} 
                         onChange={e => setFormData({...formData, mensagem: e.target.value})} 
                       />
                       
                       <button 
                         type="submit" 
                         disabled={isSending}
                         className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                       >
                          {isSending ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                          {isSending ? 'A Enviar...' : 'Enviar Pedido'}
                       </button>
                    </form>

                    <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                       <a href={`tel:${tenant.telefone}`} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors group">
                          <Phone size={18} className="text-slate-300 group-hover:text-blue-500 mb-2"/>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Ligar</span>
                       </a>
                       <a href={`mailto:${tenant.email}`} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors group">
                          <Mail size={18} className="text-slate-300 group-hover:text-blue-500 mb-2"/>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Email</span>
                       </a>
                    </div>
                   </>
                 )}
              </div>

              {/* Selo de Garantia do Tenant */}
              <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 flex items-center gap-4">
                 <ShieldCheck className="text-emerald-500" size={24} />
                 <div>
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Anúncio Verificado</p>
                    <p className="text-[9px] text-emerald-600/70 font-bold uppercase">Publicado por {tenant.nome}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Imóveis Relacionados */}
        {relatedProperties.length > 0 && (
          <section className="mt-32 pt-20 border-t border-slate-100">
             <div className="flex justify-between items-end mb-12">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Pode também interessar</p>
                  <h2 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Imóveis Recomendados</h2>
                </div>
                <Link to={`/agencia/${tenant.slug}`} className="text-[10px] font-black uppercase text-[var(--primary)] flex items-center gap-2 hover:gap-3 transition-all">
                  Ver Todo o Catálogo <ArrowRight size={16}/>
                </Link>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {relatedProperties.map(p => (
                  <ImovelCard key={p.id} imovel={p} />
                ))}
             </div>
          </section>
        )}
      </main>

      <style>{`
        .detail-input { 
          width: 100%; 
          padding: 1.25rem 1.5rem; 
          background: #f8fafc; 
          border: 2px solid transparent; 
          border-radius: 1.25rem; 
          outline: none; 
          font-weight: 700; 
          color: #1c2d51; 
          font-size: 0.875rem;
          transition: all 0.2s; 
        }
        .detail-input:focus { background: #fff; border-color: var(--primary); }
        .detail-input::placeholder { color: #cbd5e1; }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const SpecBox = ({ icon, label, val }: { icon: any, label: string, val: any }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
    <div className="text-slate-300 mb-3">{icon}</div>
    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className="text-sm font-black text-[#1c2d51] tracking-tight">{val}</p>
  </div>
);

const DetailRow = ({ label, val }: { label: string, val: any }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-xs font-black text-[#1c2d51]">{val}</span>
  </div>
);

export default PublicImovelDetails;
