
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { ADMIN_NAV_ITEMS } from '../../constants.tsx';
import { LogOut, Bell, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';

const AdminShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-brand">
      <aside className={`bg-white border-r transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6 border-b flex items-center justify-between">
          {!isCollapsed && <span className="font-black text-lg text-[#1c2d51] truncate">{tenant.nome}</span>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-[#1c2d51] text-white shadow-xl' : 'text-slate-400 hover:text-[#1c2d51]'}`}>
                {item.icon}
                {!isCollapsed && <span className="font-bold text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-red-600 rounded-xl">
            <LogOut size={20} />
            {!isCollapsed && <span className="font-bold text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">
            Backoffice / <span className="text-[#1c2d51]">{ADMIN_NAV_ITEMS.find(i => i.path === location.pathname)?.name || 'Painel'}</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-300">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-[#1c2d51]">{profile?.displayName || user?.displayName || 'Admin'}</div>
                <div className="text-[8px] text-slate-400 font-bold uppercase">{profile?.role || 'Acesso Restrito'}</div>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-[#1c2d51] text-white flex items-center justify-center font-black">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
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

export default AdminShell;
