import React, { useState, useEffect, useRef } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Globe, Layout, Type, List, Save, Loader2, 
  ChevronUp, ChevronDown, ToggleLeft, ToggleRight, 
  Plus, Trash2, Edit3, X, Navigation, Camera,
  Image as ImageIcon, ChevronRight, LayoutGrid
} from 'lucide-react';
import { DEFAULT_TENANT_CMS } from '../../constants';
import { CMSSection, TenantCMS, MenuItem, CMSPage } from '../../types';

const AdminCMS: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile } = useAuth();
  const [cms, setCms] = useState<TenantCMS>(DEFAULT_TENANT_CMS);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'homepage' | 'menus' | 'pages'>('homepage');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({ label: '', path: '', is_external: false, order: 0 });
  const [menuTarget, setMenuTarget] = useState<'main' | 'footer'>('main');
  const [editingPage, setEditingPage] = useState<Partial<CMSPage>>({ title: '', slug: '', content_md: '', enabled: true });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tenant.cms) {
      setCms({
        ...DEFAULT_TENANT_CMS,
        ...tenant.cms,
        homepage_sections: Array.isArray(tenant.cms.homepage_sections) ? tenant.cms.homepage_sections : DEFAULT_TENANT_CMS.homepage_sections,
        pages: Array.isArray(tenant.cms.pages) ? tenant.cms.pages : DEFAULT_TENANT_CMS.pages,
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
    reader.onloadend = () => {
      updateSectionContent(id, { image_url: reader.result as string });
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
    setNewMenuItem({ label: '', path: '', is_external: false });
    setEditingMenuItem(null);
  };

  const addPageToMenu = (page: CMSPage) => {
    const path = `/p/${page.slug}`;
    const alreadyInMenu = cms.menus.main.some(m => m.path === path);
    
    if (alreadyInMenu) {
      alert("Esta página já está presente no menu principal.");
      return;
    }

    setCms(prev => ({
      ...prev,
      menus: {
        ...prev.menus,
        main: [...prev.menus.main, {
          id: crypto.randomUUID(),
          label: page.title,
          path: path,
          is_external: false,
          order: prev.menus.main.length
        }]
      }
    }));
    setActiveTab('menus');
  };

  const handleAddOrUpdatePage = () => {
    if (!editingPage.title || !editingPage.slug) return;
    
    const pageObj: CMSPage = {
      id: editingPage.id || crypto.randomUUID(),
      title: editingPage.title,
      slug: editingPage.slug.toLowerCase().replace(/\s+/g, '-'),
      content_md: editingPage.content_md || '',
      enabled: editingPage.enabled ?? true,
    };

    setCms(prev => {
      const pagesArray = Array.isArray(prev.pages) ? prev.pages : [];
      const existingIdx = pagesArray.findIndex(p => p.id === pageObj.id);
      const newPages = [...pagesArray];
      if (existingIdx > -1) newPages[existingIdx] = pageObj;
      else newPages.push(pageObj);
      return { ...prev, pages: newPages };
    });

    setIsPageModalOpen(false);
    setEditingPage({ title: '', slug: '', content_md: '', enabled: true });
  };

  if (tenantLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-200" size={40} /></div>;

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Website Builder</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Configuração do Portal Público</p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:-translate-y-0.5 transition-all">
             {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16}/>} {success ? 'Guardado!' : 'Publicar Alterações'}
           </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <TabButton active={activeTab === 'homepage'} onClick={() => setActiveTab('homepage')} label="Homepage" icon={<Layout size={14}/>} />
        <TabButton active={activeTab === 'menus'} onClick={() => setActiveTab('menus')} label="Menus" icon={<List size={14}/>} />
        <TabButton active={activeTab === 'pages'} onClick={() => setActiveTab('pages')} label="Páginas" icon={<Type size={14}/>} />
      </div>

      <div className="grid grid-cols-1 gap-6">
          {activeTab === 'homepage' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="font-black text-[#1c2d51] uppercase text-[11px] tracking-widest">Estrutura da Página Inicial</h3>
                 <p className="text-[9px] text-slate-400 font-bold uppercase">Personalize blocos e conteúdos</p>
               </div>
               
               <div className="space-y-4">
                  {cms.homepage_sections.sort((a,b) => a.order - b.order).map((section, idx) => {
                    const isExpanded = expandedSectionId === section.id;
                    
                    return (
                      <div key={section.id} className={`bg-white rounded-[2rem] border transition-all overflow-hidden ${section.enabled ? 'border-slate-100 shadow-sm' : 'border-slate-100 opacity-60'}`}>
                        {/* Header do Bloco */}
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col gap-1">
                              <button onClick={(e) => { e.stopPropagation(); moveSection(idx, 'up'); }} className="text-slate-300 hover:text-[#1c2d51] transition-colors"><ChevronUp size={16}/></button>
                              <button onClick={(e) => { e.stopPropagation(); moveSection(idx, 'down'); }} className="text-slate-300 hover:text-[#1c2d51] transition-colors"><ChevronDown size={16}/></button>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-[10px] text-[#1c2d51] uppercase bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{section.type}</span>
                                <h4 className="font-black text-sm text-[#1c2d51]">{section.content.title || 'Sem título'}</h4>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <button onClick={() => toggleSectionVisibility(section.id)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                              {section.enabled ? <ToggleRight className="text-[#357fb2]" size={28}/> : <ToggleLeft className="text-slate-300" size={28}/>}
                            </button>
                            <button 
                              onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                              className={`p-3 rounded-2xl transition-all ${isExpanded ? 'bg-[#1c2d51] text-white shadow-lg shadow-[#1c2d51]/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                              <Edit3 size={18}/>
                            </button>
                          </div>
                        </div>

                        {/* Editor de Conteúdo (Expandido) */}
                        {isExpanded && (
                          <div className="px-8 pb-10 pt-4 border-t border-slate-50 animate-in slide-in-from-top duration-300 bg-slate-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {/* Lado Esquerdo: Campos de Texto */}
                               <div className="space-y-5">
                                  {(section.type === 'hero' || section.type === 'featured' || section.type === 'recent' || section.type === 'cta' || section.type === 'about_mini') && (
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título do Bloco</label>
                                      <input 
                                        className="admin-input-cms" 
                                        value={section.content.title || ''} 
                                        onChange={e => updateSectionContent(section.id, { title: e.target.value })}
                                      />
                                    </div>
                                  )}
                                  
                                  {(section.type === 'hero' || section.type === 'cta') && (
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Subtítulo / Frase de Impacto</label>
                                      <input 
                                        className="admin-input-cms" 
                                        value={section.content.subtitle || ''} 
                                        onChange={e => updateSectionContent(section.id, { subtitle: e.target.value })}
                                      />
                                    </div>
                                  )}

                                  {(section.type === 'about_mini') && (
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Texto de Apresentação</label>
                                      <textarea 
                                        rows={4}
                                        className="admin-input-cms resize-none" 
                                        value={section.content.text || ''} 
                                        onChange={e => updateSectionContent(section.id, { text: e.target.value })}
                                      />
                                    </div>
                                  )}

                                  {section.type === 'cta' && (
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Texto do Botão</label>
                                        <input 
                                          className="admin-input-cms" 
                                          value={section.content.button_text || ''} 
                                          onChange={e => updateSectionContent(section.id, { button_text: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Link do Botão</label>
                                        <input 
                                          className="admin-input-cms" 
                                          value={section.content.button_link || ''} 
                                          onChange={e => updateSectionContent(section.id, { button_link: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {(section.type === 'featured' || section.type === 'recent') && (
                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                                       <LayoutGrid className="text-blue-500 shrink-0" size={20} />
                                       <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                                         Este bloco puxa automaticamente os imóveis da sua carteira. Os imóveis exibidos são configurados na gestão de imóveis (Estado: Publicado + Destaque).
                                       </p>
                                    </div>
                                  )}
                               </div>

                               {/* Lado Direito: Carregamento de Imagem (Se aplicável) */}
                               {(section.type === 'hero' || section.type === 'about_mini') && (
                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Imagem do Bloco</label>
                                    <div 
                                      onClick={() => document.getElementById(`upload-${section.id}`)?.click()}
                                      className="aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-[#1c2d51]/20 transition-all group overflow-hidden relative"
                                    >
                                      {section.content.image_url ? (
                                        <>
                                          <img src={section.content.image_url} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-[#1c2d51]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                            <Camera size={24} className="mb-2"/>
                                            <span className="font-black text-[10px] uppercase tracking-widest">Alterar Imagem</span>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 text-slate-300">
                                            <ImageIcon size={24}/>
                                          </div>
                                          <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Carregar Imagem Personalizada</span>
                                        </>
                                      )}
                                      <input 
                                        type="file" 
                                        id={`upload-${section.id}`} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleSectionImageUpload(section.id, e)}
                                      />
                                    </div>
                                    <p className="text-[9px] text-slate-400 text-center italic">Resolução recomendada: 1920x1080 (Hero) ou 800x1000 (About)</p>
                                 </div>
                               )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
               </div>
            </div>
          )}

          {activeTab === 'menus' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-[#1c2d51] uppercase text-xs">Menu Principal</h3>
                  <button onClick={() => openMenuModal('main')} className="bg-slate-50 px-4 py-2 rounded-xl text-blue-600 font-black text-[10px] uppercase flex items-center gap-2 transition-all hover:bg-blue-50"><Plus size={14}/> Novo Link</button>
                </div>
                <div className="space-y-2">
                   {cms.menus.main.map(item => (
                     <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-transparent hover:bg-white hover:border-slate-100 transition-all group">
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                             <Navigation size={14}/>
                           </div>
                           <div className="flex flex-col">
                              <span className="font-black text-xs text-[#1c2d51]">{item.label}</span>
                              <span className="text-[9px] text-slate-400 font-bold font-mono tracking-tighter">{item.path}</span>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => openMenuModal('main', item)} className="p-2 text-slate-300 hover:text-[#1c2d51] hover:bg-white rounded-lg shadow-none hover:shadow-sm transition-all"><Edit3 size={16}/></button>
                           <button onClick={() => setCms(prev => ({ ...prev, menus: { ...prev.menus, main: prev.menus.main.filter(m => m.id !== item.id) } }))} className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg shadow-none hover:shadow-sm transition-all"><Trash2 size={16}/></button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-[#1c2d51] uppercase text-xs">Menu de Rodapé</h3>
                  <button onClick={() => openMenuModal('footer')} className="bg-slate-50 px-4 py-2 rounded-xl text-blue-600 font-black text-[10px] uppercase flex items-center gap-2"><Plus size={14}/> Novo Link</button>
                </div>
                <div className="space-y-2">
                   {cms.menus.footer.map(item => (
                     <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="font-bold text-xs">{item.label}</span>
                        <div className="flex gap-2">
                           <button onClick={() => openMenuModal('footer', item)} className="p-2 text-slate-300 hover:text-blue-500"><Edit3 size={16}/></button>
                           <button onClick={() => setCms(prev => ({ ...prev, menus: { ...prev.menus, footer: prev.menus.footer.filter(m => m.id !== item.id) } }))} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-[#1c2d51] uppercase text-xs">Páginas de Conteúdo</h3>
                <button onClick={() => { setEditingPage({ title: '', slug: '', content_md: '', enabled: true }); setIsPageModalOpen(true); }} className="bg-[#1c2d51] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg"><Plus size={16}/> Criar Página</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cms.pages.map(page => (
                    <div key={page.id} className="p-6 bg-slate-50 rounded-2xl flex flex-col gap-4 border border-transparent hover:bg-white hover:border-slate-100 transition-all">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="font-black text-[#1c2d51] text-sm">{page.title}</h4>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">/{page.slug}</p>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => { setEditingPage(page); setIsPageModalOpen(true); }} title="Editar conteúdo" className="p-2 bg-white rounded-lg text-slate-400 hover:text-[#1c2d51] shadow-sm transition-all"><Edit3 size={16}/></button>
                             <button onClick={() => setCms(prev => ({ ...prev, pages: prev.pages.filter(p => p.id !== page.id) }))} className="p-2 bg-white rounded-lg text-slate-400 hover:text-red-500 shadow-sm transition-all"><Trash2 size={16}/></button>
                          </div>
                       </div>
                       <button 
                        onClick={() => addPageToMenu(page)}
                        className="w-full py-2.5 bg-white text-[#1c2d51] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1c2d51] hover:text-white border border-slate-100 shadow-sm transition-all"
                       >
                          <Navigation size={14}/> Linkar ao Menu Principal
                       </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </div>

      {isPageModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-[#1c2d51]">Configurar Página</h3>
                <button onClick={() => setIsPageModalOpen(false)}><X size={20}/></button>
             </div>
             <div className="space-y-6">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Título Público</label>
                   <input className="admin-input-cms" placeholder="Ex: Quem Somos" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Slug da URL</label>
                   <input className="admin-input-cms" placeholder="ex: quem-somos" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Conteúdo do Texto (Markdown)</label>
                   <textarea rows={8} className="admin-input-cms resize-none font-medium text-sm" placeholder="Escreva o conteúdo aqui..." value={editingPage.content_md} onChange={e => setEditingPage({...editingPage, content_md: e.target.value})} />
                </div>
                <button onClick={handleAddOrUpdatePage} className="w-full bg-[#1c2d51] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl">Guardar Página</button>
             </div>
          </div>
        </div>
      )}

      {isMenuModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-[#1c2d51]">{editingMenuItem ? 'Editar Link' : 'Novo Link'}</h3>
                <button onClick={() => setIsMenuModalOpen(false)}><X size={20}/></button>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Nome no Menu</label>
                   <input className="admin-input-cms" placeholder="Ex: Contatos" value={newMenuItem.label} onChange={e => setNewMenuItem({...newMenuItem, label: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-2">URL ou Caminho Interno</label>
                   <input className="admin-input-cms" placeholder="Ex: /imoveis ou https://..." value={newMenuItem.path} onChange={e => setNewMenuItem({...newMenuItem, path: e.target.value})} />
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                   <input type="checkbox" className="w-5 h-5 rounded-lg" checked={newMenuItem.is_external} onChange={e => setNewMenuItem({...newMenuItem, is_external: e.target.checked})} />
                   <span className="text-[10px] font-black uppercase text-slate-500">Abrir em nova aba?</span>
                </div>
                <button onClick={handleSaveMenuItem} className="w-full bg-[#1c2d51] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl">
                  {editingMenuItem ? 'Atualizar Link' : 'Adicionar ao Menu'}
                </button>
             </div>
          </div>
        </div>
      )}
      <style>{`
        .admin-input-cms { width: 100%; padding: 1rem 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }
        .admin-input-cms:focus { background: #fff; border-color: #1c2d51; }
      `}</style>
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${active ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
    {icon} {label}
  </button>
);

export default AdminCMS;