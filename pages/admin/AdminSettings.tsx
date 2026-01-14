import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Building2, Brush, Globe, CreditCard, Save, Loader2, Camera, Clock, 
  ArrowRight, CheckCircle2, Layout, Star, Zap, Eye, ChevronLeft, Building,
  Smartphone, Monitor, MousePointer2, Check
} from 'lucide-react';
import { Tenant } from '../../types';
import { compressImage, formatCurrency } from '../../lib/utils';
import { StorageService } from '../../services/storageService';

const TEMPLATE_OPTIONS = [
  { id: 'heritage', name: 'Heritage', icon: <Building size={20}/>, desc: 'Clássico e Formal', color: '#1c2d51' },
  { id: 'canvas', name: 'Canvas', icon: <Layout size={20}/>, desc: 'Design Moderno e Limpo', color: '#357fb2' },
  { id: 'prestige', name: 'Prestige', icon: <Star size={20}/>, desc: 'Luxo e Minimalismo', color: '#000000' },
  { id: 'skyline', name: 'Skyline', icon: <Zap size={20}/>, desc: 'Urbano e Tecnológico', color: '#2563eb' },
  { id: 'luxe', name: 'Luxe', icon: <Brush size={20}/>, desc: 'Artístico e Lifestyle', color: '#2D2926' },
] as const;

