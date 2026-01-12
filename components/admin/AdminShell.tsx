
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { 
  LogOut, Bell, ChevronLeft, ChevronRight, LayoutDashboard, 
  Building2, MessageSquare, Users, Globe, Settings, Sparkles, Zap, User, ChevronDown
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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { hasAccess, daysLeft } = SubscriptionService.checkAccess(tenant, user?.email);

  useEffect(() => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    const q = query(collection(db, "tenants", profile.tenantId, "leads"), where("lido", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => setUnreadCount(snapshot.size));
    return () => unsubscribe();
  }, [profile?.tenantId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="flex min-h-screen bg-[#F4F7FA] font-brand overflow-hidden text-slate-900">
      {/* Sidebar - Estilo Original Aprovado */}
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

        {!isCollapsed && daysLeft <= 14 && (
          <div className="mx-4 mb-4 p-5 bg-gradient-to-br from-[#1c2d51] to-[#357fb2] rounded-2xl text-white shadow-lg relative overflow-hidden group">
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles size={12} className="text-yellow-400" />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Período Trial</span>
              </div>
              <p className="text-xl font-black tracking-tighter mb-1">{daysLeft} dias restantes</p>
              <Link to="/planos" className="block w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-center font-black text-[9px] uppercase tracking-widest transition-all mt-4 border border-white/20">
                Fazer Upgrade
              </Link>
            </div>
            <Zap size={60} className="absolute -right-4 -bottom-4 text-white opacity-5 rotate-12" />
          </div>
        )}

        <div className="p-4 border-t border-slate-50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-red-500 transition-colors">
            <LogOut size={18} />
            {!isCollapsed && <span className="font-bold text-sm tracking-tight">Terminar Sessão</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Header - Widget de Perfil como Cartão Branco */}
        <header className="h-24 flex items-center justify-between px-10 shrink-0 bg-transparent relative z-50">
          <div className="text-[10px] font-black tracking-[0.15em] text-slate-300">
            {getBreadcrumb()}
          </div>
          
          <div className="flex items-center gap-6">
            {/* Sino com Badge de Notificação Visual */}
            <button className="relative w-12 h-12 flex items-center justify-center text-slate-300 hover:text-[#1c2d51] hover:bg-white rounded-full transition-all">
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[#F4F7FA] animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Widget de Perfil - Cartão Branco Estilo Screenshot */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-[1.75rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-[#1c2d51] tracking-tight">
                    {profile?.displayName?.split(' ')[0] || tenant.nome || 'Agência'}
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                    {profile?.role === 'admin' ? 'Administrador' : 'Consultor'}
                  </p>
                </div>
                
                {/* Avatar / Logo à Direita */}
                <div className="w-11 h-11 bg-slate-50 rounded-full flex items-center justify-center font-black text-xs text-[#1c2d51] border border-slate-100 relative overflow-hidden shadow-inner">
                  {profile?.avatar_url || tenant.logo_url ? (
                    <img src={profile?.avatar_url || tenant.logo_url} className="w-full h-full object-cover" alt="User" />
                  ) : (
                    <span>{tenant.nome?.charAt(0) || 'D'}</span>
                  )}
                </div>
                
                <ChevronDown size={14} className={`text-slate-200 group-hover:text-[#1c2d51] transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Flutuante */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-5 py-2 mb-2 border-b border-slate-50">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sessão Iniciada</p>
                  </div>
                  <Link to="/admin/profile" onClick={() => setShowProfileDropdown(false)} className="flex items-center gap-3 px-5 py-3 text-slate-600 hover:bg-slate-50 hover:text-[#1c2d51] transition-all">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><User size={16} /></div>
                    <span className="text-sm font-bold">O Meu Perfil</span>
                  </Link>
                  <Link to="/admin/settings" onClick={() => setShowProfileDropdown(false)} className="flex items-center gap-3 px-5 py-3 text-slate-600 hover:bg-slate-50 hover:text-[#1c2d51] transition-all">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><Settings size={16} /></div>
                    <span className="text-sm font-bold">Configurações</span>
                  </Link>
                  <div className="h-px bg-slate-50 my-2 mx-5"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50 transition-all">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-400"><LogOut size={16} /></div>
                    <span className="text-sm font-bold">Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-10 pt-4 overflow-y-auto relative scrollbar-hide">
          {hasAccess ? children : (
            <div className="absolute inset-0 z-[60] bg-[#F4F7FA]/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-500">
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
