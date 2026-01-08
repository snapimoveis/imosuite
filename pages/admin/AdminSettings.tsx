
import React, { useState, useEffect } from 'react';
// Added Link to react-router-dom imports to fix 'Cannot find name Link'
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
// Added CheckCircle2 and Settings to lucide-react imports to fix missing icon component errors
import { Palette, Globe, Mail, Phone, Save, Layout, Check, Loader2, Star, Building2, Zap, Brush, MapPin, Hash, CreditCard, Languages, ShieldCheck, CheckCircle2, Settings } from 'lucide-react';

const TEMPLATE_OPTIONS = [
  { id: 'heritage', name: 'Heritage', icon: <Building2 size={20}/>, desc: 'Clássico e Formal' },
  { id: 'canvas', name: 'Canvas', icon: <Layout size={20}/>, desc: 'Clean e Moderno' },
  { id: 'prestige', name: 'Prestige', icon: <Star size={20}/>, desc: 'Luxo e Minimalismo' },
  { id: 'skyline', name: 'Skyline', icon: <Zap size={20}/>, desc: 'Urbano e Tecnológico' },
  { id: 'luxe', name: 'Luxe', icon: <Brush size={20}/>, desc: 'Artístico e Lifestyle' },
];

const AdminSettings: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile } = useAuth();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [localTenant, setLocalTenant] = useState(tenant);
  const [success, setSuccess] = useState(false);
  
  // Detetar aba a partir do URL (ex: ?tab=branding)
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'general';

  useEffect(() => {
    if (!tenantLoading && tenant.id !== 'default-tenant-uuid') {
      setLocalTenant(tenant);
    }
  }, [tenant, tenantLoading]);

  const handleSave = async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    setIsSaving(true);
    setSuccess(false);
    try {
      const tenantRef = doc(db, 'tenants', profile.tenantId);
      const updates = {
        nome: localTenant.nome,
        email: localTenant.email,
        telefone: localTenant.telefone || '',
        morada: (localTenant as any).morada || '',
        nif: (localTenant as any).nif || '',
        cor_primaria: localTenant.cor_primaria,
        cor_secundaria: localTenant.cor_secundaria || localTenant.cor_primaria,
        template_id: (localTenant as any).template_id || 'heritage',
        updated_at: serverTimestamp()
      };
      
      await updateDoc(tenantRef, updates);
      setTenant({ ...tenant, ...updates });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Erro ao guardar.");
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Configuração de Conta</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
            {activeTab === 'general' ? 'Dados da Empresa' : 
             activeTab === 'branding' ? 'Identidade de Marca' :
             activeTab === 'website' ? 'Website e Templates' : 'Preferências de Sistema'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {success && (
            <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4">
              <CheckCircle2 size={16} /> Alterações Guardadas
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
                  <input type="text" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><Hash size={12}/> NIF / Contribuinte</label>
                  <input type="text" value={(localTenant as any).nif || ''} onChange={e => setLocalTenant({...localTenant, nif: e.target.value} as any)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]" placeholder="500 000 000" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><Mail size={12}/> Email Geral</label>
                  <input type="email" value={localTenant.email} onChange={e => setLocalTenant({...localTenant, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><Phone size={12}/> Telefone</label>
                  <input type="text" value={localTenant.telefone || ''} onChange={e => setLocalTenant({...localTenant, telefone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><MapPin size={12}/> Morada Completa</label>
                  <input type="text" value={(localTenant as any).morada || ''} onChange={e => setLocalTenant({...localTenant, morada: e.target.value} as any)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]" placeholder="Rua de Exemplo, 123, Lisboa" />
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
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300 mb-4"><Palette size={32}/></div>
                  <h4 className="font-black text-[#1c2d51] text-xs uppercase mb-2">Logótipo da Marca</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed max-w-[150px] mb-6">Ficheiro SVG ou PNG transparente (Máx. 2MB)</p>
                  <button className="bg-white text-[#1c2d51] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all">Upload Logo</button>
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
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Escolha o template e o domínio</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATE_OPTIONS.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setLocalTenant({ ...localTenant, template_id: tmpl.id } as any)}
                    className={`flex items-start gap-4 p-6 rounded-3xl border-2 transition-all text-left ${
                      (localTenant as any).template_id === tmpl.id 
                      ? 'border-[#1c2d51] bg-slate-50 shadow-inner' 
                      : 'border-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      (localTenant as any).template_id === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {tmpl.icon}
                    </div>
                    <div>
                      <div className="font-black text-xs text-[#1c2d51] uppercase tracking-tighter">{tmpl.name}</div>
                      <div className="text-[9px] text-slate-400 font-bold mt-0.5">{tmpl.desc}</div>
                    </div>
                    {(localTenant as any).template_id === tmpl.id && <Check className="ml-auto text-emerald-500" size={16} strokeWidth={4} />}
                  </button>
                ))}
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
                  <select className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]">
                    <option>Português (Portugal)</option>
                    <option disabled>English (Soon)</option>
                    <option disabled>Español (Soon)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><CreditCard size={12}/> Moeda</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51]">
                    <option>Euro (€)</option>
                    <option>Dólar ($)</option>
                  </select>
                </div>
                <div className="bg-blue-50/50 p-6 rounded-3xl md:col-span-2 border border-blue-100/50 flex gap-4">
                   <div className="text-blue-500 mt-1"><ShieldCheck size={20}/></div>
                   <div>
                     <p className="text-[10px] font-black text-[#1c2d51] uppercase tracking-widest mb-1">Privacidade & RGPD</p>
                     <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                       Os seus dados e os dos seus clientes estão protegidos sob a lei europeia. 
                       Garantimos o isolamento total da sua base de dados.
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
    <div>
      <div className={`font-black text-[11px] uppercase tracking-tighter leading-none mb-1 ${active ? 'text-white' : 'text-[#1c2d51]'}`}>{label}</div>
      <div className={`text-[8px] font-bold uppercase tracking-widest ${active ? 'text-white/60' : 'text-slate-400'}`}>{sub}</div>
    </div>
  </Link>
);

export default AdminSettings;
