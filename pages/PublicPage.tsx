import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Tenant, CMSPage } from '../types';
import { 
  Loader2, Menu, X, Building2, ChevronLeft, Scale, 
  ShieldCheck, ExternalLink, Building, Gavel, Target, Users, Mail, Phone, ArrowUpRight
} from 'lucide-react';
import SEO from '../components/SEO';
import { DEFAULT_TENANT_CMS, DEFAULT_TENANT } from '../constants';
import ContactSection from '../components/ContactSection';

const RAL_ENTITIES = [
  { name: "Centro de Arbitragem de Conflitos de Consumo de Lisboa", url: "http://www.centroarbitragemlisboa.pt" },
  { name: "Centro de Arbitragem de Conflitos de Consumo do Vale do Ave / Tribunal Arbitral", url: "http://www.triave.pt" },
  { name: "CIAB – Centro de Informação, Mediação e Arbitragem de Consumo (Tribunal Arbitral de Consumo)", url: "http://www.ciab.pt/pt" },
  { name: "CNIACC – Centro Nacional de Informação e Arbitragem de Conflitos de Consumo", url: "https://www.cniacc.pt/pt/" },
  { name: "Centro de Arbitragem de Conflitos de Consumo do Distrito de Coimbra", url: "http://www.centrodearbitragemdecoimbra.com" },
  { name: "Centro de Informação, Mediação e Arbitragem de Conflitos de Consumo do Algarve", url: "http://www.consumoalgarve.pt" },
  { name: "Centro de Informação de Consumo e Arbitragem do Porto", url: "http://www.cicap.pt" },
  { name: "Centro de Arbitragem de Conflitos de Consumo da Madeira", url: "https://www.madeira.gov.pt/cacc" }
];

