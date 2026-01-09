import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
// Modular Firestore imports for version 9+
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useTenant } from '../../contexts/TenantContext';
import { Building2, ArrowRight, Loader2, AlertCircle, Sparkles, CheckCircle2, Globe } from 'lucide-react';
import { generateUniqueSlug } from '../../lib/utils';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setTenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ slug: string } | null>(null);

  const [formData, setFormData] = useState({
    agencyName: '',
    email: '',
    password: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Gerar Slug Único em Background (Shopify-like flow)
      const uniqueSlug = await generateUniqueSlug(formData.agencyName);

      // 2. Criar Utilizador no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 3. Atualizar Perfil de Autenticação
      await updateProfile(user, { displayName: formData.agencyName });

      // 4. Criar o Tenant no Firestore
      // Usamos um ID baseado no UID para segurança e consistência
      const tenantId = `tnt_${user.uid.slice(0, 12)}`;
      
      const tenantDoc = {
        id: tenantId,
        nome: formData.agencyName,
        slug: uniqueSlug,
        owner_uid: user.uid,
        template_id: "heritage", // Template padrão inicial
        estado: "ativo",
        cor_primaria: "#1c2d51",
        cor_secundaria: "#357fb2",
        email: formData.email,
        created_at: serverTimestamp()
      };

      await setDoc(doc(db, 'tenants', tenantId), tenantDoc);

      // 5. Criar o Perfil do Utilizador vinculado ao Tenant
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        displayName: formData.agencyName,
        email: formData.email,
        role: 'admin',
        tenantId: tenantId,
        created_at: serverTimestamp()
      });

      // 6. Atualizar Contexto Local e Mostrar Sucesso
      setTenant(tenantDoc as any);
      setSuccessData({ slug: uniqueSlug });

      // Redirecionar após 2.5 segundos para dar feedback visual
      setTimeout(() => {
        navigate(`/agencia/${uniqueSlug}`);
      }, 2500);

    } catch (err: any) {
      console.error("Erro no registo ImoSuite:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este endereço de email já está em utilização por outra agência.');
      } else {
        setError('Não foi possível criar a sua agência. Verifique os dados e tente novamente.');
      }
      setIsLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-brand">
        <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500 border border-slate-100">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-[#1c2d51] tracking-tighter">Parabéns!</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">A sua agência imobiliária está online</p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
             <p className="text-xs font-bold text-slate-400">O seu endereço exclusivo:</p>
             <div className="flex items-center justify-center gap-2 text-[#357fb2] font-black">
                <Globe size={16} />
                <span className="text-sm">imosuite.pt/agencia/{successData.slug}</span>
             </div>
          </div>

          <div className="flex flex-col items-center gap-4">
             <Loader2 className="animate-spin text-[#1c2d51]/20" size={24} />
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">A redirecionar para o portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-32 pb-20 px-6 font-brand">
      <div className="max-w-xl w-full bg-white p-12 md:p-16 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-60"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="mx-auto h-20 w-20 bg-[#1c2d51] rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl shadow-[#1c2d51]/20 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Building2 size={32} />
            </div>
            <h1 className="text-4xl font-black text-[#1c2d51] tracking-tighter leading-tight">
              Inicie a sua Agência <br/> <span className="text-[#357fb2]">Digital hoje.</span>
            </h1>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-5 rounded-[2rem] flex items-center gap-4 text-sm font-bold border border-red-100 mb-8 animate-in shake duration-300">
              <AlertCircle size={20} className="shrink-0" /> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="space-y-5">
              <div className="group">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-4 tracking-widest group-focus-within:text-[#357fb2] transition-colors">Nome da Imobiliária</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ex: Casas & Estilo Portugal" 
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none font-bold text-[#1c2d51] focus:bg-white focus:border-[#357fb2]/20 transition-all placeholder:text-slate-300" 
                  value={formData.agencyName} 
                  onChange={(e) => setFormData({...formData, agencyName: e.target.value})} 
                />
                <p className="text-[9px] text-slate-400 mt-2 ml-4 italic flex items-center gap-1.5">
                  <Sparkles size={10} className="text-[#357fb2]" /> O seu link público (slug) será gerado automaticamente.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-4 tracking-widest">Email de Gestão</label>
                <input 
                  required 
                  type="email" 
                  placeholder="geral@imobiliaria.pt" 
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none font-bold text-[#1c2d51] focus:bg-white focus:border-[#357fb2]/20 transition-all placeholder:text-slate-300" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-4 tracking-widest">Palavra-passe</label>
                <input 
                  required 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none font-bold text-[#1c2d51] focus:bg-white focus:border-[#357fb2]/20 transition-all placeholder:text-slate-300" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#1c2d51] text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-[#1c2d51]/20 hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" /> 
                  <span>A preparar o seu portal...</span>
                </div>
              ) : (
                <>Criar Site Imobiliário <ArrowRight /></>
              )}
            </button>
          </form>

          <div className="text-center mt-10 space-y-4">
            <p className="text-sm font-bold text-slate-400">
              Já tem uma agência no ImoSuite? <Link to="/login" className="text-[#357fb2] hover:underline">Iniciar sessão</Link>
            </p>
            <div className="pt-6 border-t border-slate-50">
               <p className="text-[9px] text-slate-300 uppercase tracking-widest font-black leading-relaxed">
                 Ao clicar em criar site, aceita os Termos de Serviço e a Política de Privacidade do ImoSuite.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;