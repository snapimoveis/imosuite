
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { 
  LogOut, Bell, ChevronLeft, ChevronRight, User as UserIcon, 
  Settings, Building2, ChevronDown, CheckCircle2, 
  X, AlertTriangle, CreditCard, Lock, Sparkles, Zap, User,
  LayoutGrid, MessageSquare, Users, Globe, BarChart3
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

  const { hasAccess } = SubscriptionService.checkAccess(tenant, user?.email);

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
    { name: 'Dashboard', path: '/admin', icon: <BarChart3 size={20} /> },
    { name: 'Imóveis', path: '/admin/imoveis', icon: <Building2 size={20} /> },
    { name: 'Website & CMS', path: '/admin/cms', icon: <Globe size={20} /> },
    { name: 'Leads', path: '/admin/leads', icon: <MessageSquare size={20} />, badge: unreadCount },
    { name: 'Utilizadores', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Configurações', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-brand">
      {/* Sidebar - Retornada ao estilo limpo */}
      <aside className={`bg-[#1c2d51] text-white transition-all duration-300 flex flex-col z-40 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="p-6 flex items-center justify-between h-20 shrink-0 border-b border-white/5">
          {!isCollapsed && (
            <div className="font-black text-xl tracking-tighter flex items-center gap-2">
              <div className="w-8 h-8 bg-white text-[#1c2d51] rounded-lg flex items-center justify-center text-xs">IS</div>
              <span>ImoSuite</span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative group ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={isActive ? 'text-blue-400' : ''}>{item.icon}</span>
                {!isCollapsed && <span className="font-bold text-sm">{item.name}</span>}
                {item.badge > 0 && !isCollapsed && (
                  <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                    {item.badge}
                  </span>
                )}
                {isActive && isCollapsed && (
                  <div className="absolute left-0 w-1 h-6 bg-blue-400 rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 text-white/40 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            {!isCollapsed && <span className="font-bold text-sm">Terminar Sessão</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative bg-[#F8FAFC]">
          {hasAccess ? children : (
            <div className="absolute inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-6">
               <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-xl text-center border border-slate-100">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><Lock size={32} /></div>
                  <h2 className="text-2xl font-black text-[#1c2d51]">Acesso Bloqueado</h2>
                  <p className="text-slate-500 font-medium mt-2 mb-8">A sua subscrição expirou. Escolha um plano para continuar.</p>
                  <Link to="/planos" className="block w-full bg-[#1c2d51] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg">Ver Planos</Link>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
