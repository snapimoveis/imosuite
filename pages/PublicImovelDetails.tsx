
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { LeadService } from '../services/leadService';
import { 
  MapPin, Bed, Bath, Square, Loader2, Phone, Mail, ChevronLeft, 
  Check, Send, Sparkles, Building, ShieldCheck, Download, ArrowRight, 
  ChevronRight, Quote, Heart, Camera, Zap, Award
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const PublicImovelDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', mensagem: '' });

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

  // --- RENDERIZADORES DE DETALHE ESPECÍFICOS ---

  // LUXE DETAIL (Editorial e Imersivo)
  const renderLuxeDetail = () => (
    <div className="bg-[#FAF9F6] text-[#2D2926] font-heritage min-h-screen">
      <nav className="h-24 px-12 flex items-center justify-between sticky top-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-[#2D2926]/5">
        <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-4 italic text-lg hover:opacity-50 transition-all"><ChevronLeft size={24} /> Voltar à Coleção</Link>
        <span className="font-bold italic text-2xl tracking-tighter">{tenant.nome}</span>
        <button className="bg-[#2D2926] text-white px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">Agendar</button>
      </nav>
      <main className="max-w-7xl mx-auto px-12 pt-24 pb-60">
        <div className="max-w-4xl space-y-12 mb-32 animate-in fade-in slide-in-from-bottom duration-1000">
           <div className="flex items-center gap-4 text-[#2D2926]/40 text-xs font-black uppercase tracking-[0.6em]"><Sparkles size={16}/> Propriedade Curada • Ref: {imovel.referencia}</div>
           <h1 className="text-8xl md:text-[10rem] font-bold leading-[0.8] tracking-tighter">{imovel.titulo}</h1>
           <p className="text-4xl italic text-[#2D2926]/40">{imovel.concelho}, Portugal</p>
        </div>
        <div className="grid grid-cols-12 gap-10 h-[900px] mb-40">
           <div className="col-span-8 rounded-[6rem] overflow-hidden shadow-3xl group relative">
              <img src={imovel.media[activeImage]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200'} className="w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110" />
           </div>
           <div className="col-span-4 flex flex-col gap-10">
              <div className="flex-1 rounded-[4rem] overflow-hidden shadow-2xl border border-[#2D2926]/5 cursor-pointer" onClick={() => setActiveImage(1)}>
                 <img src={imovel.media[1]?.url || 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'} className="w-full h-full object-cover hover:scale-105 transition-all" />
              </div>
              <div className="flex-1 rounded-[4rem] overflow-hidden shadow-2xl border border-[#2D2926]/5 relative group cursor-pointer" onClick={() => setActiveImage(2)}>
                 <img src={imovel.media[2]?.url || 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800'} className="w-full h-full object-cover hover:scale-105 transition-all" />
                 <div className="absolute inset-0 bg-[#2D2926]/40 backdrop-blur-[2px] flex items-center justify-center text-white text-3xl italic">+ {imovel.media.length}</div>
              </div>
           </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-40">
          <div className="lg:col-span-2 space-y-40">
             <div className="grid grid-cols-4 gap-12 py-24 border-y border-[#2D2926]/10 text-center">
                <div><p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 mb-4">Metragem</p><p className="text-5xl font-bold">{imovel.area_util_m2}m²</p></div>
                <div><p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 mb-4">Tipologia</p><p className="text-5xl font-bold">{imovel.tipologia}</p></div>
                <div><p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 mb-4">Quartos</p><p className="text-5xl font-bold">{imovel.quartos}</p></div>
                <div><p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 mb-4">WCs</p><p className="text-5xl font-bold">{imovel.casas_banho}</p></div>
             </div>
             <div className="relative">
                <Quote size={200} className="absolute -top-32 -left-32 text-[#2D2926]/5" />
                <p className="text-5xl italic leading-[1.4] text-[#2D2926]/80 first-letter:text-9xl first-letter:font-bold first-letter:float-left first-letter:mr-8 first-letter:text-[#2D2926]">
                   {imovel.descricao_md || 'Nossa curadoria selecionou este imóvel pelo seu design irrepreensível e harmonia com a envolvente urbana de Lisboa...'}
                </p>
             </div>
          </div>
          <div className="space-y-12">
             <div className="bg-white p-20 rounded-[6rem] border border-[#2D2926]/5 shadow-3xl sticky top-40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#2D2926]/20 mb-10">Valor do Ativo</p>
                <div className="text-7xl font-bold mb-24 tracking-tighter">{formatCurrency(imovel.preco)}</div>
                {sent ? (
                  <div className="py-24 animate-in zoom-in-95 duration-700 text-center">
                     <Award size={100} strokeWidth={0.5} className="mx-auto mb-8 text-[#2D2926]/10" />
                     <p className="text-2xl italic">Atendimento Solicitado.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContact} className="space-y-12">
                     <input required placeholder="Nome Completo" className="w-full bg-transparent border-b-2 border-[#2D2926]/10 py-6 italic text-2xl outline-none focus:border-[#2D2926] transition-all" onChange={e => setFormData({...formData, nome: e.target.value})} />
                     <input required type="email" placeholder="Endereço de Email" className="w-full bg-transparent border-b-2 border-[#2D2926]/10 py-6 italic text-2xl outline-none focus:border-[#2D2926] transition-all" onChange={e => setFormData({...formData, email: e.target.value})} />
                     <button className="w-full bg-[#2D2926] text-white py-10 rounded-full italic text-2xl hover:bg-black transition-all shadow-3xl">Solicitar Experiência</button>
                  </form>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );

  // PRESTIGE DETAIL (Minimalista, Full-bleed imagens)
  const renderPrestigeDetail = () => (
    <div className="bg-[#0a0a0a] text-white font-heritage min-h-screen">
      <div className="h-screen relative">
         <img src={imovel.media[0]?.url || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=2000'} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
         <nav className="absolute top-0 w-full p-12 flex justify-between items-center z-50">
            <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-4 text-white hover:opacity-50"><ChevronLeft size={32}/> Coleção</Link>
            <span className="text-3xl font-bold tracking-widest uppercase">{tenant.nome}</span>
            <div></div>
         </nav>
         <div className="absolute bottom-20 left-20 right-20 flex justify-between items-end">
            <div className="max-w-4xl space-y-6">
               <h1 className="text-8xl font-bold tracking-tighter leading-none">{imovel.titulo}</h1>
               <div className="flex gap-10 text-white/50 text-xl italic"><span>{imovel.concelho}</span><span>{imovel.tipologia}</span><span>Ref: {imovel.referencia}</span></div>
            </div>
            <div className="text-7xl font-bold">{formatCurrency(imovel.preco)}</div>
         </div>
      </div>
      <main className="max-w-7xl mx-auto py-40 px-12 grid grid-cols-1 md:grid-cols-2 gap-40 items-start">
         <div className="space-y-20">
            <p className="text-4xl italic leading-relaxed text-white/70">{imovel.descricao_md || 'Um refúgio de design contemporâneo onde a luz é o elemento estruturante.'}</p>
            <div className="grid grid-cols-2 gap-10">
               {imovel.media.slice(1, 5).map((m, i) => (
                 <img key={i} src={m.url} className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
               ))}
            </div>
         </div>
         <div className="bg-white/5 p-20 backdrop-blur-2xl border border-white/10 rounded-none sticky top-40 text-center">
            <h4 className="text-3xl font-bold mb-12 uppercase tracking-widest italic">Interesse Privado</h4>
            <form onSubmit={handleContact} className="space-y-10">
               <input required placeholder="Nome" className="w-full bg-transparent border-b border-white/20 py-4 outline-none focus:border-white transition-all text-xl" />
               <input required type="email" placeholder="Email" className="w-full bg-transparent border-b border-white/20 py-4 outline-none focus:border-white transition-all text-xl" />
               <button className="w-full bg-white text-black py-8 font-black uppercase tracking-widest hover:bg-white/80 transition-all">Solicitar Dossier</button>
            </form>
         </div>
      </main>
    </div>
  );

  // Renderizador principal do Detalhe
  const renderDetail = () => {
    switch (templateId) {
      case 'prestige': return renderPrestigeDetail();
      case 'luxe': return renderLuxeDetail();
      case 'skyline':
      case 'heritage':
      default: return (
        <div className="bg-white min-h-screen font-brand text-slate-900 pb-24">
          <nav className="h-20 px-8 flex items-center justify-between border-b border-slate-100">
             <Link to={`/agencia/${tenant.slug}`} className="text-slate-400 hover:text-slate-900 flex items-center gap-2"><ChevronLeft size={20}/> Voltar</Link>
             <span className="font-black text-xl text-[#1c2d51]">{tenant.nome}</span>
             <div className="w-20"></div>
          </nav>
          <main className="max-w-7xl mx-auto px-8 pt-16">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-10">
                   <div className="h-[500px] rounded-3xl overflow-hidden shadow-xl"><img src={imovel.media[0]?.url} className="w-full h-full object-cover" /></div>
                   <div className="grid grid-cols-4 gap-4">
                      {imovel.media.slice(1, 5).map((m, i) => <img key={i} src={m.url} className="h-24 w-full object-cover rounded-xl shadow-sm" />)}
                   </div>
                </div>
                <div className="space-y-10">
                   <div className="space-y-4">
                      <div className="text-xs font-black uppercase text-blue-600 tracking-widest">{imovel.concelho} • Ref: {imovel.referencia}</div>
                      <h1 className="text-5xl font-black text-[#1c2d51] tracking-tighter">{imovel.titulo}</h1>
                      <div className="text-4xl font-black text-[#1c2d51]">{formatCurrency(imovel.preco)}</div>
                   </div>
                   <div className="flex gap-10 border-y border-slate-100 py-8 text-slate-400 font-bold uppercase text-[10px]">
                      <span className="flex flex-col gap-1 items-center"><Bed size={20} className="text-slate-900 mb-1" /> {imovel.quartos} Quartos</span>
                      <span className="flex flex-col gap-1 items-center"><Bath size={20} className="text-slate-900 mb-1" /> {imovel.casas_banho} WCs</span>
                      <span className="flex flex-col gap-1 items-center"><Square size={20} className="text-slate-900 mb-1" /> {imovel.area_util_m2} m²</span>
                   </div>
                   <p className="text-slate-500 leading-relaxed font-medium text-lg">{imovel.descricao_md || 'Descrição profissional em preparação.'}</p>
                   <div className="bg-slate-50 p-10 rounded-3xl space-y-6">
                      <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest mb-6">Contactar Agente</h4>
                      <form onSubmit={handleContact} className="space-y-4">
                         <input required placeholder="O seu Nome" className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1c2d51]" onChange={e => setFormData({...formData, nome: e.target.value})} />
                         <input required type="email" placeholder="Email" className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1c2d51]" onChange={e => setFormData({...formData, email: e.target.value})} />
                         <textarea required placeholder="Mensagem" rows={4} className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1c2d51]"></textarea>
                         <button className="w-full bg-[#1c2d51] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl">Enviar Contacto</button>
                      </form>
                   </div>
                </div>
             </div>
          </main>
        </div>
      );
    }
  };

  return renderDetail();
};

export default PublicImovelDetails;
