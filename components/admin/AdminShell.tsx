
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { 
  LogOut, Bell, ChevronLeft, ChevronRight, LayoutDashboard, 
  Building2, MessageSquare, Users, Globe, Settings, Sparkles, Zap
} from 'lucide-react';
import { collection, query, where, onSnapshot } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { SubscriptionService } from '../../services/subscriptionService';

const AdminShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { hasAccess, daysLeft } = SubscriptionService.checkAccess(tenant, user?.email);

  useEffect(() => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    const q = query(collection(db, "tenants", profile.tenantId, "leads"), where("lido", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => setUnreadCount(snapshot.size));
    return () => unsubscribe();
  }, [profile?.tenantId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Imóveis', path: '/admin/imoveis', icon: <Building2 size={18} /> },
    { name: 'Website & CMS', path: '/admin/cms', icon: <Globe size={18} /> },
    { name: 'Leads', path: '/admin/leads', icon: <MessageSquare size={18} />, badge: unreadCount },
    { name: 'Utilizadores', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Configurações', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  const getBreadcrumb = () => {
    const path = location.pathname.split('/').filter(Boolean);
    if (path.length <= 1) return 'BACKOFFICE / DASHBOARD';
    return `BACKOFFICE / ${path[path.length - 1].toUpperCase().replace('-', ' ')}`;
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7FA] font-brand overflow-hidden">
      {/* Sidebar - Estilo Screenshot */}
      <aside className={`bg-white border-r border-slate-100 transition-all duration-300 flex flex-col z-40 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="p-6 flex items-center justify-between h-20 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-3 truncate">
              <span className="font-black text-[#1c2d51] text-lg tracking-tight">
                {tenant.nome || 'ImoSuite'}
              </span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-300">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                  isActive 
                    ? 'bg-[#1c2d51] text-white shadow-lg shadow-[#1c2d51]/20' 
                    : 'text-slate-400 hover:text-[#1c2d51] hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#1c2d51]'}>{item.icon}</span>
                {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
                {item.badge !== undefined && item.badge > 0 && !isCollapsed && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Trial Banner - Conforme solicitado */}
        {!isCollapsed && daysLeft <= 14 && (
          <div className="mx-4 mb-4 p-5 bg-gradient-to-br from-[#1c2d51] to-[#357fb2] rounded-2xl text-white shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-yellow-400" />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Período Trial</span>
              </div>
              <p className="text-2xl font-black tracking-tighter mb-1">{daysLeft} dias</p>
              <p className="text-[10px] font-bold opacity-70 mb-4 uppercase tracking-tight">Restantes no seu plano.</p>
              <Link to="/planos" className="block w-full bg-white text-[#1c2d51] py-2 rounded-lg text-center font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                Fazer Upgrade
              </Link>
            </div>
            <Zap size={60} className="absolute -right-4 -bottom-4 text-white opacity-5 rotate-12" />
          </div>
        )}

        <div className="p-4 border-t border-slate-50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
            {!isCollapsed && <span className="font-bold text-sm tracking-tight">Terminar Sessão</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Estilo Screenshot */}
        <header className="h-20 flex items-center justify-between px-10 shrink-0 bg-transparent">
          <div className="text-[10px] font-black tracking-[0.15em] text-slate-300">
            {getBreadcrumb()}
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-300 hover:text-[#1c2d51] transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-[#1c2d51] tracking-tight">{tenant.nome || 'Minha Agência'}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{profile?.role === 'admin' ? 'Administrador' : 'Consultor'}</p>
              </div>
              <div className="w-10 h-10 bg-[#1c2d51] text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-[#1c2d51]/20">
                {tenant.nome?.charAt(0) || 'D'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-10 pt-4 overflow-y-auto relative scrollbar-hide">
          {hasAccess ? children : (
            <div className="absolute inset-0 z-50 bg-[#F4F7FA]/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-500">
               <div className="max-w-md w-full bg-white p-12 rounded-3xl shadow-2xl text-center border border-slate-100">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><Zap size={32} /></div>
                  <h2 className="text-2xl font-black text-[#1c2d51] tracking-tight">Período Expirado</h2>
                  <p className="text-slate-500 font-medium mt-2 mb-8 leading-relaxed">O seu tempo de teste gratuito terminou. Subscreva um plano para continuar.</p>
                  <Link to="/planos" className="block w-full bg-[#1c2d51] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl">Escolher Plano</Link>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
