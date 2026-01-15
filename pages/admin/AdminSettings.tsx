
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Building2, Brush, Globe, CreditCard, Save, Loader2, Camera, 
  Layout, Star, Zap, CheckCircle2, Search, Link as LinkIcon, BarChart3,
  Check, AlertTriangle, Copy, ShieldCheck, RefreshCw
} from 'lucide-react';
import { Tenant } from '../../types';
import { compressImage } from '../../lib/utils';
import { StorageService } from '../../services/storageService';
import { DomainService, DNS_RECORDS } from '../../services/domainService';

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
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Custom Domain States
  const [verifying, setVerifying] = useState(false);
  const [dnsResults, setDnsResults] = useState<{rootOk: boolean, wwwOk: boolean} | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'general';

  const isBusiness = tenant.subscription?.plan_id === 'business' || profile?.email === 'snapimoveis@gmail.com';

  useEffect(() => {
    if (!tenantLoading && tenant) {
      setLocalTenant({ 
        ...tenant,
        seo_settings: tenant.seo_settings || { meta_title: '', meta_description: '', keywords: '', google_analytics_id: '' }
      });
    }
  }, [tenant, tenantLoading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string, 400, 400, 0.6);
      setLocalTenant(prev => ({ ...prev, logo_url: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user || !localTenant.id || localTenant.id === 'default-tenant-uuid') return;
    setIsSaving(true);
    try {
      let finalLogoUrl = localTenant.logo_url;
      if (finalLogoUrl && finalLogoUrl.startsWith('data:image')) {
        finalLogoUrl = await StorageService.uploadBase64(`tenants/${localTenant.id}/branding/logo.png`, finalLogoUrl);
      }
      
      const { id, ...dataToSave } = localTenant;
      const updatedData = { 
        ...dataToSave, 
        logo_url: finalLogoUrl, 
        updated_at: serverTimestamp() 
      };
      
      await setDoc(doc(db, 'tenants', localTenant.id), updatedData, { merge: true });
      setTenant({ ...localTenant, logo_url: finalLogoUrl });
      
      const root = document.documentElement;
      if (localTenant.cor_primaria) root.style.setProperty('--primary', localTenant.cor_primaria);
      if (localTenant.cor_secundaria) root.style.setProperty('--secondary', localTenant.cor_secundaria);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { 
      console.error(err);
      alert("Erro ao guardar definições.");
    } finally { setIsSaving(false); }
  };

  const handleVerifyDomain = async () => {
    const domain = localTenant.custom_domain;
    if (!domain || !DomainService.isValidFormat(domain)) {
      alert("Por favor, insira um domínio válido (ex: www.oseudominio.com)");
      return;
    }

    setVerifying(true);
    try {
      const results = await DomainService.verifyDNS(domain);
      setDnsResults(results);
      
      const newStatus = results.status === 'verified' ? 'verified' : 'pending';
      setLocalTenant(prev => ({ 
        ...prev, 
        domain_status: newStatus,
        domain_checked_at: new Date()
      }));

      // Se verificado, oferecemos ativação automática
      if (results.status === 'verified') {
        const autoActivate = window.confirm("DNS verificado com sucesso! Deseja ativar este domínio agora?");
        if (autoActivate) {
           const updated = { ...localTenant, domain_status: 'active' as const, domain_checked_at: serverTimestamp() };
           await setDoc(doc(db, 'tenants', localTenant.id), updated, { merge: true });
           setTenant(updated);
           alert("Domínio ativado! Pode demorar alguns minutos até que o SSL seja propagado pela Vercel.");
        }
      }
    } catch (err) {
      alert("Erro ao verificar DNS. Tente novamente.");
    } finally {
      setVerifying(false);
    }
  };

  const copyDnsInstructions = () => {
    const text = `Configuração DNS ImoSuite:\n1. Tipo: A | Nome: @ | Valor: ${DNS_RECORDS.A_ROOT}\n2. Tipo: CNAME | Nome: www | Valor: ${DNS_RECORDS.CNAME_WWW}`;
    navigator.clipboard.writeText(text);
    alert("Instruções copiadas!");
  };

  if (tenantLoading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-[#1c2d51]" /></div>;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in pb-20 font-brand">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter uppercase">Configurações</h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-1">Identidade e Gestão da Agência</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {success ? 'Alterações Guardadas' : 'Publicar Alterações'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-2 p-1.5 bg-slate-100 rounded-[2rem]">
            <TabLink active={activeTab === 'general'} id="general" label="A Agência" icon={<Building2 size={16}/>} />
            <TabLink active={activeTab === 'branding'} id="branding" label="Marca e Cores" icon={<Brush size={16}/>} />
            <TabLink active={activeTab === 'website'} id="website" label="Website" icon={<Globe size={16}/>} />
            <TabLink active={activeTab === 'seo'} id="seo" label="SEO & Analytics" icon={<Search size={16}/>} />
            <TabLink active={activeTab === 'billing'} id="billing" label="Faturação" icon={<CreditCard size={16}/>} />
          </nav>
        </aside>

        <div className="flex-1 bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm min-h-[600px]">
          {activeTab === 'general' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Building2 size={24}/></div>
                 <div>
                    <h3 className="text-lg font-black text-[#1c2d51] uppercase tracking-tight">Dados da Imobiliária</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Informações oficiais da empresa</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="admin-label-sober">Nome Comercial</label>
                  <input className="admin-input-sober" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="admin-label-sober">Email de Gestão</label>
                  <input className="admin-input-sober" value={localTenant.email} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="admin-label-sober">Telefone Principal</label>
                  <input className="admin-input-sober" value={localTenant.telefone || ''} onChange={e => setLocalTenant({...localTenant, telefone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="admin-label-sober">NIF / Contribuinte</label>
                  <input className="admin-input-sober" value={localTenant.nif || ''} onChange={e => setLocalTenant({...localTenant, nif: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="admin-label-sober">Morada Sede</label>
                  <input className="admin-input-sober" value={localTenant.morada || ''} onChange={e => setLocalTenant({...localTenant, morada: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Brush size={24}/></div>
                 <div>
                    <h3 className="text-lg font-black text-[#1c2d51] uppercase tracking-tight">Branding & Cores</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Personalize o visual do seu portal</p>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="admin-label-sober">Cor Primária (Domina o Rodapé)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <input type="color" className="w-12 h-12 border-none bg-transparent cursor-pointer rounded-lg" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} />
                      <span className="font-mono font-black text-xs uppercase">{localTenant.cor_primaria}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="admin-label-sober">Cor Secundária (Acentos)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <input type="color" className="w-12 h-12 border-none bg-transparent cursor-pointer rounded-lg" value={localTenant.cor_secundaria} onChange={e => setLocalTenant({...localTenant, cor_secundaria: e.target.value})} />
                      <span className="font-mono font-black text-xs uppercase">{localTenant.cor_secundaria}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="admin-label-sober">Logótipo</label>
                  <div onClick={() => logoInputRef.current?.click()} className="aspect-video bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 p-8 overflow-hidden group transition-all">
                    {localTenant.logo_url ? <img src={localTenant.logo_url} className="h-full object-contain" alt="Logo" /> : <Camera className="text-slate-300" size={32} />}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Globe size={24}/></div>
                 <div>
                    <h3 className="text-lg font-black text-[#1c2d51] uppercase tracking-tight">Website & Domínio</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Gestão da presença online</p>
                 </div>
              </div>

              <div className="space-y-8 mb-12">
                 <div className="space-y-2">
                    <label className="admin-label-sober">Endereço ImoSuite (Padrão)</label>
                    <div className="flex items-center bg-slate-100 p-4 rounded-2xl border border-slate-200">
                       <span className="font-bold text-slate-400 text-sm">{localTenant.slug}.imosuite.pt</span>
                       <LinkIcon size={14} className="ml-auto text-slate-300" />
                    </div>
                 </div>

                 {/* Domínio Personalizado - Apenas se for Plano Business ou demo específica */}
                 {isBusiness && (
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-200 space-y-8">
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                             <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest flex items-center gap-2">
                               Domínio Próprio <Zap size={14} className="text-amber-500 fill-current"/>
                             </h4>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ligue a sua própria marca (ex: www.suaimobiliaria.pt)</p>
                          </div>
                          
                          {localTenant.domain_status && (
                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 border ${
                              localTenant.domain_status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              localTenant.domain_status === 'verified' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {localTenant.domain_status === 'active' ? <ShieldCheck size={10}/> : <RefreshCw size={10} className="animate-spin-slow"/>}
                              Status: {localTenant.domain_status}
                            </span>
                          )}
                       </div>

                       <div className="flex flex-col md:flex-row gap-4">
                          <input 
                             className="flex-1 admin-input-sober" 
                             placeholder="ex: www.a-sua-agencia.pt" 
                             value={localTenant.custom_domain || ''} 
                             onChange={e => setLocalTenant({...localTenant, custom_domain: e.target.value.toLowerCase().trim()})} 
                          />
                          <button 
                            onClick={handleVerifyDomain} 
                            disabled={verifying || !localTenant.custom_domain}
                            className="bg-white border-2 border-slate-200 text-[#1c2d51] px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all disabled:opacity-50"
                          >
                            {verifying ? <Loader2 size={14} className="animate-spin" /> : "Verificar DNS"}
                          </button>
                       </div>

                       {/* Instruções DNS */}
                       <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-inner space-y-4">
                          <div className="flex justify-between items-center">
                             <p className="text-[10px] font-black uppercase text-slate-500">Instruções de Configuração</p>
                             <button onClick={copyDnsInstructions} className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1 hover:underline">
                                <Copy size={12}/> Copiar Instruções
                             </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className={`p-4 rounded-2xl border ${dnsResults?.rootOk ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Registo A (Raiz)</p>
                                <div className="flex justify-between font-mono text-[10px] font-bold">
                                   <span>@</span>
                                   <span className="text-[#1c2d51]">{DNS_RECORDS.A_ROOT}</span>
                                </div>
                                {dnsResults && (
                                   <div className={`mt-2 flex items-center gap-1 text-[8px] font-black uppercase ${dnsResults.rootOk ? 'text-emerald-600' : 'text-red-500'}`}>
                                      {dnsResults.rootOk ? <Check size={10}/> : <AlertTriangle size={10}/>}
                                      {dnsResults.rootOk ? 'Configurado' : 'Não detetado'}
                                   </div>
                                )}
                             </div>
                             <div className={`p-4 rounded-2xl border ${dnsResults?.wwwOk ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Registo CNAME (WWW)</p>
                                <div className="flex justify-between font-mono text-[10px] font-bold">
                                   <span>www</span>
                                   <span className="text-[#1c2d51] truncate ml-4">{DNS_RECORDS.CNAME_WWW}</span>
                                </div>
                                {dnsResults && (
                                   <div className={`mt-2 flex items-center gap-1 text-[8px] font-black uppercase ${dnsResults.wwwOk ? 'text-emerald-600' : 'text-red-500'}`}>
                                      {dnsResults.wwwOk ? <Check size={10}/> : <AlertTriangle size={10}/>}
                                      {dnsResults.wwwOk ? 'Configurado' : 'Não detetado'}
                                   </div>
                                )}
                             </div>
                          </div>
                          <p className="text-[9px] text-slate-400 italic">A propagação de novas configurações DNS pode demorar até 24 horas.</p>
                       </div>
                    </div>
                 )}
              </div>

              <h4 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-6">Catálogo de Templates</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {TEMPLATE_OPTIONS.map((tmpl) => (
                  <div key={tmpl.id} onClick={() => setLocalTenant({ ...localTenant, template_id: tmpl.id })} className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all ${localTenant.template_id === tmpl.id ? 'border-[#1c2d51] bg-[#1c2d51]/5 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-6">{tmpl.icon}</div>
                    <h4 className="font-black text-lg text-[#1c2d51]">{tmpl.name}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">{tmpl.desc}</p>
                    {localTenant.template_id === tmpl.id && <div className="mt-4 flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase"><CheckCircle2 size={14}/> Ativo</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
             <div className="space-y-10 animate-in fade-in duration-300">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Search size={24}/></div>
                   <div>
                      <h3 className="text-lg font-black text-[#1c2d51] uppercase tracking-tight">Otimização SEO & Analytics</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Melhore a sua visibilidade no Google</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                   <div className="space-y-2">
                      <label className="admin-label-sober">Título SEO da Homepage (Meta Title)</label>
                      <input 
                        className="admin-input-sober" 
                        value={localTenant.seo_settings?.meta_title || ''} 
                        onChange={e => setLocalTenant({...localTenant, seo_settings: {...(localTenant.seo_settings || {}), meta_title: e.target.value}})} 
                        placeholder="Ex: A Melhor Imobiliária em Lisboa | Nome da Agência"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="admin-label-sober">Descrição SEO (Meta Description)</label>
                      <textarea 
                        className="admin-input-sober" 
                        rows={3}
                        value={localTenant.seo_settings?.meta_description || ''} 
                        onChange={e => setLocalTenant({...localTenant, seo_settings: {...(localTenant.seo_settings || {}), meta_description: e.target.value}})} 
                        placeholder="Descreva a sua agência em poucas palavras para os motores de busca..."
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="admin-label-sober">Keywords (Separadas por vírgula)</label>
                      <input 
                        className="admin-input-sober" 
                        value={localTenant.seo_settings?.keywords || ''} 
                        onChange={e => setLocalTenant({...localTenant, seo_settings: {...(localTenant.seo_settings || {}), keywords: e.target.value}})} 
                        placeholder="Imóveis, Venda, Apartamentos, Lisboa..."
                      />
                   </div>
                   <div className="pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><BarChart3 size={20}/></div>
                         <div>
                            <h4 className="text-sm font-black text-[#1c2d51] uppercase tracking-tight">Google Analytics</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Monitorize o tráfego do seu portal</p>
                         </div>
                      </div>
                      <div className="space-y-2">
                        <label className="admin-label-sober">Measurement ID (G-XXXXXXXXXX)</label>
                        <input 
                           className="admin-input-sober" 
                           value={localTenant.seo_settings?.google_analytics_id || ''} 
                           onChange={e => setLocalTenant({...localTenant, seo_settings: {...(localTenant.seo_settings || {}), google_analytics_id: e.target.value}})} 
                           placeholder="G-A1B2C3D4E5"
                        />
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><CreditCard size={24}/></div>
                 <div>
                    <h3 className="text-lg font-black text-[#1c2d51] uppercase tracking-tight">Assinatura ImoSuite</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Gestão da subscrição e pagamentos</p>
                 </div>
              </div>

              <div className="bg-[#1c2d51] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                 <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase text-blue-300 mb-2">Plano Ativo</p>
                    <h4 className="text-4xl font-black mb-10 uppercase tracking-tighter">{tenant.subscription?.plan_id || 'Starter'} Edition</h4>
                    <button className="bg-white text-[#1c2d51] px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-transform">Gerir Pagamentos Stripe</button>
                 </div>
                 <Zap size={200} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .admin-label-sober { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; margin-left: 0.5rem; margin-bottom: 0.5rem; letter-spacing: 0.1em; }
        .admin-input-sober { width: 100%; padding: 1.15rem 1.4rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.95rem; }
        .admin-input-sober:focus { background: #fff; border-color: #357fb2; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const TabLink = ({ active, id, label, icon }: { active: boolean, id: string, label: string, icon: any }) => (
  <Link to={`/admin/settings?tab=${id}`} className={`flex items-center gap-4 px-6 py-4 rounded-[1.75rem] font-black text-[11px] uppercase tracking-tight transition-all ${active ? 'bg-white text-[#1c2d51] shadow-md border border-slate-100' : 'text-slate-400 hover:bg-white/50 hover:text-[#1c2d51]'}`}>
    {icon} {label}
  </Link>
);

export default AdminSettings;
