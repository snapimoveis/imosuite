import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

// Versão otimizada e limpa da string Base64 do Livro de Reclamações
const COMPLAINTS_BOOK_BASE64 = "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";

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
            <a 
              href="https://www.livroreclamacoes.pt" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-opacity hover:opacity-80"
            >
              <img 
                src={`data:image/png;base64,${COMPLAINTS_BOOK_BASE64}`} 
                alt="Livro de Reclamações Online"
                className="h-12 w-auto"
              />
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
          <a href="https://www.linkedin.com/company/imosuite" target="_blank" rel="noopener noreferrer" className="hover:text-[#1c2d51] transition-colors">LinkedIn</a>
          <a href="https://www.instagram.com/imosuite.pt/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1c2d51] transition-colors">Instagram</a>
          <a href="https://www.facebook.com/profile.php?id=61586140689774" target="_blank" rel="noopener noreferrer" className="hover:text-[#1c2d51] transition-colors">Facebook</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;