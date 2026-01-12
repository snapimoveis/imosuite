
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { ADMIN_NAV_ITEMS } from '../../constants.tsx';
import { 
  LogOut, Bell, ChevronLeft, ChevronRight, User as UserIcon, 
  Settings, Building2, BellRing, ChevronDown, CheckCircle2, 
  X, AlertTriangle, CreditCard, Lock, Sparkles, Zap
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

  const { hasAccess, isTrial, daysLeft } = SubscriptionService.checkAccess(tenant, user?.email);

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

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-brand overflow-hidden">
      {/* Sidebar - Visualmente idêntica ao screenshot */}
      <aside className={`bg-white border-r border-slate-100 transition-all duration-500 flex flex-col z-40 ${isCollapsed ? 'w-24' : 'w-80'}`}>
        <div className="p-8 border-b border-slate-50 flex items-center justify-between h-24 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-3 truncate">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt="Logo" className="h-10 w-auto object-contain drop-shadow-sm" />
              ) : (
                <div className="w-10 h-10 bg-[var(--primary)] rounded-2xl flex items-center justify-center text-white text-[10px] font-black">IS</div>
              )}
              <span className="font-black text-xl text-[#1c2d51] tracking-tighter truncate">{tenant.nome}</span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-300">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const isDisabled = !hasAccess && item.path !== '/admin/settings';
            
            return (
              <Link 
                key={item.path} 
                to={isDisabled ? '#' : item.path} 
                className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all relative group ${
                  isActive 
                    ? 'bg-[#1c2d51] text-white shadow-2xl shadow-[#1c2d51]/20 scale-[1.02]' 
                    : 'text-slate-400 hover:text-[#1c2d51] hover:bg-slate-50'
                } ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-[#1c2d51]'}>{item.icon}</span>
                {!isCollapsed && <span className="font-black text-xs uppercase tracking-widest">{item.name}</span>}
                {isActive && !isCollapsed && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"></div>}
              </Link>
            );
          })}
        </nav>

        {/* TRIAL BANNER - Conforme Screenshot */}
        {!isCollapsed && isTrial && (
          <div className="mx-6 mb-8 p-8 bg-[#1c2d51] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] rounded-full blur-[60px] opacity-40 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/10 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">
                  PERÍODO TRIAL
                </div>
                <Sparkles size={16} className="text-blue-300 animate-pulse" />
              </div>
              
              <div className="space-y-1 mb-6">
                <p className="text-4xl font-black tracking-tighter leading-none">
                  {user?.email === 'snapimoveis@gmail.com' ? 'Vitalício' : `${daysLeft} dias restantes`}
                </p>
                <p className="text-[10px] font-bold text-slate-300 uppercase leading-relaxed tracking-tight">
                  Aproveite todas as funções Business grátis.
                </p>
              </div>

              {user?.email !== 'snapimoveis@gmail.com' && (
                <Link 
                  to="/planos" 
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl"
                >
                  <Zap size={14} fill="currentColor" /> Assinar Agora
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="p-6 border-t border-slate-50 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-slate-300 hover:text-red-500 transition-colors">
            <LogOut size={22} />
            {!isCollapsed && <span className="font-black text-xs uppercase tracking-widest">Sair do Painel</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-50 flex items-center justify-between px-10 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
             <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                Backoffice / <span className="text-[#1c2d51]">{ADMIN_NAV_ITEMS.find(i => i.path === location.pathname)?.name || 'Painel'}</span>
             </div>
          </div>

          <div className="flex items-center gap-8">
            <Link to="/admin/leads" className="relative p-3 text-slate-300 hover:text-[#1c2d51] transition-all hover:scale-110">
              <Bell size={24} />
              {unreadCount > 0 && <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-4 border-white font-black">{unreadCount}</span>}
            </Link>

            <div className="relative group">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="w-11 h-11 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center font-black shadow-xl">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover rounded-2xl" alt="User" /> : user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block leading-none">
                   <p className="font-black text-sm text-[#1c2d51]">{profile?.displayName?.split(' ')[0]}</p>
                   <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Administrador</p>
                </div>
                <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-12 overflow-y-auto relative scrollbar-hide">
          {hasAccess ? children : (
            <div className="absolute inset-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-700">
               <div className="max-w-md w-full bg-white p-14 rounded-[4rem] shadow-2xl text-center space-y-10 border border-slate-100">
                  <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                    <Lock size={48} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-[#1c2d51] tracking-tighter">Período de Teste Terminou</h2>
                    <p className="text-slate-500 font-medium mt-4 text-lg">A sua agência está temporariamente offline. Ative um plano para retomar a gestão.</p>
                  </div>
                  <Link 
                    to="/planos"
                    className="w-full bg-[#1c2d51] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:-translate-y-1 transition-all"
                  >
                    <CreditCard size={20} /> Escolher Plano
                  </Link>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
