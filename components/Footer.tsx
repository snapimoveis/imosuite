import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const ComplaintsBookSVG = () => (
  <svg 
    id="Camada_1" 
    data-name="Camada 1" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 140 58" 
    className="h-12 w-auto"
  >
    <image 
      width="140" 
      height="58" 
      href="data:image/png;base64,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" 
    />
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="py-24 bg-white text-slate-400 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-20">
        <div className="col-span-1 md:col-span-2">
          <Logo size="lg" />
          <p className="mt-8 text-lg max-w-sm font-medium leading-relaxed">
            Inovação no mercado imobiliário português através de tecnologia simplificada e eficiente. Elevamos o padrão da sua agência.
          </p>
          <div className="mt-8">
            <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer" className="inline-block transition-opacity hover:opacity-80">
              <ComplaintsBookSVG />
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="font-black text-[#1c2d51] mb-8 uppercase tracking-widest text-xs">Produto</h4>
          <ul className="space-y-4 text-sm font-bold">
            <li><Link to="/demo" className="hover:text-[#1c2d51] transition-colors">Demo</Link></li>
            <li><Link to="/funcionalidades" className="hover:text-[#1c2d51] transition-colors">Funcionalidades</Link></li>
            <li><Link to="/planos" className="hover:text-[#1c2d51] transition-colors">Preços</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-black text-[#1c2d51] mb-8 uppercase tracking-widest text-xs">Empresa</h4>
          <ul className="space-y-4 text-sm font-bold">
            <li><a href="#" className="hover:text-[#1c2d51] transition-colors">Sobre nós</a></li>
            <li><Link to="/privacidade" className="hover:text-[#1c2d51] transition-colors">Privacidade</Link></li>
            <li><Link to="/termos" className="hover:text-[#1c2d51] transition-colors">Termos de Uso</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-16 mt-16 border-t border-slate-50 text-xs font-bold flex flex-col md:flex-row justify-between items-center gap-6">
        <span>&copy; {new Date().getFullYear()} ImoSuite SaaS. Todos os direitos reservados.</span>
        <div className="flex gap-8">
          <a 
            href="https://www.linkedin.com/company/imosuite" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#1c2d51] transition-colors"
          >
            LinkedIn
          </a>
          <a 
            href="https://www.instagram.com/imosuite.pt/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#1c2d51] transition-colors"
          >
            Instagram
          </a>
          <a 
            href="https://www.facebook.com/profile.php?id=61586140689774" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#1c2d51] transition-colors"
          >
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;