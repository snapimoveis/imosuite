
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit, doc, getDoc } from "@firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel, ImovelMedia } from '../types';
import { LeadService } from '../services/leadService';
import { PropertyService } from '../services/propertyService';
import { 
  MapPin, Bed, Bath, Square, Loader2, ChevronLeft, 
  Send, Share2, Heart, Phone, Mail, Building2, Star,
  Zap, Check, ArrowRight, Info, ShieldCheck, Menu, X, MessageCircle,
  Instagram, Facebook, Linkedin
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import ImovelCard from '../components/ImovelCard';
import SEO from '../components/SEO';
import { DEFAULT_TENANT, DEFAULT_TENANT_CMS } from '../constants';
import { MOCK_IMOVEIS } from '../mocks';

const PublicImovelDetails: React.FC = () => {
  const { slug: agencySlug, imovelSlug } = useParams<{ slug: string; imovelSlug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [media, setMedia] = useState<ImovelMedia[]>([]);
  const [relatedProperties, setRelatedProperties] = useState<Imovel[]>([]);
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
        setTimeout(() => {
          setTenant(DEFAULT_TENANT);
          const found = MOCK_IMOVEIS.find(m => m.slug === imovelSlug);
          if (found) {
            setImovel(found);
            setMedia(found.media.items || []);
            setRelatedProperties(MOCK_IMOVEIS.filter(m => m.slug !== imovelSlug).slice(0, 3));
            setFormData(prev => ({
              ...prev,
              mensagem: `Olá, gostaria de obter mais informações sobre o imóvel "${found.titulo}" (Demo Ref: ${found.ref}).`
            }));
          }
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

          const iQuery = query(collection(db, "tenants", tData.id, "properties"), where("slug", "==", imovelSlug), limit(1));
          const iSnap = await getDocs(iQuery);
          
          if (!iSnap.empty) {
            const data = { id: iSnap.docs[0].id, ...(iSnap.docs[0].data() as any) } as Imovel;
            setImovel(data);
            
            // BUSCAR MEDIA DA SUBCOLEÇÃO (CORREÇÃO)
            const propertyMedia = await PropertyService.getPropertyMedia(tData.id, data.id);
            setMedia(propertyMedia);

            setFormData(prev => ({
              ...prev,
              mensagem: `Olá, gostaria de obter mais informações sobre o imóvel "${data.titulo}" (Ref: ${data.ref}).`
            }));

            const rSnap = await getDocs(query(collection(db, "tenants", tData.id, "properties"), limit(10)));
            setRelatedProperties(rSnap.docs
              .map(d => ({ id: d.id, ...d.data() } as Imovel))
              .filter(p => p.id !== data.id && p.publicacao?.publicar_no_site).slice(0, 3));
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
      alert("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!imovel || !tenant) return <div className="h-screen flex items-center justify-center font-black uppercase text-slate-300">Não encontrado</div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  // Fallback para cover_url se items estiver vazio
  const displayImages = media.length > 0 ? media : [{ id: 'cover', url: (imovel.media as any)?.cover_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', type: 'image' } as any];

  return (
    <div className="min-h-screen flex flex-col bg-white font-brand selection:bg-[var(--primary)] selection:text-white">
      <SEO title={`${imovel.titulo} - ${tenant.nome}`} overrideFullTitle={true} />
      
      {/* NAVBAR PADRONIZADA */}
      <nav className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-50">
         <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" /> : <span className="font-black text-xl uppercase tracking-tighter text-[var(--primary)]">{tenant.nome}</span>}
         </Link>
         <div className="hidden md:flex gap-10">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={m.path === '/' ? `/agencia/${tenant.slug}` : `/agencia/${tenant.slug}/p${m.path}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[var(--primary)] transition-colors">{m.label}</Link>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <button className="bg-[var(--primary)] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105">Contactar</button>
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-slate-400"><Menu/></button>
         </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-[var(--primary)] mb-8">
           <ChevronLeft size={16}/> Ver outros imóveis
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* GALERIA REAL */}
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-4">
               <div className="aspect-[16/9] rounded-[3rem] overflow-hidden bg-slate-100 shadow-2xl relative">
                  <img src={displayImages[activeImage]?.url} className="w-full h-full object-cover transition-all duration-700" alt={imovel.titulo} />
                  <div className="absolute top-6 left-6 flex gap-3">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--primary)] shadow-xl">
                      {imovel.operacao}
                    </div>
                  </div>
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
               <div>
                  <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter leading-[1.1] mb-4">{imovel.titulo}</h1>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest"><MapPin size={16} className="text-blue-500" /> {imovel.localizacao.concelho}, {imovel.localizacao.distrito}</div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpecBox icon={<Bed size={20}/>} label="Quartos" val={imovel.divisoes.quartos} />
                  <SpecBox icon={<Bath size={20}/>} label="WCs" val={imovel.divisoes.casas_banho} />
                  <SpecBox icon={<Square size={20}/>} label="Área" val={`${imovel.areas.area_util_m2}m²`} />
                  <SpecBox icon={<Building2 size={20}/>} label="Tipologia" val={imovel.tipologia} />
               </div>

               <div className="bg-slate-50/50 p-10 rounded-[3.5rem] border border-slate-100 space-y-8">
                  <div>
                    <h3 className="text-xl font-black text-[#1c2d51] uppercase tracking-widest flex items-center gap-3 mb-6"><Info size={24} className="text-blue-500" /> Detalhes do Imóvel</h3>
                    <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-lg">{imovel.descricao.completa_md || imovel.descricao.curta}</p>
                  </div>
                  
                  {imovel.caracteristicas?.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                      {imovel.caracteristicas.map(char => (
                        <div key={char} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div> {char}
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* SIDEBAR DE CONTACTO PADRONIZADA */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-[#1c2d51] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2 relative z-10">Valor de Mercado</p>
                 <h2 className="text-5xl font-black tracking-tighter relative z-10">{formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro.preco_venda : imovel.financeiro.preco_arrendamento) || 0)}</h2>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                 {sent ? (
                   <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-500">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto"><Check size={32} /></div>
                      <h3 className="text-xl font-black text-[#1c2d51]">Pedido Enviado!</h3>
                      <p className="text-xs text-slate-400 font-medium">Entraremos em contacto brevemente.</p>
                      <button onClick={() => setSent(false)} className="text-[10px] font-black uppercase text-blue-500 pt-4">Novo pedido</button>
                   </div>
                 ) : (
                   <form onSubmit={handleContact} className="space-y-4">
                      <h3 className="font-black text-[#1c2d51] text-lg mb-6">Pedir Informações</h3>
                      <input required placeholder="O seu nome" className="detail-input" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                      <input required type="email" placeholder="O seu email" className="detail-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      <textarea required rows={4} placeholder="A sua mensagem" className="detail-input resize-none" value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})} />
                      <label className="flex items-start gap-3 cursor-pointer group pt-2">
                         <input type="checkbox" required checked={gdprConsent} onChange={e => setGdprConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-200 text-[#1c2d51]" />
                         <span className="text-[10px] font-medium text-slate-400 leading-normal">Aceito o tratamento dos meus dados para fins de contacto comercial nos termos da Política de Privacidade.</span>
                      </label>
                      <button type="submit" disabled={isSending} className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:-translate-y-1 transition-all">
                         {isSending ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>} Enviar Pedido
                      </button>
                   </form>
                 )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER PADRONIZADO */}
      <footer className="py-24 px-10 border-t border-slate-100 bg-slate-50">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6">
               <h4 className="text-xl font-black tracking-tighter uppercase">{tenant.nome}</h4>
               <p className="text-sm font-medium leading-relaxed opacity-50">{tenant.slogan}</p>
            </div>
            <div className="space-y-6">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Redes Sociais</p>
               <div className="flex gap-6">
                  {cms.social?.instagram && <a href={cms.social.instagram} target="_blank"><Instagram size={20}/></a>}
                  {cms.social?.facebook && <a href={cms.social.facebook} target="_blank"><Facebook size={20}/></a>}
                  {cms.social?.linkedin && <a href={cms.social.linkedin} target="_blank"><Linkedin size={20}/></a>}
               </div>
            </div>
            <div className="space-y-6 text-right">
               <p className="text-xs font-bold opacity-40">{tenant.email}</p>
               <p className="text-xs font-bold opacity-40">{tenant.telefone}</p>
               <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20 block pt-10">© {new Date().getFullYear()} {tenant.nome} • Powered by ImoSuite</span>
            </div>
         </div>
      </footer>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black p-10 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-top duration-300">
           <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white"><X size={32}/></button>
           {cms.menus.main.map(m => <Link key={m.id} to={`/agencia/${tenant.slug}${m.path}`} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-white">{m.label}</Link>)}
        </div>
      )}
      <style>{`.detail-input { width: 100%; padding: 1.25rem 1.5rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }.detail-input:focus { background: #fff; border-color: var(--primary); }`}</style>
    </div>
  );
};

const SpecBox = ({ icon, label, val }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:scale-105 transition-transform">
    <div className="text-slate-300 mb-3 group-hover:text-blue-500 transition-colors">{icon}</div>
    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className="text-sm font-black text-[#1c2d51] tracking-tight">{val}</p>
  </div>
);

export default PublicImovelDetails;
