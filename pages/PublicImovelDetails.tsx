
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant, Imovel } from '../types';
import { LeadService } from '../services/leadService';
import { 
  MapPin, Bed, Bath, Square, Loader2, Phone, Mail, ChevronLeft, 
  Check, Send, Sparkles, Building, ShieldCheck, Info, X, Camera, 
  MessageSquare, Zap, Crown, Award, Star, Eye, Activity, Calendar, 
  Download, ArrowRight, ChevronRight, Quote, Heart, Sparkles as SparkleIcon
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#FAF9F6]"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!imovel || !tenant) return <div className="h-screen flex items-center justify-center font-heritage italic text-2xl">Espaço não encontrado.</div>;

  const templateId = (tenant as any).template_id || 'heritage';
  const isLuxe = templateId === 'luxe';

  return (
    <div className={`min-h-screen pb-60 transition-colors duration-1000 ${isLuxe ? 'bg-[#FAF9F6] text-[#2D2926]' : 'bg-white text-slate-900'}`}>
      {/* NAVEGAÇÃO LUXE */}
      <nav className={`h-24 flex items-center px-12 justify-between sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${isLuxe ? 'bg-[#FAF9F6]/80 border-[#2D2926]/5' : 'bg-white/90 border-slate-100'}`}>
        <Link to={`/agencia/${tenant.slug}`} className={`flex items-center gap-4 font-heritage italic text-xl hover:opacity-50 transition-all ${isLuxe ? 'text-[#2D2926]' : 'text-[#1c2d51] font-black uppercase text-[10px] tracking-widest'}`}>
          <ChevronLeft size={24} /> Voltar à Coleção
        </Link>
        <div className={`font-heritage font-bold text-2xl tracking-tighter ${isLuxe ? 'text-[#2D2926] italic' : 'text-[#1c2d51]'}`}>{tenant.nome}</div>
        <button className={`hidden md:block px-12 py-3 rounded-full font-heritage italic text-lg shadow-2xl transition-all ${isLuxe ? 'bg-[#2D2926] text-white hover:bg-black' : 'bg-primary text-white'}`}>Solicitar Dossier</button>
      </nav>

      <main className="max-w-7xl mx-auto px-12 pt-24">
        {/* HERO NARRATIVO LUXE */}
        <div className="mb-40 space-y-20">
           <div className="max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom duration-1000">
              <div className="flex items-center gap-4 text-[#2D2926]/40 text-xs font-black uppercase tracking-[0.6em]">
                 <SparkleIcon size={16}/> Propriedade Curada &bull; Ref: {imovel.referencia}
              </div>
              <h1 className="text-8xl md:text-[10rem] font-heritage font-bold leading-[0.8] tracking-tighter">{imovel.titulo}</h1>
              <p className="text-4xl font-heritage italic text-[#2D2926]/40">{imovel.concelho}, Portugal</p>
           </div>
           
           {/* GALERIA MOSAICO LUXE */}
           <div className="grid grid-cols-12 gap-10 h-[900px]">
              <div className="col-span-7 h-full rounded-[6rem] overflow-hidden shadow-3xl relative group">
                 <img src={imovel.media[activeImage]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200'} className="w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110" />
                 <div className="absolute top-16 left-16 bg-[#FAF9F6]/95 backdrop-blur px-10 py-5 rounded-full text-[10px] font-black tracking-[0.4em] uppercase text-[#2D2926] shadow-xl">
                    Master View
                 </div>
              </div>
              <div className="col-span-5 flex flex-col gap-10 h-full">
                 <div className="flex-1 rounded-[4rem] overflow-hidden shadow-2xl border border-[#2D2926]/5 group cursor-pointer" onClick={() => setActiveImage(1)}>
                    <img src={imovel.media[1]?.url || 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                 </div>
                 <div className="flex-1 rounded-[4rem] overflow-hidden shadow-2xl border border-[#2D2926]/5 relative group cursor-pointer" onClick={() => setActiveImage(2)}>
                    <img src={imovel.media[2]?.url || 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800'} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-[#2D2926]/40 backdrop-blur-[2px] flex items-center justify-center font-heritage italic text-white text-3xl group-hover:opacity-0 transition-all duration-500">
                       Ver Portfólio Completo ({imovel.media.length})
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-40">
          <div className="lg:col-span-2 space-y-40">
            
            {/* CARACTERÍSTICAS LUXE */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-16 py-24 border-y border-[#2D2926]/10">
               <LuxeStat label="Espaço Útil" value={`${imovel.area_util_m2} m²`} />
               <LuxeStat label="Tipologia" value={imovel.tipologia} />
               <LuxeStat label="Suítes" value={imovel.quartos} />
               <LuxeStat label="Banheiros" value={imovel.casas_banho} />
            </div>

            {/* NARRATIVA COM DROP CAP */}
            <div className="space-y-24">
               <div className="flex items-center gap-10">
                  <div className="w-24 h-px bg-[#2D2926]/10"></div>
                  <h3 className="text-2xl font-heritage font-bold italic opacity-60">A Alma do Espaço</h3>
               </div>
               <div className="relative">
                  <Quote className="absolute -top-20 -left-20 text-[#2D2926]/5" size={200} />
                  <p className="text-4xl md:text-5xl font-heritage italic leading-[1.6] text-[#2D2926]/80 first-letter:text-9xl first-letter:font-bold first-letter:mr-6 first-letter:float-left first-letter:text-[#2D2926] first-letter:leading-[0.8] first-letter:pt-2">
                     {imovel.descricao_md}
                  </p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-24 pt-24">
                  <div className="space-y-12">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.6em] opacity-30">Atributos de Luxo</h4>
                     <div className="grid grid-cols-1 gap-10">
                        {imovel.caracteristicas.map((c, i) => (
                          <div key={i} className="flex items-center gap-8 group">
                             <div className="w-12 h-12 rounded-full border border-[#2D2926]/10 flex items-center justify-center text-[#2D2926]/20 group-hover:bg-[#2D2926] group-hover:text-white transition-all duration-500"><SparkleIcon size={18}/></div>
                             <span className="font-heritage italic text-2xl">{c}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="bg-white p-20 rounded-[5rem] shadow-sm border border-[#2D2926]/5 space-y-10">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.6em] opacity-30">Dossier de Investimento</h4>
                     <p className="text-xl font-heritage italic opacity-60 leading-relaxed">
                        Descarregue a ficha técnica detalhada e o relatório de valorização de mercado deste ativo imobiliário singular.
                     </p>
                     <button className="group flex items-center gap-6 text-xs font-black uppercase tracking-[0.4em] border-b-2 border-[#2D2926] pb-4 transition-all hover:gap-10">
                        Download PDF <Download size={20}/>
                     </button>
                  </div>
               </div>
            </div>

            {/* CONTEXTO GEOGRÁFICO LUXE */}
            <div className="space-y-20">
               <div className="flex justify-between items-end">
                  <div className="space-y-8">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.6em] opacity-30">Envolvente</h3>
                     <p className="text-6xl font-heritage font-bold tracking-tighter">{imovel.distrito}, Portugal</p>
                  </div>
                  <button className="font-heritage italic text-2xl underline underline-offset-[16px] decoration-[#2D2926]/10 hover:decoration-[#2D2926] transition-all duration-500">Ver no Mapa</button>
               </div>
               <div className="h-[700px] rounded-[6rem] overflow-hidden grayscale opacity-80 hover:grayscale-0 transition-all duration-[2s] shadow-3xl">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>

          {/* PAINEL DE CONVERSÃO LUXE */}
          <div className="space-y-20">
             <div className="bg-white p-20 rounded-[6rem] border border-[#2D2926]/5 shadow-3xl sticky top-40 transition-all text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#2D2926]/20 mb-10">Investimento Privado</p>
                <div className="text-7xl font-heritage font-bold mb-24 tracking-tighter text-[#2D2926]">{formatCurrency(imovel.preco)}</div>
                
                {sent ? (
                  <div className="py-24 animate-in zoom-in-95 duration-1000">
                     <Award size={100} strokeWidth={0.5} className="text-[#2D2926]/10 mx-auto mb-12" />
                     <h4 className="font-heritage font-bold text-3xl italic">A Jornada Começou.</h4>
                     <p className="font-heritage italic text-xl text-[#2D2926]/40 mt-8 leading-relaxed">A nossa equipa de concierge entrará em contacto para uma consultoria privada em 24h.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContact} className="space-y-12">
                    <LuxeInput placeholder="O seu nome completo" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                    <LuxeInput placeholder="Endereço de e-mail" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <LuxeInput placeholder="Contacto telefónico" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                    <button type="submit" disabled={isSending} className="w-full bg-[#2D2926] text-white py-10 rounded-full font-heritage italic text-2xl flex items-center justify-center gap-8 hover:bg-black transition-all shadow-3xl mt-12 active:scale-95">
                      {isSending ? <Loader2 className="animate-spin" /> : 'Solicitar Atendimento Private'}
                    </button>
                  </form>
                )}
                
                <div className="mt-24 pt-12 border-t border-[#2D2926]/5 flex flex-col items-center gap-6 opacity-30">
                   <ShieldCheck size={40} strokeWidth={1} />
                   <span className="text-[10px] font-black uppercase tracking-[0.5em]">Transação Totalmente Protegida</span>
                </div>
             </div>

             <div className="p-20 font-heritage italic text-center text-[#2D2926]/30 leading-[2] text-2xl">
                "Não procuramos apenas paredes; procuramos o cenário onde a sua vida será contada com beleza e paz."
             </div>
          </div>
        </div>
      </main>

      {/* FOOTER LUXE (Reuso do Portal) */}
      <footer className="mt-80 py-60 border-t border-[#2D2926]/5 bg-[#FAF9F6]">
         <div className="max-w-7xl mx-auto flex flex-col items-center text-center px-12 space-y-24">
            <h4 className="text-6xl font-heritage font-bold italic tracking-tighter">{tenant.nome}</h4>
            <div className="flex flex-wrap justify-center gap-20 font-heritage italic text-2xl opacity-40">
               <Link to={`/agencia/${tenant.slug}`} className="hover:opacity-100 transition-opacity">Coleção</Link>
               <Link to={`/agencia/${tenant.slug}`} className="hover:opacity-100 transition-opacity">Privacidade</Link>
               <Link to={`/agencia/${tenant.slug}`} className="hover:opacity-100 transition-opacity">Termos</Link>
               <Link to={`/agencia/${tenant.slug}`} className="hover:opacity-100 transition-opacity">Consultoria</Link>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] opacity-20">ImoSuite Luxe Engine &bull; Curated by Digital Arts</p>
         </div>
      </footer>
    </div>
  );
};

const LuxeStat = ({ label, value }: { label: string, value: any }) => (
  <div className="text-center space-y-6">
    <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">{label}</p>
    <p className="font-heritage text-5xl font-bold text-[#2D2926] tracking-tighter">{value}</p>
  </div>
);

const LuxeInput = ({ placeholder, type = "text", value, onChange }: any) => (
  <input 
    required 
    type={type}
    placeholder={placeholder} 
    value={value}
    onChange={onChange}
    className="w-full bg-transparent border-b-2 border-[#2D2926]/10 py-8 font-heritage italic text-2xl outline-none focus:border-[#2D2926] transition-all placeholder:text-[#2D2926]/15" 
  />
);

export default PublicImovelDetails;
