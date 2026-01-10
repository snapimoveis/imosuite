
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
// Import firestore functions from modular SDK
// Fix: Using @firebase/firestore to resolve missing exported members
import { doc, setDoc, serverTimestamp } from "@firebase/firestore";
import { auth, db } from '../../lib/firebase';
import { useTenant } from '../../contexts/TenantContext';
import { Building2, ArrowRight, Loader2, AlertCircle, Sparkles, CheckCircle2, Globe, ShieldCheck } from 'lucide-react';
import { generateUniqueSlug } from '../../lib/utils';
import SEO from '../../components/SEO';

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

  // GDPR States
  const [legalConsent, setLegalConsent] = useState(false);
  const [processorConsent, setProcessorConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!legalConsent || !processorConsent) {
      setError("Deverá aceitar as condições obrigatórias para criar a sua conta.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Gerar Slug Único em Background
      const uniqueSlug = await generateUniqueSlug(formData.agencyName);

      // 2. Criar Utilizador no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 3. Atualizar Perfil de Autenticação
      await updateProfile(user, { displayName: formData.agencyName });

      // 4. Criar o Tenant no Firestore
      const tenantId = `tnt_${user.uid.slice(0, 12)}`;
      
      const tenantDoc = {
        id: tenantId,
        nome: formData.agencyName,
        slug: uniqueSlug,
        owner_uid: user.uid,
        template_id: "heritage", 
        estado: "ativo",
        cor_primaria: "#1c2d51",
        cor_secundaria: "#357fb2",
        email: formData.email,
        gdpr_log: {
          legal_accepted: legalConsent,
          processor_accepted: processorConsent,
          marketing_accepted: marketingConsent,
          timestamp: new Date().toISOString(),
          ip: 'client-side-logged'
        },
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
        <SEO title="Registo Concluído" />
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
      <SEO title="Crie a sua Agência Digital" description="Inicie o seu portal imobiliário white-label em segundos. Registe-se agora no ImoSuite." />
      <div className="max-w-xl w-full bg-white p-12 md:p-16 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
        
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
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-4 tracking-widest">Nome da Imobiliária</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ex: Casas & Estilo Portugal" 
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none font-bold text-[#1c2d51] focus:bg-white focus:border-[#357fb2]/20 transition-all placeholder:text-slate-300" 
                  value={formData.agencyName} 
                  onChange={(e) => setFormData({...formData, agencyName: e.target.value})} 
                />
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

            {/* GDPR Legal Section */}
            <div className="space-y-4 py-6 border-y border-slate-50">
               <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" required checked={legalConsent} onChange={e => setLegalConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-200 text-[#1c2d51]" />
                  <span className="text-[10px] font-medium text-slate-500 leading-normal">
                    Declaro que li e aceito os <Link to="/termos" className="text-blue-500 underline">Termos de Uso</Link>, a <Link to="/privacidade" className="text-blue-500 underline">Política de Privacidade</Link> e o <Link to="/dpa" className="text-blue-500 underline">Acordo de Tratamento de Dados (DPA)</Link> da plataforma Imosuite, em conformidade com o RGPD.
                  </span>
               </label>
               <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" required checked={processorConsent} onChange={e => setProcessorConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-200 text-[#1c2d51]" />
                  <span className="text-[10px] font-medium text-slate-500 leading-normal">
                    Confirmo que atuo como Responsável pelo Tratamento de Dados relativamente aos dados inseridos na plataforma e que possuo base legal para o seu tratamento, nos termos do RGPD.
                  </span>
               </label>
               <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-200 text-[#1c2d51]" />
                  <span className="text-[10px] font-medium text-slate-400 leading-normal italic">
                    (Opcional) Autorizo o contacto por email para comunicações relacionadas com o serviço, podendo retirar o consentimento a qualquer momento.
                  </span>
               </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#1c2d51] text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-[#1c2d51]/20 hover:-translate-y-1 transition-all disabled:opacity-50"
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

          <div className="text-center mt-10">
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-6">
               <ShieldCheck size={16} />
               <span className="text-[9px] font-black uppercase tracking-widest">Ligação Segura e em conformidade RGPD</span>
            </div>
            <p className="text-sm font-bold text-slate-400">
              Já tem uma agência no ImoSuite? <Link to="/login" className="text-[#357fb2] hover:underline">Iniciar sessão</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
