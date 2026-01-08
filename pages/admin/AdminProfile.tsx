
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { User, Mail, Shield, Lock, Save, Loader2, CheckCircle2, Phone, Camera, Smartphone } from 'lucide-react';

const AdminProfile: React.FC = () => {
  const { profile, user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        email: profile.email || '',
        phone: (profile as any).phone || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, avatar_url: base64String }));
      
      try {
        const userRef = doc(db, 'users', user.uid);
        // Usamos setDoc com merge para criar o documento se ele não existir
        await setDoc(userRef, { 
          avatar_url: base64String,
          updated_at: serverTimestamp() 
        }, { merge: true });
      } catch (err) {
        console.error("Erro ao guardar avatar:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setIsSaving(true);
    setSuccess(false);

    try {
      // 1. Atualizar Profile no Firebase Auth
      await updateProfile(user, { displayName: formData.displayName });

      // 2. Atualizar ou Criar documento do utilizador no Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        displayName: formData.displayName,
        phone: formData.phone,
        role: profile.role || 'admin',
        tenantId: profile.tenantId || 'pending',
        updated_at: serverTimestamp(),
      }, { merge: true });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro ao guardar alterações. Verifique a sua ligação.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 font-brand animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">O Meu Perfil</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gerir dados pessoais e segurança de acesso</p>
        </div>
        {success && (
          <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4">
            <CheckCircle2 size={16} /> Perfil Atualizado
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <div className="relative group mb-6">
              <div className="w-24 h-24 rounded-[2rem] bg-[#1c2d51] text-white flex items-center justify-center text-3xl font-black shadow-xl overflow-hidden">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  formData.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              <button 
                onClick={handleAvatarClick}
                className="absolute -bottom-2 -right-2 bg-white w-10 h-10 rounded-xl shadow-lg border border-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1c2d51] transition-all"
              >
                <Camera size={18} />
              </button>
            </div>
            <h3 className="font-black text-[#1c2d51] text-lg leading-tight mb-1">{formData.displayName || 'Utilizador'}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-6">{profile?.role === 'admin' ? 'Administrador da Agência' : 'Consultor Imobiliário'}</p>
            
            <div className="w-full pt-6 border-t border-slate-50 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-300">Estado</span>
                <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Online</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-300">Desde</span>
                <span className="text-slate-400">Mar 2024</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100/50">
            <div className="flex items-start gap-4">
              <div className="text-blue-500"><Shield size={20}/></div>
              <div>
                <p className="text-[10px] font-black text-[#1c2d51] uppercase tracking-widest mb-1">Acesso Protegido</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                  Os seus dados estão protegidos por encriptação AES-256. Mantenha as suas credenciais seguras.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center"><User size={24}/></div>
              <div>
                <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Dados de Identificação</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Como será identificado na plataforma e nos anúncios</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2">Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.displayName} 
                  onChange={e => setFormData({...formData, displayName: e.target.value})} 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/10 transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><Mail size={12}/> Email (Login)</label>
                <input 
                  type="email" 
                  readOnly 
                  value={formData.email} 
                  className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl outline-none font-bold text-slate-400 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 flex items-center gap-2"><Smartphone size={12}/> Telemóvel</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-[#1c2d51]/10 transition-all" 
                  placeholder="+351 900 000 000"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-[#1c2d51] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Gravar Alterações
              </button>
            </div>
          </form>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center"><Lock size={24}/></div>
              <div>
                <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Segurança & Palavra-passe</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Controlo de acesso à conta</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-slate-50 rounded-[2rem]">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[#1c2d51] uppercase tracking-tighter">Alterar Palavra-passe</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Última alteração há 3 meses</p>
                  </div>
               </div>
               <button className="px-6 py-3 bg-white border border-slate-200 text-[#1c2d51] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Redefinir Agora
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
