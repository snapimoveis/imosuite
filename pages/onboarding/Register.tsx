
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase.ts';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { Building2, ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { tenant, setTenant } = useTenant();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    agencyName: '',
    email: '',
    password: '',
    slug: '',
    color: '#1c2d51'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. Criar no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Definir nome no perfil do Auth
      await updateProfile(user, { displayName: formData.agencyName });

      // 3. Gerar IDs
      const tenantId = `tnt_${Date.now()}`;
      const slug = formData.slug.trim().toLowerCase().replace(/\s+/g, '-') || formData.agencyName.toLowerCase().replace(/\s+/g, '-');

      // 4. CRIAR UTILIZADOR PRIMEIRO (Para as regras do Firebase reconhecerem o vínculo)
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        displayName: formData.agencyName,
        email: formData.email,
        role: 'admin',
        tenantId: tenantId,
        created_at: serverTimestamp()
      });

      // 5. CRIAR TENANT
      await setDoc(doc(db, 'tenants', tenantId), {
        id: tenantId,
        nome: formData.agencyName,
        slug: slug,
        email: formData.email,
        cor_primaria: formData.color,
        owner_id: user.uid,
        created_at: serverTimestamp()
      });
      
      // 6. Sincronizar contexto local
      setTenant({
        ...tenant,
        id: tenantId,
        nome: formData.agencyName,
        email: formData.email,
        slug: slug,
        cor_primaria: formData.color
      });

      navigate('/onboarding');
    } catch (err: any) {
      console.error("Erro detalhado no registo:", err);
      if (err.code === 'auth/email-already-in-use') setError('Este email já está em uso.');
      else if (err.code === 'permission-denied') setError('Erro de permissão no base de dados. Verifique as regras.');
      else setError(`Erro: ${err.message || 'Verifique os seus dados.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-32 pb-20 px-6 font-brand">
      <div className="max-w-xl w-full space-y-10 bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-[#1c2d51] rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-[#1c2d51]/20">
            <Building2 size={32} />
          </div>
          <h2 className="text-4xl font-black text-[#1c2d51] tracking-tighter">
            {step === 1 ? 'Comece agora' : 'Dados da Marca'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in shake duration-300">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="space-y-6">
              <input required type="text" placeholder="Nome da Agência" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" value={formData.agencyName} onChange={(e) => setFormData({...formData, agencyName: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <input required type="password" placeholder="Palavra-passe" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex rounded-2xl overflow-hidden shadow-sm">
                <span className="px-5 bg-slate-100 text-slate-400 text-sm font-bold flex items-center border-r border-slate-200">imosuite.pt/</span>
                <input required type="text" className="flex-1 px-6 py-4 bg-slate-50 border-none outline-none font-bold" placeholder="sua-agencia" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div className="flex flex-wrap gap-4">
                {['#1c2d51', '#357fb2', '#b91c1c', '#15803d'].map(c => (
                  <button key={c} type="button" onClick={() => setFormData({...formData, color: c})} className={`w-12 h-12 rounded-2xl border-4 ${formData.color === c ? 'border-slate-900 scale-110' : 'border-transparent opacity-60'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full bg-[#1c2d51] text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" /> : <>{step === 1 ? 'Continuar' : 'Criar Portal'} <ArrowRight /></>}
          </button>
        </form>

        <p className="text-center text-sm font-bold text-slate-400">
          Já tem conta? <Link to="/login" className="text-[#357fb2]">Iniciar sessão</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
