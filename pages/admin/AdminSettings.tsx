
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from "@firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Palette, Globe, Mail, Phone, Save, Layout, Check, 
  Loader2, Star, Building2, Zap, Brush, MapPin, Hash, 
  Settings, AlertTriangle, Eye, ChevronLeft, ChevronRight, Info,
  CreditCard, Lock, Camera, CheckCircle2, Clock, ShieldCheck
} from 'lucide-react';
import { Tenant } from '../../types';
import { generateSlug, formatCurrency, compressImage } from '../../lib/utils';
import { SubscriptionService } from '../../services/subscriptionService';

const TEMPLATE_OPTIONS = [
  { id: 'heritage', name: 'Heritage', icon: <Building2 size={20}/>, desc: 'Clássico e Formal' },
  { id: 'canvas', name: 'Canvas', icon: <Layout size={20}/>, desc: 'Design Moderno e Limpo' },
  { id: 'prestige', name: 'Prestige', icon: <Star size={20}/>, desc: 'Luxo e Minimalismo' },
  { id: 'skyline', name: 'Skyline', icon: <Zap size={20}/>, desc: 'Urbano e Tecnológico' },
  { id: 'luxe', name: 'Luxe', icon: <Brush size={20}/>, desc: 'Artístico e Lifestyle' },
] as const;

