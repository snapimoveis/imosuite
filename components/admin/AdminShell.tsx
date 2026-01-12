
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
    { name: 'Dashboard', path: '/admin', icon: <BarChart3 size={18} /> },
    { name: 'Imóveis', path: '/admin/imoveis', icon: <Building2 size={18} /> },
    { name: 'Website & CMS', path: '/admin/cms', icon: <Globe size={18} /> },
    { name: 'Leads', path: '/admin/leads', icon: <MessageSquare size={18} />, badge: unreadCount },
    { name: 'Utilizadores', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Configurações', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-brand overflow-hidden">
      {/* Sidebar - Visual Refinado e Padrão */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-40 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="p-6 flex items-center justify-between h-20 shrink-0 border-b border-slate-50">
          {!isCollapsed && (
            <div className="flex items-center gap-3 truncate">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt="Logo" className="h-8 w-auto object-contain" />
              ) : (
                <div className="w-8 h-8 bg-[#1c2d51] rounded-lg flex items-center justify-center text-white text-[10px] font-black">IS</div>
              )}
              <span className="font-black text-[#1c2d51] tracking-tighter">ImoSuite</span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                  isActive 
                    ? 'bg-[#1c2d51] text-white shadow-md' 
                    : 'text-slate-500 hover:text-[#1c2d51] hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#1c2d51]'}>{item.icon}</span>
                {!isCollapsed && <span className="font-bold text-sm">{item.name}</span>}
                {item.badge > 0 && !isCollapsed && (
                  <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="mx-4 mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plano Trial</p>
              <div className="mb-4">
                <p className="text-2xl font-black text-[#1c2d51] tracking-tight">{user?.email === 'snapimoveis@gmail.com' ? 'Acesso Total' : '14 dias restantes'}</p>
              </div>
              <Link to="/planos" className="w-full bg-[#1c2d51] hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                Upgrade Plano
              </Link>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-slate-50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
            {!isCollapsed && <span className="font-bold text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 lg:p-10 overflow-y-auto relative scrollbar-hide">
          {hasAccess ? children : (
            <div className="absolute inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-500">
               <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center border border-slate-200">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><Lock size={32} /></div>
                  <h2 className="text-2xl font-black text-[#1c2d51]">Acesso Restrito</h2>
                  <p className="text-slate-500 font-medium mt-2 mb-8">Ative a sua subscrição para continuar a gerir a sua agência.</p>
                  <Link to="/planos" className="block w-full bg-[#1c2d51] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg">Escolher Plano</Link>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