const AdminSettings: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { user } = useAuth();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [localTenant, setLocalTenant] = useState<Tenant>(tenant);
  const [success, setSuccess] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<Tenant['template_id'] | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'general';

  useEffect(() => {
    if (!tenantLoading) {
      setLocalTenant({ ...tenant });
    }
  }, [tenant, tenantLoading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      // Compressão mais agressiva para o logo (max 400px, 0.6 quality)
      const compressed = await compressImage(reader.result as string, 400, 400, 0.6);
      setLocalTenant(prev => ({ ...prev, logo_url: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user || !localTenant.id) return;
    setIsSaving(true);
    try {
      let finalLogoUrl = localTenant.logo_url;
      
      // Upload para Storage se for Base64
      if (finalLogoUrl && finalLogoUrl.startsWith('data:image')) {
        finalLogoUrl = await StorageService.uploadBase64(`tenants/${localTenant.id}/branding/logo.png`, finalLogoUrl);
      }

      const { id, ...dataToSave } = localTenant;
      const updatedData = { ...dataToSave, logo_url: finalLogoUrl, updated_at: serverTimestamp() };
      
      await setDoc(doc(db, 'tenants', localTenant.id), updatedData, { merge: true });
      setTenant({ ...localTenant, logo_url: finalLogoUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'AGÊNCIA', icon: <Building2 size={16}/> },
    { id: 'branding', label: 'MARCA', icon: <Brush size={16}/> },
    { id: 'website', label: 'WEBSITE', icon: <Globe size={16}/> },
    { id: 'billing', label: 'FATURAÇÃO', icon: <CreditCard size={16}/> },
  ];

  if (tenantLoading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" /></div>;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter uppercase">Configurações</h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Identidade e faturação</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all hover:opacity-90">
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
          {success ? 'GUARDADO' : 'GUARDAR ALTERAÇÕES'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-60 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0">
            {tabs.map(tab => (
              <Link 
                key={tab.id}
                to={`/admin/settings?tab=${tab.id}`}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-[#1c2d51] text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-[#1c2d51]'
                }`}
              >
                {tab.icon} {tab.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px]">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h3 className="text-sm font-black text-[#1c2d51] uppercase tracking-widest border-b pb-4">Dados Principais</h3>
              <div className="grid gap-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Nome Comercial</label>
                  <input className="admin-input-sober" value={localTenant.nome} onChange={e => setLocalTenant({...localTenant, nome: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Slogan da Agência</label>
                  <input className="admin-input-sober" value={localTenant.slogan || ''} onChange={e => setLocalTenant({...localTenant, slogan: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <h3 className="text-sm font-black text-[#1c2d51] uppercase tracking-widest border-b pb-4">Visual da Marca</h3>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Cor Primária</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <input type="color" className="w-10 h-10 border-none bg-transparent cursor-pointer rounded-lg" value={localTenant.cor_primaria} onChange={e => setLocalTenant({...localTenant, cor_primaria: e.target.value})} />
                      <span className="font-mono font-black text-xs uppercase tracking-tighter">{localTenant.cor_primaria}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Cor Secundária</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <input type="color" className="w-10 h-10 border-none bg-transparent cursor-pointer rounded-lg" value={localTenant.cor_secundaria} onChange={e => setLocalTenant({...localTenant, cor_secundaria: e.target.value})} />
                      <span className="font-mono font-black text-xs uppercase tracking-tighter">{localTenant.cor_secundaria}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Logótipo da Empresa</label>
                  <div onClick={() => logoInputRef.current?.click()} className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all p-6 overflow-hidden relative group">
                    {localTenant.logo_url ? (
                      <>
                        <img src={localTenant.logo_url} className="h-full object-contain" alt="Logo" />
                        <div className="absolute inset-0 bg-[#1c2d51]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[9px] uppercase tracking-widest">Alterar Imagem</div>
                      </>
                    ) : <Camera className="text-slate-300" size={32} />}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <h3 className="text-sm font-black text-[#1c2d51] uppercase tracking-widest border-b pb-4">Templates de Website</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TEMPLATE_OPTIONS.map((tmpl) => (
                  <div 
                    key={tmpl.id} 
                    className={`group relative p-8 rounded-[2.5rem] border-2 transition-all ${
                      localTenant.template_id === tmpl.id 
                        ? 'border-[#1c2d51] bg-[#1c2d51]/5' 
                        : 'border-slate-50 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${localTenant.template_id === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-50 text-slate-400'}`}>
                         {tmpl.icon}
                       </div>
                       {localTenant.template_id === tmpl.id && (
                         <div className="bg-[#1c2d51] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                           <Check size={10}/> Ativo
                         </div>
                       )}
                    </div>
                    <h4 className="font-black text-lg text-[#1c2d51] tracking-tight">{tmpl.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">{tmpl.desc}</p>
                    
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setLocalTenant({ ...localTenant, template_id: tmpl.id })}
                         className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                           localTenant.template_id === tmpl.id 
                             ? 'bg-[#1c2d51] text-white cursor-default' 
                             : 'bg-white border border-slate-200 text-[#1c2d51] hover:bg-slate-50'
                         }`}
                       >
                         Selecionar
                       </button>
                       <button 
                         onClick={() => setPreviewingTemplate(tmpl.id)}
                         className="px-4 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1c2d51] transition-colors flex items-center justify-center"
                         title="Pré-visualizar"
                       >
                         <Eye size={16}/>
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-sm font-black text-[#1c2d51] uppercase tracking-widest">A minha Subscrição</h3>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5"><CheckCircle2 size={12}/> Plano Ativo</span>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-inner">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Plano Atual</p>
                  <p className="text-2xl font-black text-[#1c2d51] uppercase tracking-tight">{localTenant.subscription?.plan_id || 'Starter'}</p>
                </div>
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-inner">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ciclo de Faturação</p>
                  <p className="text-2xl font-black text-[#1c2d51] flex items-center gap-2"><Clock size={20}/> Mensal</p>
                </div>
              </div>
              <div className="pt-4">
                <Link to="/planos" className="inline-flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">
                  Alterar o meu Plano <ArrowRight size={14}/>
                </Link>
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
            setLocalTenant({ ...localTenant, template_id: previewingTemplate }); 
            setPreviewingTemplate(null); 
          }} 
          tenantData={localTenant}
        />
      )}
      
      <style>{`
        .admin-input-sober { 
          width: 100%; 
          padding: 1rem 1.25rem; 
          background: #f8fafc; 
          border: 1px solid #e2e8f0; 
          border-radius: 1rem; 
          outline: none; 
          font-weight: 700; 
          color: #1c2d51; 
          transition: all 0.2s;
        }
        .admin-input-sober:focus { 
          border-color: #1c2d51; 
          background: #fff; 
          box-shadow: 0 4px 20px -10px rgba(28, 45, 81, 0.1); 
        }
      `}</style>
    </div>
  );
};

const TemplatePreviewModal = ({ templateId, onClose, onSelect, tenantData }: any) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const template = TEMPLATE_OPTIONS.find(t => t.id === templateId);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1c2d51] transition-colors">
          <ChevronLeft size={16}/> Voltar
        </button>
        
        <div className="hidden sm:flex bg-slate-50 p-1 rounded-xl gap-1">
           <button 
             onClick={() => setDevice('desktop')} 
             className={`p-2 rounded-lg transition-all ${device === 'desktop' ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400'}`}
           >
             <Monitor size={16}/>
           </button>
           <button 
             onClick={() => setDevice('mobile')} 
             className={`p-2 rounded-lg transition-all ${device === 'mobile' ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400'}`}
           >
             <Smartphone size={16}/>
           </button>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-[#1c2d51] uppercase leading-none mb-1">{template?.name}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Live Preview</p>
           </div>
           <button 
             onClick={onSelect} 
             className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all"
           >
             Usar este Template
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden bg-slate-100 p-4 sm:p-10 flex items-center justify-center">
        <div 
          className={`bg-white shadow-2xl rounded-[3rem] overflow-hidden transition-all duration-500 ${
            device === 'desktop' ? 'w-full max-w-6xl h-full' : 'w-[375px] h-[667px]'
          }`}
        >
          <div className="h-full w-full overflow-y-auto">
            <PreviewEngine templateId={templateId} tenant={tenantData} />
          </div>
        </div>
      </div>
      
      <div className="h-12 bg-white/5 border-t border-white/5 flex items-center justify-center">
         <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-2">
           <MousePointer2 size={10}/> Modo de Pré-visualização Interactiva
         </p>
      </div>
    </div>
  );
};

const PreviewEngine = ({ templateId, tenant }: any) => {
  const dummyProps = [
    { id: 1, title: 'Apartamento T3 com Vista Mar', price: 385000, loc: 'Cascais', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
    { id: 2, title: 'Moradia V4 com Jardim', price: 750000, loc: 'Vila Nova de Gaia', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800' },
    { id: 3, title: 'Estúdio Moderno no Centro', price: 185000, loc: 'Lisboa', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800' }
  ];

  // Estilos rápidos baseados nos templates reais
  const styles: Record<string, any> = {
    heritage: { font: 'font-heritage italic', primary: tenant.cor_primaria, bg: 'bg-white' },
    canvas: { font: 'font-brand font-black', primary: tenant.cor_primaria, bg: 'bg-white' },
    prestige: { font: 'font-brand font-black italic', primary: '#000', bg: 'bg-black', text: 'text-white' },
    skyline: { font: 'font-brand font-black uppercase', primary: tenant.cor_primaria, bg: 'bg-slate-50' },
    luxe: { font: 'font-brand font-black tracking-widest', primary: '#2D2926', bg: 'bg-[#FDFBF7]' }
  };

  const s = styles[templateId] || styles.heritage;

  return (
    <div className={`min-h-full ${s.bg} ${s.text || 'text-slate-900'} selection:bg-blue-500 selection:text-white`}>
       <nav className="h-20 border-b border-black/5 px-10 flex items-center justify-between sticky top-0 bg-inherit z-10">
          <span className={`${s.font} text-xl tracking-tight`}>{tenant.nome || 'Heritage Agency'}</span>
          <div className="flex gap-6 text-[9px] font-black uppercase tracking-widest opacity-60">
             <span>Início</span>
             <span>Imóveis</span>
             <span>Agência</span>
          </div>
       </nav>

       <header className={`py-32 px-10 text-center ${templateId === 'prestige' ? 'bg-neutral-900' : 'bg-slate-50/50'}`}>
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className={`${s.font} text-5xl md:text-7xl leading-tight`}>
               {templateId === 'skyline' ? 'O Teu Destino.' : 'Tradição & Confiança.'}
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">{tenant.slogan || 'O seu próximo capítulo começa aqui.'}</p>
          </div>
       </header>

       <main className="p-10 lg:p-20">
          <div className="mb-12 flex justify-between items-end">
             <h2 className={`${s.font} text-3xl`}>Destaques</h2>
             <span className="text-[9px] font-black uppercase border-b-2 border-current pb-1">Ver Todos</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             {dummyProps.map(p => (
               <div key={p.id} className="group cursor-pointer">
                  <div className={`aspect-[4/5] bg-slate-200 overflow-hidden mb-6 transition-all duration-700 ${
                    templateId === 'luxe' ? 'rounded-[3rem]' : templateId === 'canvas' ? 'rounded-[2.5rem]' : 'rounded-none'
                  } ${templateId === 'prestige' ? 'grayscale group-hover:grayscale-0' : ''}`}>
                     <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.title} />
                  </div>
                  <h4 className={`${s.font} text-lg mb-1`}>{p.title}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{p.loc}</p>
                    <p className="font-black text-blue-500">{formatCurrency(p.price)}</p>
                  </div>
               </div>
             ))}
          </div>
       </main>
       
       <footer className="py-20 border-t border-black/5 px-10 text-center opacity-40">
          <p className="text-[8px] font-black uppercase tracking-[0.5em]">© {new Date().getFullYear()} {tenant.nome || 'ImoSuite'}</p>
       </footer>
    </div>
  );
};

export default AdminSettings;