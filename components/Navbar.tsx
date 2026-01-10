
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  // Determine if we are in the real estate demo or SaaS marketing
  const isDemo = location.pathname.startsWith('/demo') || location.pathname.startsWith('/imovel');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50 h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        <Link to="/"><Logo size="md" /></Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/funcionalidades" className={`text-sm font-bold ${location.pathname === '/funcionalidades' ? 'text-[#1c2d51]' : 'text-slate-600 hover:text-[#1c2d51]'}`}>Funcionalidades</Link>
          <Link to="/planos" className={`text-sm font-bold ${location.pathname === '/planos' ? 'text-[#1c2d51]' : 'text-slate-600 hover:text-[#1c2d51]'}`}>Planos</Link>
          <Link to="/demo" className={`text-sm font-bold ${isDemo ? 'text-[#1c2d51]' : 'text-slate-600 hover:text-[#1c2d51]'}`}>Demo</Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-700 px-4 hover:text-[#1c2d51]">Iniciar Sessão</Link>
            <Link to="/register" className="bg-[#1c2d51] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 transition-all">
              Criar Conta
            </Link>
          </div>
          
          {/* Mobile Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-[#1c2d51] p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300 shadow-xl md:hidden">
          <Link to="/funcionalidades" onClick={() => setIsOpen(false)} className="text-lg font-bold text-[#1c2d51]">Funcionalidades</Link>
          <Link to="/planos" onClick={() => setIsOpen(false)} className="text-lg font-bold text-[#1c2d51]">Planos</Link>
          <Link to="/demo" onClick={() => setIsOpen(false)} className="text-lg font-bold text-[#1c2d51]">Demo</Link>
          <hr className="border-slate-100" />
          <div className="flex flex-col gap-4">
            <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-3 font-bold text-slate-600">Iniciar Sessão</Link>
            <Link to="/register" onClick={() => setIsOpen(false)} className="bg-[#1c2d51] text-white py-4 rounded-2xl text-center font-bold">Criar Conta</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
