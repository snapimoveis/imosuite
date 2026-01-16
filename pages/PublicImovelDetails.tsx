
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, Imovel, ImovelMedia } from '../types';
import { LeadService } from '../services/leadService';
import { PropertyService } from '../services/propertyService';
import { 
  MapPin, Bed, Bath, Square, Loader2, ChevronLeft, ChevronRight,
  Send, Check, Menu, X, Building2, Info, Camera,
  Mail, Phone, Maximize2, ArrowUpRight
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import SEO from '../components/SEO';
import ContactSection from '../components/ContactSection';
import { DEFAULT_TENANT, DEFAULT_TENANT_CMS } from '../constants';
import { MOCK_IMOVEIS } from '../mocks';

const SpecBox = ({ icon, label, val, tid }: any) => (
  <div className={`p-6 md:p-8 border shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md ${tid === 'prestige' ? 'bg-neutral-900 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'} ${tid === 'luxe' ? 'rounded-[1.5rem] md:rounded-[2.5rem]' : tid === 'canvas' ? 'rounded-[1.5rem] md:rounded-[2rem]' : 'rounded-none'}`}>
    <div className="text-blue-500 mb-2 md:mb-4">{icon}</div>
    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className={`text-sm md:text-base font-black ${tid === 'prestige' ? 'italic' : ''}`}>{val}</p>
  </div>
);

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!agencySlug || !imovelSlug) return;
      setLoading(true);
      try {
        let tData: Tenant | null = null;
        if (agencySlug === 'demo-imosuite') {
          tData = DEFAULT_TENANT;
          const found = MOCK_IMOVEIS.find(m => m.slug === imovelSlug);
          if (found) { setImovel(found); setMedia(found.media.items || []); }
        } else {
          const tSnap = await getDocs(query(collection(db, "tenants"), where("slug", "==", agencySlug), limit(1)));
          if (!tSnap.empty) {
            tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
            const iSnap = await getDocs(query(collection(db, "tenants", tData.id, "properties"), where("slug", "==", imovelSlug), limit(1)));
            if (!iSnap.empty) {
              const data = { id: iSnap.docs[0].id, ...(iSnap.docs[0].data() as any) } as Imovel;
              setImovel(data);
              const propertyMedia = await PropertyService.getPropertyMedia(tData.id, data.id);
              setMedia(propertyMedia);
            }
          }
        }
        if (tData) {
          setTenant(tData);
          document.documentElement.style.setProperty('--primary', tData.cor_primaria);
          document.documentElement.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [agencySlug, imovelSlug]);

  const displayImages = useMemo(() => {
    if (media.length > 0) return media;
    if (imovel?.media?.cover_url) return [{ url: imovel.media.cover_url, id: 'cover' }];
    return [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', id: 'placeholder' }];
  }, [media, imovel?.media?.cover_url]);

  const nextPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (displayImages.length <= 1) return;
    setActiveImage(prev => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (displayImages.length <= 1) return;
    setActiveImage(prev => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !imovel) return;
    setIsSending(true);
    try {
      await LeadService.createLead(tenant.id, { ...formData, property_id: imovel.id, property_ref: imovel.ref, tipo: 'contacto', gdpr_consent: true });
      setSent(true);
    } catch (err) { alert("Erro ao enviar."); } finally { setIsSending(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[var(--primary)]" size={48} /></div>;
  if (!imovel || !tenant) return <div className="h-screen flex items-center justify-center font-black text-slate-300">Imóvel não encontrado</div>;

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
    heritage: { nav: "h-20 md:h-28 px-6 md:px-10 sticky top-0 z-50 bg-white border-b border-slate-100 flex items-center justify-between", heading: "font-heritage italic text-[#1c2d51]", wrapper: "font-brand bg-white" },
    canvas: { nav: "h-20 md:h-32 px-6 md:px-12 sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50 flex items-center justify-between", heading: "font-black text-[#1c2d51] tracking-tight", wrapper: "font-brand bg-white" },
    prestige: { nav: "h-20 md:h-28 px-6 md:px-10 sticky top-0 z-50 bg-black text-white border-b border-white/5 flex items-center justify-between", heading: "font-black italic uppercase text-white", wrapper: "font-brand bg-black text-white" }
  };
  const s = styles[tid] || styles.heritage;

  return (
    <div className={`${s.wrapper} min-h-screen flex flex-col overflow-x-hidden selection:bg-[var(--primary)]`}>
      <SEO title={`${imovel.titulo} - ${tenant.nome}`} overrideFullTitle={true} />
      
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`}>
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 md:h-16 w-auto object-contain" alt={tenant.nome} /> : <span className={`text-xl font-black ${tid === 'prestige' ? 'text-white' : 'text-[#1c2d51]'}`}>{tenant.nome}</span>}
         </Link>
         <div className="hidden lg:flex gap-8">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={getMenuLink(m.path)} className={`text-[10px] font-black uppercase tracking-widest ${tid === 'prestige' ? 'text-white' : 'text-slate-400'}`}>{m.label}</Link>
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

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 md:py-16 w-full animate-in fade-in">
        <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 md:mb-12 hover:opacity-70">
          <ChevronLeft size={16}/> Voltar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          <div className="lg:col-span-8 space-y-10">
            {/* CARROUSEL PRINCIPAL */}
            <div className={`relative aspect-video overflow-hidden shadow-2xl group bg-slate-100 ${tid === 'luxe' ? 'rounded-[2rem] md:rounded-[4rem]' : tid === 'canvas' ? 'rounded-[1.5rem] md:rounded-[3rem]' : 'rounded-none'}`}>
               <div className="w-full h-full flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${activeImage * 100}%)` }}>
                  {displayImages.map((img, idx) => (
                    <img key={img.id || idx} src={img.url} className="w-full h-full object-cover flex-shrink-0" alt={`${imovel.titulo} - Foto ${idx + 1}`} />
                  ))}
               </div>
               
               {displayImages.length > 1 && (
                 <>
                   <button onClick={prevPhoto} className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md text-white p-3 md:p-5 rounded-full transition-all hover:bg-white hover:text-[#1c2d51] z-10 opacity-0 group-hover:opacity-100">
                     <ChevronLeft size={28}/>
                   </button>
                   <button onClick={nextPhoto} className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md text-white p-3 md:p-5 rounded-full transition-all hover:bg-white hover:text-[#1c2d51] z-10 opacity-0 group-hover:opacity-100">
                     <ChevronRight size={28}/>
                   </button>
                   
                   {/* INDICADORES DO CARROUSEL */}
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {displayImages.map((_, idx) => (
                        <button key={idx} onClick={() => setActiveImage(idx)} className={`w-2 h-2 rounded-full transition-all ${activeImage === idx ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`} />
                      ))}
                   </div>

                   {/* ETIQUETA DA FOTO ATIVA */}
                   {displayImages[activeImage]?.tag && (
                     <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {displayImages[activeImage].tag}
                     </div>
                   )}
                 </>
               )}
            </div>

            <div className="space-y-8">
               <div>
                 <h1 className={`text-3xl md:text-6xl leading-tight ${s.heading}`}>{imovel.titulo}</h1>
                 <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mt-4">
                    <MapPin size={16} className="text-blue-500" /> {imovel.localizacao.concelho}, {imovel.localizacao.distrito}
                 </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <SpecBox icon={<Bed size={20}/>} label="Quartos" val={imovel.divisoes.quartos || 'N/A'} tid={tid} />
                  <SpecBox icon={<Bath size={20}/>} label="Banhos" val={imovel.divisoes.casas_banho || 'N/A'} tid={tid} />
                  <SpecBox icon={<Square size={20}/>} label="Área Útil" val={imovel.areas.area_util_m2 ? `${imovel.areas.area_util_m2}m²` : '---'} tid={tid} />
                  {imovel.areas.area_terreno_m2 && (
                    <SpecBox icon={<Maximize2 size={20}/>} label="Área Terreno" val={`${imovel.areas.area_terreno_m2}m²`} tid={tid} />
                  )}
                  <SpecBox icon={<Building2 size={20}/>} label="Tipologia" val={imovel.tipologia} tid={tid} />
               </div>

               <div className={`p-8 md:p-12 border ${tid === 'prestige' ? 'bg-neutral-900 border-white/5' : 'bg-slate-50/50 border-slate-100'} ${tid === 'luxe' ? 'rounded-[2rem] md:rounded-[4rem]' : tid === 'canvas' ? 'rounded-[1.5rem] md:rounded-[3rem]' : 'rounded-none'}`}>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3"><Info size={24} className="text-blue-500" /> Descrição</h3>
                  <div className="prose prose-slate max-w-none font-medium leading-relaxed whitespace-pre-line text-base md:text-lg opacity-80">
                    {imovel.descricao.completa_md || imovel.descricao.curta}
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
               <div className={`p-8 md:p-12 text-white shadow-2xl ${tid === 'prestige' ? 'bg-neutral-900' : 'bg-[#1c2d51]'} ${tid === 'luxe' ? 'rounded-[2rem]' : 'rounded-none'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-2">Valor de Mercado</p>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro.preco_venda : imovel.financeiro.preco_arrendamento) || 0)}</h2>
               </div>

               <div className={`p-8 md:p-12 border bg-white shadow-xl space-y-8 ${tid === 'luxe' ? 'rounded-[2rem]' : 'rounded-none'}`}>
                  <h3 className="text-xl font-black tracking-tight uppercase">Pedir Detalhes</h3>
                  {sent ? (
                    <div className="py-12 text-center space-y-4 animate-in zoom-in-90">
                       <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner"><Check size={32} strokeWidth={3} /></div>
                       <h3 className="text-xl font-black text-[#1c2d51]">Pedido Enviado!</h3>
                    </div>
                  ) : (
                    <form onSubmit={handleContact} className="space-y-4">
                       <input required placeholder="Nome" className="detail-input-resp" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                       <input required type="email" placeholder="Email" className="detail-input-resp" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                       <textarea rows={4} className="detail-input-resp" placeholder="A sua mensagem..." value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})} />
                       <button type="submit" disabled={isSending} className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1">
                          {isSending ? <Loader2 className="animate-spin" /> : <Send size={18}/>} Enviar Contacto
                       </button>
                    </form>
                  )}
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 px-8 text-white/40 text-center text-[10px] font-black uppercase tracking-[0.4em]" style={{ backgroundColor: tenant.cor_primaria }}>
         © {new Date().getFullYear()} {tenant.nome} • Software por ImoSuite
      </footer>
      <style>{`
        .detail-input-resp { width: 100%; padding: 1.15rem 1.4rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.875rem; }
        .detail-input-resp:focus { background: #fff; border-color: var(--primary); }
      `}</style>
    </div>
  );
};

export default PublicImovelDetails;
