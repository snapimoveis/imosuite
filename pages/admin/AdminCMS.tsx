
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { 
  Globe, Layout, Type, List, Save, Loader2, Eye, 
  ChevronUp, ChevronDown, ToggleLeft, ToggleRight, 
  Plus, Trash2, Edit3, Smartphone, Laptop, X, ChevronRight, Check,
  Link as LinkIcon, FileText, ExternalLink, Settings
} from 'lucide-react';
import { DEFAULT_TENANT_CMS } from '../../constants.tsx';
import { CMSSection, TenantCMS, MenuItem, CMSPage } from '../../types.ts';

const AdminCMS: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile } = useAuth();
  const [cms, setCms] = useState<TenantCMS>(tenant.cms || DEFAULT_TENANT_CMS);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'homepage' | 'menus' | 'pages'>('homepage');
  
  // Modais
  const [editingSection, setEditingSection] = useState<CMSSection | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  
  // States para novos itens
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({ label: '', path: '', is_external: false, order: 0 });
  const [menuTarget, setMenuTarget] = useState<'main' | 'footer'>('main');
  const [editingPage, setEditingPage] = useState<Partial<CMSPage>>({ title: '', slug: '', content_md: '', enabled: true });

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

  // --- MÉTODOS HOMEPAGE ---
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

  // --- MÉTODOS MENUS ---
  const addMenuItem = () => {
    if (!newMenuItem.label || !newMenuItem.path) return;
    const item: MenuItem = {
      id: Math.random().toString(36).substr(2, 9),
      label: newMenuItem.label,
      path: newMenuItem.path,
      is_external: !!newMenuItem.is_external,
      order: cms.menus[menuTarget].length
    };
    
    setCms(prev => ({
      ...prev,
      menus: {
        ...prev.menus,
        [menuTarget]: [...prev.menus[menuTarget], item]
      }
    }));
    setNewMenuItem({ label: '', path: '', is_external: false });
    setIsMenuModalOpen(false);
  };

  const deleteMenuItem = (target: 'main' | 'footer', id: string) => {
    setCms(prev => ({
      ...prev,
      menus: {
        ...prev.menus,
        [target]: prev.menus[target].filter(m => m.id !== id)
      }
    }));
  };

  // --- MÉTODOS PÁGINAS ---
  const handleAddOrUpdatePage = () => {
    if (!editingPage.title || !editingPage.slug) return;
    
    const pageObj: CMSPage = {
      id: editingPage.id || Math.random().toString(36).substr(2, 9),
      title: editingPage.title,
      slug: editingPage.slug.toLowerCase().replace(/\s+/g, '-'),
      content_md: editingPage.content_md || '',
      enabled: editingPage.enabled ?? true,
    };

    setCms(prev => {
      const existingIdx = prev.pages.findIndex(p => p.id === pageObj.id);
      const newPages = [...prev.pages];
      if (existingIdx > -1) newPages[existingIdx] = pageObj;
      else newPages.push(pageObj);
      return { ...prev, pages: newPages };
    });

    setIsPageModalOpen(false);
    setEditingPage({ title: '', slug: '', content_md: '', enabled: true });
  };

  const deletePage = (id: string) => {
    if(window.confirm("Apagar esta página?")) {
      setCms(prev => ({ ...prev, pages: prev.pages.filter(p => p.id !== id) }));
    }
  };

  if (tenantLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-200" size={40} /></div>;

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Website Builder</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gerencie a experiência online da sua agência</p>
        </div>
        <div className="flex items-center gap-3">
           <a href={`#/agencia/${tenant.slug}`} target="_blank" className="bg-slate-100 text-[#1c2d51] px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-200 transition-all">
             <Eye size={16}/> Ver Site
           </a>
           <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 transition-all">
             {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16}/>} {success ? 'Guardado!' : 'Publicar Alterações'}
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
          
          {/* TAB HOMEPAGE */}
          {activeTab === 'homepage' && (
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
               <h3 className="font-black text-[#1c2d51] uppercase text-[10px] tracking-[0.2em] mb-4">Estrutura de Blocos</h3>
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
          )}

          {/* TAB NAVEGAÇÃO */}
          {activeTab === 'menus' && (
            <div className="space-y-8">
              {/* Menu Principal */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><LayoutIcon size={18}/></div>
                     <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Menu de Topo</h3>
                   </div>
                   <button onClick={() => { setMenuTarget('main'); setIsMenuModalOpen(true); }} className="bg-slate-50 px-5 py-2.5 rounded-xl text-blue-600 font-black text-[10px] uppercase flex items-center gap-2 hover:bg-blue-50 transition-all"><Plus size={14}/> Novo Link</button>
                </div>
                <div className="space-y-2">
                   {cms.menus.main.map(item => (
                     <MenuItemRow key={item.id} item={item} onDelete={() => deleteMenuItem('main', item.id)} />
                   ))}
                </div>
              </div>

              {/* Menu Rodapé */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center"><ChevronDown size={18}/></div>
                     <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Menu Rodapé</h3>
                   </div>
                   <button onClick={() => { setMenuTarget('footer'); setIsMenuModalOpen(true); }} className="bg-slate-50 px-5 py-2.5 rounded-xl text-blue-600 font-black text-[10px] uppercase flex items-center gap-2 hover:bg-blue-50 transition-all"><Plus size={14}/> Novo Link</button>
                </div>
                <div className="space-y-2">
                   {cms.menus.footer.map(item => (
                     <MenuItemRow key={item.id} item={item} onDelete={() => deleteMenuItem('footer', item.id)} />
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB PÁGINAS */}
          {activeTab === 'pages' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center border-b pb-6">
                <div>
                   <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Páginas Institucionais</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Crie conteúdo como "Quem Somos" ou "Termos e Condições"</p>
                </div>
                <button onClick={() => { setEditingPage({ title: '', slug: '', content_md: '', enabled: true }); setIsPageModalOpen(true); }} className="bg-[#1c2d51] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                  <Plus size={16}/> Criar Página
                </button>
              </div>

              {cms.pages.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200"><FileText size={40}/></div>
                   <p className="font-black text-slate-300 uppercase text-[10px] tracking-[0.2em]">Nenhuma página criada ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cms.pages.map(page => (
                    <div key={page.id} className="p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-200 transition-all group">
                       <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><FileText size={20}/></div>
                          <div className="flex gap-1">
                             <button onClick={() => { setEditingPage(page); setIsPageModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"><Edit3 size={16}/></button>
                             <button onClick={() => deletePage(page.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"><Trash2 size={16}/></button>
                          </div>
                       </div>
                       <h4 className="font-black text-[#1c2d51] text-sm mb-1">{page.title}</h4>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">/{page.slug}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#1c2d51] p-8 rounded-[3rem] text-white shadow-xl">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6"><Settings size={24} className="text-blue-400" /></div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-2">Estado Visual</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mb-8">
                As alterações que faz aqui afetam apenas a estrutura e conteúdo. O design continua a ser ditado pelo template <span className="text-white font-black uppercase underline decoration-blue-400 underline-offset-4">{tenant.template_id}</span>.
              </p>
              <Link to="/admin/settings?tab=website" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-[#1c2d51] px-6 py-3 rounded-xl hover:scale-105 transition-all">Trocar Estilo <ChevronRight size={14}/></Link>
           </div>
        </div>
      </div>

      {/* MODAL EDITAR SECÇÃO HOMEPAGE */}
      {editingSection && (
        <Modal title={`Editar ${editingSection.type.toUpperCase()}`} onClose={() => setEditingSection(null)}>
           <div className="space-y-6">
              {editingSection.content.hasOwnProperty('title') && (
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título Principal</label>
                   <input className="admin-input-cms" value={editingSection.content.title} onChange={e => setEditingSection({...editingSection, content: {...editingSection.content, title: e.target.value}})} />
                </div>
              )}
              {editingSection.content.hasOwnProperty('subtitle') && (
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Subtítulo / Descrição</label>
                   <textarea rows={3} className="admin-input-cms" value={editingSection.content.subtitle} onChange={e => setEditingSection({...editingSection, content: {...editingSection.content, subtitle: e.target.value}})} />
                </div>
              )}
              <button onClick={() => { updateSectionContent(editingSection.id, editingSection.content); setEditingSection(null); }} className="w-full bg-[#1c2d51] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                 <Check size={16}/> Aplicar
              </button>
           </div>
        </Modal>
      )}

      {/* MODAL NOVO LINK MENU */}
      {isMenuModalOpen && (
        <Modal title={`Novo Link (${menuTarget === 'main' ? 'Topo' : 'Rodapé'})`} onClose={() => setIsMenuModalOpen(false)}>
           <div className="space-y-5">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome do Link</label>
                 <input className="admin-input-cms" placeholder="Ex: Sobre Nós" value={newMenuItem.label} onChange={e => setNewMenuItem({...newMenuItem, label: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Endereço (Caminho ou URL)</label>
                 <input className="admin-input-cms" placeholder="Ex: /quem-somos ou https://google.com" value={newMenuItem.path} onChange={e => setNewMenuItem({...newMenuItem, path: e.target.value})} />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                 <input type="checkbox" id="ext" className="w-5 h-5 rounded-md" checked={newMenuItem.is_external} onChange={e => setNewMenuItem({...newMenuItem, is_external: e.target.checked})} />
                 <label htmlFor="ext" className="text-xs font-black text-[#1c2d51] uppercase cursor-pointer">Este link abre num novo separador</label>
              </div>
              <button onClick={addMenuItem} className="w-full bg-[#1c2d51] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl">
                 <Plus size={16}/> Adicionar ao Menu
              </button>
           </div>
        </Modal>
      )}

      {/* MODAL NOVA PÁGINA */}
      {isPageModalOpen && (
        <Modal title={editingPage.id ? "Editar Página" : "Nova Página"} onClose={() => setIsPageModalOpen(false)} size="max-w-4xl">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título da Página</label>
                 <input className="admin-input-cms" placeholder="Ex: Quem Somos" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL (Slug)</label>
                 <div className="flex items-center bg-slate-50 rounded-2xl px-4">
                   <span className="text-slate-300 font-bold text-xs">/</span>
                   <input className="flex-1 bg-transparent py-4 outline-none font-bold text-[#1c2d51]" placeholder="quem-somos" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: e.target.value})} />
                 </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Conteúdo (Markdown)</label>
                 <textarea rows={12} className="admin-input-cms font-mono text-sm leading-relaxed" placeholder="# O seu título aqui..." value={editingPage.content_md} onChange={e => setEditingPage({...editingPage, content_md: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                 <button onClick={handleAddOrUpdatePage} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-emerald-700 transition-all">
                    <Check size={18}/> Guardar Página
                 </button>
              </div>
           </div>
        </Modal>
      )}

      <style>{`
        .admin-input-cms { width: 100%; padding: 1rem 1.25rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; }
        .admin-input-cms:focus { background: #fff; border-color: #1c2d51; }
      `}</style>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

// Fix: Use React.FC to ensure that React-specific props like 'key' are handled correctly by TypeScript
const MenuItemRow: React.FC<{ item: MenuItem; onDelete: () => void }> = ({ item, onDelete }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
    <div className="flex items-center gap-4">
       <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-300 shadow-sm"><LinkIcon size={14} /></div>
       <div>
         <span className="font-bold text-xs block text-[#1c2d51]">{item.label}</span>
         <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
           {item.path} {item.is_external && <ExternalLink size={8} />}
         </span>
       </div>
    </div>
    <button onClick={onDelete} className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-colors"><Trash2 size={16}/></button>
  </div>
);

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${active ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
    {icon} {label}
  </button>
);

const Modal = ({ title, children, onClose, size = "max-w-lg" }: any) => (
  <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
    <div className={`bg-white w-full ${size} rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
      <div className="p-8 border-b flex justify-between items-center">
        <div>
           <h3 className="text-xl font-black text-[#1c2d51] tracking-tight">{title}</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ajuste os dados e publique</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20}/></button>
      </div>
      <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  </div>
);

const LayoutIcon = List; // Alias para icon

export default AdminCMS;
