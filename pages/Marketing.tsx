
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Shield, Zap, TrendingUp, Globe, Smartphone, ArrowRight, Star, Building2, Users } from 'lucide-react';
import { DashboardMockup } from '../components/DashboardMockup';

const Marketing: React.FC = () => {
  return (
    <div className="bg-white selection:bg-[#1c2d51] selection:text-white pt-20">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black mb-8 uppercase tracking-wider">
              <Star size={14} fill="currentColor" /> Software #1 em Portugal
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-[#1c2d51] leading-[1.05] mb-8 tracking-tighter">
              Tudo o que a sua imobiliária precisa, <span className="text-[#357fb2]">num só sistema.</span>
            </h1>
            
            <p className="text-xl text-slate-500 mb-10 font-medium leading-relaxed max-w-xl">
              Gestão completa de imóveis, clientes e leads, com inteligência artificial para valorizar anúncios e tecnologia preparada para crescer consigo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="bg-[#1c2d51] text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 group shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-1">
                Começar Grátis <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/demo" className="bg-white border-2 border-slate-200 text-[#1c2d51] px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-colors flex items-center justify-center">
                Ver Site Demo
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 shadow-sm" />)}
              </div>
              <p className="text-sm text-slate-400 font-bold tracking-tight">+500 imobiliárias já utilizam o ImoSuite</p>
            </div>
          </div>
          
          <div className="relative">
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
             <div className="relative rotate-1 transition-transform hover:rotate-0 duration-500">
                <DashboardMockup />
                <div className="absolute -bottom-10 -left-10 bg-[#1c2d51] p-8 rounded-3xl text-white shadow-2xl animate-bounce-slow hidden md:block">
                   <div className="text-xs opacity-70 mb-1 font-black uppercase tracking-widest">Leads do Mês</div>
                   <div className="text-4xl font-black">124</div>
                   <div className="text-[10px] mt-3 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-black inline-block tracking-widest">+12.5% vs FEV</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Logos */}
      <section className="py-20 border-y border-slate-50 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-12 opacity-30 grayscale text-[#1c2d51]">
          <Building2 size={40} />
          <Shield size={40} />
          <Globe size={40} />
          <TrendingUp size={40} />
          <Smartphone size={40} />
        </div>
      </section>

      {/* Features Grid */}
      <section id="funcionalidades" className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black text-[#1c2d51] mb-6 tracking-tight">Potencialize a sua operação.</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Esqueça as planilhas complexas. O ImoSuite centraliza toda a sua operação imobiliária num único sistema inteligente e intuitivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            { title: 'Site Próprio', icon: <Globe />, desc: 'Portal imobiliário de alta conversão, personalizado com o seu domínio e marca.' },
            { title: 'IA Generativa', icon: <Zap />, desc: 'O Gemini AI cria descrições de imóveis persuasivas e profissionais para você.' },
            { title: 'Gestão de Leads', icon: <Users />, desc: 'Nunca perca um negócio. Painel de CRM focado exclusivamente no setor imobiliário.' },
            { title: 'Multitenant', icon: <Shield />, desc: 'Segurança absoluta e isolamento total para os dados da sua empresa.' },
            { title: 'White Label', icon: <Check />, desc: 'Remova as referências ao ImoSuite e utilize a sua própria identidade visual.' },
            { title: 'Mobile First', icon: <Smartphone />, desc: 'Gerencie o seu inventário e responda a clientes diretamente do telemóvel.' }
          ].map((feat, i) => (
            <div key={i} className="group p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-[#357fb2]/20 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300">
              <div className="w-16 h-16 bg-white text-[#1c2d51] rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-[#1c2d51] group-hover:text-white transition-all duration-300">
                {feat.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-[#1c2d51] tracking-tight">{feat.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="planos" className="py-24 max-w-7xl mx-auto px-6">
        <div className="bg-[#1c2d51] rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#357fb2] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Pronto para transformar a sua agência?</h2>
            <p className="text-white/70 max-w-xl mx-auto mb-12 text-lg font-medium">Junte-se a centenas de profissionais que já modernizaram a sua forma de trabalhar com o ImoSuite.</p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/planos" className="bg-white text-[#1c2d51] px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-transform flex items-center gap-3">
                Ver Planos e Preços
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Marketing;
