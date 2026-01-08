
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { 
  Palette, Globe, Mail, Phone, Save, Layout, Check, 
  Loader2, Star, Building2, Zap, Brush, MapPin, Hash, 
  CreditCard, Languages, ShieldCheck, CheckCircle2, Settings, AlertTriangle 
} from 'lucide-react';
import { Tenant } from '../../types.ts';

const TEMPLATE_OPTIONS = [
  { id: 'heritage', name: 'Heritage', icon: <Building2 size={20}/>, desc: 'Clássico e Formal' },
  { id: 'canvas', name: 'Canvas', icon: <Layout size={20}/>, desc: 'Clean e Moderno' },
  { id: 'prestige', name: 'Prestige', icon: <Star size={20}/>, desc: 'Luxo e Minimalismo' },
  { id: 'skyline', name: 'Skyline', icon: <Zap size={20}/>, desc: 'Urbano e Tecnológico' },
  { id: 'luxe', name: 'Luxe', icon: <Brush size={20}/>, desc: 'Artístico e Lifestyle' },
];

const AdminSettings: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile, user } = useAuth();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [localTenant, setLocalTenant] = useState<Tenant>(tenant);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'general';

  // Sincronizar dados locais quando o tenant global carregar ou mudar
  useEffect(() => {
    if (!tenantLoading && tenant.id !== 'default-tenant-uuid') {
      setLocalTenant(tenant);
    }
  }, [tenant, tenantLoading]);

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setLocalTenant(prev => ({ ...prev, logo_url: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    // Lógica de recuperação de ID robusta
    let tId = profile?.tenantId;
    
    // Fallback: Se o tenantId for 'pending' mas temos um utilizador,
    // tentamos usar o tnt_ID baseado no UID ou o ID local se já estiver preenchido
    if ((!tId || tId === 'pending') && localTenant.id && localTenant.id !== 'default-tenant-uuid') {
      tId = localTenant.id;
    }

    if (!tId || tId === 'pending') {
      setErrorMessage("Identificador de conta pendente. Por favor, recarregue a página.");
      return;
    }

    if (tId === 'default-tenant-uuid') {
      setErrorMessage("O modo demonstração é apenas de leitura. Registe a sua conta para gerir dados próprios.");
      return;
    }

    setIsSaving(true);
    setSuccess(false);
    setErrorMessage(null);

    try {
      const tenantRef = doc(db, 'tenants', tId);
      
      const updates = {
        id: tId,
        nome: localTenant.nome || '',
        email: localTenant.email || '',
        telefone: localTenant.telefone || '',
        morada: localTenant.morada || '',
        nif: localTenant.nif || '',
        logo_url: localTenant.logo_url || '',
        slogan: localTenant.slogan || '',
        cor_primaria: localTenant.cor_primaria || '#1c2d51',
        cor_secundaria: localTenant.cor_secundaria || localTenant.cor_primaria || '#1c2d51',
        template_id: localTenant.template_id || 'heritage',
        updated_at: serverTimestamp()
      };
      
      await setDoc(tenantRef, updates, { merge: true });
      
      // Se o perfil do utilizador não estiver vinculado a este tenant, vinculamos agora
      if (user && profile?.tenantId === 'pending') {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { tenantId: tId }, { merge: true });
      }

      setTenant({ ...tenant, ...updates });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Erro ao guardar definições:", err);
      setErrorMessage("Erro de permissão ou rede ao guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (tenantLoading && profile?.tenantId === 'pending') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="animate-spin mb-4 text-[#1c2d51]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">A sintonizar com a central...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Configuração de Conta</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
            {activeTab === 'general' ? 'Dados da Empresa' : 
             activeTab === 'branding' ? 'Identidade de Marca' :
             activeTab === 'website' ? 'Website e Templates' : 'Preferências de Sistema'}
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
          {success && (
            <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4">
              <CheckCircle2 size={16} /> Alterações Guardadas
            </div>
          )}
          {errorMessage && (
            <div className="bg-amber-50 text-amber-600 px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-amber-100 animate-in shake duration-300">
              <AlertTriangle size={14} /> {errorMessage}
            </div>
          )}
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Gravar Tudo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Mini Nav */}
        <div className="lg:col-span-1 space-y-2">
          <TabLink active={activeTab === 'general'} icon={<Building2 size={18}/>} label="Empresa" sub="NIF e Localização" tab="general" />
          <TabLink active={activeTab === 'branding'} icon={<Brush size={18}/>} label="Branding" sub="Cores e Logótipo" tab="branding" />
          <TabLink active={activeTab === 'website'} icon={<Globe size={18}/>} label="Website" sub="Templates e Domínio" tab="website" />
          <TabLink active={activeTab === 'system'} icon={<Settings size={18}/>} label="Sistema" sub="Moeda e Idioma" tab="system" />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'general' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><Building2 size={24}/></div>
                <div>
                  <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Informação Institucional</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Estes dados aparecem no rodapé do seu site</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2">Nome Comercial</label>
                  <input type="text" value={localTenant.nome || ''} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/5 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><Hash size={12}/> NIF / Contribuinte</label>
                  <input type="text" value={localTenant.nif || ''} onChange={e => setLocalTenant({...localTenant, nif: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/5 transition-all" placeholder="500 000 000" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><Mail size={12}/> Email Geral</label>
                  <input type="email" value={localTenant.email || ''} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/5 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><Phone size={12}/> Telefone</label>
                  <input type="text" value={localTenant.telefone || ''} onChange={e => setLocalTenant({...localTenant, telefone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/5 transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><MapPin size={12}/> Morada Completa</label>
                  <input type="text" value={localTenant.morada || ''} onChange={e => setLocalTenant({...localTenant, morada: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/5 transition-all" placeholder="Rua de Exemplo, 123, Lisboa" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center"><Brush size={24}/></div>
                <div>
                  <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Identidade Visual</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Defina o ADN visual da sua imobiliária</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 ml-2">Cor Primária</label>
                    <div className="p-4 bg-slate-50 rounded-3xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl shadow-xl border-2 border-white" style={{ backgroundColor: localTenant.cor_primaria }}></div>
                        <span className="text-xs font-black uppercase tracking-widest text-[#1c2d51]">{localTenant.cor_primaria}</span>
                      </div>
                      <input type="color" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} className="w-10 h-10 border-none bg-transparent cursor-pointer" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 ml-2">Cor Secundária</label>
                    <div className="p-4 bg-slate-50 rounded-3xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl shadow-xl border-2 border-white" style={{ backgroundColor: localTenant.cor_secundaria || localTenant.cor_primaria }}></div>
                        <span className="text-xs font-black uppercase tracking-widest text-[#1c2d51]">{localTenant.cor_secundaria || localTenant.cor_primaria}</span>
                      </div>
                      <input type="color" value={localTenant.cor_secundaria || localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_secundaria: e.target.value})} className="w-10 h-10 border-none bg-transparent cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300 mb-4 overflow-hidden border border-slate-100">
                    {localTenant.logo_url ? (
                      <img src={localTenant.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <Palette size={32}/>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={logoInputRef} 
                    onChange={handleLogoChange} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  <h4 className="font-black text-[#1c2d51] text-xs uppercase mb-2">Logótipo da Marca</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed max-w-[150px] mb-6">Ficheiro SVG ou PNG transparente (Máx. 2MB)</p>
                  <button 
                    onClick={handleLogoClick}
                    className="bg-white text-[#1c2d51] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    Upload Logo
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><Globe size={24}/></div>
                <div>
                  <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Website Público</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Escolha o template e o slogan</p>
                </div>
              </div>

              <div className="space-y-8">
                 <div>
                   <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><Zap size={12}/> Slogan do Website</label>
                   <input 
                    type="text" 
                    value={localTenant.slogan || ''} 
                    onChange={e => setLocalTenant({...localTenant, slogan: e.target.value})} 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/5 transition-all" 
                    placeholder="Ex: A chave do seu novo lar." 
                   />
                 </div>

                 <div>
                   <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 ml-2">Templates de Design</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TEMPLATE_OPTIONS.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => setLocalTenant({ ...localTenant, template_id: tmpl.id })}
                        className={`flex items-start gap-4 p-6 rounded-3xl border-2 transition-all text-left group ${
                          localTenant.template_id === tmpl.id 
                          ? 'border-[#1c2d51] bg-[#1c2d51]/5 shadow-inner' 
                          : 'border-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          localTenant.template_id === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-white text-slate-300 border border-slate-100'
                        }`}>
                          {tmpl.icon}
                        </div>
                        <div>
                          <div className={`font-black text-xs uppercase tracking-tighter ${localTenant.template_id === tmpl.id ? 'text-[#1c2d51]' : 'text-slate-500'}`}>{tmpl.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold mt-0.5">{tmpl.desc}</div>
                        </div>
                        {localTenant.template_id === tmpl.id && <Check className="ml-auto text-[#1c2d51]" size={16} strokeWidth={4} />}
                      </button>
                    ))}
                  </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center"><Settings size={24}/></div>
                <div>
                  <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Preferências do Sistema</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configurações globais de funcionamento</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><Languages size={12}/> Idioma Base</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/5 transition-all">
                    <option>Português (Portugal)</option>
                    <option disabled>English (Soon)</option>
                    <option disabled>Español (Soon)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><CreditCard size={12}/> Moeda</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/5 transition-all">
                    <option>Euro (€)</option>
                    <option>Dólar ($)</option>
                  </select>
                </div>
                <div className="bg-blue-50/50 p-6 rounded-3xl md:col-span-2 border border-blue-100/50 flex gap-4">
                   <div className="text-blue-500 mt-1"><ShieldCheck size={20}/></div>
                   <div>
                     <p className="text-[10px] font-black text-[#1c2d51] uppercase tracking-widest mb-1 text-blue-800">Privacidade & RGPD</p>
                     <p className="text-[9px] text-blue-600/70 font-bold uppercase leading-relaxed">
                       Os seus dados e os dos seus clientes estão protegidos sob a lei europeia. 
                       Garantimos o isolamento total da sua base de dados no ecossistema ImoSuite.
                     </p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabLink = ({ active, icon, label, sub, tab }: { active: boolean, icon: any, label: string, sub: string, tab: string }) => (
  <Link 
    to={`/admin/settings?tab=${tab}`} 
    className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all border ${
      active 
      ? 'bg-[#1c2d51] text-white border-[#1c2d51] shadow-xl shadow-slate-900/10' 
      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
    }`}
  >
    <div className={active ? 'text-white' : 'text-slate-300'}>{icon}</div>
    <div className="overflow-hidden">
      <div className={`font-black text-[11px] uppercase tracking-tighter leading-none mb-1 truncate ${active ? 'text-white' : 'text-[#1c2d51]'}`}>{label}</div>
      <div className={`text-[8px] font-bold uppercase tracking-widest truncate ${active ? 'text-white/60' : 'text-slate-400'}`}>{sub}</div>
    </div>
  </Link>
);

export default AdminSettings;
