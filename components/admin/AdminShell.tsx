
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
import { Lead } from '../../types';
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

  // Verificação de Acesso (Trial / Subscrição) - Passando o email para bypass do dono
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
    <div className="flex min-h-screen bg-slate-50 font-brand">
      {/* Sidebar */}
      <aside className={`bg-white border-r transition-all duration-500 flex flex-col z-40 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="p-6 border-b flex items-center justify-between h-16 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2 truncate">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt="Logo" className="w-6 h-6 object-contain" />
              ) : (
                <div className="w-6 h-6 bg-[#1c2d51] rounded-lg flex items-center justify-center text-white text-[8px] font-black">IS</div>
              )}
              <span className="font-black text-lg text-[#1c2d51] truncate">{tenant.nome}</span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-300">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const isDisabled = !hasAccess && item.path !== '/admin/settings';
            
            return (
              <Link 
                key={item.path} 
                to={isDisabled ? '#' : item.path} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all relative group ${
                  isActive ? 'bg-[#1c2d51] text-white shadow-xl' : 'text-slate-400 hover:text-[#1c2d51] hover:bg-slate-50'
                } ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-[#1c2d51]'}>{item.icon}</span>
                {!isCollapsed && <span className="font-bold text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* TRIAL BANNER / UPGRADE SECTION */}
        {!isCollapsed && isTrial && (
          <div className="mx-4 mb-4 p-5 bg-gradient-to-br from-slate-900 to-[#1c2d51] rounded-[2rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                  {user?.email === 'snapimoveis@gmail.com' ? 'Acesso Master' : 'Período Trial'}
                </div>
                <div className="text-blue-400">
                  <Sparkles size={14} className="animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-1 mb-4">
                <p className="text-xl font-black tracking-tighter leading-none">
                  {user?.email === 'snapimoveis@gmail.com' ? 'Vitalício' : `${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'} restantes`}
                </p>
                <p className="text-[10px] font-medium text-slate-400">
                  {user?.email === 'snapimoveis@gmail.com' ? 'Administrador do Sistema' : 'Aproveite todas as funções Business grátis.'}
                </p>
              </div>

              {user?.email !== 'snapimoveis@gmail.com' && (
                <Link 
                  to="/planos" 
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  <Zap size={12} fill="currentColor" /> Assinar Agora
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="p-4 border-t shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-slate-300 hover:text-red-500 rounded-xl transition-colors">
            <LogOut size={20} />
            {!isCollapsed && <span className="font-bold text-sm">Terminar Sessão</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                Backoffice / <span className="text-[#1c2d51]">{ADMIN_NAV_ITEMS.find(i => i.path === location.pathname)?.name || 'Painel'}</span>
             </div>
             {isTrial && hasAccess && (
               <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-2 border animate-in fade-in slide-in-from-left-2 ${user?.email === 'snapimoveis@gmail.com' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  <AlertTriangle size={12} /> {user?.email === 'snapimoveis@gmail.com' ? 'Administrador Master' : `${daysLeft} dias de Trial`}
               </div>
             )}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/admin/leads" className="relative p-2 text-slate-300 hover:text-[#1c2d51] transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white font-black">{unreadCount}</span>}
            </Link>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#1c2d51] text-white flex items-center justify-center font-black shadow-lg shadow-[#1c2d51]/10">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover rounded-xl" alt="User avatar" /> : user?.email?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 py-6 px-2 animate-in fade-in zoom-in-95 z-[60]">
                  <div className="px-6 pb-6 border-b border-slate-50 mb-4">
                    <p className="font-black text-sm text-[#1c2d51]">{profile?.displayName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Link to="/admin/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-500 transition-all">
                      <UserIcon size={18} /> <span className="text-sm font-bold">O meu Perfil</span>
                    </Link>
                    <Link to="/admin/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-500 transition-all">
                      <Settings size={18} /> <span className="text-sm font-bold">Configurações</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto relative">
          {hasAccess ? children : (
            <div className="absolute inset-0 z-50 bg-slate-50/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-700">
               <div className="max-w-md w-full bg-white p-12 rounded-[4rem] shadow-2xl text-center space-y-8 border border-slate-100 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <Lock size={40} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Trial Expirado</h2>
                    <p className="text-slate-500 font-medium mt-2">O seu período de teste terminou. Ative um plano para continuar a gerir o seu inventário e website.</p>
                  </div>
                  <div className="space-y-3">
                    <Link 
                      to="/planos"
                      className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:-translate-y-1 transition-all"
                    >
                      <CreditCard size={18} /> Ativar Plano Agora
                    </Link>
                    <button onClick={handleLogout} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors">Terminar Sessão</button>
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