const AdminSettings: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile, user } = useAuth();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [localTenant, setLocalTenant] = useState<Tenant>(tenant);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<Tenant['template_id'] | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'general';

  const isBusiness = tenant.subscription?.plan_id === 'business' || user?.email === 'snapimoveis@gmail.com';

  useEffect(() => {
    if (!tenantLoading) {
      setLocalTenant(prev => ({
        ...prev,
        ...tenant,
        id: tenant.id !== 'default-tenant-uuid' ? tenant.id : prev.id
      }));
    }
  }, [tenant, tenantLoading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const compressed = await compressImage(base64, 1200, 1200, 0.9);
      setLocalTenant(prev => ({ ...prev, logo_url: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    let tId = tenant.id;
    if ((!tId || tId === 'default-tenant-uuid' || tId === 'pending') && user) tId = `tnt_${user.uid.slice(0, 12)}`;
    if (!tId || !user) return;

    setIsSaving(true);
    setSuccess(false);

    try {
      if (localTenant.slug !== tenant.slug) {
        const normalizedSlug = generateSlug(localTenant.slug);
        const q = query(collection(db, "tenants"), where("slug", "==", normalizedSlug), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty && snap.docs[0].id !== tId) throw new Error("Endereço já em uso.");
        localTenant.slug = normalizedSlug;
      }

      const { id, ...dataToSave } = localTenant;
      const updates = { ...dataToSave, updated_at: serverTimestamp() };

      await setDoc(doc(db, 'tenants', tId), updates, { merge: true });
      setTenant({ ...localTenant, id: tId });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (tenantLoading && !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#1c2d51] tracking-tighter uppercase">Configurações</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Gestão de Identidade e Agência</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl hover:-translate-y-1 transition-all">
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Guardar Tudo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ABAS LATERAIS CONFORME SCREENSHOT */}
        <div className="lg:col-span-3 space-y-4">
          <LargeTabLink active={activeTab === 'general'} icon={<Building2 size={20}/>} label="Empresa" tab="general" />
          <LargeTabLink active={activeTab === 'branding'} icon={<Brush size={20}/>} label="Branding" tab="branding" />
          <LargeTabLink active={activeTab === 'website'} icon={<Globe size={20}/>} label="Website" tab="website" />
          <LargeTabLink active={activeTab === 'billing'} icon={<CreditCard size={20}/>} label="Faturação" tab="billing" />
        </div>

        <div className="lg:col-span-9">
          {activeTab === 'general' && (
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
               <h3 className="font-black text-[#1c2d51] uppercase text-sm tracking-widest border-b pb-6">Dados da Empresa</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Nome Comercial</label>
                    <input className="admin-input-settings" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Email de Gestão</label>
                    <input className="admin-input-settings" value={localTenant.email} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Slogan / Frase de Capa</label>
                    <input className="admin-input-settings" value={localTenant.slogan || ''} onChange={e => setLocalTenant({...localTenant, slogan: e.target.value})} />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-sm tracking-widest border-b pb-6">Identidade Visual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Cor Primária</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <input type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value.toUpperCase()})} />
                          <span className="font-black text-sm uppercase tracking-widest">{localTenant.cor_primaria}</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Cor Secundária</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <input type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer" value={localTenant.cor_secundaria} onChange={e => setLocalTenant({...localTenant, cor_secundaria: e.target.value.toUpperCase()})} />
                          <span className="font-black text-sm uppercase tracking-widest">{localTenant.cor_secundaria}</span>
                       </div>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-4 block">Logótipo Oficial (PNG Transparente)</label>
                    <div onClick={() => logoInputRef.current?.click()} className="h-64 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:bg-slate-100 transition-all overflow-hidden p-6 relative group">
                       {localTenant.logo_url ? (
                         <>
                           <img src={localTenant.logo_url} className="h-full w-auto object-contain" alt="Logo" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase">Alterar Logótipo</div>
                         </>
                       ) : (
                         <>
                           <Camera size={32} className="mb-2"/>
                           <span className="text-[10px] font-black uppercase tracking-widest">Upload PNG</span>
                         </>
                       )}
                       <input type="file" ref={logoInputRef} onChange={handleFileChange} className="hidden" accept="image/png,image/jpeg,image/webp" />
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-sm tracking-widest border-b pb-6">Catálogo de Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {TEMPLATE_OPTIONS.map((tmpl) => (
                  <div key={tmpl.id} className={`group relative p-8 rounded-[2.5rem] border-2 transition-all ${localTenant.template_id === tmpl.id ? 'border-[#1c2d51] bg-[#1c2d51]/5' : 'border-slate-50 hover:border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${localTenant.template_id === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-50 text-slate-400'}`}>{tmpl.icon}</div>
                       {localTenant.template_id === tmpl.id && <div className="bg-[#1c2d51] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Ativo</div>}
                    </div>
                    <h4 className="font-black text-xl text-[#1c2d51]">{tmpl.name}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">{tmpl.desc}</p>
                    <div className="flex gap-2">
                       <button onClick={() => setLocalTenant({ ...localTenant, template_id: tmpl.id })} className="flex-1 bg-[#1c2d51] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest">Selecionar</button>
                       <button onClick={() => setPreviewingTemplate(tmpl.id)} className="px-6 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1c2d51] transition-colors"><Eye size={20}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESTAURAÇÃO DA SECÇÃO DE FATURAÇÃO */}
          {activeTab === 'billing' && (
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
              <div className="flex justify-between items-center border-b pb-6">
                 <h3 className="font-black text-[#1c2d51] uppercase text-sm tracking-widest">Gestão de Subscrição</h3>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Estado:</span>
                    <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2"><CheckCircle2 size={12}/> Ativo</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#1c2d51] rounded-full blur-[80px] opacity-10 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Plano Atual</p>
                    <h4 className="text-4xl font-black text-[#1c2d51] uppercase tracking-tighter mb-2">{localTenant.subscription?.plan_id || 'Starter'}</h4>
                    <p className="text-xs font-bold text-[#357fb2] uppercase tracking-widest mb-8">Subscrição Mensal</p>
                    <Link to="/planos" className="inline-flex items-center gap-2 text-[10px] font-black text-[#1c2d51] uppercase tracking-widest border-b-2 border-[#1c2d51] pb-1 hover:gap-4 transition-all">Alterar Plano <ArrowRight size={14}/></Link>
                 </div>

                 <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Clock size={14}/> Próximo Pagamento</p>
                    <div className="space-y-4">
                       <p className="text-3xl font-black text-[#1c2d51]">{new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">O valor será debitado automaticamente no seu cartão pré-definido.</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 pt-10">
                 <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Histórico de Faturas</h4>
                 <div className="bg-white border border-slate-50 rounded-3xl overflow-hidden">
                    <div className="p-6 flex items-center justify-between border-b border-slate-50 opacity-40">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><FileText size={18}/></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Sem faturas recentes</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {previewingTemplate && (
        <TemplatePreviewModal 
          templateId={previewingTemplate} 
          onClose={() => setPreviewingTemplate(null)} 
          onSelect={() => { 
            const templateId = previewingTemplate;
            if (templateId) setLocalTenant({ ...localTenant, template_id: templateId }); 
            setPreviewingTemplate(null); 
          }} 
          tenantData={localTenant}
        />
      )}

      <style>{`
        .admin-input-settings { width: 100%; padding: 1.25rem 1.6rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.95rem; }
        .admin-input-settings:focus { background: #fff; border-color: #1c2d51; box-shadow: 0 10px 30px -10px rgba(28, 45, 81, 0.1); }
      `}</style>
    </div>
  );
};

const LargeTabLink = ({ active, icon, label, tab }: { active: boolean, icon: any, label: string, tab: string }) => (
  <Link to={`/admin/settings?tab=${tab}`} className={`flex items-center gap-6 px-8 py-7 rounded-[2.5rem] transition-all border group ${active ? 'bg-[#1c2d51] text-white border-[#1c2d51] shadow-2xl scale-[1.02]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-300 group-hover:text-[#1c2d51]'}`}>{icon}</div>
    <div className={`font-black text-sm uppercase tracking-widest ${active ? 'text-white' : 'text-[#1c2d51]'}`}>{label}</div>
    {active && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
  </Link>
);

const TemplatePreviewModal = ({ templateId, onClose, onSelect, tenantData }: any) => {
  const [page, setPage] = useState('home');
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"><ChevronLeft size={20}/> Voltar</button>
        <div className="bg-slate-50 p-2 rounded-[2rem] flex gap-2">
           {['home', 'catalogo', 'detalhe'].map(p => (
             <button key={p} onClick={() => setPage(p)} className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${page === p ? 'bg-white text-[#1c2d51] shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>{p}</button>
           ))}
        </div>
        <button onClick={onSelect} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:-translate-y-1 transition-all">Aplicar Template</button>
      </header>
      <div className="flex-1 overflow-y-auto bg-slate-100 p-12 lg:p-24">
        <div className="max-w-[1440px] mx-auto min-h-full bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] rounded-[4rem] overflow-hidden">
          <PreviewEngine templateId={templateId} page={page} tenant={tenantData} />
        </div>
      </div>
    </div>
  );
};

const PreviewEngine = ({ templateId, page, tenant }: any) => {
  const dummyProps = [
    { id: 1, title: 'Apartamento T3 com Vista Rio', price: 425000, loc: 'Lisboa', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800' },
    { id: 2, title: 'Moradia V4 com Piscina', price: 950000, loc: 'Cascais', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800' },
  ];

  return (
    <div className="min-h-screen bg-white">
       <nav className="h-28 px-12 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#1c2d51] flex items-center justify-center text-white text-xs font-black">IS</div>
            <span className="font-black text-2xl text-[#1c2d51] tracking-tighter">{tenant.nome}</span>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Início</span>
            <span>Imóveis</span>
            <span>Contactos</span>
          </div>
       </nav>

       <main>
          {page === 'home' && (
            <>
              <header className="py-40 px-12 text-center bg-slate-50 relative overflow-hidden">
                 <div className="relative z-10 space-y-6">
                   <h1 className={`text-8xl font-black text-[#1c2d51] tracking-tighter leading-none ${templateId === 'prestige' ? 'italic' : ''}`}>{tenant.nome}</h1>
                   <p className="text-2xl text-slate-400 font-medium max-w-2xl mx-auto">{tenant.slogan || 'Encontre o seu próximo capítulo.'}</p>
                 </div>
              </header>
              <div className="p-24 grid grid-cols-1 md:grid-cols-2 gap-16">
                {dummyProps.map(p => (
                  <div key={p.id} className="group cursor-pointer">
                    <div className="aspect-video bg-slate-100 rounded-[3.5rem] overflow-hidden mb-8 shadow-sm">
                      <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <h3 className="text-3xl font-black text-[#1c2d51] tracking-tight">{p.title}</h3>
                    <p className="text-[#357fb2] font-black text-xl mt-2 tracking-tight">{formatCurrency(p.price)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {page !== 'home' && (
            <div className="p-40 flex flex-col items-center justify-center text-slate-300 space-y-6">
              <Loader2 className="animate-spin" size={48} />
              <p className="font-black text-xs uppercase tracking-[0.3em]">Gerando visualização de {page}...</p>
            </div>
          )}
       </main>
    </div>
  );
};

const FileText = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const ArrowRight = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

export default AdminSettings;
