import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="py-24 bg-white text-slate-400 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-20">
        <div className="col-span-1 md:col-span-2">
          <Logo size="lg" />
          <p className="mt-8 text-lg max-w-sm font-medium leading-relaxed">
            Inovação no mercado imobiliário português através de tecnologia simplificada e eficiente. Elevamos o padrão da sua agência.
          </p>
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
            <li><Link to="/privacidade" className="hover:text-[#1c2d51] transition-colors">Privacidade</Link></li>
            <li><Link to="/termos" className="hover:text-[#1c2d51] transition-colors">Termos de Uso</Link></li>
            <li><Link to="/resolucao-de-litigios" className="hover:text-[#1c2d51] transition-colors">Resolução de Litígios</Link></li>
            <li><a href="https://www.livroreclamacoes.pt/Inicio/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1c2d51] transition-colors">Livro de Reclamações</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-16 mt-16 border-t border-slate-50 text-xs font-bold flex flex-col md:flex-row justify-between items-center gap-6">
        <span>&copy; {new Date().getFullYear()} ImoSuite SaaS. Todos os direitos reservados.</span>
        <div className="flex gap-8">
          <a href="https://www.linkedin.com/company/imosuite" target="_blank" rel="noopener noreferrer" className="hover:text-[#1c2d51] transition-colors">LinkedIn</a>
          <a href="https://www.instagram.com/imosuite.pt/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1c2d51] transition-colors">Instagram</a>
          <a href="https://www.facebook.com/profile.php?id=61586140689774" target="_blank" rel="noopener noreferrer" className="hover:text-[#1c2d51] transition-colors">Facebook</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;