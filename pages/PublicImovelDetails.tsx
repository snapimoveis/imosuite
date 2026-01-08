
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { LeadService } from '../services/leadService';
import { 
  MapPin, Bed, Bath, Square, Loader2, Phone, Mail, ChevronLeft, 
  Check, Send, Sparkles, Building, ShieldCheck, Download, ArrowRight, 
  ChevronRight, Quote, Heart, Camera, Zap, Award, X, MessageSquare
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const PublicImovelDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  
  const contactSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchSlug = window.location.hash.split('/agencia/')[1]?.split('/')[0];
        
        if (searchSlug) {
          const tQuery = query(collection(db, "tenants"), where("slug", "==", searchSlug), limit(1));
          const tSnap = await getDocs(tQuery);
          if (!tSnap.empty) {
            const tData = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() } as Tenant;
            setTenant(tData);
            
            const iQuery = query(collection(db, "tenants", tData.id, "properties"), where("slug", "==", slug), limit(1));
            const iSnap = await getDocs(iQuery);
            if (!iSnap.empty) {
              const data = { id: iSnap.docs[0].id, ...iSnap.docs[0].data() } as Imovel;
              setImovel(data);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Efeito para fazer scroll automático até ao contacto
  useEffect(() => {
    if (!loading && imovel) {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('contact') === 'true') {
        setTimeout(() => {
          const element = document.getElementById('contact-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500); // Pequeno atraso para garantir o render
      }
    }
  }, [loading, imovel, location.search]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !imovel) return;
    setIsSending(true);
    try {
      await LeadService.createLead(tenant.id, {
        ...formData,
        imovel_id: imovel.id,
        tipo: 'contacto'
      });
      setSent(true);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!imovel || !tenant) return <div className="h-screen flex items-center justify-center font-bold">Imóvel não encontrado.</div>;

  const templateId = tenant.template_id || 'heritage';

  // --- RENDERIZADOR LUXE DETAIL ---
  const renderLuxeDetail = () => (
    <div className="bg-[#FAF9F6] text-[#2D2926] font-heritage min-h-screen">
      <nav className="h-24 px-12 flex items-center justify-between sticky top-0 z-50 bg-[#FAF9F6]/80 backdrop-blur-xl border-b border-[#2D2926]/5">
        <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-4 italic text-lg hover:opacity-50 transition-all"><ChevronLeft size={24} /> Coleção</Link>
        <span className="font-bold italic text-2xl tracking-tighter">{tenant.nome}</span>
        <button onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#2D2926] text-white px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl">Solicitar Dossier</button>
      </nav>
      <main className="max-w-7xl mx-auto px-12 pt-24 pb-60">
        <div className="max-w-4xl space-y-12 mb-32">
           <div className="flex items-center gap-4 text-[#2D2926]/40 text-xs font-black uppercase tracking-[0.6em]"><Sparkles size={16}/> Propriedade Curada &bull; Ref: {imovel.referencia}</div>
           <h1 className="text-8xl md:text-[10rem] font-bold leading-[0.8] tracking-tighter">{imovel.titulo}</h1>
           <p className="text-4xl italic text-[#2D2926]/40">{imovel.concelho}, Portugal</p>
        </div>
        <div className="grid grid-cols-12 gap-10 h-[800px] mb-40">
           <div className="col-span-8 rounded-[5rem] overflow-hidden shadow-3xl relative group">
              <img src={imovel.media[activeImage]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200'} className="w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110" />
           </div>
           <div className="col-span-4 flex flex-col gap-10 h-full">
              {imovel.media.slice(1, 3).map((m, i) => (
                <div key={i} className="flex-1 rounded-[3rem] overflow-hidden shadow-2xl border border-[#2D2926]/5 cursor-pointer" onClick={() => setActiveImage(i+1)}>
                   <img src={m.url} className="w-full h-full object-cover hover:scale-105 transition-all duration-700" />
                </div>
              ))}
           </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-40">
          <div className="lg:col-span-2 space-y-40">
             <div className="grid grid-cols-4 gap-12 py-24 border-y border-[#2D2926]/10 text-center">
                <div><p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30 mb-4">Área Útil</p><p className="text-5xl font-bold">{imovel.area_util_m2}m²</p></div>
                <div><p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30 mb-4">Tipologia</p><p className="text-5xl font-bold">{imovel.tipologia}</p></div>
                <div><p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30 mb-4">Suítes</p><p className="text-5xl font-bold">{imovel.quartos}</p></div>
                <div><p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30 mb-4">WCs</p><p className="text-5xl font-bold">{imovel.casas_banho}</p></div>
             </div>
             <div className="relative">
                <Quote size={200} className="absolute -top-32 -left-32 text-[#2D2926]/5" />
                <p className="text-5xl italic leading-[1.5] text-[#2D2926]/80 first-letter:text-9xl first-letter:font-bold first-letter:float-left first-letter:mr-8 first-letter:text-[#2D2926]">
                   {imovel.descricao_md || 'Nossa curadoria selecionou este imóvel pelo seu design irrepreensível e harmonia com a envolvente...'}
                </p>
             </div>
          </div>
          <div className="space-y-12">
             <div id="contact-section" className="bg-white p-16 rounded-[6rem] border border-[#2D2926]/5 shadow-3xl sticky top-40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#2D2926]/20 mb-10">Investimento Ativo</p>
                <div className="text-7xl font-bold mb-24 tracking-tighter">{formatCurrency(imovel.preco)}</div>
                {sent ? (
                  <div className="py-20 animate-in zoom-in-95 duration-700"><Award size={100} strokeWidth={0.5} className="mx-auto mb-6 text-[#2D2926]/10" /><p className="text-2xl italic">Consultoria Privada Agendada.</p></div>
                ) : (
                  <form onSubmit={handleContact} className="space-y-10">
                     <input required placeholder="Nome Completo" className="w-full bg-transparent border-b-2 border-[#2D2926]/10 py-6 italic text-2xl outline-none focus:border-[#2D2926] transition-all" onChange={e => setFormData({...formData, nome: e.target.value})} />
                     <input required type="email" placeholder="Endereço Digital" className="w-full bg-transparent border-b-2 border-[#2D2926]/10 py-6 italic text-2xl outline-none focus:border-[#2D2926] transition-all" onChange={e => setFormData({...formData, email: e.target.value})} />
                     <button className="w-full bg-[#2D2926] text-white py-10 rounded-full italic text-2xl hover:bg-black transition-all shadow-3xl mt-10">Solicitar Experiência</button>
                  </form>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );

  // --- RENDERIZADOR PRESTIGE DETAIL ---
  const renderPrestigeDetail = () => (
    <div className="bg-[#0a0a0a] text-white font-heritage min-h-screen pb-40">
      <div className="h-[90vh] relative">
         <img src={imovel.media[0]?.url || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=2000'} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/60"></div>
         <div className="absolute top-0 w-full p-12 flex justify-between items-center">
            <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-4 text-white uppercase tracking-widest text-xs font-bold hover:opacity-50"><ChevronLeft size={24}/> Voltar</Link>
            <span className="text-3xl font-bold tracking-[0.5em] uppercase italic">{tenant.nome}</span>
            <div></div>
         </div>
         <div className="absolute bottom-20 left-20 right-20 flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="max-w-4xl space-y-6">
               <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-none">{imovel.titulo}</h1>
               <div className="flex gap-10 text-white/50 text-xl italic uppercase tracking-[0.2em]"><span>{imovel.concelho}</span><span>Ref: {imovel.referencia}</span></div>
            </div>
            <div className="text-6xl font-bold tracking-tighter">{formatCurrency(imovel.preco)}</div>
         </div>
      </div>
      <main className="max-w-screen-xl mx-auto py-40 px-12 grid grid-cols-1 lg:grid-cols-2 gap-40 items-start">
         <div className="space-y-20">
            <div className="grid grid-cols-3 gap-20 border-y border-white/10 py-16 uppercase tracking-[0.4em] text-[10px] text-white/40">
               <div className="text-center"><p className="mb-4">Dormitórios</p><p className="text-4xl text-white font-bold tracking-tighter">{imovel.quartos}</p></div>
               <div className="text-center"><p className="mb-4">Superfície</p><p className="text-4xl text-white font-bold tracking-tighter">{imovel.area_util_m2}m²</p></div>
               <div className="text-center"><p className="mb-4">Banheiros</p><p className="text-4xl text-white font-bold tracking-tighter">{imovel.casas_banho}</p></div>
            </div>
            <p className="text-4xl italic leading-relaxed text-white/70 font-light">{imovel.descricao_md || 'Um refúgio de design contemporâneo onde a luz é o elemento estruturante.'}</p>
         </div>
         <div id="contact-section" className="bg-white/5 p-20 backdrop-blur-3xl border border-white/10 sticky top-40 text-center">
            <h4 className="text-3xl font-bold mb-12 uppercase tracking-widest italic">Interesse Reservado</h4>
            <form onSubmit={handleContact} className="space-y-10 text-left">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.5em] text-white/30 ml-2">Nome</label>
                  <input required className="w-full bg-transparent border border-white/10 px-6 py-4 outline-none focus:border-white transition-all text-xl text-white" onChange={e => setFormData({...formData, nome: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.5em] text-white/30 ml-2">Email</label>
                  <input required type="email" className="w-full bg-transparent border border-white/10 px-6 py-4 outline-none focus:border-white transition-all text-xl text-white" onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               <button className="w-full bg-white text-black py-8 font-black uppercase tracking-[0.4em] text-xs hover:bg-white/80 transition-all shadow-2xl">Solicitar Consultoria</button>
            </form>
         </div>
      </main>
    </div>
  );

  const renderTemplateDetail = () => {
    switch (templateId) {
      case 'prestige': return renderPrestigeDetail();
      case 'luxe': return renderLuxeDetail();
      default: return (
        <div className="bg-white min-h-screen font-brand text-slate-900 pb-24">
          <nav className="h-20 px-8 flex items-center justify-between border-b border-slate-100">
             <Link to={`/agencia/${tenant.slug}`} className="text-slate-400 hover:text-slate-900 flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><ChevronLeft size={16}/> Voltar</Link>
             <span className="font-black text-xl text-[#1c2d51] tracking-tighter">{tenant.nome}</span>
             <div className="w-20"></div>
          </nav>
          <main className="max-w-7xl mx-auto px-8 pt-16 grid grid-cols-1 lg:grid-cols-2 gap-20">
             <div className="space-y-8">
                <div className="h-[600px] rounded-3xl overflow-hidden shadow-2xl"><img src={imovel.media[0]?.url} className="w-full h-full object-cover" /></div>
                <div className="grid grid-cols-4 gap-4">
                   {imovel.media.slice(1, 5).map((m, i) => <img key={i} src={m.url} className="h-24 w-full object-cover rounded-2xl cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveImage(i+1)} />)}
                </div>
             </div>
             <div className="space-y-10">
                <div className="space-y-4">
                   <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><MapPin size={12}/> {imovel.concelho} &bull; Ref: {imovel.referencia}</div>
                   <h1 className="text-5xl font-black text-[#1c2d51] tracking-tighter leading-tight">{imovel.titulo}</h1>
                   <div className="text-4xl font-black text-[#1c2d51]">{formatCurrency(imovel.preco)}</div>
                </div>
                <div className="flex gap-10 border-y border-slate-100 py-10 text-slate-400 font-bold uppercase text-[10px]">
                   <span className="flex flex-col gap-2 items-center"><Bed size={20} className="text-slate-900" /> {imovel.quartos} Quartos</span>
                   <span className="flex flex-col gap-2 items-center"><Bath size={20} className="text-slate-900" /> {imovel.casas_banho} WCs</span>
                   <span className="flex flex-col gap-2 items-center"><Square size={20} className="text-slate-900" /> {imovel.area_util_m2} m²</span>
                </div>
                <p className="text-slate-500 leading-relaxed font-medium text-lg">{imovel.descricao_md || 'Descrição profissional em preparação.'}</p>
                <div id="contact-section" className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                   <h4 className="font-black text-[#1c2d51] uppercase text-[10px] tracking-[0.2em] mb-8">Contactar Agência</h4>
                   <form onSubmit={handleContact} className="space-y-4">
                      <input required placeholder="Nome" className="w-full p-5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all" onChange={e => setFormData({...formData, nome: e.target.value})} />
                      <input required type="email" placeholder="Email" className="w-full p-5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all" onChange={e => setFormData({...formData, email: e.target.value})} />
                      <button className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/10 hover:-translate-y-1 transition-all">Enviar Mensagem</button>
                   </form>
                </div>
             </div>
          </main>
        </div>
      );
    }
  };

  return renderTemplateDetail();
};

export default PublicImovelDetails;
