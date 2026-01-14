import React, { useState, useEffect, useRef } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../../lib/firebase';
import { 
  Globe, Layout, Type, List, Save, Loader2, 
  ChevronUp, ChevronDown, ToggleLeft, ToggleRight, 
  Plus, Trash2, Edit3, X, Navigation, Camera,
  ImageIcon, LayoutGrid, Clock, Star, Sparkles,
  Facebook, Instagram, Linkedin, MessageCircle, FileText, Check,
  Users, Target, Eye, ImagePlus, UserPlus, Phone, Mail, FileWarning, Zap, Lock
} from 'lucide-react';
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
  const [pageModalTab, setPageModalTab] = useState<'content' | 'institutional' | 'team' | 'media'>('content');
  const [menuTarget, setMenuTarget] = useState<'main' | 'footer'>('main');

  const isBusiness = tenant.subscription?.plan_id === 'business' || profile?.email === 'snapimoveis@gmail.com';

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
      // 1. Processar Imagens das Secções da Homepage
      const processedSections = await Promise.all(cms.homepage_sections.map(async (section) => {
        if (section.content.image_url?.startsWith('data:image')) {
          const downloadUrl = await StorageService.uploadBase64(
            `tenants/${profile.tenantId}/cms/sections/${section.id}.jpg`, 
            section.content.image_url
          );
          return { ...section, content: { ...section.content, image_url: downloadUrl } };
        }
        return section;
      }));

      // 2. Processar Imagens das Páginas (Galeria e Equipa)
      const processedPages = await Promise.all(cms.pages.map(async (page) => {
        // Galeria
        const processedGallery = page.galeria_fotos ? await Promise.all(page.galeria_fotos.map(async (img, idx) => {
          if (img.startsWith('data:image')) {
            return await StorageService.uploadBase64(
              `tenants/${profile.tenantId}/cms/pages/${page.id}/gallery/${idx}.jpg`,
              img
            );
          }
          return img;
        })) : [];

        // Equipa
        const processedTeam = page.equipa ? await Promise.all(page.equipa.map(async (member) => {
          if (member.avatar_url?.startsWith('data:image')) {
            const downloadUrl = await StorageService.uploadBase64(
              `tenants/${profile.tenantId}/cms/pages/${page.id}/team/${member.id}.jpg`,
              member.avatar_url
            );
            return { ...member, avatar_url: downloadUrl };
          }
          return member;
        })) : [];

        return { ...page, galeria_fotos: processedGallery, equipa: processedTeam };
      }));

      const finalCMS = {
        ...cms,
        homepage_sections: processedSections,
        pages: processedPages
      };

      const tenantRef = doc(db, 'tenants', profile.tenantId);
      await updateDoc(tenantRef, {
        cms: finalCMS,
        updated_at: serverTimestamp()
      });

      setTenant({ ...tenant, cms: finalCMS });
      setCms(finalCMS);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      // Erro amigável baseado na falha técnica detetada
      if (err.message?.includes("PERMISSÃO NEGADA") || err.code === 'storage/unauthorized') {
         alert("ERRO DE CONFIGURAÇÃO: O seu Firebase Storage está a bloquear os uploads. Por favor, verifique se as 'Rules' no console do Firebase permitem escrita.");
      } else if (err.message?.includes("exceeds the maximum allowed size")) {
         alert("ERRO: O documento é demasiado grande. Isto acontece porque o upload para o Storage falhou e a imagem ficou guardada no banco de dados. Resolva primeiro as permissões do Storage.");
      } else {
         alert("Erro ao guardar CMS: " + (err.message || "Erro desconhecido"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSectionVisibility = (id: string) => {
    setCms(prev => ({
      ...prev,
      homepage_sections: prev.homepage_sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    }));
  };

  const updateSectionContent = (id: string, updates: Partial<CMSSection['content']>) => {
    setCms(prev => ({
      ...prev,
      homepage_sections: prev.homepage_sections.map(s => s.id === id ? { ...s, content: { ...s.content, ...updates } } : s)
    }));
  };

  const handleSectionImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      // Compressão optimizada para Web (max 1000px, 0.5 quality) para manter o doc < 1MB
      const compressed = await compressImage(reader.result as string, 1000, 700, 0.5);
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

  const openPageModal = (page: CMSPage | null = null) => {
    setPageModalTab('content');
    if (page) {
      setEditingPage({ 
        ...page,
        missao: page.missao || '',
        visao: page.visao || '',
        valores: page.valores || [],
        equipa: page.equipa || [],
        galeria_fotos: page.galeria_fotos || []
      });
    } else {
      setEditingPage({
        id: crypto.randomUUID(),
        title: '',
        slug: '',
        content_md: '',
        enabled: true,
        missao: '',
        visao: '',
        valores: [],
        equipa: [],
        galeria_fotos: []
      });
    }
    setIsPageModalOpen(true);
  };

  const handleSavePage = () => {
    if (!editingPage || !editingPage.title) return;
    const pageToSave = { ...editingPage, slug: editingPage.slug || generateSlug(editingPage.title) };
    setCms(prev => {
      const exists = prev.pages.find(p => p.id === pageToSave.id);
      return { ...prev, pages: exists ? prev.pages.map(p => p.id === pageToSave.id ? pageToSave : p) : [...prev.pages, pageToSave] };
    });
    setIsPageModalOpen(false);
  };

  const handleTeamMemberAvatar = async (memberId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPage) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string, 300, 300, 0.5);
      setEditingPage({
        ...editingPage,
        equipa: editingPage.equipa?.map(m => m.id === memberId ? { ...m, avatar_url: compressed } : m)
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePageGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingPage) return;
    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      const promise = new Promise<void>((resolve) => {
        reader.onloadend = async () => {
          // Galeria de páginas com resolução reduzida para evitar erro de 1MB doc size
          const compressed = await compressImage(reader.result as string, 800, 600, 0.5);
          newPhotos.push(compressed);
          resolve();
        };
        reader.readAsDataURL(files[i]);
      });
      await promise;
    }
    setEditingPage({ ...editingPage, galeria_fotos: [...(editingPage.galeria_fotos || []), ...newPhotos] });
  };

  return (
    <div className="max-w-6xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Website Builder</h1>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Personalize a sua montra digital</p>
             {isBusiness && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border border-blue-100 flex items-center gap-1"><Check size={10}/> White-label Business</span>}
          </div>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-[#1c2d51] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16}/>} {success ? 'Guardado!' : 'Publicar Alterações'}
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <TabButton active={activeTab === 'homepage'} onClick={() => setActiveTab('homepage')} label="Homepage" icon={<Layout size={14}/>} />
        <TabButton active={activeTab === 'menus'} onClick={() => setActiveTab('menus')} label="Menus" icon={<List size={14}/>} />
        <TabButton active={activeTab === 'pages'} onClick={() => setActiveTab('pages')} label="Páginas" icon={<Type size={14}/>} />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} label="Canais & Legal" icon={<Globe size={14}/>} />
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
                          <div onClick={() => document.getElementById(`img-input-${section.id}`)?.click()} className="aspect-video bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 relative overflow-hidden group">
                            {section.content.image_url ? (
                              <>
                                <img src={section.content.image_url} className="w-full h-full object-cover" alt="Section" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs">ALTERAR IMAGEM</div>
                              </>
                            ) : <Camera size={24} className="text-slate-300"/>}
                            <input type="file" id={`img-input-${section.id}`} className="hidden" onChange={e => handleSectionImageUpload(section.id, e)} accept="image/*" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {!isBusiness && (
                <div className="bg-slate-50 border border-slate-100 p-10 rounded-[3rem] text-center space-y-6">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
                    <LayoutGrid size={32} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest mb-2">Desbloqueie Secções Avançadas</h3>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest leading-relaxed">O plano Business permite adicionar blocos ilimitados, secções de Testemunhos, <br/> Galeria de Parceiros e Custom HTML.</p>
                  </div>
                  <Link to="/planos" className="inline-flex bg-[#1c2d51] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all">Ver Upgrade</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                  <h3 className="font-black text-[#1c2d51] text-lg">Páginas Institucionais</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Quem Somos, Contactos e Brand Building.</p>
                </div>
                <button onClick={() => openPageModal()} className="bg-[#1c2d51] text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-lg">
                  <Plus size={18}/> Adicionar Página
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cms.pages.map(page => (
                  <div key={page.id} className={`bg-white p-6 rounded-[2rem] border transition-all flex flex-col justify-between group ${page.enabled ? 'border-slate-100 shadow-sm' : 'border-dashed border-slate-200 opacity-60'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1c2d51]"><FileText size={20}/></div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openPageModal(page)} className="p-2 text-slate-300 hover:text-[#1c2d51]"><Edit3 size={18}/></button>
                        <button onClick={() => setCms({...cms, pages: cms.pages.filter(p => p.id !== page.id)})} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-[#1c2d51] text-base mb-1">{page.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">/p/{page.slug}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-12 animate-in fade-in">
              <div className="space-y-8">
                <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4 flex items-center gap-2"><Globe size={16}/> Canais de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SocialInput icon={<Facebook size={18}/>} label="Facebook" value={cms.social.facebook} onChange={val => setCms({...cms, social: {...cms.social, facebook: val}})} />
                  <SocialInput icon={<Instagram size={18}/>} label="Instagram" value={cms.social.instagram} onChange={val => setCms({...cms, social: {...cms.social, instagram: val}})} />
                  <SocialInput icon={<Linkedin size={18}/>} label="LinkedIn" value={cms.social.linkedin} onChange={val => setCms({...cms, social: {...cms.social, linkedin: val}})} />
                  <SocialInput icon={<MessageCircle size={18}/>} label="WhatsApp" value={cms.social.whatsapp} onChange={val => setCms({...cms, social: {...cms.social, whatsapp: val}})} />
                </div>
              </div>

              <div className="space-y-8 pt-8 border-t">
                <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest border-b pb-4 flex items-center gap-2 text-red-600"><FileWarning size={16}/> Obrigatoriedade Legal</h3>
                <div className="grid grid-cols-1 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">Link do Livro de Reclamações Online</label>
                      <input 
                        className="admin-input-cms" 
                        placeholder="https://www.livroreclamacoes.pt/inicio/reclamacao/..." 
                        value={cms.social.complaints_book_link || ''} 
                        onChange={e => setCms({...cms, social: {...cms.social, complaints_book_link: e.target.value}})} 
                      />
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 px-2 italic">A inclusão deste link é obrigatória por lei em todos os websites comerciais em Portugal.</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menus' && (
             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Navegação</h3>
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
                       <button onClick={() => setCms({...cms, menus: {...cms.menus, main: cms.menus.main.filter(m => m.id !== item.id)}})} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                  ))}
                </div>
             </div>
          )}
      </div>

      {isPageModalOpen && editingPage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1c2d51] text-white rounded-xl flex items-center justify-center shadow-lg"><FileText size={20}/></div>
                <div>
                   <h3 className="text-xl font-black text-[#1c2d51] tracking-tight">Personalizar Página</h3>
                   <div className="flex gap-4 mt-2">
                      <button onClick={() => setPageModalTab('content')} className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${pageModalTab === 'content' ? 'border-[#1c2d51] text-[#1c2d51]' : 'border-transparent text-slate-300'}`}>Conteúdo</button>
                      <button onClick={() => setPageModalTab('institutional')} className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${pageModalTab === 'institutional' ? 'border-[#1c2d51] text-[#1c2d51]' : 'border-transparent text-slate-300'}`}>Institucional (M/V/V)</button>
                      <button onClick={() => setPageModalTab('team')} className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${pageModalTab === 'team' ? 'border-[#1c2d51] text-[#1c2d51]' : 'border-transparent text-slate-300'}`}>Equipa</button>
                      <button onClick={() => setPageModalTab('media')} className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${pageModalTab === 'media' ? 'border-[#1c2d51] text-[#1c2d51]' : 'border-transparent text-slate-300'}`}>Galeria</button>
                   </div>
                </div>
              </div>
              <button onClick={() => setIsPageModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
              {pageModalTab === 'content' && (
                <div className="space-y-8 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título da Página</label>
                      <input className="admin-input-cms" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value})} placeholder="Ex: Quem Somos" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Slug</label>
                      <div className="flex items-center bg-slate-50 rounded-2xl px-4">
                        <span className="text-slate-300 text-xs font-bold">/p/</span>
                        <input className="flex-1 bg-transparent border-none outline-none p-3 font-bold text-[#1c2d51] text-xs lowercase" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: generateSlug(e.target.value)})} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Conteúdo Principal (Markdown)</label>
                    <textarea rows={10} className="admin-input-cms font-medium leading-relaxed" value={editingPage.content_md} onChange={e => setEditingPage({...editingPage, content_md: e.target.value})} placeholder="Escreva o texto principal aqui..."></textarea>
                  </div>
                </div>
              )}

              {pageModalTab === 'institutional' && (
                <div className="space-y-10 animate-in fade-in">
                   <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-2"><Target size={14}/> Nossa Missão</label>
                      <textarea rows={3} className="admin-input-cms" value={editingPage.missao || ''} onChange={e => setEditingPage({...editingPage, missao: e.target.value})} placeholder="Descreva o propósito fundamental da sua agência..." />
                   </div>
                   <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-2"><Eye size={14}/> Nossa Visão</label>
                      <textarea rows={3} className="admin-input-cms" value={editingPage.visao || ''} onChange={e => setEditingPage({...editingPage, visao: e.target.value})} placeholder="Onde pretendem estar nos próximos 5 anos?" />
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-2"><Star size={14}/> Nossos Valores</label>
                        <button onClick={() => setEditingPage({...editingPage, valores: [...(editingPage.valores || []), '']})} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Adicionar Valor</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {editingPage.valores?.map((val, idx) => (
                           <div key={idx} className="flex gap-2">
                              <input className="admin-input-cms" value={val} onChange={e => {
                                const next = [...(editingPage.valores || [])];
                                next[idx] = e.target.value;
                                setEditingPage({...editingPage, valores: next});
                              }} placeholder="Ex: Transparência" />
                              <button onClick={() => setEditingPage({...editingPage, valores: editingPage.valores?.filter((_, i) => i !== idx)})} className="p-3 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {pageModalTab === 'team' && (
                <div className="space-y-8 animate-in fade-in">
                   <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="font-black text-[#1c2d51] text-sm uppercase">Equipa da Página</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Gira os membros visíveis no "Quem Somos"</p>
                      </div>
                      <button onClick={() => setEditingPage({...editingPage, equipa: [...(editingPage.equipa || []), { id: crypto.randomUUID(), name: '', role: '', email: '', phone: '', avatar_url: '' }]})} className="bg-[#1c2d51] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg">
                        <UserPlus size={14}/> Adicionar Membro
                      </button>
                   </div>

                   <div className="grid grid-cols-1 gap-4">
                      {editingPage.equipa?.map((member, idx) => (
                        <div key={member.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 animate-in slide-in-from-bottom-2">
                           <div className="flex flex-col items-center gap-4 shrink-0">
                              <div onClick={() => document.getElementById(`avatar-input-${member.id}`)?.click()} className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 overflow-hidden relative group">
                                 {member.avatar_url ? (
                                   <>
                                     <img src={member.avatar_url} className="w-full h-full object-cover" alt={member.name} />
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px] font-black">EDITAR</div>
                                   </>
                                 ) : <Camera size={20} className="text-slate-300"/>}
                                 <input type="file" id={`avatar-input-${member.id}`} className="hidden" onChange={e => handleTeamMemberAvatar(member.id, e)} />
                              </div>
                              <button onClick={() => setEditingPage({...editingPage, equipa: editingPage.equipa?.filter(m => m.id !== member.id)})} className="text-red-500 font-black text-[9px] uppercase hover:underline">Remover</button>
                           </div>
                           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Nome Completo</label>
                                 <input className="admin-input-cms text-sm py-3" value={member.name} onChange={e => {
                                   const next = [...(editingPage.equipa || [])];
                                   next[idx] = { ...next[idx], name: e.target.value };
                                   setEditingPage({...editingPage, equipa: next});
                                 }} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Cargo / Função</label>
                                 <input className="admin-input-cms text-sm py-3" value={member.role} onChange={e => {
                                   const next = [...(editingPage.equipa || [])];
                                   next[idx] = { ...next[idx], role: e.target.value };
                                   setEditingPage({...editingPage, equipa: next});
                                 }} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Email</label>
                                 <input className="admin-input-cms text-sm py-3" value={member.email} onChange={e => {
                                   const next = [...(editingPage.equipa || [])];
                                   next[idx] = { ...next[idx], email: e.target.value };
                                   setEditingPage({...editingPage, equipa: next});
                                 }} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Telemóvel</label>
                                 <input className="admin-input-cms text-sm py-3" value={member.phone} onChange={e => {
                                   const next = [...(editingPage.equipa || [])];
                                   next[idx] = { ...next[idx], phone: e.target.value };
                                   setEditingPage({...editingPage, equipa: next});
                                 }} />
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {pageModalTab === 'media' && (
                <div className="space-y-8 animate-in fade-in">
                   <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="font-black text-[#1c2d51] text-sm uppercase">Galeria de Fotos</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Imagens de ambiente, escritório ou lifestyle</p>
                      </div>
                      <label className="bg-[#1c2d51] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg cursor-pointer hover:-translate-y-0.5 transition-all">
                        <ImagePlus size={14}/> Carregar Fotos
                        <input type="file" multiple className="hidden" accept="image/*" onChange={handlePageGalleryUpload} />
                      </label>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {editingPage.galeria_fotos?.map((photo, i) => (
                        <div key={i} className="relative aspect-video rounded-2xl overflow-hidden group shadow-sm border border-slate-100">
                           <img src={photo} className="w-full h-full object-cover" alt={`Galeria ${i}`} />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => setEditingPage({...editingPage, galeria_fotos: editingPage.galeria_fotos?.filter((_, idx) => idx !== i)})} className="p-2 bg-white text-red-500 rounded-xl hover:scale-110 transition-all shadow-lg">
                                 <Trash2 size={18}/>
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t bg-white flex justify-end gap-4 shrink-0">
              <button onClick={() => setIsPageModalOpen(false)} className="px-8 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-red-500 transition-colors">Cancelar</button>
              <button onClick={handleSavePage} className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
                <Check size={18}/> Aplicar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {isMenuModalOpen && editingMenuItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex items-center justify-between">
              <h3 className="text-xl font-black text-[#1c2d51]">Novo Link de Menu</h3>
              <button onClick={() => setIsMenuModalOpen(false)}><X size={24}/></button>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Etiqueta do Link</label>
                <input className="admin-input-cms" value={editingMenuItem.label} onChange={e => setEditingMenuItem({...editingMenuItem, label: e.target.value})} placeholder="Ex: Blog" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Caminho / URL</label>
                <input className="admin-input-cms" value={editingMenuItem.path} onChange={e => setEditingMenuItem({...editingMenuItem, path: e.target.value})} placeholder="Ex: /p/blog ou https://..." />
              </div>
              <button onClick={() => {
                setCms(prev => ({
                  ...prev,
                  menus: { ...prev.menus, [menuTarget]: [...prev.menus[menuTarget], editingMenuItem] }
                }));
                setIsMenuModalOpen(false);
              }} className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Adicionar Link</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-input-cms { width: 100%; padding: 1rem 1.4rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.875rem; }
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