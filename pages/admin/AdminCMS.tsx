
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
/* Fixed modular Firestore imports */
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Globe, Layout, Type, List, Save, Loader2, 
  ChevronUp, ChevronDown, ToggleLeft, ToggleRight, 
  Plus, Trash2, Edit3, X, Navigation, Camera,
  Image as ImageIcon, LayoutGrid, Clock, Star, Sparkles,
  Facebook, Instagram, Linkedin, MessageCircle
} from 'lucide-react';
import { DEFAULT_TENANT_CMS } from '../../constants';
import { CMSSection, TenantCMS, MenuItem, CMSPage } from '../../types';

const AdminCMS: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile } = useAuth();
  const [cms, setCms] = useState<TenantCMS>(DEFAULT_TENANT_CMS);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'homepage' | 'menus' | 'pages' | 'social'>('homepage');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({ label: '', path: '', is_external: false, order: 0 });
  const [menuTarget, setMenuTarget] = useState<'main' | 'footer'>('main');
  const [editingPage, setEditingPage] = useState<Partial<CMSPage>>({ title: '', slug: '', content_md: '', enabled: true });

  useEffect(() => {
    if (tenant.cms) {
      setCms({
        ...DEFAULT_TENANT_CMS,
        ...tenant.cms,
        homepage_sections: Array.isArray(tenant.cms.homepage_sections) ? tenant.cms.homepage_sections : DEFAULT_TENANT_CMS.homepage_sections,
        pages: Array.isArray(tenant.cms.pages) ? tenant.cms.pages : DEFAULT_TENANT_CMS.pages,
        social: tenant.cms.social || DEFAULT_TENANT_CMS.social,
        menus: {
          main: Array.isArray(tenant.cms.menus?.main) ? tenant.cms.menus.main : DEFAULT_TENANT_CMS.menus.main,
          footer: Array.isArray(tenant.cms.menus?.footer) ? tenant.cms.menus.footer : DEFAULT_TENANT_CMS.menus.footer
        }
      });
    }
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

  const toggleSectionVisibility = (id: string) => {
    setCms(prev => ({
      ...prev,
      homepage_sections: prev.homepage_sections.map(s => 
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    }));
  };

  const updateSectionContent = (id: string, updates: Partial<CMSSection['content']>) => {
    setCms(prev => ({
      ...prev,
      homepage_sections: prev.homepage_sections.map(s => 
        s.id === id ? { ...s, content: { ...s.content, ...updates } } : s
      )
    }));
  };

  const handleSectionImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateSectionContent(id, { image_url: reader.result as string });
    reader.readAsDataURL(file);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...cms.homepage_sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setCms({ ...cms, homepage_sections: newSections.map((s, i) => ({ ...s, order: i })) });
  };

  const openMenuModal = (target: 'main' | 'footer', item: MenuItem | null = null) => {
    setMenuTarget(target);
    if (item) {
      setEditingMenuItem(item);
      setNewMenuItem({ ...item });
    } else {
      setEditingMenuItem(null);
      setNewMenuItem({ label: '', path: '', is_external: false, order: cms.menus[target].length });
    }
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuItem = () => {
    if (!newMenuItem.label || !newMenuItem.path) return;
    setCms(prev => {
      const currentMenu = [...prev.menus[menuTarget]];
      if (editingMenuItem) {
        const idx = currentMenu.findIndex(m => m.id === editingMenuItem.id);
        if (idx > -1) currentMenu[idx] = { ...editingMenuItem, ...newMenuItem } as MenuItem;
      } else {
        currentMenu.push({
          id: crypto.randomUUID(),
          label: newMenuItem.label!,
          path: newMenuItem.path!,
          is_external: !!newMenuItem.is_external,
          order: currentMenu.length
        });
      }
      return { ...prev, menus: { ...prev.menus, [menuTarget]: currentMenu } };
    });
    setIsMenuModalOpen(false);
  };

  if (tenantLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-200" size={40} /></div>;

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Website Builder</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Personalize a sua montra digital</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16}/>} {success ? 'Guardado!' : 'Publicar Alterações'}
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <TabButton active={activeTab === 'homepage'} onClick={() => setActiveTab('homepage')} label="Homepage" icon={<Layout size={14}/>} />
        <TabButton active={activeTab === 'menus'} onClick={() => setActiveTab('menus')} label="Menus" icon={<List size={14}/>} />
        <TabButton active={activeTab === 'pages'} onClick={() => setActiveTab('pages')} label="Páginas" icon={<Type size={14}/>} />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} label="Redes Sociais" icon={<Globe size={14}/>} />
      </div>

      <div className="grid grid-cols-1 gap-6">
          {activeTab === 'homepage' && (
            <div className="space-y-4">
              {cms.homepage_sections.sort((a,b) => a.order - b.order).map((section, idx) => (
                <div key={section.id} className={`bg-white rounded-[2rem] border transition-all overflow-hidden ${section.enabled ? 'border-slate-100 shadow-sm' : 'opacity-60 border-dashed border-slate-200'}`}>
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <button onClick={() => moveSection(idx, 'up')} className="text-slate-300 hover:text-[#1c2d51]"><ChevronUp size={14}/></button>
                        <button onClick={() => moveSection(idx, 'down')} className="text-slate-300 hover:text-[#1c2d51]"><ChevronDown size={14}/></button>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#1c2d51]">
                        {section.type === 'hero' ? <Sparkles size={18}/> : section.type === 'featured' ? <Star size={18}/> : <LayoutGrid size={18}/>}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-[#1c2d51]">{section.content.title || `Bloco ${section.type}`}</h4>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{section.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSectionVisibility(section.id)} className="p-2">
                        {section.enabled ? <ToggleRight className="text-[#357fb2]" size={28}/> : <ToggleLeft className="text-slate-200" size={28}/>}
                      </button>
                      <button onClick={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)} className="p-2 text-slate-300 hover:text-[#1c2d51]"><Edit3 size={20}/></button>
                    </div>
                  </div>
                  {expandedSectionId === section.id && (
                    <div className="p-10 border-t border-slate-50 bg-slate-50/20 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título do Bloco</label>
                        <input className="admin-input-cms" value={section.content.title || ''} onChange={e => updateSectionContent(section.id, { title: e.target.value })} />
                        {(section.type === 'hero' || section.type === 'cta') && (
                          <>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Subtítulo</label>
                            <input className="admin-input-cms" value={section.content.subtitle || ''} onChange={e => updateSectionContent(section.id, { subtitle: e.target.value })} />
                          </>
                        )}
                      </div>
                      <div className="space-y-4">
                        {(section.type === 'hero' || section.type === 'about_mini') && (
                          <div onClick={() => document.getElementById(`img-${section.id}`)?.click()} className="aspect-video bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 relative overflow-hidden group">
                            {section.content.image_url ? <img src={section.content.image_url} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-300"/>}
                            <input type="file" id={`img-${section.id}`} className="hidden" onChange={e => handleSectionImageUpload(section.id, e)} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'social' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4">Canais de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SocialInput icon={<Facebook size={18}/>} label="Facebook" value={cms.social.facebook} onChange={val => setCms({...cms, social: {...cms.social, facebook: val}})} />
                <SocialInput icon={<Instagram size={18}/>} label="Instagram" value={cms.social.instagram} onChange={val => setCms({...cms, social: {...cms.social, instagram: val}})} />
                <SocialInput icon={<Linkedin size={18}/>} label="LinkedIn" value={cms.social.linkedin} onChange={val => setCms({...cms, social: {...cms.social, linkedin: val}})} />
                <SocialInput icon={<MessageCircle size={18}/>} label="WhatsApp" value={cms.social.whatsapp} onChange={val => setCms({...cms, social: {...cms.social, whatsapp: val}})} />
              </div>
            </div>
          )}

          {activeTab === 'menus' && (
             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Navegação do Site</h3>
                  <button onClick={() => openMenuModal('main')} className="bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-2"><Plus size={16}/> Link</button>
                </div>
                <div className="space-y-2">
                  {cms.menus.main.map(item => (
                    <div key={item.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Navigation size={14} className="text-slate-300"/>
                          <div>
                            <p className="font-black text-sm text-[#1c2d51]">{item.label}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.path}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setCms({...cms, menus: {...cms.menus, main: cms.menus.main.filter(m => m.id !== item.id)}})} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
      </div>

      <style>{`
        .admin-input-cms { width: 100%; padding: 1.15rem 1.4rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.875rem; }
        .admin-input-cms:focus { background: #fff; border-color: #357fb2; }
      `}</style>
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${active ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
    {icon} {label}
  </button>
);

const SocialInput = ({ icon, label, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">{icon} {label}</label>
    <input className="admin-input-cms" placeholder="https://..." value={value || ''} onChange={e => onChange(e.target.value)} />
  </div>
);

export default AdminCMS;