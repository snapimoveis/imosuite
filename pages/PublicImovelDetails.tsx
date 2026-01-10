
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// Fix: Using @firebase/firestore to resolve missing modular exports
import { collection, query, where, getDocs, limit } from "@firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel } from '../types';
import { LeadService } from '../services/leadService';
import { 
  MapPin, Bed, Bath, Square, Loader2, ChevronLeft, 
  Send, Share2, Heart, Phone, Mail, Building2, Star,
  Zap, Check, ArrowRight, Info, ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import ImovelCard from '../components/ImovelCard';
import SEO from '../components/SEO';
import { DEFAULT_TENANT } from '../constants';
import { MOCK_IMOVEIS } from '../mocks';

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
  const [gdprConsent, setGdprConsent] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-spam
  
  useEffect(() => {
    const fetchData = async () => {
      if (!agencySlug || !imovelSlug) return;
      setLoading(true);

      // Bypass de Demonstração
      if (agencySlug === 'demo-imosuite') {
        setTimeout(() => {
          setTenant(DEFAULT_TENANT);
          const found = MOCK_IMOVEIS.find(m => m.slug === imovelSlug);
          if (found) {
            setImovel(found);
            setRelatedProperties(MOCK_IMOVEIS.filter(m => m.slug !== imovelSlug).slice(0, 3));
            setFormData(prev => ({
              ...prev,
              mensagem: `Olá, gostaria de obter mais informações sobre o imóvel "${found.titulo}" (Demo Ref: ${found.ref}).`
            }));
          }
          
          const root = document.documentElement;
          root.style.setProperty('--primary', DEFAULT_TENANT.cor_primaria);
          root.style.setProperty('--secondary', DEFAULT_TENANT.cor_secundaria);
          
          setLoading(false);
        }, 600);
        return;
      }

      try {
        const tQuery = query(collection(db, "tenants"), where("slug", "==", agencySlug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          
          const root = document.documentElement;
          root.style.setProperty('--primary', tData.cor_primaria);
          root.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);

          const iQuery = query(collection(db, "tenants", tData.id, "properties"), where("slug", "==", imovelSlug), limit(1));
          const iSnap = await getDocs(iQuery);
          
          if (!iSnap.empty) {
            const data = { id: iSnap.docs[0].id, ...(iSnap.docs[0].data() as any) } as Imovel;
            setImovel(data);
            setFormData(prev => ({
              ...prev,
              mensagem: `Olá, gostaria de obter mais informações sobre o imóvel "${data.titulo}" (Ref: ${data.ref}).`
            }));

            const rQuery = query(
              collection(db, "tenants", tData.id, "properties"), 
              where("publicacao.publicar_no_site", "==", true),
              limit(10)
            );
            const rSnap = await getDocs(rQuery);
            const related = rSnap.docs
              .map(propertyDoc => ({ id: propertyDoc.id, ...(propertyDoc.data() as any) } as Imovel))
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
    if (honeypot) return; // Silent discard if honeypot is filled
    if (!gdprConsent) {
      alert("Por favor, aceite a política de privacidade para continuar.");
      return;
    }
    
    setIsSending(true);
    
    // Simulação para Demo
    if (agencySlug === 'demo-imosuite') {
      setTimeout(() => {
        setSent(true);
        setIsSending(false);
      }, 1500);
      return;
    }

    try {
      await LeadService.createLead(tenant.id, {
        ...formData,
        property_id: imovel.id,
        property_ref: imovel.ref,
        tipo: 'contacto',
        gdpr_consent: gdprConsent
      });
      setSent(true);
    } catch (err) {
      console.error("Erro ao enviar lead:", err);
      alert("Ocorreu um erro ao enviar o seu pedido. Por favor, tente contactar-nos diretamente por telefone.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-200 mb-4" size={48} />
      <p className="font-brand font-black text-slate-400 uppercase tracking-widest text-[10px]">A carregar detalhes...</p>
    </div>
  );

  if (!imovel || !tenant) return (
    <div className="h-screen flex flex-col items-center justify-center font-brand p-10 text-center">
      <h2 className="text-xl font-black text-[#1c2d51] mb-2 tracking-tight">Imóvel não encontrado.</h2>
      <Link to={`/agencia/${agencySlug}`} className="text-blue-500 font-bold underline">Voltar</Link>
    </div>
  );

  const images = imovel.media?.items || [];
  const mainImage = images[activeImage]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200';

  return (
    <div className="bg-white min-h-screen font-brand text-slate-900 pb-20 selection:bg-[var(--primary)] selection:text-white">
      <SEO 
        title={`${imovel.titulo} - ${tenant.nome}`} 
        description={imovel.descricao?.curta || `${imovel.tipo_imovel} para ${imovel.operacao} em ${imovel.localizacao?.concelho}. Ref: ${imovel.ref}`}
        overrideFullTitle={true}
      />
      
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
           <ChevronLeft size={16}/> Voltar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* GALERIA */}
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-4">
               <div className="aspect-[16/9] rounded-[3rem] overflow-hidden bg-slate-100 shadow-2xl relative group">
                  <img src={mainImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={imovel.titulo} />
                  <div className="absolute top-6 left-6 flex gap-3">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--primary)] shadow-xl">
                      {imovel.operacao}
                    </div>
                  </div>
               </div>
               {images.length > 1 && (
                 <div className="flex gap-4 overflow-x-auto pb-4">
                   {images.map((img, idx) => (
                     <button key={img.id} onClick={() => setActiveImage(idx)} className={`w-32 aspect-video rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${activeImage === idx ? 'border-[var(--primary)] scale-95' : 'border-transparent opacity-60'}`}><img src={img.url} className="w-full h-full object-cover" /></button>
                   ))}
                 </div>
               )}
            </div>

            <div className="space-y-6">
               <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter leading-[1.1]">{imovel.titulo}</h1>
               <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest"><MapPin size={16} className="text-blue-500" /> {imovel.localizacao.concelho}, {imovel.localizacao.distrito}</div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpecBox icon={<Bed size={20}/>} label="Quartos" val={imovel.divisoes.quartos} />
                  <SpecBox icon={<Bath size={20}/>} label="WCs" val={imovel.divisoes.casas_banho} />
                  <SpecBox icon={<Square size={20}/>} label="Área" val={`${imovel.areas.area_util_m2}m²`} />
                  <SpecBox icon={<Building2 size={20}/>} label="Tipo" val={imovel.tipo_imovel} />
               </div>
            </div>

            <div className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100 space-y-6">
               <h3 className="text-xl font-black text-[#1c2d51] uppercase tracking-widest flex items-center gap-3"><Info size={24} className="text-blue-500" /> Descrição</h3>
               <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-lg">{imovel.descricao.completa_md || imovel.descricao.curta}</p>
            </div>
          </div>

          {/* SIDEBAR PREÇO */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-[#1c2d51] p-10 rounded-[3rem] text-white shadow-2xl">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2">Preço de {imovel.operacao}</p>
                 <h2 className="text-5xl font-black tracking-tighter">{formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro.preco_venda : imovel.financeiro.preco_arrendamento) || 0)}</h2>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                 {sent ? (
                   <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-500">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto"><Check size={32} /></div>
                      <h3 className="text-xl font-black text-[#1c2d51]">Pedido Enviado!</h3>
                      <p className="text-xs text-slate-400 font-medium">A nossa equipa entrará em contacto brevemente.</p>
                      <button onClick={() => setSent(false)} className="text-[10px] font-black uppercase text-blue-500 pt-4">Enviar outro pedido</button>
                   </div>
                 ) : (
                   <form onSubmit={handleContact} className="space-y-4">
                      <h3 className="font-black text-[#1c2d51] text-lg mb-4">Solicitar Informação</h3>
                      
                      {/* Honeypot field (Anti-spam) */}
                      <input type="text" className="hidden" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />

                      <input required placeholder="Nome Completo" className="detail-input" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                      <input required type="email" placeholder="Email" className="detail-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      <input placeholder="Telefone (Opcional)" className="detail-input" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                      <textarea required rows={4} placeholder="Mensagem" className="detail-input resize-none" value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})} />
                      
                      <div className="space-y-3 pt-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                           <input 
                              type="checkbox" 
                              required 
                              checked={gdprConsent} 
                              onChange={e => setGdprConsent(e.target.checked)}
                              className="mt-1 w-4 h-4 rounded border-slate-200 text-[#1c2d51] focus:ring-[#1c2d51]" 
                           />
                           <span className="text-[10px] font-medium text-slate-500 leading-normal group-hover:text-slate-700 transition-colors">
                              Declaro que li e aceito a <Link to="/privacidade" className="text-[#357fb2] underline">Política de Privacidade</Link> e autorizo o tratamento dos meus dados para fins de contacto comercial.
                           </span>
                        </label>
                      </div>

                      <button type="submit" disabled={isSending} className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:-translate-y-1 transition-all disabled:opacity-50">
                         {isSending ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>} Enviar Pedido
                      </button>
                      <p className="text-[8px] text-center text-slate-300 font-bold uppercase tracking-widest">Protegido por ImoSuite Antispam</p>
                   </form>
                 )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <style>{`.detail-input { width: 100%; padding: 1.25rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }.detail-input:focus { background: #fff; border-color: var(--primary); }`}</style>
    </div>
  );
};

const SpecBox = ({ icon, label, val }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
    <div className="text-slate-300 mb-3">{icon}</div>
    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className="text-sm font-black text-[#1c2d51] tracking-tight">{val}</p>
  </div>
);

export default PublicImovelDetails;
