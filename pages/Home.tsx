
import React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { Search, ChevronRight, CheckCircle2 } from 'lucide-react';
import ImovelCard from '../components/ImovelCard';
import { MOCK_IMOVEIS } from '../mocks';

const Home: React.FC = () => {
  const { tenant } = useTenant();
  // Fix: access destaque via publicacao.destaque
  const featuredProperties = MOCK_IMOVEIS.filter(i => i.publicacao.destaque).slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 max-w-4xl px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Encontre o seu próximo <span className="text-[var(--secondary)]">lar perfeito</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Descubra as melhores oportunidades em Portugal com {tenant.nome}.
          </p>
          
          <div className="bg-white p-2 md:p-4 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-lg border border-gray-100">
              <Search className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Ex: Apartamento em Lisboa..." 
                className="w-full py-4 bg-transparent outline-none text-gray-700"
              />
            </div>
            <button className="bg-[var(--primary)] text-white px-10 py-4 rounded-lg font-bold hover:opacity-95 transition-opacity">
              Procurar
            </button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Imóveis em Destaque</h2>
            <p className="text-gray-500 max-w-md">As propriedades mais exclusivas e procuradas da nossa carteira.</p>
          </div>
          <a href="#/imoveis" className="hidden md:flex items-center gap-2 text-[var(--primary)] font-bold hover:underline">
            Ver catálogo completo <ChevronRight size={20} />
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map(imovel => (
            <ImovelCard key={imovel.id} imovel={imovel} />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Porquê escolher a {tenant.nome}?</h2>
            <div className="w-20 h-1.5 bg-[var(--primary)] mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Experiência de Mercado', desc: 'Mais de 15 anos a realizar sonhos em Portugal.' },
              { title: 'Tecnologia de Ponta', desc: 'SaaS exclusivo para maior rapidez e eficiência.' },
              { title: 'Atendimento Personalizado', desc: 'Cada cliente é único e merece total atenção.' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-8 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                <CheckCircle2 className="w-12 h-12 text-[var(--secondary)] mb-6" />
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;