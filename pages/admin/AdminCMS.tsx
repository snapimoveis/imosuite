
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from "@firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Globe, Layout, Type, List, Save, Loader2, 
  ChevronUp, ChevronDown, ToggleLeft, ToggleRight, 
  Plus, Trash2, Edit3, X, Navigation, Camera,
  Image as ImageIcon, LayoutGrid, Clock, Star, Sparkles,
  Facebook, Instagram, Linkedin, MessageCircle, FileText, Check
} from 'lucide-react';
import { DEFAULT_TENANT_CMS } from '../../constants';
import { CMSSection, TenantCMS, MenuItem, CMSPage } from '../../types';
import { compressImage, generateSlug } from '../../lib/utils';

const AdminCMS: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile } = useAuth();
  const [cms, setCms] = useState<TenantCMS>(DEFAULT_TENANT_CMS);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'homepage' | 'menus' | 'pages' | 'social'>('homepage');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  
  // Modais e Estados de Edição
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  // Fix: Added missing editingMenuItem state
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [menuTarget, setMenuTarget] = useState<'main' | 'footer'>('main');

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
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('exceeds the maximum allowed size')) {
        alert("Erro: O documento da sua agência ficou demasiado grande. Tente usar imagens mais pequenas ou menos blocos.");
      } else {
        alert("Erro ao guardar CMS. Tente novamente ou verifique a sua ligação.");
      }
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
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const compressed = await compressImage(base64, 1200, 800, 0.7);
      updateSectionContent(id, { image_url: compressed });
    };
    reader.readAsDataURL(file);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...cms.homepage_sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setCms({ ...cms, homepage_sections: newSections.map((s, i) => ({ ...s, order: i })) });
  };

  // Fix: Added missing openMenuModal function
  const openMenuModal = (target: 'main' | 'footer') => {
    setMenuTarget(target);
    setEditingMenuItem({
      id: crypto.randomUUID(),
      label: '',
      path: '',
      order: cms.menus[target].length,
      is_external: false
    });
    setIsMenuModalOpen(true);
  };

  // Fix: Added missing handleSaveMenuItem function
  const handleSaveMenuItem = () => {
    if (!editingMenuItem || !editingMenuItem.label) return;
    
    setCms(prev => ({
      ...prev,
      menus: {
        ...prev.menus,
        [menuTarget]: [...prev.menus[menuTarget], editingMenuItem]
      }
    }));
    setIsMenuModalOpen(false);
  };

  // Lógica de Páginas
  const openPageModal = (page: CMSPage | null = null) => {
    if (page) {
      setEditingPage({ ...page });
    } else {
      setEditingPage({
        id: crypto.randomUUID(),
        title: '',
        slug: '',
        content_md: '',
        enabled: true,
        seo: { title: '', description: '' }
      });
    }
    setIsPageModalOpen(true);
  };

  const handleSavePage = () => {
    if (!editingPage || !editingPage.title) return;
    
    const pageToSave = {
      ...editingPage,
      slug: editingPage.slug || generateSlug(editingPage.title)
    };

    setCms(prev => {
      const exists = prev.pages.find(p => p.id === pageToSave.id);
      return {
        ...prev,
        pages: exists 
          ? prev.pages.map(p => p.id === pageToSave.id ? pageToSave : p)
          : [...prev.pages, pageToSave]
      };
    });
    setIsPageModalOpen(false);
  };

  const handleDeletePage = (id: string) => {
    if (window.confirm("Deseja apagar esta página permanentemente?")) {
      setCms(prev => ({
        ...prev,
        pages: prev.pages.filter(p => p.id !== id)
      }));
    }
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
            <div className="space-y-4 animate-in fade-in duration-300">
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
                        <label htmlFor={`title-${section.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2">Título do Bloco</label>
                        <input id={`title-${section.id}`} name={`title-${section.id}`} className="admin-input-cms" value={section.content.title || ''} onChange={e => updateSectionContent(section.id, { title: e.target.value })} />
                        {(section.type === 'hero' || section.type === 'cta') && (
                          <>
                            <label htmlFor={`subtitle-${section.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2">Subtítulo</label>
                            <input id={`subtitle-${section.id}`} name={`subtitle-${section.id}`} className="admin-input-cms" value={section.content.subtitle || ''} onChange={e => updateSectionContent(section.id, { subtitle: e.target.value })} />
                          </>
                        )}
                        {section.type === 'about_mini' && (
                          <>
                            <label htmlFor={`text-${section.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2">Texto</label>
                            <textarea id={`text-${section.id}`} name={`text-${section.id}`} rows={4} className="admin-input-cms" value={section.content.text || ''} onChange={e => updateSectionContent(section.id, { text: e.target.value })} />
                          </>
                        )}
                      </div>
                      <div className="space-y-4">
                        {(section.type === 'hero' || section.type === 'about_mini') && (
                          <div onClick={() => document.getElementById(`img-input-${section.id}`)?.click()} className="aspect-video bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 relative overflow-hidden group">
                            {section.content.image_url ? (
                              <>
                                <img src={section.content.image_url} className="w-full h-full object-cover" alt="Section content" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Camera size={24} className="text-white" />
                                </div>
                              </>
                            ) : (
                              <ImageIcon size={24} className="text-slate-300"/>
                            )}
                            <input type="file" id={`img-input-${section.id}`} name={`img-input-${section.id}`} className="hidden" onChange={e => handleSectionImageUpload(section.id, e)} accept="image/*" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                  <h3 className="font-black text-[#1c2d51] text-lg">Páginas Institucionais</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Crie conteúdo para Quem Somos, Contactos e mais.</p>
                </div>
                <button onClick={() => openPageModal()} className="bg-[#1c2d51] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 hover:scale-105 transition-all">
                  <Plus size={18}/> Adicionar Página
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cms.pages.map(page => (
                  <div key={page.id} className={`bg-white p-6 rounded-[2rem] border transition-all flex flex-col justify-between group ${page.enabled ? 'border-slate-100 shadow-sm' : 'border-dashed border-slate-200 opacity-60'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1c2d51]">
                        <FileText size={20}/>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setCms({...cms, pages: cms.pages.map(p => p.id === page.id ? {...p, enabled: !p.enabled} : p)})}
                          className="p-2"
                        >
                          {page.enabled ? <ToggleRight className="text-emerald-500" size={24}/> : <ToggleLeft className="text-slate-300" size={24}/>}
                        </button>
                        <button onClick={() => openPageModal(page)} className="p-2 text-slate-300 hover:text-[#1c2d51] transition-colors"><Edit3 size={18}/></button>
                        <button onClick={() => handleDeletePage(page.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-[#1c2d51] text-base mb-1">{page.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">URL: /p/{page.slug}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
              <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4">Canais de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SocialInput id="fb" name="facebook" icon={<Facebook size={18}/>} label="Facebook" value={cms.social.facebook} onChange={val => setCms({...cms, social: {...cms.social, facebook: val}})} />
                <SocialInput id="ig" name="instagram" icon={<Instagram size={18}/>} label="Instagram" value={cms.social.instagram} onChange={val => setCms({...cms, social: {...cms.social, instagram: val}})} />
                <SocialInput id="li" name="linkedin" icon={<Linkedin size={18}/>} label="LinkedIn" value={cms.social.linkedin} onChange={val => setCms({...cms, social: {...cms.social, linkedin: val}})} />
                <SocialInput id="wa" name="whatsapp" icon={<MessageCircle size={18}/>} label="WhatsApp" value={cms.social.whatsapp} onChange={val => setCms({...cms, social: {...cms.social, whatsapp: val}})} />
              </div>
            </div>
          )}

          {activeTab === 'menus' && (
             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 animate-in fade-in">
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

      {/* Modal de Edição de Página */}
      {isPageModalOpen && editingPage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1c2d51] text-white rounded-xl flex items-center justify-center"><FileText size={20}/></div>
                <h3 className="text-xl font-black text-[#1c2d51] tracking-tight">Editar Página Institucional</h3>
              </div>
              <button onClick={() => setIsPageModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título da Página</label>
                  <input className="admin-input-cms" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value})} placeholder="Ex: Quem Somos" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Slug (URL Personalizada)</label>
                  <div className="flex items-center bg-slate-50 rounded-2xl px-4">
                    <span className="text-slate-300 text-xs font-bold">/p/</span>
                    <input className="flex-1 bg-transparent border-none outline-none p-3 font-bold text-[#1c2d51] text-xs lowercase" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: generateSlug(e.target.value)})} placeholder="quem-somos" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Conteúdo da Página (Texto)</label>
                <textarea rows={12} className="admin-input-cms font-medium leading-relaxed" value={editingPage.content_md} onChange={e => setEditingPage({...editingPage, content_md: e.target.value})} placeholder="Escreva aqui o conteúdo da sua página..."></textarea>
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-4">
              <button onClick={() => setIsPageModalOpen(false)} className="px-8 py-3 text-[#1c2d51] font-black text-xs uppercase tracking-widest">Cancelar</button>
              <button onClick={handleSavePage} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:-translate-y-1 transition-all">
                <Check size={18}/> Aplicar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fix: Added missing Modal de Edição de Menu */}
      {isMenuModalOpen && editingMenuItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1c2d51] text-white rounded-xl flex items-center justify-center"><Navigation size={20}/></div>
                <h3 className="text-xl font-black text-[#1c2d51] tracking-tight">Adicionar Link</h3>
              </div>
              <button onClick={() => setIsMenuModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Rótulo (Texto do Link)</label>
                <input className="admin-input-cms" value={editingMenuItem.label} onChange={e => setEditingMenuItem({...editingMenuItem, label: e.target.value})} placeholder="Ex: Galeria" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Caminho (URL ou Slug)</label>
                <input className="admin-input-cms" value={editingMenuItem.path} onChange={e => setEditingMenuItem({...editingMenuItem, path: e.target.value})} placeholder="Ex: /galeria ou https://..." />
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-4">
              <button onClick={() => setIsMenuModalOpen(false)} className="px-8 py-3 text-[#1c2d51] font-black text-xs uppercase tracking-widest">Cancelar</button>
              <button onClick={handleSaveMenuItem} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:-translate-y-1 transition-all">
                <Check size={18}/> Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

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

const SocialInput = ({ id, name, icon, label, value, onChange }: any) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">{icon} {label}</label>
    <input id={id} name={name} className="admin-input-cms" placeholder="https://..." value={value || ''} onChange={e => onChange(e.target.value)} />
  </div>
);

export default AdminCMS;
