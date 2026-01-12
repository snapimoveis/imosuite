
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, HelpCircle, Star, ShieldCheck, Zap, Globe, Loader2, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionService, StripePlans } from '../services/subscriptionService';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planKey: 'starter' | 'business') => {
    if (!user) {
      navigate('/login?redirect=planos');
      return;
    }

    // Verificar se os IDs do Stripe foram preenchidos
    if (StripePlans[planKey].includes('ReplaceMe')) {
      alert("Configuração incompleta: É necessário substituir os IDs 'price_...' no ficheiro subscriptionService.ts pelos IDs reais do seu Dashboard Stripe.");
      return;
    }

    setLoadingPlan(planKey);
    try {
      await SubscriptionService.createCheckoutSession(user.uid, StripePlans[planKey]);
    } catch (err: any) {
      console.error("Erro detalhado no checkout:", err);
      // Mostrar o erro real para ajudar no debug
      const errorMsg = err.code === 'permission-denied' 
        ? "Erro de Permissão: Verifique se as Regras do Firestore permitem escrita na coleção checkout_sessions."
        : `Erro ao iniciar pagamento: ${err.message}`;
      
      alert(errorMsg);
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Ideal para consultores independentes.',
      price: 29,
      icon: <Zap className="text-amber-500" />,
      features: [
        'Até 50 imóveis ativos',
        'Website em subdomínio',
        'Gemini AI (Básico)',
        '1 Utilizador',
        'Suporte por Email'
      ],
      cta: 'Começar agora',
      highlight: false
    },
    {
      id: 'business',
      name: 'Business',
      description: 'A solução completa para agências.',
      price: 49,
      icon: <Star className="text-white" />,
      features: [
        'Imóveis ilimitados',
        'Domínio Próprio',
        'Gemini AI Ilimitado',
        'Até 10 Utilizadores',
        'CRM de Leads Premium',
        'White-label completo'
      ],
      cta: 'Escolher Business',
      highlight: true
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-20">
      <SEO title="Planos e Preços" description="14 dias grátis. Escolha entre Starter 29€ ou Business 49€." />
      <main className="px-6">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-[#1c2d51] mb-6 tracking-tighter">Escolha o seu <span className="text-[#357fb2]">Plano</span></h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">14 dias de teste grátis em qualquer conta nova. Sem fidelização.</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative flex flex-col rounded-[3rem] p-10 md:p-14 transition-all ${
                plan.highlight ? 'bg-[#1c2d51] text-white shadow-2xl scale-105' : 'bg-slate-50 text-[#1c2d51]'
              }`}
            >
              <div className="mb-10">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 ${plan.highlight ? 'bg-white/10' : 'bg-white'}`}>
                  {plan.icon}
                </div>
                <h3 className="text-3xl font-black mb-3">{plan.name}</h3>
                <p className="text-sm opacity-70">{plan.description}</p>
              </div>

              <div className="mb-12 flex items-baseline gap-2">
                <span className="text-6xl font-black">{plan.price}€</span>
                <span className="text-xl font-bold opacity-50">/mês</span>
              </div>

              <div className="flex-1 space-y-5 mb-14">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-4 text-sm font-bold">
                    <Check size={18} className="text-emerald-500" /> {feature}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSubscribe(plan.id as any)}
                disabled={!!loadingPlan}
                className={`w-full py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                  plan.highlight ? 'bg-white text-[#1c2d51]' : 'bg-[#1c2d51] text-white'
                }`}
              >
                {loadingPlan === plan.id ? <Loader2 className="animate-spin" /> : <>{plan.cta} <ArrowRight /></>}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
