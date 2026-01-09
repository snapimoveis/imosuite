import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Globe, Layout, Type, List, Save, Loader2, 
  ChevronUp, ChevronDown, ToggleLeft, ToggleRight, 
  Plus, Trash2, Edit3, X, Navigation
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
             {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16}/>} {success ? 'Guardado!' : 'Publicar'}
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
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
               <h3 className="font-black text-[#1c2d51] uppercase text-[10px] tracking-widest">Blocos da Página Inicial</h3>
               <div className="space-y-3">
                  {cms.homepage_sections.sort((a,b) => a.order - b.order).map((section, idx) => (
                    <div key={section.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${section.enabled ? 'bg-white border-slate-100' : 'bg-slate-50 opacity-60'}`}>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <button onClick={() => moveSection(idx, 'up')} className="text-slate-300 hover:text-[#1c2d51]"><ChevronUp size={14}/></button>
                          <button onClick={() => moveSection(idx, 'down')} className="text-slate-300 hover:text-[#1c2d51]"><ChevronDown size={14}/></button>
                        </div>
                        <div>
                          <p className="font-black text-xs text-[#1c2d51] uppercase">{section.type}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{section.content.title || 'Sem título'}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleSection(section.id)}>
                        {section.enabled ? <ToggleRight className="text-[#1c2d51]" size={28}/> : <ToggleLeft className="text-slate-300" size={28}/>}
                      </button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'menus' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-[#1c2d51] uppercase text-xs">Menu Principal</h3>
                  <button onClick={() => openMenuModal('main')} className="bg-slate-50 px-4 py-2 rounded-xl text-blue-600 font-black text-[10px] uppercase flex items-center gap-2"><Plus size={14}/> Novo Link</button>
                </div>
                <div className="space-y-2">
                   {cms.menus.main.map(item => (
                     <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col">
                           <span className="font-bold text-xs">{item.label}</span>
                           <span className="text-[9px] text-slate-400 font-bold font-mono">{item.path}</span>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => openMenuModal('main', item)} className="p-2 text-slate-300 hover:text-blue-500"><Edit3 size={16}/></button>
                           <button onClick={() => setCms(prev => ({ ...prev, menus: { ...prev.menus, main: prev.menus.main.filter(m => m.id !== item.id) } }))} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
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
                    <div key={page.id} className="p-6 bg-slate-50 rounded-2xl flex flex-col gap-4">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="font-black text-[#1c2d51] text-sm">{page.title}</h4>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">/{page.slug}</p>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => { setEditingPage(page); setIsPageModalOpen(true); }} title="Editar conteúdo" className="p-2 bg-white rounded-lg text-slate-400 hover:text-blue-600 shadow-sm transition-all"><Edit3 size={16}/></button>
                             <button onClick={() => setCms(prev => ({ ...prev, pages: prev.pages.filter(p => p.id !== page.id) }))} className="p-2 bg-white rounded-lg text-slate-400 hover:text-red-500 shadow-sm transition-all"><Trash2 size={16}/></button>
                          </div>
                       </div>
                       <button 
                        onClick={() => addPageToMenu(page)}
                        className="w-full py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
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
                   <input className="admin-input-small" placeholder="Ex: Quem Somos" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Slug da URL</label>
                   <input className="admin-input-small" placeholder="ex: quem-somos" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Conteúdo do Texto (Markdown)</label>
                   <textarea rows={8} className="admin-input-small resize-none font-medium text-sm" placeholder="Escreva o conteúdo aqui..." value={editingPage.content_md} onChange={e => setEditingPage({...editingPage, content_md: e.target.value})} />
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
                   <input className="admin-input-small" placeholder="Ex: Contatos" value={newMenuItem.label} onChange={e => setNewMenuItem({...newMenuItem, label: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-2">URL ou Caminho Interno</label>
                   <input className="admin-input-small" placeholder="Ex: /imoveis ou https://..." value={newMenuItem.path} onChange={e => setNewMenuItem({...newMenuItem, path: e.target.value})} />
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
        .admin-input-small { width: 100%; padding: 1rem 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }
        .admin-input-small:focus { background: #fff; border-color: #1c2d51; }
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