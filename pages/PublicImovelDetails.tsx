
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { LeadService } from '../services/leadService';
import { MapPin, Bed, Bath, Square, Loader2, Phone, Mail, ChevronLeft, Check, Send, Sparkles } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const PublicImovelDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', mensagem: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRef = collection(db, "tenants"); // First we need to find which tenant owns this imovel context could be tricky here
        // Usually you'd have the tenant slug in the URL too, e.g. /agencia/:slug/imovel/:imovelSlug
        // But for simplicity in this demo, we'll search across all properties if we don't have tenant context
        // Better: Assuming we are in a tenant's sub-portal context
        const searchSlug = window.location.hash.split('/agencia/')[1]?.split('/')[0];
        
        if (searchSlug) {
          const tQuery = query(collection(db, "tenants"), where("slug", "==", searchSlug), limit(1));
          const tSnap = await getDocs(tQuery);
          if (!tSnap.empty) {
            const tData = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() } as Tenant;
            setTenant(tData);
            
            const iQuery = query(collection(db, "tenants", tData.id, "properties"), where("slug", "==", slug), limit(1));
            const iSnap = await getDocs(iQuery);
            if (!iSnap.empty) setImovel({ id: iSnap.docs[0].id, ...iSnap.docs[0].data() } as Imovel);
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

  return (
    <div className="bg-white min-h-screen font-brand pb-20">
      <nav className="h-20 border-b flex items-center px-8 justify-between sticky top-0 bg-white z-50">
        <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-2 font-black text-[#1c2d51] uppercase text-[10px] tracking-widest hover:gap-4 transition-all">
          <ChevronLeft size={16} /> Voltar ao Catálogo
        </Link>
        <div className="font-black text-xl tracking-tighter uppercase">{tenant.nome}</div>
        <div className="w-20"></div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-10">
          <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl bg-slate-100">
             <img src={imovel.media?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
              <MapPin size={14}/> {imovel.concelho}, {imovel.distrito}
            </div>
            <h1 className="text-5xl font-black text-[#1c2d51] tracking-tighter leading-tight">{imovel.titulo}</h1>
            
            <div className="flex flex-wrap gap-8 py-8 border-y border-slate-100">
               <div className="flex items-center gap-3"><Bed className="text-slate-300" /> <div><p className="text-[8px] font-black uppercase text-slate-400">Tipologia</p><p className="font-black">{imovel.tipologia}</p></div></div>
               <div className="flex items-center gap-3"><Bath className="text-slate-300" /> <div><p className="text-[8px] font-black uppercase text-slate-400">WC</p><p className="font-black">{imovel.casas_banho}</p></div></div>
               <div className="flex items-center gap-3"><Square className="text-slate-300" /> <div><p className="text-[8px] font-black uppercase text-slate-400">Área Útil</p><p className="font-black">{imovel.area_util_m2}m²</p></div></div>
            </div>

            <div className="prose prose-slate max-w-none">
               <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-4">
                  <Sparkles size={14} /> Descrição Premium (Gemini AI)
               </div>
               <p className="text-slate-600 leading-relaxed whitespace-pre-line font-medium text-lg">
                  {imovel.descricao_md || 'Nenhuma descrição disponível.'}
               </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-50 p-10 rounded-[3rem] sticky top-32 border border-slate-100">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Valor do Investimento</div>
              <div className="text-4xl font-black text-[#1c2d51] mb-8">{formatCurrency(imovel.preco)}</div>
              
              {sent ? (
                <div className="text-center py-10 animate-in zoom-in-95 duration-500">
                   <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Check /></div>
                   <h4 className="font-black text-[#1c2d51] mb-2">Mensagem Enviada!</h4>
                   <p className="text-xs text-slate-500 font-bold uppercase">Entraremos em contacto brevemente.</p>
                </div>
              ) : (
                <form onSubmit={handleContact} className="space-y-4">
                  <input required placeholder="O seu nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full px-6 py-4 bg-white border-none rounded-2xl font-bold outline-none shadow-sm" />
                  <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 bg-white border-none rounded-2xl font-bold outline-none shadow-sm" />
                  <input placeholder="Telefone" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full px-6 py-4 bg-white border-none rounded-2xl font-bold outline-none shadow-sm" />
                  <textarea required rows={4} placeholder="Tenho interesse neste imóvel..." value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})} className="w-full px-6 py-4 bg-white border-none rounded-2xl font-bold outline-none shadow-sm"></textarea>
                  <button type="submit" disabled={isSending} className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 group">
                    {isSending ? <Loader2 className="animate-spin" /> : <><Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" /> Contactar Agente</>}
                  </button>
                </form>
              )}
           </div>

           <div className="p-10 bg-[#1c2d51] text-white rounded-[3rem] shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-6 text-center underline decoration-blue-500">Agência Certificada</p>
              <div className="flex flex-col items-center gap-4 text-center">
                 <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl">{tenant.nome.charAt(0)}</div>
                 <div>
                    <h4 className="font-black text-lg">{tenant.nome}</h4>
                    <p className="text-xs opacity-60 font-bold">{tenant.email}</p>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default PublicImovelDetails;
