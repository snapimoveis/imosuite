
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Building2, ArrowRight, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setError('Credenciais inválidas ou problema de ligação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-6 font-brand">
      <SEO title="Iniciar Sessão" description="Aceda à sua conta ImoSuite e faça a gestão do seu inventário imobiliário." />
      <div className="max-w-md w-full space-y-10 bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#1c2d51] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-[#1c2d51]/20">
            <Building2 size={28} />
          </div>
          <h2 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Bem-vindo de volta</h2>
          <p className="mt-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aceda ao seu painel ImoSuite</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="email"
                placeholder="Email"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1c2d51] outline-none font-bold transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="password"
                placeholder="Palavra-passe"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1c2d51] outline-none font-bold transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 group shadow-xl shadow-[#1c2d51]/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : (
              <>Entrar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm font-bold text-slate-400">
            Não tem uma conta? <Link to="/register" className="text-[#357fb2] hover:underline">Registe-se gratuitamente</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
