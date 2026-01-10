
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { ADMIN_NAV_ITEMS } from '../../constants.tsx';
import { 
  LogOut, Bell, ChevronLeft, ChevronRight, User as UserIcon, 
  Settings, Building2, Brush, Globe, Shield, CreditCard, 
  Languages, BellRing, ChevronDown, CheckCircle2, Layout, MessageSquare, X
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { Lead } from '../../types';

const AdminShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastLead, setLastLead] = useState<Lead | null>(null);
  const [showToast, setShowToast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  // Listener em tempo real para novas leads (Notificações)
  useEffect(() => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;

    const leadsRef = collection(db, "tenants", profile.tenantId, "leads");
    const q = query(leadsRef, where("lido", "==", false), orderBy("created_at", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
      
      // Detetar novas leads vindas do servidor para exibir o Toast
      const source = snapshot.metadata.hasPendingWrites ? 'local' : 'server';
      if (snapshot.docChanges().some(change => change.type === 'added') && source === 'server') {
        const newestDoc = snapshot.docs[0];
        if (newestDoc) {
          setLastLead({ id: newestDoc.id, ...newestDoc.data() } as Lead);
          setShowToast(true);
          // Ocultar automaticamente após 8 segundos
          setTimeout(() => setShowToast(false), 8000);
        }
      }
    }, (error) => {
      console.error("Erro no listener de notificações:", error);
    });

    return () => unsubscribe();
  }, [profile?.tenantId]);

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
            const isLeads = item.path === '/admin/leads';
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all relative ${
                  isActive 
                  ? 'bg-[#1c2d51] text-white shadow-xl shadow-slate-900/10' 
                  : 'text-slate-400 hover:text-[#1c2d51] hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-300'}>{item.icon}</span>
                {!isCollapsed && <span className="font-bold text-sm">{item.name}</span>}
                
                {/* Notificação dinâmica no item "Leads" da barra lateral */}
                {isLeads && unreadCount > 0 && (
                  <span className={`absolute ${isCollapsed ? 'top-1 right-1' : 'right-3'} flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white shadow-lg border-2 border-white animate-in zoom-in duration-300`}>
                    {unreadCount}
                  </span>
                )}
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
            {/* Sino de Notificações com Badge Dinâmico */}
            <Link to="/admin/leads" className="relative p-2 text-slate-300 hover:text-[#1c2d51] transition-colors group">
              <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle text-blue-500' : ''} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white font-black shadow-lg animate-in zoom-in duration-300">
                  {unreadCount}
                </span>
              )}
            </Link>

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
                      <div className="truncate">
                        <p className="font-black text-sm text-[#1c2d51] truncate">{profile?.displayName || 'Utilizador'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link to="/admin/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-[#1c2d51] transition-all">
                      <UserIcon size={18} />
                      <span className="text-sm font-bold">O meu Perfil</span>
                    </Link>
                    <Link to="/admin/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-[#1c2d51] transition-all">
                      <Settings size={18} />
                      <span className="text-sm font-bold">Configurações</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-500 transition-all">
                      <LogOut size={18} />
                      <span className="text-sm font-bold">Terminar Sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>

        {/* Real-time Toast notification */}
        {showToast && lastLead && (
          <div className="fixed bottom-8 right-8 z-[60] bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 flex items-center gap-6 animate-in slide-in-from-right-10 duration-500">
             <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                <MessageSquare size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Nova Lead Recebida</p>
                <p className="font-black text-[#1c2d51] text-sm">{lastLead.nome}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{lastLead.email}</p>
             </div>
             <button onClick={() => setShowToast(false)} className="p-2 text-slate-200 hover:text-slate-900 transition-colors">
                <X size={18} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Fix: Add default export to resolve error in App.tsx line 27
export default AdminShell;
