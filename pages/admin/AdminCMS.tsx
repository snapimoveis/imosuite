import React, { useState, useEffect, useRef } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Globe, LayoutGrid, List, Save, Loader2, 
  ToggleLeft, ToggleRight, Plus, Trash2, Edit3, X, 
  Navigation, GripVertical, Sparkles, Star,
  Facebook, Instagram, Linkedin, MessageCircle, FileText,
  Target, Users, Image as ImageIcon, Camera, Phone, Mail, ChevronRight
} from 'lucide-react';
import { DEFAULT_TENANT_CMS } from '../../constants';
import { TenantCMS, MenuItem, CMSPage, TeamMember } from '../../types';
import { generateSlug, compressImage } from '../../lib/utils';

const AdminCMS: React.FC = () => {
  const { tenant, setTenant } = useTenant();
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
  const [pageModalTab, setPageModalTab] = useState<'content' | 'mission' | 'team' | 'gallery'>('content');
  
  const [menuTarget, setMenuTarget] = useState<'main' | 'footer'>('main');
  const [menuLinkType, setMenuLinkType] = useState<'page' | 'custom'>('page');

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
    } catch (err: any) { alert("Erro ao guardar: " + err.message); } finally { setIsSaving(false); }
  };

  const handleAddTeamMember = () => {
    if (!editingPage) return;
    const newMember: TeamMember = { id: crypto.randomUUID(), name: '', role: '', email: '', phone: '', avatar_url: '' };
    setEditingPage({ ...editingPage, equipa: [...(editingPage.equipa || []), newMember] });
  };

  const handlePageImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingPage) return;
    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      const p = new Promise<void>(res => {
        reader.onloadend = async () => {
          const compressed = await compressImage(reader.result as string, 1200, 1200, 0.7);
          newPhotos.push(compressed);
          res();
        };
        reader.readAsDataURL(files[i]);
      });
      await p;
    }
    setEditingPage({ ...editingPage, galeria_fotos: [...(editingPage.galeria_fotos || []), ...newPhotos] });
  };

  const TabButton = ({ active, onClick, label, icon }: any) => (
    <button onClick={onClick} className={`px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${active ? 'bg-white text-[#1c2d51] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
      {icon} {label}
    </button>
  );

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div><h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter uppercase">Website Builder</h1><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gestão de Conteúdo e Identidade</p></div>
        <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center gap-3 shadow-xl transition-all hover:scale-105">
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
            <div className="space-y-4 animate-in fade-in">
               {cms.homepage_sections.sort((a,b) => a.order - b.order).map((section) => (
                 <div key={section.id} className={`bg-white rounded-[2.5rem] border transition-all overflow-hidden ${section.enabled ? 'border-slate-100 shadow-sm' : 'opacity-60 grayscale border-dashed border-slate-200'}`}>
                    <div className="p-6 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.enabled ? 'bg-slate-50 text-[#1c2d51]' : 'bg-slate-100 text-slate-300'}`}>{section.type === 'hero' ? <Sparkles size={18}/> : section.type === 'featured' ? <Star size={18}/> : <LayoutGrid size={18}/>}</div>
                          <div><h4 className="font-black text-sm text-[#1c2d51] uppercase tracking-tight">{section.content.title || `Bloco ${section.type}`}</h4><span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">{section.type}</span></div>
                       </div>
                       <div className="flex items-center gap-4">
                          <button onClick={() => setCms(prev => ({ ...prev, homepage_sections: prev.homepage_sections.map(s => s.id === section.id ? { ...s, enabled: !s.enabled } : s) }))}>{section.enabled ? <ToggleRight className="text-blue-500" size={32}/> : <ToggleLeft className="text-slate-200" size={32}/>}</button>
                          <button onClick={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)} className={`p-2 rounded-lg transition-colors ${expandedSectionId === section.id ? 'bg-[#1c2d51] text-white' : 'text-slate-300 hover:text-[#1c2d51]'}`}><Edit3 size={20}/></button>
                       </div>
                    </div>
                    {expandedSectionId === section.id && (
                      <div className="p-10 border-t border-slate-50 bg-slate-50/20 grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-3"><label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Título do Bloco</label><input className="admin-input-cms" value={section.content.title || ''} onChange={e => setCms(prev => ({ ...prev, homepage_sections: prev.homepage_sections.map(s => s.id === section.id ? { ...s, content: { ...s.content, title: e.target.value } } : s) }))} /></div>
                         <div className="space-y-3"><label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Texto / Subtítulo</label><textarea className="admin-input-cms" rows={3} value={section.content.subtitle || section.content.text || ''} onChange={e => setCms(prev => ({ ...prev, homepage_sections: prev.homepage_sections.map(s => s.id === section.id ? { ...s, content: { ...s.content, subtitle: e.target.value, text: e.target.value } } : s) }))} /></div>
                      </div>
                    )}
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex justify-between items-center">
                 <div><h3 className="font-black text-[#1c2d51] text-lg uppercase tracking-tight">Páginas de Conteúdo</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Institucional, Serviços e Guias</p></div>
                 <button onClick={() => { setEditingPage({ id: crypto.randomUUID(), title: '', slug: '', content_md: '', enabled: true, equipa: [], galeria_fotos: [] }); setPageModalTab('content'); setIsPageModalOpen(true); }} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all hover:-translate-y-0.5"><Plus size={18}/> Nova Página</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {cms.pages.map(page => (
                   <div key={page.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
                      <div><h4 className="font-black text-[#1c2d51] text-base mb-1">{page.title}</h4><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">/p/{page.slug}</p></div>
                      <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-slate-50">
                        <button onClick={() => { setEditingPage(page); setPageModalTab('content'); setIsPageModalOpen(true); }} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-[#1c2d51]"><Edit3 size={18}/></button>
                        <button onClick={() => setCms({...cms, pages: cms.pages.filter(p => p.id !== page.id)})} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'social' && (
             <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
                <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-[0.3em] border-b border-slate-50 pb-6 flex items-center gap-3"><Globe size={18} className="text-blue-500"/> Canais Digitais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Facebook size={14}/> Facebook</label><input className="admin-input-cms" value={cms.social.facebook || ''} onChange={e => setCms({...cms, social: {...cms.social, facebook: e.target.value}})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Instagram size={14}/> Instagram</label><input className="admin-input-cms" value={cms.social.instagram || ''} onChange={e => setCms({...cms, social: {...cms.social, instagram: e.target.value}})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Linkedin size={14}/> LinkedIn</label><input className="admin-input-cms" value={cms.social.linkedin || ''} onChange={e => setCms({...cms, social: {...cms.social, linkedin: e.target.value}})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><MessageCircle size={14}/> WhatsApp</label><input className="admin-input-cms" value={cms.social.whatsapp || ''} onChange={e => setCms({...cms, social: {...cms.social, whatsapp: e.target.value}})} /></div>
                </div>
             </div>
          )}
      </div>

      {isPageModalOpen && editingPage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex items-center justify-between bg-slate-50/30">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#1c2d51] shadow-sm"><FileText size={24}/></div>
                  <div><h3 className="text-xl font-black text-[#1c2d51] tracking-tight uppercase">Editor de Página</h3><p className="text-[10px] text-slate-400 font-bold uppercase">{editingPage.title || 'Nova Página'}</p></div>
               </div>
               <button onClick={() => setIsPageModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900"><X size={28}/></button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
               <aside className="w-full md:w-56 bg-slate-50 border-r border-slate-100 p-4 space-y-2">
                  <PageTabBtn active={pageModalTab === 'content'} onClick={() => setPageModalTab('content')} icon={<FileText size={16}/>} label="Conteúdo" />
                  <PageTabBtn active={pageModalTab === 'mission'} onClick={() => setPageModalTab('mission')} icon={<Target size={16}/>} label="Missão/Visão" />
                  <PageTabBtn active={pageModalTab === 'team'} onClick={() => setPageModalTab('team')} icon={<Users size={16}/>} label="A Equipa" />
                  <PageTabBtn active={pageModalTab === 'gallery'} onClick={() => setPageModalTab('gallery')} icon={<ImageIcon size={16}/>} label="Galeria" />
               </aside>

               <div className="flex-1 overflow-y-auto p-10">
                  {pageModalTab === 'content' && (
                    <div className="space-y-8 animate-in fade-in">
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2"><label className="admin-cms-label">Título</label><input className="admin-input-cms" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value, slug: editingPage.slug || generateSlug(e.target.value)})} /></div>
                          <div className="space-y-2"><label className="admin-cms-label">Slug URL</label><input className="admin-input-cms" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: generateSlug(e.target.value)})} /></div>
                       </div>
                       <div className="space-y-3"><label className="admin-cms-label">Corpo da Página (Markdown)</label><textarea rows={12} className="admin-input-cms font-medium leading-relaxed" value={editingPage.content_md} onChange={e => setEditingPage({...editingPage, content_md: e.target.value})} placeholder="Escreva o conteúdo principal aqui..." /></div>
                    </div>
                  )}

                  {pageModalTab === 'mission' && (
                    <div className="space-y-8 animate-in fade-in">
                       <div className="space-y-2"><label className="admin-cms-label">Missão</label><textarea rows={3} className="admin-input-cms" value={editingPage.missao || ''} onChange={e => setEditingPage({...editingPage, missao: e.target.value})} /></div>
                       <div className="space-y-2"><label className="admin-cms-label">Visão</label><textarea rows={3} className="admin-input-cms" value={editingPage.visao || ''} onChange={e => setEditingPage({...editingPage, visao: e.target.value})} /></div>
                       <div className="space-y-2"><label className="admin-cms-label">Valores (Separados por vírgula)</label><input className="admin-input-cms" value={editingPage.valores?.join(', ') || ''} onChange={e => setEditingPage({...editingPage, valores: e.target.value.split(',').map(v => v.trim())})} /></div>
                    </div>
                  )}

                  {pageModalTab === 'team' && (
                    <div className="space-y-8 animate-in fade-in">
                       <div className="flex justify-between items-center"><h4 className="font-black text-[#1c2d51] uppercase text-xs">Gestão de Equipa</h4><button onClick={handleAddTeamMember} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-[9px] uppercase flex items-center gap-2"><Plus size={14}/> Membro</button></div>
                       <div className="grid grid-cols-1 gap-4">
                          {(editingPage.equipa || []).map((member, idx) => (
                            <div key={member.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-center relative group">
                               <div className="md:col-span-1 flex flex-col items-center gap-2">
                                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200">
                                     {member.avatar_url ? <img src={member.avatar_url} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" />}
                                  </div>
                                  <button className="text-[8px] font-black uppercase text-blue-500">Alterar Foto</button>
                               </div>
                               <div className="md:col-span-2 space-y-3">
                                  <input placeholder="Nome Completo" className="admin-input-cms py-2 text-xs" value={member.name} onChange={e => {
                                     const eq = [...(editingPage.equipa || [])];
                                     eq[idx].name = e.target.value;
                                     setEditingPage({...editingPage, equipa: eq});
                                  }} />
                                  <input placeholder="Cargo / Especialidade" className="admin-input-cms py-2 text-xs" value={member.role} onChange={e => {
                                     const eq = [...(editingPage.equipa || [])];
                                     eq[idx].role = e.target.value;
                                     setEditingPage({...editingPage, equipa: eq});
                                  }} />
                               </div>
                               <div className="flex justify-end gap-2"><button onClick={() => setEditingPage({...editingPage, equipa: editingPage.equipa?.filter(m => m.id !== member.id)})} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button></div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {pageModalTab === 'gallery' && (
                    <div className="space-y-8 animate-in fade-in">
                       <div className="flex justify-between items-center"><h4 className="font-black text-[#1c2d51] uppercase text-xs">Galeria de Fotos</h4><label className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-[9px] uppercase flex items-center gap-2 cursor-pointer"><Plus size={14}/> Carregar<input type="file" multiple className="hidden" accept="image/*" onChange={handlePageImageUpload}/></label></div>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(editingPage.galeria_fotos || []).map((url, idx) => (
                            <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden group border border-slate-100 shadow-sm">
                               <img src={url} className="w-full h-full object-cover" />
                               <button onClick={() => setEditingPage({...editingPage, galeria_fotos: editingPage.galeria_fotos?.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
               </div>
            </div>

            <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-4">
               <button onClick={() => setIsPageModalOpen(false)} className="px-8 py-4 text-slate-400 font-black text-xs uppercase hover:text-slate-900 transition-all">Cancelar</button>
               <button onClick={() => { setCms(prev => ({ ...prev, pages: prev.pages.find(p => p.id === editingPage.id) ? prev.pages.map(p => p.id === editingPage.id ? editingPage : p) : [...prev.pages, editingPage] })); setIsPageModalOpen(false); }} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center gap-2"><Check size={18}/> Guardar Página</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-input-cms { width: 100%; padding: 1.25rem 1.6rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.5rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.95rem; }
        .admin-input-cms:focus { background: #fff; border-color: #357fb2; }
        .admin-cms-label { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; margin-left: 0.5rem; margin-bottom: 0.5rem; letter-spacing: 0.1em; }
      `}</style>
    </div>
  );
};

const PageTabBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-white text-[#1c2d51] shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-white/50 hover:text-[#1c2d51]'}`}>
    {icon} {label}
  </button>
);

const Check = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

export default AdminCMS;