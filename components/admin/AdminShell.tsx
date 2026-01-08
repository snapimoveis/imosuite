
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { ADMIN_NAV_ITEMS } from '../../constants.tsx';
import { 
  LogOut, Bell, ChevronLeft, ChevronRight, User as UserIcon, 
  Settings, Building2, Brush, Globe, Shield, CreditCard, 
  Languages, BellRing, ChevronDown, CheckCircle2, Layout
} from 'lucide-react';

const AdminShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-brand selection:bg-[#1c2d51] selection:text-white">
      {/* Sidebar */}
      <aside className={`bg-white border-r transition-all duration-500 flex flex-col z-40 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6 border-b flex items-center justify-between h-16">
          {!isCollapsed && (
            <div className="flex items-center gap-2 truncate">
              {tenant.logo_url && <img src={tenant.logo_url} alt="Logo" className="w-6 h-6 object-contain" />}
              <span className="font-black text-lg text-[#1c2d51] truncate">{tenant.nome}</span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-300 transition-colors">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive 
                  ? 'bg-[#1c2d51] text-white shadow-xl shadow-slate-900/10' 
                  : 'text-slate-400 hover:text-[#1c2d51] hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-300'}>{item.icon}</span>
                {!isCollapsed && <span className="font-bold text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-slate-300 hover:text-red-500 rounded-xl transition-colors">
            <LogOut size={20} />
            {!isCollapsed && <span className="font-bold text-sm">Terminar Sessão</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
            Backoffice / <span className="text-[#1c2d51]">{ADMIN_NAV_ITEMS.find(i => i.path === location.pathname)?.name || 'Painel'}</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-300 hover:text-[#1c2d51] transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Account Trigger */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-3 p-1 rounded-2xl transition-all hover:bg-slate-50 ${isMenuOpen ? 'bg-slate-50 ring-1 ring-slate-100' : ''}`}
              >
                <div className="text-right hidden sm:block pl-2">
                  <div className="text-[11px] font-black text-[#1c2d51] leading-none mb-0.5">{tenant.nome}</div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{profile?.role === 'admin' ? 'Administrador' : 'Equipa'}</div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#1c2d51] text-white flex items-center justify-center font-black shadow-lg shadow-[#1c2d51]/20 relative overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.email?.charAt(0).toUpperCase()
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3 h-3 rounded-full border-2 border-white"></div>
                </div>
                <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN MENU */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-slate-100 py-6 px-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-6 pb-6 border-b border-slate-50 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#1c2d51] flex items-center justify-center font-black text-lg border border-slate-100 overflow-hidden">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          user?.email?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-black text-sm text-[#1c2d51]">{profile?.displayName || 'Utilizador'}</div>
                        <div className="text-[9px] text-slate-400 font-bold truncate w-40">{user?.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="px-6 py-2 text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">Pessoal</p>
                    <MenuLink to="/admin/profile" icon={<UserIcon size={16}/>} label="Perfil pessoal" sub="Gerir conta e segurança" />
                    
                    {isAdmin && (
                      <>
                        <div className="pt-3">
                          <p className="px-6 py-2 text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">Imobiliária</p>
                          <MenuLink to="/admin/settings" icon={<Building2 size={16}/>} label="Dados da empresa" sub="Fiscais e morada" />
                          <MenuLink to="/admin/settings?tab=branding" icon={<Brush size={16}/>} label="Identidade visual" sub="Logo, cores e branding" />
                        </div>
                        
                        <div className="pt-3">
                          <p className="px-6 py-2 text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">Plataforma</p>
                          <MenuLink to="/admin/settings?tab=website" icon={<Globe size={16}/>} label="Website & Domínio" sub="Templates e SEO" />
                          <MenuLink to="/admin/settings?tab=system" icon={<Settings size={16}/>} label="Preferências" sub="Idioma e moeda" />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 px-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut size={16} />
                        <span className="font-black text-[11px] uppercase tracking-widest">Sair da Sessão</span>
                      </div>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-200">ImoSuite SaaS v1.0.4</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const MenuLink = ({ to, icon, label, sub }: { to: string, icon: any, label: string, sub: string }) => (
  <Link 
    to={to} 
    className="flex items-center gap-4 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all group"
  >
    <div className="text-slate-300 group-hover:text-[#1c2d51] transition-colors">{icon}</div>
    <div className="flex-1">
      <div className="font-black text-[11px] text-[#1c2d51] uppercase tracking-tighter leading-none mb-0.5">{label}</div>
      <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{sub}</div>
    </div>
  </Link>
);

export default AdminShell;
