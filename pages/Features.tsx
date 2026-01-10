
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, Zap, MessageSquare, Building2, TrendingUp, Users, 
  ShieldCheck, Check, Smartphone, ArrowRight, Star 
} from 'lucide-react';
import SEO from '../components/SEO';

const FeaturesPage: React.FC = () => {
  return (
    <div className="bg-white pt-32 pb-20 font-brand">
      <SEO 
        title="Funcionalidades" 
        description="Explore as ferramentas que tornam o ImoSuite o sistema imobiliário mais avançado: CRM de leads, portais automáticos e Inteligência Artificial." 
      />
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black mb-6 uppercase tracking-wider">
            <Star size={14} fill="currentColor" /> Potência Máxima
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#1c2d51] mb-6 tracking-tighter">
            Potencialize a sua operação imobiliária.
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
            Centralize imóveis, contactos e processos comerciais num único sistema criado especificamente para consultores e imobiliárias que não têm tempo a perder.
          </p>
        </div>

        {/* Group 1: Gestão & Operação */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-slate-100"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Gestão & Operação</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Globe />} 
              title="Site Próprio" 
              desc="Tenha um site imobiliário profissional, sempre atualizado com os seus imóveis, pronto para gerar contactos sem esforço técnico."
            />
            <FeatureCard 
              icon={<Building2 />} 
              title="Gestão de Imóveis" 
              desc="Crie, edite e publique imóveis em poucos cliques, com controlo total do estado de cada negócio."
            />
            <FeatureCard 
              icon={<MessageSquare />} 
              title="Gestão de Leads" 
              desc="Todos os contactos organizados num único painel, com histórico completo e acompanhamento de cada oportunidade."
            />
            <FeatureCard 
              icon={<Users />} 
              title="Gestão de Equipa" 
              desc="Distribua leads, defina permissões e acompanhe o desempenho da sua equipa comercial em tempo real."
            />
          </div>
        </div>

        {/* Group 2: Produtividade & Tecnologia */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-slate-100"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Produtividade & Tecnologia</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Zap />} 
              title="IA Generativa" 
              desc="Crie descrições comerciais profissionais em segundos e publique imóveis mais rápido, sem perder tempo a escrever textos."
            />
            <FeatureCard 
              icon={<Check />} 
              title="White Label" 
              desc="Trabalhe com a sua própria marca, domínio e identidade visual, como se o sistema fosse seu."
            />
            <FeatureCard 
              icon={<Smartphone />} 
              title="Mobile First" 
              desc="Gere imóveis, responda a clientes e acompanhe leads diretamente no telemóvel, em qualquer lugar."
            />
            <FeatureCard 
              icon={<ShieldCheck />} 
              title="Segurança de Dados" 
              desc="Os dados da sua imobiliária ficam totalmente isolados e protegidos, garantindo privacidade absoluta."
            />
          </div>
        </div>

        {/* Final Phrase & CTA */}
        <div className="bg-[#1c2d51] rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#357fb2] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <p className="text-xl md:text-2xl font-black mb-12 opacity-90">
              Tudo o que precisa para gerir e vender imóveis, num único sistema.
            </p>
            <Link to="/planos" className="inline-flex items-center gap-3 bg-white text-[#1c2d51] px-12 py-6 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-all">
              Ver Planos e Preços <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-xl transition-all duration-300">
    <div className="w-14 h-14 bg-white text-[#1c2d51] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
      {icon}
    </div>
    <h3 className="text-xl font-black mb-3 text-[#1c2d51]">{title}</h3>
    <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

export default FeaturesPage;
