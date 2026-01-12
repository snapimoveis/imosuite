
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { ADMIN_NAV_ITEMS } from '../../constants.tsx';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const { hasAccess, isTrial, daysLeft } = SubscriptionService.checkAccess(tenant, user?.email);

  useEffect(() => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    const q = query(collection(db, "tenants", profile.tenantId, "leads"), where("lido", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => setUnreadCount(snapshot.size));
    return () => unsubscribe();
  }, [profile?.tenantId]);

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
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'DASHBOARD', path: '/admin', icon: <BarChart3 size={18} /> },
    { name: 'IMÓVEIS', path: '/admin/imoveis', icon: <Building2 size={18} /> },
    { name: 'WEBSITE & CMS', path: '/admin/cms', icon: <Globe size={18} /> },
    { name: 'LEADS', path: '/admin/leads', icon: <MessageSquare size={18} /> },
    { name: 'UTILIZADORES', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'CONFIGURAÇÕES', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-brand overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-100 transition-all duration-500 flex flex-col z-40 ${isCollapsed ? 'w-24' : 'w-80'}`}>
        <div className="p-8 flex items-center justify-between h-24 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-3 truncate">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 bg-[#1c2d51] rounded-2xl flex items-center justify-center text-white text-[10px] font-black">IS</div>
              )}
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-300">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/admin/settings' && location.pathname.includes('/admin/settings'));
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all relative group ${
                  isActive 
                    ? 'bg-[#1c2d51] text-white shadow-2xl shadow-[#1c2d51]/20' 
                    : 'text-slate-400 hover:text-[#1c2d51]'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-[#1c2d51]'}>{item.icon}</span>
                {!isCollapsed && <span className="font-black text-[11px] uppercase tracking-[0.15em]">{item.name}</span>}
                {isActive && !isCollapsed && <div className="absolute right-6 w-2 h-2 bg-white rounded-full"></div>}
              </Link>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="mx-6 mb-8 p-8 bg-[#1c2d51] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-4 right-4"><Sparkles size={16} className="text-blue-300 opacity-50" /></div>
            <div className="relative z-10">
              <div className="bg-white/10 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 w-fit mb-4">PERÍODO TRIAL</div>
              <div className="mb-6">
                <p className="text-5xl font-black tracking-tighter leading-none">{user?.email === 'snapimoveis@gmail.com' ? 'Full' : '14 dias'}</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight mt-2">Aproveite todas as funções grátis.</p>
              </div>
              <Link to="/planos" className="w-full bg-[#4081ff] hover:bg-blue-400 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl">
                <Zap size={14} fill="currentColor" /> Assinar Agora
              </Link>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-slate-50 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-slate-300 hover:text-red-500 transition-colors">
            <LogOut size={22} />
            {!isCollapsed && <span className="font-black text-[11px] uppercase tracking-widest">Sair do Painel</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <main className="flex-1 p-12 overflow-y-auto relative scrollbar-hide">
          {hasAccess ? children : (
            <div className="absolute inset-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-700">
               <div className="max-w-md w-full bg-white p-14 rounded-[4rem] shadow-2xl text-center space-y-10 border border-slate-100">
                  <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner"><Lock size={48} /></div>
                  <div>
                    <h2 className="text-4xl font-black text-[#1c2d51] tracking-tighter">Acesso Restrito</h2>
                    <p className="text-slate-500 font-medium mt-4 text-lg">Ative a sua subscrição para continuar.</p>
                  </div>
                  <Link to="/planos" className="w-full bg-[#1c2d51] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:-translate-y-1 transition-all"><CreditCard size={20} /> Escolher Plano</Link>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
