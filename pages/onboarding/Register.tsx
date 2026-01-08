
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase.ts';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { Building2, ArrowRight, Loader2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { getUniqueTenantSlug } from '../../lib/utils.ts';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setTenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [finalSlug, setFinalSlug] = useState('');

  const [formData, setFormData] = useState({
    agencyName: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Gerar Slug Único (Regra de Negócio Crítica)
      const slug = await getUniqueTenantSlug(formData.agencyName);
      setFinalSlug(slug);

      // 2. Criar Utilizador no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 3. Atualizar Nome no Auth Profile
      await updateProfile(user, { displayName: formData.agencyName });

      // 4. Gerar ID do Tenant
      const tenantId = `tnt_${user.uid.slice(0, 12)}`;

      // 5. Criar Documento do Utilizador (Firestore)
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        displayName: formData.agencyName,
        email: formData.email,
        role: 'admin',
        tenantId: tenantId,
        created_at: serverTimestamp()
      });

      // 6. Criar Documento do Tenant (Firestore)
      const newTenant = {
        id: tenantId,
        nome: formData.agencyName,
        slug: slug,
        email: formData.email,
        cor_primaria: '#1c2d51',
        cor_secundaria: '#357fb2',
        template_id: 'heritage',
        owner_id: user.uid,
        ativo: true,
        onboarding_completed: false,
        created_at: serverTimestamp()
      };

      await setDoc(doc(db, 'tenants', tenantId), newTenant);
      
      // 7. Sincronizar Contexto Local
      setTenant(newTenant as any);

      setRegistrationSuccess(true);
      
      // Pequeno delay para mostrar o feedback de sucesso antes do redirecionamento
      setTimeout(() => {
        navigate(`/agencia/${slug}`);
      }, 2000);

    } catch (err: any) {
      console.error("Erro no fluxo de registo:", err);
      if (err.code === 'auth/email-already-in-use') setError('Este endereço de email já está registado.');
      else if (err.code === 'auth/weak-password') setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      else setError('Ocorreu um erro ao criar a sua conta. Tente novamente.');
      setIsLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-brand">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Portal Criado!</h2>
          <div className="space-y-2">
            <p className="text-slate-500 font-medium">A preparar o seu endereço exclusivo:</p>
            <p className="text-[#357fb2] font-black text-sm break-all">imosuite.pt/agencia/{finalSlug}</p>
          </div>
          <div className="pt-4">
             <Loader2 className="animate-spin mx-auto text-[#1c2d51]/20" size={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-32 pb-20 px-6 font-brand">
      <div className="max-w-xl w-full space-y-10 bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -z-0 opacity-50"></div>
        
        <div className="relative z-10 text-center">
          <div className="mx-auto h-20 w-20 bg-[#1c2d51] rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-[#1c2d51]/20">
            <Building2 size={32} />
          </div>
          <h2 className="text-4xl font-black text-[#1c2d51] tracking-tighter">
            Crie a sua Agência
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Plataforma ImoSuite SaaS</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in shake duration-300">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form className="mt-10 space-y-6 relative z-10" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">Nome da Imobiliária</label>
              <input 
                required 
                type="text" 
                placeholder="Ex: Elite Homes Portugal" 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-blue-100 transition-all" 
                value={formData.agencyName} 
                onChange={(e) => setFormData({...formData, agencyName: e.target.value})} 
              />
              <p className="text-[9px] text-slate-400 mt-2 ml-2 italic flex items-center gap-1">
                <Sparkles size={10} /> O seu link público será gerado automaticamente.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">Email Profissional</label>
              <input 
                required 
                type="email" 
                placeholder="geral@suaagencia.pt" 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-blue-100 transition-all" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">Palavra-passe</label>
              <input 
                required 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-[#1c2d51] focus:ring-2 focus:ring-blue-100 transition-all" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-[#1c2d51] text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin" /> 
                <span>A configurar agência...</span>
              </div>
            ) : (
              <>Criar Site Imobiliário <ArrowRight /></>
            )}
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-sm font-bold text-slate-400">
            Já tem conta? <Link to="/login" className="text-[#357fb2] hover:underline">Iniciar sessão</Link>
          </p>
          <div className="pt-4 border-t border-slate-50">
             <p className="text-[9px] text-slate-300 uppercase tracking-widest font-black">Ao registar-se aceita os Termos de Serviço</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
