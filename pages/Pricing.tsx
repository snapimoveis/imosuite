
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, HelpCircle, Star, ShieldCheck, Zap, Globe } from 'lucide-react';

const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      description: 'Ideal para consultores independentes que estão a começar.',
      price: isAnnual ? 24 : 29,
      icon: <Zap className="text-amber-500" />,
      features: [
        'Até 50 imóveis ativos',
        'Website em subdomínio (.imosuite.pt)',
        'Integração com Gemini AI (Básico)',
        '1 Utilizador administrador',
        'Suporte por Email',
        'Certificado SSL incluído'
      ],
      cta: 'Começar agora',
      highlight: false
    },
    {
      name: 'Business',
      description: 'A solução completa para agências imobiliárias em crescimento.',
      price: isAnnual ? 49 : 59,
      icon: <Star className="text-white" />,
      features: [
        'Imóveis ilimitados',
        'Domínio Próprio (ex: suaagencia.pt)',
        'Gemini AI Ilimitado (SEO & Descrições)',
        'Até 10 Utilizadores/Consultores',
        'Gestão Avançada de Leads (CRM)',
        'Exportação automática para portais',
        'Suporte Prioritário 24/7',
        'White-label (Sem marca ImoSuite)'
      ],
      cta: 'Escolher plano Business',
      highlight: true
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-32">
      <main className="pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-[#1c2d51] mb-6 tracking-tighter">Planos que acompanham o <span className="text-[#357fb2]">seu sucesso.</span></h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
            Escolha o plano ideal para a sua operação. Sem fidelização, cancele quando quiser.
          </p>

          {/* Toggle Mensal/Anual */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <span className={`text-sm font-black uppercase tracking-widest ${!isAnnual ? 'text-[#1c2d51]' : 'text-slate-300'}`}>Mensal</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-16 h-9 bg-slate-100 rounded-full relative p-1.5 transition-colors hover:bg-slate-200"
            >
              <div className={`w-6 h-6 bg-[#357fb2] rounded-full shadow-lg transition-transform duration-300 transform ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-black uppercase tracking-widest ${isAnnual ? 'text-[#1c2d51]' : 'text-slate-300'}`}>Anual</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter">Poupa 20%</span>
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative flex flex-col rounded-[3rem] p-10 md:p-14 transition-all duration-300 ${
                plan.highlight 
                ? 'bg-[#1c2d51] text-white shadow-2xl scale-105 z-10' 
                : 'bg-slate-50 text-[#1c2d51] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#357fb2] text-white text-[10px] font-black px-8 py-2.5 rounded-full uppercase tracking-widest shadow-xl">
                  Recomendado
                </div>
              )}

              <div className="mb-10">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 ${plan.highlight ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                  {plan.icon}
                </div>
                <h3 className="text-3xl font-black mb-3 tracking-tight">{plan.name}</h3>
                <p className={`text-sm font-medium ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>{plan.description}</p>
              </div>

              <div className="mb-12 flex items-baseline gap-2">
                <span className="text-6xl font-black">{plan.price}€</span>
                <span className={`text-xl font-bold ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>/mês</span>
              </div>

              <div className="flex-1 space-y-5 mb-14">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-4">
                    <div className={`mt-1 p-0.5 rounded-full ${plan.highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Check size={16} strokeWidth={4} />
                    </div>
                    <span className="text-sm font-bold opacity-90">{feature}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/register" 
                className={`w-full py-6 rounded-2xl font-black text-lg text-center transition-all flex items-center justify-center gap-3 shadow-lg ${
                  plan.highlight 
                  ? 'bg-white text-[#1c2d51] hover:bg-slate-100 shadow-white/5' 
                  : 'bg-[#1c2d51] text-white hover:opacity-90 shadow-[#1c2d51]/10'
                }`}
              >
                {plan.cta}
                <ArrowRight size={20} />
              </Link>
            </div>
          ))}
        </div>

        {/* Trust & FAQ Preview */}
        <div className="max-w-4xl mx-auto mt-40 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-32">
            <div className="space-y-4">
              <ShieldCheck className="mx-auto text-[#357fb2]" size={40} />
              <h4 className="text-lg font-black text-[#1c2d51] tracking-tight">Dados Seguros</h4>
              <p className="text-sm font-medium text-slate-400">Backups diários e encriptação AES-256 de nível bancário.</p>
            </div>
            <div className="space-y-4">
              <Globe className="mx-auto text-[#357fb2]" size={40} />
              <h4 className="text-lg font-black text-[#1c2d51] tracking-tight">Regras RGPD</h4>
              <p className="text-sm font-medium text-slate-400">Totalmente adequado às diretivas de privacidade europeias.</p>
            </div>
            <div className="space-y-4">
              <HelpCircle className="mx-auto text-[#357fb2]" size={40} />
              <h4 className="text-lg font-black text-[#1c2d51] tracking-tight">Suporte Prioritário</h4>
              <p className="text-sm font-medium text-slate-400">Equipa especializada em Portugal disponível para ajudar.</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-[3rem] p-12 md:p-20">
            <h2 className="text-3xl font-black text-[#1c2d51] mb-12 tracking-tight">Perguntas Frequentes</h2>
            <div className="space-y-6 text-left">
              {[
                { q: "Posso mudar de plano a qualquer momento?", a: "Sim! Pode fazer upgrade ou downgrade do seu plano diretamente no seu painel de controlo. A alteração de faturação é processada imediatamente." },
                { q: "O suporte técnico está incluído?", a: "Sim, todos os nossos clientes têm acesso a suporte. O plano Business conta com gestores de conta dedicados e tempo de resposta garantido." },
                { q: "Tenho ajuda para migrar o meu site antigo?", a: "Com certeza. Se já utiliza outro CRM imobiliário, a nossa equipa técnica pode ajudar a importar todos os seus imóveis automaticamente." }
              ].map((faq, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <h4 className="text-lg font-black text-[#1c2d51] mb-3 tracking-tight">{faq.q}</h4>
                  <p className="text-base text-slate-500 leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
