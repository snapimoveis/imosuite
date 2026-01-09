
import React, { useState, useEffect } from 'react';
// Import Link from react-router-dom to fix the reference error on line 164
import { Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { 
  Globe, Layout, Type, List, Save, Loader2, Eye, 
  ChevronUp, ChevronDown, ToggleLeft, ToggleRight, 
  Plus, Trash2, Edit3, Smartphone, Laptop, X, ChevronRight, Check
} from 'lucide-react';
import { DEFAULT_TENANT_CMS } from '../../constants.tsx';
import { CMSSection, TenantCMS } from '../../types.ts';

const AdminCMS: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile } = useAuth();
  const [cms, setCms] = useState<TenantCMS>(tenant.cms || DEFAULT_TENANT_CMS);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'homepage' | 'menus' | 'pages'>('homepage');
  const [editingSection, setEditingSection] = useState<CMSSection | null>(null);

  useEffect(() => {
    if (tenant.cms) setCms(tenant.cms);
  }, [tenant.cms]);

  const handleSave = async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    setIsSaving(true);
    try {
      const tenantRef = doc(db, 'tenants', profile.tenantId);
      await updateDoc(tenantRef, {
        cms: cms,
        updated_at: serverTimestamp()
      });
      setTenant({ ...tenant, cms });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Erro ao guardar CMS.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (id: string) => {
    setCms(prev => ({
      ...prev,
      homepage_sections: prev.homepage_sections.map(s => 
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...cms.homepage_sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setCms({ ...cms, homepage_sections: newSections.map((s, i) => ({ ...s, order: i })) });
  };

  const updateSectionContent = (id: string, newContent: any) => {
    setCms(prev => ({
      ...prev,
      homepage_sections: prev.homepage_sections.map(s => 
        s.id === id ? { ...s, content: { ...s.content, ...newContent } } : s
      )
    }));
  };

  if (tenantLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Website Builder</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Personalize a experiência dos seus clientes</p>
        </div>
        <div className="flex items-center gap-3">
           <a href={`#/agencia/${tenant.slug}`} target="_blank" className="bg-slate-100 text-[#1c2d51] px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-200 transition-all">
             <Eye size={16}/> Ver Site
           </a>
           <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 transition-all">
             {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16}/>} {success ? 'Guardado!' : 'Publicar'}
           </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <TabButton active={activeTab === 'homepage'} onClick={() => setActiveTab('homepage')} label="Homepage" icon={<Layout size={14}/>} />
        <TabButton active={activeTab === 'menus'} onClick={() => setActiveTab('menus')} label="Navegação" icon={<List size={14}/>} />
        <TabButton active={activeTab === 'pages'} onClick={() => setActiveTab('pages')} label="Páginas Institucionais" icon={<Type size={14}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'homepage' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-[#1c2d51] uppercase text-[10px] tracking-[0.2em] mb-6">Ordem das Secções</h3>
                <div className="space-y-3">
                  {cms.homepage_sections.sort((a,b) => a.order - b.order).map((section, idx) => (
                    <div key={section.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${section.enabled ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <button onClick={() => moveSection(idx, 'up')} className="text-slate-300 hover:text-[#1c2d51]"><ChevronUp size={14}/></button>
                          <button onClick={() => moveSection(idx, 'down')} className="text-slate-300 hover:text-[#1c2d51]"><ChevronDown size={14}/></button>
                        </div>
                        <div>
                          <p className="font-black text-xs text-[#1c2d51] uppercase tracking-tighter">{section.type.replace('_', ' ')}</p>
                          <p className="text-[10px] text-slate-400 font-bold truncate max-w-[200px]">{section.content.title || 'Sem título'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <button onClick={() => toggleSection(section.id)} className="text-[#1c2d51]">
                           {section.enabled ? <ToggleRight size={28}/> : <ToggleLeft size={28} className="text-slate-300"/>}
                         </button>
                         <button onClick={() => setEditingSection(section)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"><Edit3 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menus' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
               <div>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-[#1c2d51] uppercase text-[10px] tracking-widest">Menu de Topo</h3>
                    <button className="bg-slate-50 px-4 py-2 rounded-lg text-blue-600 font-black text-[10px] uppercase flex items-center gap-1 hover:bg-blue-50"><Plus size={14}/> Novo Link</button>
                 </div>
                 <div className="space-y-2">
                    {cms.menus.main.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-300 shadow-sm"><List size={14} /></div>
                           <div>
                             <span className="font-bold text-xs block">{item.label}</span>
                             <span className="text-[9px] text-slate-400 font-medium">{item.path}</span>
                           </div>
                        </div>
                        <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#1c2d51] p-8 rounded-[3rem] text-white shadow-xl">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6"><Layout size={24} className="text-blue-400" /></div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-2">Template Ativo</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mb-8">
                Está a utilizar o estilo <span className="text-white font-black uppercase underline decoration-blue-400 underline-offset-4">{tenant.template_id}</span>. Todas as suas alterações são adaptadas visualmente a este layout.
              </p>
              <Link to="/admin/settings?tab=website" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-[#1c2d51] px-6 py-3 rounded-xl hover:scale-105 transition-all">Alterar Template <ChevronRight size={14}/></Link>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="font-black text-[#1c2d51] text-xs uppercase tracking-widest mb-4">Pré-visualização</h4>
              <div className="aspect-[9/16] bg-slate-50 rounded-2xl border-4 border-slate-100 flex items-center justify-center overflow-hidden relative group">
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white text-[#1c2d51] px-4 py-2 rounded-lg font-black text-[10px] uppercase">Abrir Simulador</button>
                 </div>
                 <Smartphone size={32} className="text-slate-200" />
              </div>
           </div>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO DE SECÇÃO */}
      {editingSection && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black text-[#1c2d51] tracking-tight">Editar {editingSection.type.toUpperCase()}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ajuste os textos desta secção</p>
                 </div>
                 <button onClick={() => setEditingSection(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              <div className="p-8 space-y-6">
                 {editingSection.content.hasOwnProperty('title') && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título Principal</label>
                      <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51] focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all" value={editingSection.content.title} onChange={e => setEditingSection({...editingSection, content: {...editingSection.content, title: e.target.value}})} />
                   </div>
                 )}
                 {editingSection.content.hasOwnProperty('subtitle') && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Subtítulo / Descrição</label>
                      <textarea rows={3} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51] focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all" value={editingSection.content.subtitle} onChange={e => setEditingSection({...editingSection, content: {...editingSection.content, subtitle: e.target.value}})} />
                   </div>
                 )}
                 {editingSection.content.hasOwnProperty('button_text') && (
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Texto do Botão</label>
                        <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={editingSection.content.button_text} onChange={e => setEditingSection({...editingSection, content: {...editingSection.content, button_text: e.target.value}})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Link (Opcional)</label>
                        <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[#1c2d51]" value={editingSection.content.button_link} onChange={e => setEditingSection({...editingSection, content: {...editingSection.content, button_link: e.target.value}})} />
                      </div>
                   </div>
                 )}
              </div>
              <div className="p-8 bg-slate-50 flex gap-4">
                 <button onClick={() => {
                   updateSectionContent(editingSection.id, editingSection.content);
                   setEditingSection(null);
                 }} className="flex-1 bg-[#1c2d51] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                    <Check size={16}/> Aplicar Alterações
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${active ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
    {icon} {label}
  </button>
);

export default AdminCMS;
