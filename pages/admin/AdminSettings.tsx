import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
// Modular Firestore imports
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from "@firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Palette, Globe, Mail, Phone, Save, Layout, Check, 
  Loader2, Star, Building2, Zap, Brush, MapPin, Hash, 
  Settings, AlertTriangle, Eye, ChevronLeft, ChevronRight, Info,
  Quote, Heart, Search, LayoutGrid, List, ArrowUpRight, Bed, Bath, Square,
  MessageSquare, Camera, Share2, Sparkles, Image as ImageIcon, Car, Handshake, Key, ArrowRight, Send,
  ShieldCheck, CreditCard, Clock, CheckCircle2,
  Lock
} from 'lucide-react';
import { Tenant } from '../../types';
import { generateSlug, formatCurrency, compressImage } from '../../lib/utils';
import { generateAgencySlogan } from '../../services/geminiService';
import { SubscriptionService } from '../../services/subscriptionService';

const TEMPLATE_OPTIONS = [
  { id: 'heritage', name: 'Heritage', icon: <Building2 size={20}/>, desc: 'Clássico e Formal', color: '#1c2d51' },
  { id: 'canvas', name: 'Canvas', icon: <Layout size={20}/>, desc: 'Design Moderno e Limpo', color: '#357fb2' },
  { id: 'prestige', name: 'Prestige', icon: <Star size={20}/>, desc: 'Luxo e Minimalismo', color: '#000000' },
  { id: 'skyline', name: 'Skyline', icon: <Zap size={20}/>, desc: 'Urbano e Tecnológico', color: '#2563eb' },
  { id: 'luxe', name: 'Luxe', icon: <Brush size={20}/>, desc: 'Artístico e Lifestyle', color: '#2D2926' },
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
  const [isGeneratingSlogan, setIsGeneratingSlogan] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'general';

  const isBusiness = tenant.subscription?.plan_id === 'business' || user?.email === 'snapimoveis@gmail.com';

  const { isTrial, daysLeft, hasAccess } = SubscriptionService.checkAccess(tenant, user?.email);

  useEffect(() => {
    if (!tenantLoading) {
      setLocalTenant(prev => ({
        ...prev,
        ...tenant,
        id: tenant.id !== 'default-tenant-uuid' ? tenant.id : prev.id
      }));
    }
  }, [tenant, tenantLoading]);

  const handleLogoClick = () => logoInputRef.current?.click();
  const handleHeroClick = () => heroInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const compressed = await compressImage(base64, 1200, 1200, 0.75);
      
      if (type === 'logo') {
        setLocalTenant(prev => ({ ...prev, logo_url: compressed }));
      } else {
        setLocalTenant(prev => ({ ...prev, hero_image_url: compressed }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSlogan = async () => {
    if (!localTenant.nome) return;
    setIsGeneratingSlogan(true);
    try {
      const slogan = await generateAgencySlogan(localTenant.nome);
      setLocalTenant(prev => ({ ...prev, slogan }));
    } finally {
      setIsGeneratingSlogan(false);
    }
  };

  const handleSave = async () => {
    let tId = tenant.id;
    if ((!tId || tId === 'default-tenant-uuid' || tId === 'pending') && user) tId = `tnt_${user.uid.slice(0, 12)}`;
    if (!tId || !user) return;

    setIsSaving(true);
    setSuccess(false);
    setErrorMessage(null);

    try {
      if (localTenant.slug !== tenant.slug) {
        const normalizedSlug = generateSlug(localTenant.slug);
        const q = query(collection(db, "tenants"), where("slug", "==", normalizedSlug), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty && snap.docs[0].id !== tId) {
          throw new Error("Este endereço já está a ser utilizado por outra agência.");
        }
        localTenant.slug = normalizedSlug;
      }

      const { id, ...dataToSave } = localTenant;
      const updates = {
        ...dataToSave,
        updated_at: serverTimestamp()
      };

      await setDoc(doc(db, 'tenants', tId), updates, { merge: true });
      setTenant({ ...localTenant, id: tId });
      
      const root = document.documentElement;
      root.style.setProperty('--primary', localTenant.cor_primaria);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro ao guardar as definições.");
    } finally {
      setIsSaving(false);
    }
  };

  if (tenantLoading && !user) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" size={48} /></div>;
  }

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Configuração da Agência</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gerir identidade e presença online</p>
        </div>
        <div className="flex items-center gap-4">
          {success && <div className="text-emerald-600 text-xs font-black uppercase flex items-center gap-2 animate-bounce"><Check size={16}/> Guardado!</div>}
          <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Guardar Tudo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-2">
          <TabLink active={activeTab === 'general'} icon={<Building2 size={18}/>} label="Empresa" tab="general" />
          <TabLink active={activeTab === 'branding'} icon={<Brush size={18}/>} label="Branding" tab="branding" />
          <TabLink active={activeTab === 'website'} icon={<Globe size={18}/>} label="Website" tab="website" />
          <TabLink active={activeTab === 'billing'} icon={<CreditCard size={18}/>} label="Faturação" tab="billing" />
        </div>

        <div className="lg:col-span-3">
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-bold border border-red-100">
              <ShieldCheck size={18} /> {errorMessage}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4">Dados da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label htmlFor="agency_name" className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Comercial</label>
                    <input id="agency_name" name="agency_name" className="admin-input-settings" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label htmlFor="agency_nif" className="text-[10px] font-black uppercase text-slate-400 ml-2">NIF / Identificação Fiscal</label>
                    <input id="agency_nif" name="agency_nif" className="admin-input-settings" value={localTenant.nif || ''} onChange={e => setLocalTenant({...localTenant, nif: e.target.value})} />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label htmlFor="agency_slogan" className="text-[10px] font-black uppercase text-slate-400 ml-2">Slogan / Frase de Capa</label>
                    <div className="relative">
                      <input id="agency_slogan" name="agency_slogan" className="admin-input-settings pr-14" value={localTenant.slogan || ''} onChange={e => setLocalTenant({...localTenant, slogan: e.target.value})} />
                      <button onClick={handleGenerateSlogan} disabled={isGeneratingSlogan} className="absolute right-2 top-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm hover:bg-blue-50 transition-colors">
                        {isGeneratingSlogan ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      </button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label htmlFor="agency_email" className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Público</label>
                    <input id="agency_email" name="agency_email" type="email" className="admin-input-settings" value={localTenant.email} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label htmlFor="agency_phone" className="text-[10px] font-black uppercase text-slate-400 ml-2">Telefone Público</label>
                    <input id="agency_phone" name="agency_phone" className="admin-input-settings" value={localTenant.telefone || ''} onChange={e => setLocalTenant({...localTenant, telefone: e.target.value})} />
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4">Branding & Cores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label htmlFor="color_primary" className="text-[10px] font-black uppercase text-slate-400 ml-2">Cor Primária</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                          <input id="color_primary" name="color_primary" type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} />
                          <span className="font-black text-xs uppercase tracking-widest">{localTenant.cor_primaria}</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label htmlFor="color_secondary" className="text-[10px] font-black uppercase text-slate-400 ml-2">Cor Secundária</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                          <input id="color_secondary" name="color_secondary" type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer" value={localTenant.cor_secundaria} onChange={e => setLocalTenant({...localTenant, cor_secundaria: e.target.value})} />
                          <span className="font-black text-xs uppercase tracking-widest">{localTenant.cor_secundaria}</span>
                       </div>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-4 block">Logótipo da Agência</label>
                    <div onClick={handleLogoClick} className="h-52 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:bg-slate-100 transition-all overflow-hidden p-6 relative group">
                       {localTenant.logo_url ? (
                         <>
                           <img src={localTenant.logo_url} className="h-full w-auto object-contain" alt="Logótipo da Agência" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase">Alterar Logótipo</div>
                         </>
                       ) : (
                         <>
                           <Camera size={32} className="mb-2"/>
                           <span className="text-[10px] font-black uppercase">Upload PNG/JPG</span>
                         </>
                       )}
                       <input type="file" id="logo_input" name="logo_input" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} className="hidden" accept="image/*" />
                    </div>
                 </div>
              </div>
              
              {!isBusiness && (
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center gap-4">
                  <Lock className="text-slate-300" size={24}/>
                  <div>
                    <p className="text-xs font-black uppercase text-[#1c2d51]">Remover Branding ImoSuite</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Apenas disponível no plano Business.</p>
                  </div>
                  <Link to="/planos" className="text-blue-500 font-black text-[10px] uppercase tracking-widest border-b border-blue-500 pb-0.5">Fazer Upgrade</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'website' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-12 animate-in fade-in">
              <div className="space-y-6">
                 <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Endereço & Imagem de Capa</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label htmlFor="agency_slug" className="text-[10px] font-black uppercase text-slate-400 ml-2">Endereço do Website (Link)</label>
                       <div className="flex items-center bg-slate-50 rounded-2xl px-6 py-4">
                         <span className="text-slate-300 font-bold text-sm">/agencia/</span>
                         <input id="agency_slug" name="agency_slug" className="flex-1 bg-transparent outline-none font-black text-[#1c2d51] text-sm lowercase" value={localTenant.slug} onChange={e => setLocalTenant({...localTenant, slug: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Imagem de Capa (Hero)</label>
                       <div onClick={handleHeroClick} className="h-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center gap-4 px-6 cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative">
                          {localTenant.hero_image_url ? (
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white"><img src={localTenant.hero_image_url} className="w-full h-full object-cover" alt="Capa" /></div>
                              <span className="text-[10px] font-black text-[#1c2d51] uppercase truncate">Imagem Personalizada</span>
                            </div>
                          ) : (
                            <>
                              <ImageIcon size={20} className="text-slate-300" />
                              <span className="text-[10px] font-black text-slate-400 uppercase">Usar padrão ou Carregar</span>
                            </>
                          )}
                          <input type="file" id="hero_input" name="hero_input" ref={heroInputRef} onChange={(e) => handleFileChange(e, 'hero')} className="hidden" accept="image/*" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* DOMÍNIO PRÓPRIO SECTION */}
              <div className="space-y-8 pt-10 border-t">
                <div className="flex items-center justify-between">
                   <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest flex items-center gap-2">
                     <Globe size={16}/> Domínio Personalizado
                   </h3>
                   {!isBusiness && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-2"><Star size={10} fill="currentColor"/> Business Only</span>}
                </div>
                
                <div className={`p-8 rounded-[2.5rem] border-2 border-dashed transition-all ${isBusiness ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
                   {!isBusiness ? (
                     <div className="text-center space-y-4">
                        <p className="text-sm font-bold text-slate-600">Aponte o seu domínio próprio (ex: imobiliaria-exemplo.pt) para a nossa plataforma.</p>
                        <Link to="/planos" className="inline-block bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Desbloquear Agora</Link>
                     </div>
                   ) : (
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Insira o seu domínio</label>
                           <div className="flex gap-4">
                              <input className="admin-input-settings flex-1" placeholder="www.agencia-exemplo.pt" />
                              <button className="bg-[#1c2d51] text-white px-8 rounded-xl font-black text-xs uppercase">Configurar</button>
                           </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-4">
                           <Info className="text-blue-500 shrink-0" size={20}/>
                           <p className="text-[10px] font-bold text-blue-800 uppercase leading-relaxed">Deverá apontar o registo CNAME 'www' do seu DNS para 'proxy.imosuite.pt' após a configuração.</p>
                        </div>
                     </div>
                   )}
                </div>
              </div>

              <div className="space-y-6 border-t pt-10">
                <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Catálogo de Templates (5 Estilos)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {TEMPLATE_OPTIONS.map((tmpl) => (
                    <div key={tmpl.id} className={`group relative p-8 rounded-[2.5rem] border-2 transition-all ${localTenant.template_id === tmpl.id ? 'border-[#1c2d51] bg-[#1c2d51]/5' : 'border-slate-50 hover:border-slate-200 shadow-sm'}`}>
                      <div className="flex justify-between items-start mb-6">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${localTenant.template_id === tmpl.id ? 'bg-[#1c2d51] text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-white'}`}>{tmpl.icon}</div>
                         {localTenant.template_id === tmpl.id && <div className="bg-[#1c2d51] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-sm">Ativo</div>}
                      </div>
                      <h4 className="font-black text-lg text-[#1c2d51] mb-1">{tmpl.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-8 leading-tight">{tmpl.desc}</p>
                      <div className="flex gap-2">
                         <button onClick={() => setLocalTenant({ ...localTenant, template_id: tmpl.id })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localTenant.template_id === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-50 text-slate-400 hover:bg-[#1c2d51] hover:text-white'}`}>Selecionar</button>
                         <button onClick={() => setPreviewingTemplate(tmpl.id)} className="px-5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1c2d51] hover:border-[#1c2d51] transition-all flex items-center justify-center gap-2"><Eye size={16}/> <span className="hidden sm:inline text-[8px] font-black uppercase">Ver</span></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Billing Tab Remains the same as before */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4">Gestão de Subscrição</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Current Status Card */}
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Plano Atual</p>
                      <h4 className="text-3xl font-black text-[#1c2d51] uppercase tracking-tighter mb-6">
                        {user?.email === 'snapimoveis@gmail.com' ? 'MASTER ADMIN' : (tenant.subscription?.plan_id || 'Starter')}
                      </h4>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasAccess ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {hasAccess ? <CheckCircle2 size={16} /> : <Lock size={16} />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Estado da Conta</p>
                            <p className="text-xs font-bold text-[#1c2d51]">{hasAccess ? 'Ativa e Funcional (Master)' : 'Acesso Bloqueado'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Clock size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Próxima Fatura</p>
                            <p className="text-xs font-bold text-[#1c2d51]">
                              {user?.email === 'snapimoveis@gmail.com' ? 'Vitalício / Isento' : (isTrial ? `${daysLeft} dias restantes` : 'Faturação ativa')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isTrial && user?.email !== 'snapimoveis@gmail.com' && (
                        <Link 
                          to="/planos" 
                          className="inline-flex bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl items-center gap-2 hover:-translate-y-1 transition-all"
                        >
                          <Zap size={14} fill="currentColor" /> Atualizar Plano
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Limits Info */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center space-y-6">
                    <div>
                      <h5 className="font-black text-xs text-[#1c2d51] uppercase tracking-widest mb-4">O que inclui o seu plano:</h5>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Check size={14} className="text-emerald-500" /> {isBusiness ? 'Imóveis Ilimitados' : 'Até 50 Imóveis'}
                        </li>
                        <li className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Check size={14} className="text-emerald-500" /> {isBusiness ? 'Até 10 Utilizadores' : '1 Utilizador'}
                        </li>
                        <li className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Check size={14} className="text-emerald-500" /> Gemini AI {isBusiness ? 'Pro Ilimitado' : 'Básico'}
                        </li>
                        <li className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Check size={14} className="text-emerald-500" /> {isBusiness ? 'White-label Total + Domínio' : 'Site em Subdomínio'}
                        </li>
                      </ul>
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
            const tid = previewingTemplate;
            if (tid) {
              setLocalTenant({ ...localTenant, template_id: tid }); 
            }
            setPreviewingTemplate(null); 
          }} 
          tenantData={localTenant}
        />
      )}

      <style>{`
        .admin-input-settings {
          width: 100%;
          padding: 1rem 1.25rem;
          background: #f8fafc;
          border: 2px solid transparent;
          border-radius: 1.25rem;
          outline: none;
          font-weight: 700;
          color: #1c2d51;
          transition: all 0.2s;
        }
        .admin-input-settings:focus {
          background: #fff;
          border-color: #1c2d51;
        }
      `}</style>
    </div>
  );
};

const TabLink = ({ active, icon, label, tab }: { active: boolean, icon: any, label: string, tab: string }) => (
  <Link to={`/admin/settings?tab=${tab}`} className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all border ${active ? 'bg-[#1c2d51] text-white border-[#1c2d51] shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>
    <div className={active ? 'text-white' : 'text-slate-300'}>{icon}</div>
    <div className={`font-black text-[11px] uppercase tracking-tighter leading-none ${active ? 'text-white' : 'text-[#1c2d51]'}`}>{label}</div>
  </Link>
);

const TemplatePreviewModal = ({ templateId, onClose, onSelect, tenantData }: any) => {
  const [page, setPage] = useState('home');
  const template = TEMPLATE_OPTIONS.find(t => t.id === templateId);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1c2d51] transition-all">
            <ChevronLeft size={16}/> Voltar
          </button>
          <div className="h-8 w-px bg-slate-100"></div>
          <div>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Pré-visualização Real</span>
            <h4 className="text-sm font-black text-[#1c2d51] tracking-tighter">{template?.name}</h4>
          </div>
        </div>

        <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center gap-1">
           <PageTab active={page === 'home'} onClick={() => setPage('home')} label="Homepage" />
        </div>

        <button onClick={onSelect} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all">
          Usar este Template
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-100 p-8 sm:p-12 lg:p-20">
        <div className="max-w-[1440px] mx-auto min-h-full bg-white shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-[3rem] overflow-hidden">
          <PreviewEngine templateId={templateId} page={page} tenant={tenantData} />
        </div>
      </div>
    </div>
  );
};

const PageTab = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {label}
  </button>
);

const PreviewEngine = ({ templateId, tenant }: any) => {
  // Added useAuth and isBusiness definition to fix the 'Cannot find name isBusiness' reference error in the preview footer
  const { user } = useAuth();
  const isBusiness = tenant.subscription?.plan_id === 'business' || user?.email === 'snapimoveis@gmail.com';

  const dummyProps = [
    { id: 1, title: 'Apartamento T3 com Vista Mar', price: 385000, loc: 'Cascais e Estoril, Cascais', ref: 'REF001', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', bed: 3, bath: 2, sq: 120 },
    { id: 2, title: 'Moradia V4 com Jardim e Piscina', price: 750000, loc: 'Madalena, Vila Nova de Gaia', ref: 'REF002', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', bed: 4, bath: 3, sq: 240 },
    { id: 3, title: 'Moradia T5 com Vista Panorâmica', price: 1250000, loc: 'São Pedro de Penaferrim, Sintra', ref: 'REF004', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', bed: 5, bath: 4, sq: 350 },
  ];

  // Identidades Visuais
  const styles: Record<string, any> = {
    heritage: {
      nav: "h-20 border-b border-slate-100 px-10 flex items-center justify-between bg-white font-brand",
      hero: "py-32 px-10 text-center bg-slate-50 border-b border-slate-100 relative font-brand",
      title: "text-7xl font-black text-[#1c2d51] tracking-tighter leading-[0.9] mb-8 max-w-4xl mx-auto italic",
      card: "group cursor-pointer aspect-[4/5] bg-slate-200 rounded-[2.5rem] overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-700",
      contact: "bg-slate-50 py-32 px-10 border-t border-slate-100",
      footer: "py-24 px-10 border-t border-slate-100 bg-slate-50"
    },
    canvas: {
      nav: "h-24 px-12 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 font-brand",
      hero: "py-40 px-12 flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 to-white",
      title: "text-6xl md:text-8xl font-black text-[#1c2d51] tracking-tight mb-8",
      card: "group cursor-pointer aspect-video bg-slate-100 rounded-3xl overflow-hidden mb-6 shadow-md hover:shadow-2xl transition-all",
      contact: "bg-white py-32 px-12 border-t border-slate-100",
      footer: "py-24 px-10 border-t border-slate-100 bg-slate-50"
    },
    prestige: {
      nav: "h-20 px-10 flex items-center justify-between bg-black text-white font-brand uppercase tracking-widest",
      hero: "h-[80vh] flex flex-col items-center justify-center text-center bg-black text-white relative overflow-hidden",
      title: "text-8xl md:text-[10rem] font-black tracking-tighter italic mb-10 leading-none",
      card: "group cursor-pointer aspect-[3/4] bg-neutral-900 rounded-none overflow-hidden mb-6 shadow-none transition-all grayscale hover:grayscale-0",
      contact: "bg-neutral-900 py-32 px-10 text-white",
      footer: "py-24 px-10 border-t border-white/10 bg-black text-white"
    },
    skyline: {
      nav: "h-20 px-12 flex items-center justify-between bg-blue-600 text-white font-brand",
      hero: "py-32 px-12 bg-blue-600 text-white relative",
      title: "text-6xl font-black tracking-tighter leading-none mb-6",
      card: "group cursor-pointer aspect-square bg-slate-50 rounded-[2rem] overflow-hidden mb-4 border border-slate-100 shadow-xl",
      contact: "bg-slate-900 py-32 px-12 text-white",
      footer: "py-24 px-10 border-t border-white/10 bg-slate-900 text-white"
    },
    luxe: {
      nav: "h-24 px-10 flex items-center justify-between bg-[#FDFBF7] font-brand",
      hero: "py-40 px-10 bg-[#FDFBF7] text-[#2D2926] font-brand",
      title: "text-7xl font-black tracking-tighter mb-8 max-w-3xl",
      card: "group cursor-pointer aspect-[4/5] bg-[#EAE3D9] rounded-[4rem] overflow-hidden mb-8 shadow-sm hover:shadow-2xl transition-all duration-1000",
      contact: "bg-[#FDFBF7] py-32 px-10",
      footer: "py-24 px-10 border-t border-[#EAE3D9] bg-[#FDFBF7]"
    }
  };

  const s = styles[templateId] || styles.heritage;
  const isDarkFooter = templateId === 'prestige' || templateId === 'skyline';

  return (
    <div className={`font-brand min-h-screen ${templateId === 'prestige' ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>
       {/* NAV */}
       <nav className={s.nav}>
          <span className="font-black text-2xl tracking-tighter">{tenant.nome}</span>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest opacity-60">
             <span>Início</span><span>Propriedades</span><span>Agência</span>
          </div>
          <button className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest ${templateId === 'prestige' ? 'bg-white text-black' : 'bg-[#1c2d51] text-white'}`}>Contactar</button>
       </nav>

       {/* HERO */}
       <header className={s.hero}>
          <div className="max-w-4xl mx-auto px-6 relative z-10">
             <h1 className={s.title}>{tenant.nome}</h1>
             <p className="text-xl font-medium opacity-60 max-w-xl mx-auto mb-12">{tenant.slogan || "Consultoria imobiliária de elite."}</p>
             <div className="bg-white p-2 rounded-2xl shadow-2xl flex max-w-2xl mx-auto border border-slate-100 text-slate-900">
                <input className="flex-1 px-6 font-bold text-slate-400 text-sm outline-none" placeholder="Localidade ou Ref..." />
                <button className={`px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest ${templateId === 'prestige' ? 'bg-black text-white' : 'bg-[#1c2d51] text-white'}`}>Pesquisar</button>
             </div>
          </div>
       </header>

       {/* PROPERTIES */}
       <main className="py-32 px-10 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-20 border-b pb-10 border-slate-100">
             <h2 className={`text-4xl font-black tracking-tighter ${templateId === 'prestige' ? 'italic uppercase' : ''}`}>Destaques</h2>
             <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Consultoria Imobiliária Premium</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {dummyProps.map(p => (
              <div key={p.id} className="group cursor-pointer">
                 <div className={s.card}>
                    <img src={p.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.title} />
                 </div>
                 <h4 className="font-black text-xl mb-1 tracking-tight">{p.title}</h4>
                 <div className="flex items-center gap-4 text-slate-400 font-bold text-[9px] uppercase mb-4">
                    <span className="flex items-center gap-1"><Bed size={14}/> {p.bed}</span>
                    <span className="flex items-center gap-1"><Bath size={14}/> {p.bath}</span>
                    <span className="flex items-center gap-1"><Square size={14}/> {p.sq}m²</span>
                 </div>
                 <p className="font-black text-xl">{formatCurrency(p.price)}</p>
              </div>
            ))}
          </div>
       </main>

       {/* CONTACT FORM */}
       <section className={s.contact}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
             <div className="space-y-8">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">Fale Connosco</h2>
                <p className="text-xl font-medium opacity-60 leading-relaxed max-w-md">Estamos aqui para ajudar a esclarecer as suas dúvidas.</p>
             </div>
             <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-slate-900 space-y-6">
                <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="Nome" />
                <button className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Enviar Pedido</button>
             </div>
          </div>
       </section>

       {/* FOOTER COM LIVRO DE RECLAMAÇÕES */}
       <footer className={s.footer}>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
           <div>
             <h4 className="text-xl font-black tracking-tighter uppercase mb-2">{tenant.nome}</h4>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">© {new Date().getFullYear()} {tenant.nome} • {isBusiness ? 'Real Estate Solution' : 'Powered by ImoSuite'}</p>
           </div>
           <div className="flex justify-end gap-10 items-center">
             <a href="#" className="block opacity-60 hover:opacity-100 transition-opacity">
                <img 
                  src={isDarkFooter 
                    ? "https://www.livroreclamacoes.pt/assets/img/logo_reclamacoes_white.png" 
                    : "https://www.livroreclamacoes.pt/assets/img/logo_reclamacoes.png"
                  } 
                  alt="Livro de Reclamações Online" 
                  className="h-10 w-auto"
                />
             </a>
           </div>
         </div>
       </footer>
    </div>
  );
};

export default AdminSettings;