const PublicPage: React.FC = () => {
  const { slug, pageSlug } = useParams<{ slug: string; pageSlug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [page, setPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug || !pageSlug) return;
      setLoading(true);
      try {
        let tData: Tenant | null = null;
        if (slug === 'demo-imosuite') tData = DEFAULT_TENANT;
        else {
          const tSnap = await getDocs(query(collection(db, "tenants"), where("slug", "==", slug), limit(1)));
          if (!tSnap.empty) tData = { id: tSnap.docs[0].id, ...(tSnap.docs[0].data() as any) } as Tenant;
        }
        if (tData) {
          setTenant(tData);
          const p = (tData.cms?.pages || DEFAULT_TENANT_CMS.pages).find(p => p.slug === pageSlug);
          if (p) setPage(p);
          document.documentElement.style.setProperty('--primary', tData.cor_primaria);
          document.documentElement.style.setProperty('--secondary', tData.cor_secundaria || tData.cor_primaria);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug, pageSlug]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  if (!tenant || !page) return <div className="h-screen flex flex-col items-center justify-center p-10 font-brand"><Building2 size={48} className="text-slate-100 mb-4"/><h2 className="text-xl font-black">Página não encontrada.</h2><Link to={`/agencia/${slug}`} className="text-blue-500 mt-4 underline">Voltar</Link></div>;

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
    heritage: { nav: "h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-50", heading: "font-heritage italic text-[#1c2d51]" },
    canvas: { nav: "h-24 bg-white/80 backdrop-blur-md border-b border-slate-50 flex items-center justify-between px-10 sticky top-0 z-50", heading: "font-black tracking-tight" },
    prestige: { nav: "h-20 bg-black text-white flex items-center justify-between px-10 sticky top-0 z-50", heading: "font-black italic uppercase" },
    skyline: { nav: "h-20 bg-[#2563eb] text-white flex items-center justify-between px-10 sticky top-0 z-50", heading: "font-black uppercase" },
    luxe: { nav: "h-28 bg-[#FDFBF7] flex items-center justify-between px-10 sticky top-0 z-50", heading: "font-serif italic" }
  };
  const s = styles[tid] || styles.heritage;

  const isRALPage = pageSlug === 'resolucao-de-litigios';

  return (
    <div className={`min-h-screen flex flex-col bg-white selection:bg-[var(--primary)] font-brand`}>
      <SEO title={`${page.title} - ${tenant.nome}`} overrideFullTitle={true} />
      <nav className={s.nav}>
         <Link to={`/agencia/${tenant.slug}`}>
            {tenant.logo_url ? <img src={tenant.logo_url} className="h-10 w-auto object-contain" alt={tenant.nome} /> : <span className="text-xl font-black">{tenant.nome}</span>}
         </Link>
         <div className="hidden lg:flex gap-8">
            {cms.menus.main.map(m => renderLink(m, "text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"))}
         </div>
         <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-slate-400"><Menu size={28} /></button>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white p-8 flex flex-col animate-in slide-in-from-top">
           <div className="flex justify-between items-center mb-16">
              <span className="font-black">{tenant.nome}</span>
              <button onClick={() => setIsMenuOpen(false)}><X size={32}/></button>
           </div>
           <div className="flex flex-col gap-8">
              {cms.menus.main.map(m => renderLink(m, "text-3xl font-black uppercase tracking-tighter"))}
           </div>
        </div>
      )}

      <main className="flex-1 w-full animate-in fade-in py-16 md:py-24">
         <div className="max-w-6xl mx-auto px-6">
            <Link to={`/agencia/${tenant.slug}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all mb-10"><ChevronLeft size={16}/> Voltar</Link>
            
            {isRALPage ? (
              <div className="animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                  <div className="max-w-2xl">
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-8" style={{ backgroundColor: `${tenant.cor_primaria}10`, color: tenant.cor_primaria }}>
                      <Scale size={32} />
                    </div>
                    <h1 className={`text-4xl md:text-7xl leading-tight mb-6 ${s.heading}`}>{page.title}</h1>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                      Em caso de litígio o consumidor pode recorrer a uma Entidade de Resolução Alternativa de Litígios (RAL) de consumo. Abaixo listamos as principais entidades nacionais e regionais disponíveis.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                    <ShieldCheck size={40} className="text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Proteção do Consumidor</p>
                      <p className="text-sm font-bold text-[#1c2d51]">Lei n.º 144/2015</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {RAL_ENTITIES.map((entity, index) => (
                    <a key={index} href={entity.url} target="_blank" rel="noopener noreferrer" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between h-full">
                      <div><div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1c2d51] group-hover:text-white transition-colors"><Building size={20} /></div><h3 className="font-black text-[#1c2d51] leading-tight mb-4 group-hover:text-[var(--primary)] transition-colors">{entity.name}</h3></div>
                      <div className="pt-6 border-t border-slate-50 mt-6 flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-[var(--primary)] transition-colors">Aceder ao Website</span><ExternalLink size={14} className="text-slate-300 group-hover:text-[var(--primary)]" /></div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-24">
                <div className="max-w-4xl">
                  <h1 className={`text-4xl md:text-7xl leading-tight mb-12 ${s.heading}`}>{page.title}</h1>
                  <div className="prose prose-slate max-w-none text-lg leading-relaxed whitespace-pre-line text-slate-600 font-medium">{page.content_md}</div>
                </div>

                {(page.missao || page.visao) && (
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {page.missao && <div className="p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100 space-y-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm text-[var(--primary)]"><Target size={28}/></div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-[#1c2d51]">A Nossa Missão</h3>
                        <p className="text-lg text-slate-500 leading-relaxed font-medium">{page.missao}</p>
                     </div>}
                     {page.visao && <div className="p-12 bg-[#1c2d51] text-white rounded-[3.5rem] space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/10 text-white"><ArrowUpRight size={28}/></div>
                        <h3 className="text-2xl font-black uppercase tracking-tight relative z-10">A Nossa Visão</h3>
                        <p className="text-lg opacity-70 leading-relaxed font-medium relative z-10">{page.visao}</p>
                        <Target size={200} className="absolute -right-20 -bottom-20 opacity-5 rotate-12" />
                     </div>}
                  </section>
                )}

                {page.equipa && page.equipa.length > 0 && (
                  <section>
                     <div className="flex items-center gap-4 mb-12"><div className="h-px flex-1 bg-slate-100"></div><h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Encontre a nossa Equipa</h2><div className="h-px flex-1 bg-slate-100"></div></div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {page.equipa.map(member => (
                           <div key={member.id} className="text-center group">
                              <div className="aspect-[3/4] bg-slate-100 rounded-[2.5rem] mb-6 overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700">
                                 {member.avatar_url ? <img src={member.avatar_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><Users size={48}/></div>}
                              </div>
                              <h4 className="text-xl font-black text-[#1c2d51] uppercase tracking-tighter">{member.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-4">{member.role}</p>
                              <div className="flex justify-center gap-3">
                                 {member.email && <a href={`mailto:${member.email}`} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#1c2d51] hover:text-white transition-all"><Mail size={16}/></a>}
                                 {member.phone && <a href={`tel:${member.phone}`} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#1c2d51] hover:text-white transition-all"><Phone size={16}/></a>}
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>
                )}

                {page.galeria_fotos && page.galeria_fotos.length > 0 && (
                  <section>
                     <div className="flex items-center gap-4 mb-12"><div className="h-px flex-1 bg-slate-100"></div><h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Galeria & Lifestyle</h2><div className="h-px flex-1 bg-slate-100"></div></div>
                     <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {page.galeria_fotos.map((url, idx) => (
                           <div key={idx} className="rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all"><img src={url} className="w-full h-auto" loading="lazy" /></div>
                        ))}
                     </div>
                  </section>
                )}
              </div>
            )}
         </div>
         {pageSlug === 'contactos' && <div className="mt-24 bg-slate-50"><ContactSection tenantId={tenant.id} isWhiteLabel={true} /></div>}
      </main>

      <footer className="py-20 px-10 text-white" style={{ backgroundColor: tenant.cor_primaria }}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6"><h4 className="text-xl font-black uppercase tracking-tight">{tenant.nome}</h4><p className="text-sm opacity-60 leading-relaxed">{tenant.slogan}</p></div>
            <div className="space-y-4"><p className="text-[10px] font-black uppercase tracking-widest opacity-40">Navegação</p><div className="flex flex-col gap-2">{cms.menus.main.map(m => renderLink(m, "text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"))}</div></div>
            <div className="space-y-4"><p className="text-[10px] font-black uppercase tracking-widest opacity-40">Legal</p><div className="flex flex-col gap-2">{cms.menus.footer.map(m => renderLink(m, "text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"))}</div></div>
         </div>
         <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-white/10 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">© {new Date().getFullYear()} {tenant.nome} • Software por ImoSuite</div>
      </footer>
    </div>
  );
};

export default PublicPage;