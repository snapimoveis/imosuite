import React, { useState, useEffect, useRef } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Globe, Layout, Type, List, Save, Loader2, 
  ChevronUp, ChevronDown, ToggleLeft, ToggleRight, 
  Plus, Trash2, Edit3, X, Navigation, Camera, GripVertical,
  ImageIcon, LayoutGrid, Clock, Star, Sparkles,
  Facebook, Instagram, Linkedin, MessageCircle, FileText, Check,
  Users, Target, Eye, ImagePlus, UserPlus, Phone, Mail, FileWarning, Zap, Lock, Link2
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { DEFAULT_TENANT_CMS } from '../../constants';
import { CMSSection, TenantCMS, MenuItem, CMSPage, TeamMember } from '../../types';
import { compressImage, generateSlug } from '../../lib/utils';
import { StorageService } from '../../services/storageService';

const AdminCMS: React.FC = () => {
  const { tenant, setTenant, isLoading: tenantLoading } = useTenant();
  const { profile } = useAuth();
  const [cms, setCms] = useState<TenantCMS>(DEFAULT_TENANT_CMS);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'homepage' | 'menus' | 'pages' | 'social'>('homepage');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [menuTarget, setMenuTarget] = useState<'main' | 'footer'>('main');
  const [menuLinkType, setMenuLinkType] = useState<'page' | 'custom'>('page');

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

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
      const finalCMS = { ...cms };
      const tenantRef = doc(db, 'tenants', profile.tenantId);
      await updateDoc(tenantRef, { cms: finalCMS, updated_at: serverTimestamp() });
      setTenant({ ...tenant, cms: finalCMS });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert("Erro ao guardar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (index: number) => setDraggedItemIndex(index);
  
  const handleDragOver = (e: React.DragEvent, index: number, target: 'main' | 'footer') => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index || menuTarget !== target) return;
    
    const newItems = [...cms.menus[target]];
    const draggedItem = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setCms({
      ...cms,
      menus: { ...cms.menus, [target]: newItems.map((item, i) => ({ ...item, order: i })) }
    });
    setDraggedItemIndex(index);
  };

  const toggleSectionVisibility = (id: string) => {
    setCms(prev => ({
      ...prev,
      homepage_sections: prev.homepage_sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    }));
  };

  const updateSectionContent = (id: string, updates: any) => {
    setCms(prev => ({
      ...prev,
      homepage_sections: prev.homepage_sections.map(s => s.id === id ? { ...s, content: { ...s.content, ...updates } } : s)
    }));
  };

  const openMenuModal = (target: 'main' | 'footer') => {
    setMenuTarget(target);
    setMenuLinkType('page');
    setEditingMenuItem({ id: crypto.randomUUID(), label: '', path: '', order: cms.menus[target].length, is_external: false });
    setIsMenuModalOpen(true);
  };

  const TabButton = ({ active, onClick, label, icon }: any) => (
    <button onClick={onClick} className={`px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${active ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
      {icon} {label}
    </button>
  );

  const SocialInput = ({ icon, label, value, onChange }: any) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">{icon} {label}</label>
      <input className="admin-input-cms" placeholder="https://..." value={value || ''} onChange={e => onChange(e.target.value)} />
    </div>
  );

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter uppercase">Website Builder</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gestão de Conteúdo e Canais Digitais</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95">
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16}/>} {success ? 'Publicado!' : 'Publicar Alterações'}
        </button>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit overflow-x-auto max-w-full">
        <TabButton active={activeTab === 'homepage'} onClick={() => setActiveTab('homepage')} label="Homepage" icon={<LayoutGrid size={14}/>} />
        <TabButton active={activeTab === 'menus'} onClick={() => setActiveTab('menus')} label="Navegação" icon={<Navigation size={14}/>} />
        <TabButton active={activeTab === 'pages'} onClick={() => setActiveTab('pages')} label="Páginas" icon={<FileText size={14}/>} />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} label="Canais" icon={<Globe size={14}/>} />
      </div>

      <div className="grid grid-cols-1 gap-6">
          {activeTab === 'homepage' && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 mb-6 flex items-center gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#1c2d51] shadow-md shadow-blue-900/5"><Sparkles size={28}/></div>
                  <div>
                    <h4 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Estrutura da Homepage</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Ative, desative ou personalize as secções do seu portal público</p>
                  </div>
               </div>
               
               {cms.homepage_sections.sort((a,b) => a.order - b.order).map((section) => (
                 <div key={section.id} className={`bg-white rounded-[2.5rem] border transition-all overflow-hidden ${section.enabled ? 'border-slate-100 shadow-sm' : 'opacity-60 grayscale border-dashed border-slate-200'}`}>
                    <div className="p-6 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.enabled ? 'bg-slate-50 text-[#1c2d51]' : 'bg-slate-100 text-slate-300'}`}>
                             {section.type === 'hero' ? <Sparkles size={18}/> : section.type === 'featured' ? <Star size={18}/> : <LayoutGrid size={18}/>}
                          </div>
                          <div>
                             <h4 className="font-black text-sm text-[#1c2d51] uppercase tracking-tight">{section.content.title || `Bloco ${section.type}`}</h4>
                             <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">{section.type}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <button onClick={() => toggleSectionVisibility(section.id)} className="transition-transform active:scale-90">
                             {section.enabled ? <ToggleRight className="text-blue-500" size={32}/> : <ToggleLeft className="text-slate-200" size={32}/>}
                          </button>
                          <button onClick={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)} className={`p-2 rounded-lg transition-colors ${expandedSectionId === section.id ? 'bg-[#1c2d51] text-white' : 'text-slate-300 hover:text-[#1c2d51] hover:bg-slate-50'}`}>
                            <Edit3 size={20}/>
                          </button>
                       </div>
                    </div>
                    {expandedSectionId === section.id && (
                      <div className="p-10 border-t border-slate-50 bg-slate-50/20 grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-top-2">
                         <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Título do Bloco</label>
                            <input className="admin-input-cms" value={section.content.title || ''} onChange={e => updateSectionContent(section.id, { title: e.target.value })} />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Texto / Subtítulo</label>
                            <textarea className="admin-input-cms" rows={3} value={section.content.subtitle || section.content.text || ''} onChange={e => updateSectionContent(section.id, { subtitle: e.target.value, text: e.target.value })} />
                         </div>
                      </div>
                    )}
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'menus' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-[0.2em]">Menu de Topo</h3>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Arraste para reordenar os links</p>
                    </div>
                    <button onClick={() => openMenuModal('main')} className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-100 transition-colors"><Plus size={14}/> Novo Link</button>
                  </div>
                  <div className="space-y-2">
                    {cms.menus.main.map((item, idx) => (
                      <div 
                        key={item.id} 
                        draggable
                        onDragStart={() => { setMenuTarget('main'); handleDragStart(idx); }}
                        onDragOver={(e) => handleDragOver(e, idx, 'main')}
                        onDragEnd={() => setDraggedItemIndex(null)}
                        className={`p-5 bg-slate-50 rounded-2xl flex items-center justify-between group cursor-move transition-all ${draggedItemIndex === idx && menuTarget === 'main' ? 'opacity-30 scale-95 border-2 border-dashed border-blue-300' : 'hover:bg-slate-100'}`}
                      >
                         <div className="flex items-center gap-4">
                            <GripVertical size={16} className="text-slate-300"/>
                            <div>
                              <p className="font-black text-sm text-[#1c2d51] uppercase tracking-tight">{item.label}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.path}</p>
                            </div>
                         </div>
                         <button onClick={() => setCms({...cms, menus: {...cms.menus, main: cms.menus.main.filter(m => m.id !== item.id)}})} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-[0.2em]">Menu de Rodapé</h3>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Links institucionais e legais</p>
                    </div>
                    <button onClick={() => openMenuModal('footer')} className="bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-colors"><Plus size={14}/> Novo Link</button>
                  </div>
                  <div className="space-y-2">
                    {cms.menus.footer.map((item, idx) => (
                      <div 
                        key={item.id} 
                        draggable
                        onDragStart={() => { setMenuTarget('footer'); handleDragStart(idx); }}
                        onDragOver={(e) => handleDragOver(e, idx, 'footer')}
                        onDragEnd={() => setDraggedItemIndex(null)}
                        className={`p-5 bg-slate-50 rounded-2xl flex items-center justify-between group cursor-move transition-all ${draggedItemIndex === idx && menuTarget === 'footer' ? 'opacity-30 scale-95 border-2 border-dashed border-blue-300' : 'hover:bg-slate-100'}`}
                      >
                         <div className="flex items-center gap-4">
                            <GripVertical size={16} className="text-slate-300"/>
                            <div>
                              <p className="font-black text-sm text-[#1c2d51] uppercase tracking-tight">{item.label}</p>
                            </div>
                         </div>
                         <button onClick={() => setCms({...cms, menus: {...cms.menus, footer: cms.menus.footer.filter(m => m.id !== item.id)}})} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'pages' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex justify-between items-center">
                 <div>
                    <h3 className="font-black text-[#1c2d51] text-lg uppercase tracking-tight">Páginas de Conteúdo</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Crie guias, termos ou páginas sobre a equipa</p>
                 </div>
                 <button onClick={() => { setEditingPage({ id: crypto.randomUUID(), title: '', slug: '', content_md: '', enabled: true }); setIsPageModalOpen(true); }} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all hover:-translate-y-0.5"><Plus size={18}/> Nova Página</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {cms.pages.map(page => (
                   <div key={page.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
                      <div>
                        <h4 className="font-black text-[#1c2d51] text-base mb-1">{page.title}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">URL: /p/{page.slug}</p>
                      </div>
                      <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-slate-50">
                        <button onClick={() => { setEditingPage(page); setIsPageModalOpen(true); }} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-[#1c2d51] hover:bg-slate-100 transition-all"><Edit3 size={18}/></button>
                        <button onClick={() => { if(window.confirm("Eliminar página?")) setCms({...cms, pages: cms.pages.filter(p => p.id !== page.id)}) }} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={18}/></button>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'social' && (
             <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-16 animate-in fade-in">
                <div className="space-y-10">
                  <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-[0.3em] border-b border-slate-50 pb-6 flex items-center gap-3"><Globe size={18} className="text-blue-500"/> Canais de Contacto Direto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SocialInput icon={<Facebook size={18}/>} label="Facebook Page" value={cms.social.facebook} onChange={(val: string) => setCms({...cms, social: {...cms.social, facebook: val}})} />
                    <SocialInput icon={<Instagram size={18}/>} label="Instagram Profile" value={cms.social.instagram} onChange={(val: string) => setCms({...cms, social: {...cms.social, instagram: val}})} />
                    <SocialInput icon={<Linkedin size={18}/>} label="LinkedIn Business" value={cms.social.linkedin} onChange={(val: string) => setCms({...cms, social: {...cms.social, linkedin: val}})} />
                    <SocialInput icon={<MessageCircle size={18}/>} label="Número WhatsApp" value={cms.social.whatsapp} onChange={(val: string) => setCms({...cms, social: {...cms.social, whatsapp: val}})} />
                  </div>
                </div>
                <div className="space-y-10">
                  <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-[0.3em] border-b border-slate-50 pb-6 flex items-center gap-3"><FileWarning size={18} className="text-amber-500"/> Conformidade e Links Legais</h3>
                  <div className="grid grid-cols-1 gap-8">
                     <SocialInput icon={<Link2 size={18}/>} label="Link Livro de Reclamações Digital" value={cms.social.complaints_book_link} onChange={(val: string) => setCms({...cms, social: {...cms.social, complaints_book_link: val}})} />
                  </div>
                </div>
             </div>
          )}
      </div>

      {isMenuModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-[#1c2d51] tracking-tight uppercase">Configurar Link</h3>
              <button onClick={() => setIsMenuModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
                 <button onClick={() => setMenuLinkType('page')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${menuLinkType === 'page' ? 'bg-white text-[#1c2d51] shadow-md' : 'text-slate-400'}`}>Páginas Internas</button>
                 <button onClick={() => setMenuLinkType('custom')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${menuLinkType === 'custom' ? 'bg-white text-[#1c2d51] shadow-md' : 'text-slate-400'}`}>URL Manual</button>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Texto de Exibição</label>
                    <input className="admin-input-cms" value={editingMenuItem?.label} onChange={e => setEditingMenuItem({...editingMenuItem!, label: e.target.value})} placeholder="Ex: Sobre Nós" />
                 </div>
                 {menuLinkType === 'page' ? (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Escolher Página</label>
                      <select className="admin-input-cms" value={editingMenuItem?.path} onChange={e => {
                        const pg = cms.pages.find(p => p.slug === e.target.value);
                        setEditingMenuItem({...editingMenuItem!, path: e.target.value, label: pg?.title || editingMenuItem?.label || ''});
                      }}>
                         <option value="">Selecione uma opção...</option>
                         <option value="imoveis">Lista de Imóveis (Sistema)</option>
                         {cms.pages.map(p => <option key={p.id} value={p.slug}>{p.title}</option>)}
                      </select>
                   </div>
                 ) : (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Caminho / Link Externo</label>
                      <input className="admin-input-cms" value={editingMenuItem?.path} onChange={e => setEditingMenuItem({...editingMenuItem!, path: e.target.value})} placeholder="Ex: /imoveis ou https://google.com" />
                   </div>
                 )}
              </div>
              <button onClick={() => {
                if (!editingMenuItem?.label || !editingMenuItem?.path) return;
                setCms({...cms, menus: { ...cms.menus, [menuTarget]: [...cms.menus[menuTarget], editingMenuItem] }});
                setIsMenuModalOpen(false);
              }} className="w-full bg-[#1c2d51] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all hover:scale-[1.02] active:scale-95">Adicionar à Navegação</button>
            </div>
          </div>
        </div>
      )}

      {isPageModalOpen && editingPage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-[#1c2d51] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20"><Edit3 size={24}/></div>
                 <div>
                    <h3 className="text-xl font-black text-[#1c2d51] tracking-tight uppercase">Conteúdo da Página</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Utilize Markdown para formatação avançada</p>
                 </div>
              </div>
              <button onClick={() => setIsPageModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={28}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Título da Página</label>
                    <input className="admin-input-cms text-lg" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value, slug: editingPage.slug || generateSlug(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Caminho do URL (Slug)</label>
                    <input className="admin-input-cms text-lg font-mono" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: generateSlug(e.target.value)})} />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex justify-between">
                    <span>Conteúdo da Página</span>
                    <span className="text-[8px] opacity-60">Aceita Markdown (# H1, **Bold**, etc)</span>
                  </label>
                  <textarea rows={12} className="admin-input-cms font-medium leading-relaxed" value={editingPage.content_md} onChange={e => setEditingPage({...editingPage, content_md: e.target.value})} placeholder="Escreva aqui o texto da sua página..." />
               </div>
            </div>
            <div className="p-10 border-t bg-slate-50 flex justify-end gap-4">
               <button onClick={() => setIsPageModalOpen(false)} className="px-8 py-4 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
               <button onClick={() => {
                 const pageToSave = { ...editingPage, slug: editingPage.slug || generateSlug(editingPage.title) };
                 setCms(prev => {
                    const exists = prev.pages.find(p => p.id === pageToSave.id);
                    return {
                      ...prev,
                      pages: exists ? prev.pages.map(p => p.id === pageToSave.id ? pageToSave : p) : [...prev.pages, pageToSave]
                    };
                 });
                 setIsPageModalOpen(false);
               }} className="bg-[#1c2d51] text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all hover:scale-105">Guardar Alterações</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-input-cms { width: 100%; padding: 1.25rem 1.6rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.95rem; }
        .admin-input-cms:focus { background: #fff; border-color: #357fb2; box-shadow: 0 4px 20px rgba(53, 127, 178, 0.05); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AdminCMS;