import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
// Modular Firestore imports for tenant configuration
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Palette, Globe, Mail, Phone, Save, Layout, Check, 
  Loader2, Star, Building2, Zap, Brush, MapPin, Hash, 
  Settings, AlertTriangle, Eye, ChevronLeft, ChevronRight, Info,
  Quote, Heart, Search, LayoutGrid, List, ArrowUpRight, Camera, ArrowRight
} from 'lucide-react';
import { Tenant } from '../types';
import { formatCurrency, generateSlug } from '../lib/utils';
import { generateAgencySlogan } from '../services/geminiService';

// Standardized template options
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
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'general';

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

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => setLocalTenant(prev => ({ ...prev, logo_url: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    let tId = tenant.id;
    if ((!tId || tId === 'default-tenant-uuid' || tId === 'pending') && user) tId = `tnt_${user.uid.slice(0, 12)}`;
    if (!tId || !user) return;

    setIsSaving(true);
    try {
      const updates = {
        ...localTenant,
        id: tId,
        updated_at: serverTimestamp()
      };
      await setDoc(doc(db, 'tenants', tId), updates, { merge: true });
      setTenant({ ...tenant, ...updates });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMessage("Erro ao guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Configuração</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{activeTab}</p>
        </div>
        <div className="flex items-center gap-4">
          {success && <div className="text-emerald-600 text-xs font-black uppercase">Guardado!</div>}
          <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3">
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Gravar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-2">
          <TabLink active={activeTab === 'general'} icon={<Building2 size={18}/>} label="Empresa" tab="general" />
          <TabLink active={activeTab === 'branding'} icon={<Brush size={18}/>} label="Branding" tab="branding" />
          <TabLink active={activeTab === 'website'} icon={<Globe size={18}/>} label="Website" tab="website" />
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'website' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Catálogo de Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {TEMPLATE_OPTIONS.map((tmpl) => (
                  <div key={tmpl.id} className={`group relative p-8 rounded-[2.5rem] border-2 transition-all ${localTenant.template_id === tmpl.id ? 'border-[#1c2d51] bg-[#1c2d51]/5' : 'border-slate-50 hover:border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${localTenant.template_id === tmpl.id ? 'bg-[#1c2d51] text-white' : 'bg-slate-50 text-slate-400'}`}>{tmpl.icon}</div>
                       {localTenant.template_id === tmpl.id && <div className="bg-[#1c2d51] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase">Ativo</div>}
                    </div>
                    <h4 className="font-black text-lg text-[#1c2d51]">{tmpl.name}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">{tmpl.desc}</p>
                    <div className="flex gap-2">
                       <button onClick={() => setLocalTenant({ ...localTenant, template_id: tmpl.id })} className="flex-1 bg-[#1c2d51] text-white py-3 rounded-xl text-[10px] font-black uppercase">Selecionar</button>
                       <button onClick={() => setPreviewingTemplate(tmpl.id)} className="px-4 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1c2d51] transition-colors"><Eye size={16}/></button>
                    </div>
                  </div>
                ))}
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
            if (templateId) {
              setLocalTenant({ ...localTenant, template_id: templateId }); 
            }
            setPreviewingTemplate(null); 
          }} 
          tenantData={localTenant}
        />
      )}
    </div>
  );
};

// --- COMPONENTES DE PREVIEW REALISTAS ---

const TemplatePreviewModal = ({ templateId, onClose, onSelect, tenantData }: any) => {
  const [page, setPage] = useState('home');
  const template = TEMPLATE_OPTIONS.find(t => t.id === templateId);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8">
        <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><ChevronLeft size={16}/> Voltar</button>
        <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1">
           {['home', 'list', 'detail'].map(p => (
             <PageTab key={p} active={page === p} onClick={() => setPage(p)} label={p} />
           ))}
        </div>
        <button onClick={onSelect} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Usar este Template</button>
      </header>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-[1440px] mx-auto min-h-full bg-white shadow-2xl">
          <PreviewEngine templateId={templateId} page={page} tenant={tenantData} />
        </div>
