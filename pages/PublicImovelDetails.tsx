
import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { LeadService } from '../services/leadService';
import { 
  MapPin, Bed, Bath, Square, Loader2, ChevronLeft, 
  Send, Sparkles, MessageSquare, ChevronRight
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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlParts = window.location.hash.split('/agencia/');
        const searchSlug = urlParts.length > 1 ? urlParts[1].split('/')[0] : null;
        
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

  useEffect(() => {
    if (!loading && imovel) {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('contact') === 'true') {
        const timer = setTimeout(() => {
          const element = document.getElementById('contact-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 800);
        return () => clearTimeout(timer);
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
        property_id: imovel.id,
        property_ref: imovel.ref,
        tipo: 'contacto'
      });
      setSent(true);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!imovel || !tenant) return <div className="h-screen flex items-center justify-center font-bold">Imóvel não encontrado.</div>;

  return (
    <div className="bg-white min-h-screen font-brand text-slate-900 pb-24">
      <nav className="h-20 px-8 flex items-center justify-between border-b border-slate-100">
         <Link to={`/agencia/${tenant.slug}`} className="text-slate-400 hover:text-slate-900 flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><ChevronLeft size={16}/> Voltar</Link>
         <span className="font-black text-xl text-[#1c2d51] tracking-tighter">{tenant.nome}</span>
         <div className="w-20"></div>
      </nav>
      <main className="max-w-7xl mx-auto px-8 pt-16 grid grid-cols-1 lg:grid-cols-2 gap-20">
         <div className="space-y-8">
            <div className="h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              <img src={imovel.media.items?.[activeImage]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000'} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-4">
               {imovel.media.items?.map((m, i) => (
                 <img key={i} src={m.url} className="h-24 w-full object-cover rounded-2xl cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveImage(i)} />
               ))}
            </div>
         </div>
         <div className="space-y-10">
            <div className="space-y-4">
               <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><MapPin size={12}/> {imovel.localizacao.concelho} &bull; Ref: {imovel.ref}</div>
               <h1 className="text-5xl font-black text-[#1c2d51] tracking-tighter leading-tight">{imovel.titulo}</h1>
               <div className="text-4xl font-black text-[#1c2d51]">
                 {formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro.preco_venda : imovel.financeiro.preco_arrendamento) || 0)}
               </div>
            </div>
            <div className="flex gap-10 border-y border-slate-100 py-10 text-slate-400 font-bold uppercase text-[10px]">
               <span className="flex flex-col gap-2 items-center"><Bed size={20} className="text-slate-900" /> {imovel.divisoes.quartos} Quartos</span>
               <span className="flex flex-col gap-2 items-center"><Bath size={20} className="text-slate-900" /> {imovel.divisoes.casas_banho} WCs</span>
               <span className="flex flex-col gap-2 items-center"><Square size={20} className="text-slate-900" /> {imovel.areas.area_util_m2} m²</span>
            </div>
            <p className="text-slate-500 leading-relaxed font-medium text-lg">{imovel.descricao.completa_md || 'Descrição profissional em preparação.'}</p>
            <div id="contact-section" className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
               <h4 className="font-black text-[#1c2d51] uppercase text-[10px] tracking-[0.2em] mb-8">Contactar Agência</h4>
               {sent ? (
                  <div className="py-10 bg-white rounded-2xl text-center border border-emerald-100 text-emerald-600 font-black text-xs uppercase tracking-widest">Mensagem Enviada</div>
               ) : (
                <form onSubmit={handleContact} className="space-y-4">
                  <input required placeholder="Nome" className="w-full p-5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                  <input required type="email" placeholder="Email" className="w-full p-5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <button disabled={isSending} className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/10 hover:-translate-y-1 transition-all">
                    {isSending ? 'A enviar...' : 'Enviar Mensagem'}
                  </button>
                </form>
               )}
            </div>
         </div>
      </main>
    </div>
  );
};

export default PublicImovelDetails;
