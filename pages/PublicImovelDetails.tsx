
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel, ImovelMedia } from '../types';
import { LeadService } from '../services/leadService';
import { PropertyService } from '../services/propertyService';
import { 
  MapPin, Bed, Bath, Square, Loader2, ChevronLeft, 
  Send, Check, Menu, X, MessageCircle, Instagram, Facebook, Linkedin, Building2, Info
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import SEO from '../components/SEO';
import { DEFAULT_TENANT, DEFAULT_TENANT_CMS } from '../constants';
import { MOCK_IMOVEIS } from '../mocks';

const PublicImovelDetails: React.FC = () => {
  const { slug: agencySlug, imovelSlug } = useParams<{ slug: string; imovelSlug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [media, setMedia] = useState<ImovelMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!agencySlug || !imovelSlug) return;
      setLoading(true);

      if (agencySlug === 'demo-imosuite') {
        const found = MOCK_IMOVEIS.find(m => m.slug === imovelSlug);
        if (found) {
          setTenant(DEFAULT_TENANT);
          setImovel(found);
          setMedia(found.media.items || []);
        }
        setLoading(false);
        return;
      }

      try {
        const tQuery = query(collection(db, "tenants"), where("slug", "==", agencySlug), limit(1));
        const tSnap = await getDocs(tQuery);
        
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          document.documentElement.style.setProperty('--primary', tData.cor_primaria);

          const iQuery = query(collection(db, "tenants", tData.id, "properties"), where("slug", "==", imovelSlug), limit(1));
          const iSnap = await getDocs(iQuery);
          
          if (!iSnap.empty) {
            const data = { id: iSnap.docs[0].id, ...(iSnap.docs[0].data() as any) } as Imovel;
            setImovel(data);
            
            // BUSCA OBRIGATÓRIA DA SUBCOLEÇÃO PARA OBTER TODAS AS FOTOS
            const propertyMedia = await PropertyService.getPropertyMedia(tData.id, data.id);
            setMedia(propertyMedia);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agencySlug, imovelSlug]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !imovel || !gdprConsent) return;
    setIsSending(true);
    try {
      await LeadService.createLead(tenant.id, { ...formData, property_id: imovel.id, property_ref: imovel.ref, tipo: 'contacto', gdpr_consent: gdprConsent });
      setSent(true);
    } catch (err) {
      alert("Erro ao enviar pedido.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!imovel || !tenant) return <div className="h-screen flex items-center justify-center font-black text-slate-300 uppercase">Não encontrado</div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  const displayImages = media.length > 0 ? media : [{ url: (imovel.media as any)?.cover_url || 'https://via.placeholder.com/800x600', id: 'placeholder' }];

  return (
    <div className="min-h-screen flex flex-col bg-white font-brand">
      <SEO title={`${imovel.titulo} - ${tenant.nome}`} overrideFullTitle={true} />
      
      <nav className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-50">
         <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" /> : <span className="font-black text-xl uppercase text-[var(--primary)]">{tenant.nome}</span>}
         </Link>
         <div className="hidden md:flex gap-10">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={m.path === '/' ? `/agencia/${tenant.slug}` : `/agencia/${tenant.slug}/p/${m.path.replace('/', '')}`} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[var(--primary)]">{m.label}</Link>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-slate-400"><Menu/></button>
         </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase mb-8"><ChevronLeft size={16}/> Voltar</Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-4">
               <div className="aspect-[16/9] rounded-[3rem] overflow-hidden bg-slate-100 shadow-2xl">
                  <img src={displayImages[activeImage]?.url} className="w-full h-full object-cover" alt="" />
               </div>
               {displayImages.length > 1 && (
                 <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                   {displayImages.map((img, idx) => (
                     <button key={img.id} onClick={() => setActiveImage(idx)} className={`w-32 aspect-video rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${activeImage === idx ? 'border-[var(--primary)]' : 'border-transparent opacity-60'}`}>
                        <img src={img.url} className="w-full h-full object-cover" />
                     </button>
                   ))}
                 </div>
               )}
            </div>

            <div className="space-y-8">
               <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter leading-tight">{imovel.titulo}</h1>
               <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase"><MapPin size={16} className="text-blue-500" /> {imovel.localizacao.concelho}, {imovel.localizacao.distrito}</div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpecBox icon={<Bed size={20}/>} label="Quartos" val={imovel.divisoes.quartos} />
                  <SpecBox icon={<Bath size={20}/>} label="WCs" val={imovel.divisoes.casas_banho} />
                  <SpecBox icon={<Square size={20}/>} label="Área" val={`${imovel.areas.area_util_m2}m²`} />
                  <SpecBox icon={<Building2 size={20}/>} label="Tipologia" val={imovel.tipologia} />
               </div>

               <div className="bg-slate-50/50 p-10 rounded-[3.5rem] border border-slate-100">
                  <h3 className="text-xl font-black text-[#1c2d51] uppercase mb-6 flex items-center gap-3"><Info size={24} className="text-blue-500" /> Descrição</h3>
                  <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-line text-lg">
                    {imovel.descricao.completa_md || imovel.descricao.curta}
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-[#1c2d51] p-10 rounded-[3rem] text-white shadow-2xl">
                 <p className="text-[10px] font-black uppercase text-blue-300 mb-2">Valor</p>
                 <h2 className="text-5xl font-black tracking-tighter">{formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro.preco_venda : imovel.financeiro.preco_arrendamento) || 0)}</h2>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                 {sent ? (
                   <div className="py-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto"><Check size={32} /></div>
                      <h3 className="text-xl font-black text-[#1c2d51]">Pedido Enviado!</h3>
                      <button onClick={() => setSent(false)} className="text-[10px] font-black uppercase text-blue-500">Novo pedido</button>
                   </div>
                 ) : (
                   <form onSubmit={handleContact} className="space-y-4">
                      <h3 className="font-black text-[#1c2d51] text-lg">Contactar Agente</h3>
                      <input required placeholder="Nome" className="detail-input" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                      <input required type="email" placeholder="Email" className="detail-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      <textarea required rows={4} placeholder="Mensagem" className="detail-input resize-none" value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})} />
                      <label className="flex items-start gap-3 cursor-pointer pt-2">
                         <input type="checkbox" required checked={gdprConsent} onChange={e => setGdprConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-200 text-[#1c2d51]" />
                         <span className="text-[10px] font-medium text-slate-400">Aceito a Política de Privacidade.</span>
                      </label>
                      <button type="submit" disabled={isSending} className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3">
                         {isSending ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>} Enviar
                      </button>
                   </form>
                 )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .detail-input { width: 100%; padding: 1.25rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.875rem; }
        .detail-input:focus { background: #fff; border-color: var(--primary); }
      `}</style>
    </div>
  );
};

const SpecBox = ({ icon, label, val }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
    <div className="text-slate-300 mb-3">{icon}</div>
    <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{label}</p>
    <p className="text-sm font-black text-[#1c2d51]">{val}</p>
  </div>
);

export default PublicImovelDetails;
