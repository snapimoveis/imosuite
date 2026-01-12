
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "@firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, CMSPage } from '../types';
import { 
  Loader2, Building2, ChevronLeft, Menu, X, Facebook, Instagram, 
  Linkedin, MessageCircle, Target, Star, Eye, Mail, Phone, Camera
} from 'lucide-react';
import SEO from '../components/SEO';
import { DEFAULT_TENANT_CMS } from '../constants';
import ContactSection from '../components/ContactSection';

const PublicPage: React.FC = () => {
  const { slug, pageSlug } = useParams<{ slug: string; pageSlug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [page, setPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug || !pageSlug) return;
      try {
        const tSnap = await getDocs(query(collection(db, "tenants"), where("slug", "==", slug), limit(1)));
        if (!tSnap.empty) {
          const tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
          setTenant(tData);
          const p = tData.cms?.pages?.find(p => p.slug === pageSlug);
          if (p) setPage(p);
          document.documentElement.style.setProperty('--primary', tData.cor_primaria);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug, pageSlug]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!tenant || !page) return <div className="h-screen flex flex-col items-center justify-center p-10 font-brand"><Building2 size={48} className="text-slate-100 mb-4"/><h2 className="text-xl font-black text-slate-800 tracking-tighter">Página não encontrada.</h2><Link to="/" className="text-blue-500 mt-4 font-bold underline">Voltar</Link></div>;

  const cms = tenant.cms || DEFAULT_TENANT_CMS;
  const isContactPage = page.slug === 'contactos' || page.title.toLowerCase().includes('contacto');

  return (
    <div className="min-h-screen flex flex-col bg-white font-brand selection:bg-[var(--primary)] selection:text-white">
      <SEO title={`${page.title} - ${tenant.nome}`} overrideFullTitle={true} />
      
      <nav className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-50">
         <Link to={`/agencia/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" alt={tenant.nome} /> : <span className="font-black text-xl uppercase tracking-tighter text-[var(--primary)]">{tenant.nome}</span>}
         </Link>
         <div className="hidden md:flex gap-10">
            {cms.menus.main.map(m => (
              <Link key={m.id} to={m.path === '/' ? `/agencia/${tenant.slug}` : `/agencia/${tenant.slug}/p/${m.path.replace('/', '')}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[var(--primary)] transition-colors">{m.label}</Link>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <button className="bg-[var(--primary)] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105">Contactar</button>
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-slate-400"><Menu/></button>
         </div>
      </nav>

      <main className="flex-1 w-full animate-in fade-in duration-700">
         <div className="max-w-5xl mx-auto px-6 py-20">
            <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-[var(--primary)] mb-12">
               <ChevronLeft size={16}/> Início
            </Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
               <div className="lg:col-span-7 space-y-12">
                  <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-[#1c2d51] leading-[0.9]">{page.title}</h1>
                  <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-line text-lg">
                    {page.content_md}
                  </div>

                  {/* MISSÃO E VISÃO */}
                  {(page.missao || page.visao) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-50">
                       {page.missao && (
                         <div className="space-y-4">
                           <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500"><Target size={18}/> Nossa Missão</h4>
                           <p className="text-sm font-medium leading-relaxed italic text-slate-500">{page.missao}</p>
                         </div>
                       )}
                       {page.visao && (
                         <div className="space-y-4">
                           <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-500"><Eye size={18}/> Nossa Visão</h4>
                           <p className="text-sm font-medium leading-relaxed italic text-slate-500">{page.visao}</p>
                         </div>
                       )}
                    </div>
                  )}

                  {/* VALORES */}
                  {page.valores && page.valores.length > 0 && (
                    <div className="space-y-6 pt-10">
                       <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#1c2d51]">Nossos Valores</h4>
                       <div className="flex flex-wrap gap-3">
                          {page.valores.map((v, i) => (
                            <span key={i} className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-600 flex items-center gap-2">
                               <Star size={14} className="text-amber-500" fill="currentColor"/> {v}
                            </span>
                          ))}
                       </div>
                    </div>
                  )}
               </div>

               <div className="lg:col-span-5">
                  {/* GALERIA DA PÁGINA */}
                  {page.galeria_fotos && page.galeria_fotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                       {page.galeria_fotos.map((img, i) => (
                         <div key={i} className={`rounded-[2.5rem] overflow-hidden shadow-xl ${i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                           <img src={img} className="w-full h-full object-cover" alt={`Galeria ${i}`} />
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            </div>

            {/* EQUIPA DE CONSULTORES */}
            {page.equipa && page.equipa.length > 0 && (
               <div className="mt-32 space-y-16">
                  <div className="text-center">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[#1c2d51] mb-4">A Nossa Equipa</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Profissionais focados no seu sucesso</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                     {page.equipa.map((m) => (
                        <div key={m.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 text-center group">
                           <div className="w-32 h-32 rounded-full mx-auto mb-8 overflow-hidden border-4 border-white shadow-xl transition-transform group-hover:scale-105">
                              <img src={m.avatar_url || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" alt={m.name} />
                           </div>
                           <h4 className="text-xl font-black text-[#1c2d51] mb-1">{m.name || 'Nome do Consultor'}</h4>
                           <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-8">{m.role || 'Consultor Imobiliário'}</p>
                           
                           <div className="flex flex-col gap-3">
                              {m.email && (
                                <a href={`mailto:${m.email}`} className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-500 hover:bg-[#1c2d51] hover:text-white transition-all">
                                   <Mail size={16}/> {m.email}
                                </a>
                              )}
                              {m.phone && (
                                <a href={`tel:${m.phone}`} className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-500 hover:bg-[#1c2d51] hover:text-white transition-all">
                                   <Phone size={16}/> {m.phone}
                                </a>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* FORMULÁRIO PADRÃO PARA PÁGINAS DE CONTACTO */}
         {isContactPage && (
           <div className="bg-slate-50 border-t border-slate-100">
             <ContactSection 
               tenantId={tenant.id} 
               isWhiteLabel={true} 
               title="Envie-nos uma mensagem"
               subtitle="Estamos aqui para responder a todas as suas questões sobre o mercado imobiliário."
             />
           </div>
         )}
      </main>

      <footer className="py-24 px-10 border-t border-slate-100 bg-slate-50">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6">
               <h4 className="text-xl font-black tracking-tighter uppercase">{tenant.nome}</h4>
               <p className="text-sm font-medium leading-relaxed opacity-50">{tenant.slogan}</p>
               
               {/* LIVRO DE RECLAMAÇÕES - VERSÃO POSITIVA */}
               {cms.social?.complaints_book_link && (
                 <a 
                   href={cms.social.complaints_book_link} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="block w-fit mt-8 transition-opacity hover:opacity-80"
                 >
                   <img 
                     src="https://www.livroreclamacoes.pt/assets/img/logo_reclamacoes.png" 
                     alt="Livro de Reclamações Online" 
                     className="h-10 w-auto grayscale contrast-125"
                   />
                 </a>
               )}
            </div>
            <div className="space-y-6 text-right">
               <div className="flex justify-end gap-6 mb-8">
                  {cms.social?.instagram && <a href={cms.social.instagram} target="_blank" rel="noreferrer"><Instagram size={20}/></a>}
                  {cms.social?.facebook && <a href={cms.social.facebook} target="_blank" rel="noreferrer"><Facebook size={20}/></a>}
                  {cms.social?.whatsapp && <a href={cms.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={20}/></a>}
               </div>
               <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20 block pt-10">© {new Date().getFullYear()} {tenant.nome} • Powered by ImoSuite</span>
            </div>
         </div>
      </footer>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black p-10 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-top duration-300">
           <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white"><X size={32}/></button>
           {cms.menus.main.map(m => (
             <Link 
               key={m.id} 
               to={m.path === '/' ? `/agencia/${tenant.slug}` : `/agencia/${tenant.slug}/p/${m.path.replace('/', '')}`} 
               onClick={() => setIsMenuOpen(false)} 
               className="text-2xl font-black text-white uppercase tracking-tighter"
             >
               {m.label}
             </Link>
           ))}
        </div>
      )}
    </div>
  );
};

export default PublicPage;
