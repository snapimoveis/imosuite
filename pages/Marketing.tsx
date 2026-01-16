
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Shield, Zap, TrendingUp, Globe, Smartphone, ArrowRight, Star, Building2, Users, MessageSquare, ShieldCheck } from 'lucide-react';
import { DashboardMockup } from '../components/DashboardMockup';
import ContactSection from '../components/ContactSection';
import SEO from '../components/SEO';

const Marketing: React.FC = () => {
  return (
    <div className="bg-white selection:bg-[#1c2d51] selection:text-white pt-20">
      <SEO 
        title="Software de Gestão Imobiliária & CRM" 
        description="A solução completa para a sua imobiliária em Portugal. Gestão de imóveis, portais white-label e descrições com IA Generativa." 
      />
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black mb-8 uppercase tracking-wider">
              <Star size={14} fill="currentColor" /> Mais controlo, mais vendas, menos complexidade
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
          </div>
          
          <div className="relative">
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
             <div className="relative rotate-1 transition-transform hover:rotate-0 duration-500">
                <DashboardMockup />
             </div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-[#1c2d51] mb-6 tracking-tight">Potencialize a sua operação imobiliária.</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Centralize imóveis, contactos e processos comerciais num único sistema criado para consultores e imobiliárias.
          </p>
        </div>

        <div className="space-y-24">
          {/* Gestão & Operação */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Gestão & Operação</h3>
              <div className="h-px flex-1 bg-slate-100"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureItem 
                icon={<Globe />} 
                title="Site Próprio" 
                desc="Tenha um site imobiliário profissional, sempre atualizado com os seus imóveis."
              />
              <FeatureItem 
                icon={<Building2 />} 
                title="Gestão de Imóveis" 
                desc="Crie, edite e publique imóveis em poucos cliques, com controlo total."
              />
              <FeatureItem 
                icon={<MessageSquare />} 
                title="Gestão de Leads" 
                desc="Todos os contactos organizados num único painel, com histórico completo."
              />
              <FeatureItem 
                icon={<Users />} 
                title="Gestão de Equipa" 
                desc="Distribua leads e acompanhe o desempenho da sua equipa comercial."
              />
            </div>
          </div>

          {/* Produtividade & Tecnologia */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Produtividade & Tecnologia</h3>
              <div className="h-px flex-1 bg-slate-100"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureItem 
                icon={<Zap />} 
                title="IA Generativa" 
                desc="Crie descrições comerciais profissionais em segundos sem perder tempo."
              />
              <FeatureItem 
                icon={<ShieldCheck />} 
                title="Segurança" 
                desc="Os dados da sua imobiliária ficam totalmente isolados e protegidos."
              />
              <FeatureItem 
                icon={<Check />} 
                title="White Label" 
                desc="Trabalhe com a sua própria marca e identidade visual."
              />
              <FeatureItem 
                icon={<Smartphone />} 
                title="Mobile First" 
                desc="Gere imóveis e acompanhe leads diretamente no telemóvel."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="planos" className="py-32 max-w-7xl mx-auto px-6">
        <div className="bg-[#1c2d51] rounded-[4rem] p-12 md:p-24 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#357fb2] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight relative z-10">Pronto para transformar a sua agência?</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-12 text-lg font-medium relative z-10">Junte-se a centenas de profissionais que já modernizaram a sua forma de trabalhar.</p>
          <Link to="/planos" className="inline-flex bg-white text-[#1c2d51] px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-transform items-center gap-3 shadow-xl relative z-10">
            Ver Planos e Preços <ArrowRight />
          </Link>
        </div>
      </section>

      {/* Contact Section - Background escurecido para destaque e contraste premium */}
      <div className="bg-[#1c2d51] border-t border-white/5">
        <ContactSection 
          tenantId="imosuite-hq" 
          title="Fale com os nossos especialistas" 
          subtitle="Estamos prontos para ajudar a escalar a sua operação imobiliária com a melhor tecnologia do mercado."
        />
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="group">
    <div className="w-12 h-12 bg-slate-50 text-[#1c2d51] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1c2d51] group-hover:text-white transition-all">
      {icon}
    </div>
    <h4 className="font-black text-[#1c2d51] mb-2">{title}</h4>
    <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

export default Marketing;
