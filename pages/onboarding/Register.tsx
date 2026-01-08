
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useTenant } from '../../contexts/TenantContext';
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
      // 1. Criar utilizador no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Atualizar nome no perfil do Auth
      await updateProfile(user, { displayName: formData.agencyName });

      // 3. Criar dados do Tenant e Perfil no Firestore
      const tenantId = `tnt_${Date.now()}`;
      const slug = formData.slug || formData.agencyName.toLowerCase().replace(/\s+/g, '-');

      // Salvar o Tenant
      await setDoc(doc(db, 'tenants', tenantId), {
        nome: formData.agencyName,
        slug: slug,
        email: formData.email,
        cor_primaria: formData.color,
        owner_id: user.uid,
        created_at: serverTimestamp()
      });

      // Salvar o perfil do utilizador
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        displayName: formData.agencyName,
        email: formData.email,
        role: 'admin',
        tenantId: tenantId,
        created_at: serverTimestamp()
      });
      
      // 4. Atualizar estado local
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
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao criar conta. Verifique a sua ligação.');
      }
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
            {step === 1 ? 'Comece o seu Teste Grátis' : 'Identidade da Agência'}
          </h2>
          <p className="mt-4 text-slate-400 font-bold uppercase text-xs tracking-widest">
            Sem cartão de crédito • 14 dias grátis
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black text-[#1c2d51] mb-2 uppercase tracking-widest">Nome da Agência</label>
                <input
                  required
                  type="text"
                  className="mt-1 block w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1c2d51] outline-none font-bold text-lg transition-all"
                  placeholder="Ex: Alentejo Homes"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#1c2d51] mb-2 uppercase tracking-widest">Email Profissional</label>
                <input
                  required
                  type="email"
                  className="mt-1 block w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1c2d51] outline-none font-bold text-lg transition-all"
                  placeholder="contato@empresa.pt"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#1c2d51] mb-2 uppercase tracking-widest">Palavra-passe</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  className="mt-1 block w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1c2d51] outline-none font-bold text-lg transition-all"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black text-[#1c2d51] mb-2 uppercase tracking-widest">Subdomínio (Ex: agenciademo.pt)</label>
                <div className="mt-1 flex rounded-2xl overflow-hidden shadow-sm">
                  <span className="inline-flex items-center px-5 bg-slate-100 text-slate-400 text-sm font-bold border-r border-slate-200">
                    imosuite.pt/
                  </span>
                  <input
                    required
                    type="text"
                    className="flex-1 block w-full px-6 py-4 bg-slate-50 border-none outline-none font-bold text-lg focus:ring-2 focus:ring-[#1c2d51] transition-all"
                    placeholder="alentejo-homes"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-[#1c2d51] mb-4 uppercase tracking-widest">Escolha a cor da sua marca</label>
                <div className="flex flex-wrap gap-4">
                  {['#1c2d51', '#357fb2', '#b91c1c', '#15803d', '#7c3aed'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({...formData, color: c})}
                      className={`w-12 h-12 rounded-2xl border-4 transition-all ${formData.color === c ? 'border-slate-900 scale-110 shadow-lg shadow-black/10' : 'border-transparent opacity-60'}`}
                      style={{ backgroundColor: c }}
                    >
                      {formData.color === c && <Check className="text-white mx-auto" size={20} strokeWidth={4} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-6 px-4 border border-transparent text-xl font-black rounded-2xl text-white bg-[#1c2d51] hover:opacity-95 shadow-xl shadow-[#1c2d51]/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  {step === 1 ? 'Continuar' : 'Criar Conta'}
                  <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center flex flex-col gap-4">
          <Link to="/login" className="text-sm font-bold text-[#357fb2] hover:underline">Já tem uma conta? Inicie sessão</Link>
          <Link to="/" className="text-sm font-bold text-slate-400 hover:text-[#1c2d51] transition-colors">Voltar para a página inicial</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
