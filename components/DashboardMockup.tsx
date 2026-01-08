
import React from 'react';
import { BarChart3, Building2, MessageSquare, Users, Settings, Bell, ChevronLeft, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';

export const DashboardMockup: React.FC = () => {
  return (
    <div className="w-full bg-slate-50 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex h-[500px] text-[10px] sm:text-xs">
      {/* Sidebar Mockup */}
      <aside className="w-1/4 bg-white border-r border-slate-100 flex flex-col py-4">
        <div className="px-4 mb-6 flex items-center justify-between">
          <span className="font-black text-[#1c2d51] truncate">ImoSuite Demo</span>
          <ChevronLeft size={12} className="text-slate-300" />
        </div>
        <nav className="flex-1 px-2 space-y-1">
          <div className="flex items-center gap-2 p-2 bg-[#1c2d51] text-white rounded-lg font-bold">
            <BarChart3 size={14} /> <span>Dashboard</span>
          </div>
          <div className="flex items-center gap-2 p-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">
            <Building2 size={14} /> <span>Imóveis</span>
          </div>
          <div className="flex items-center gap-2 p-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">
            <MessageSquare size={14} /> <span>Leads</span>
          </div>
          <div className="flex items-center gap-2 p-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">
            <Users size={14} /> <span>Utilizadores</span>
          </div>
          <div className="flex items-center gap-2 p-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">
            <Settings size={14} /> <span>Configurações</span>
          </div>
        </nav>
      </aside>

      {/* Main Content Mockup */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-10 bg-white border-b border-slate-100 flex items-center justify-between px-4">
          <div className="text-[8px] text-slate-400">Painel de Controlo / <span className="text-slate-600 font-bold">Dashboard</span></div>
          <div className="flex items-center gap-3">
            <Bell size={12} className="text-slate-300" />
            <div className="flex items-center gap-2">
              <div className="text-right leading-none">
                <div className="font-bold text-[#1c2d51]">Admin User</div>
                <div className="text-[6px] text-slate-400">Administrador</div>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">A</div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-4 space-y-4 overflow-y-auto">
          <div>
            <h2 className="text-base font-black text-[#1c2d51]">Dashboard</h2>
            <p className="text-slate-400 text-[8px]">Bem-vindo à área de gestão do ImoSuite.</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Imóveis Ativos', val: '124', change: '+12%', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Building2 size={14}/> },
              { label: 'Leads (Mês)', val: '48', change: '+5%', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <MessageSquare size={14}/> },
              { label: 'Visitas Site', val: '2.4k', change: '-2%', color: 'text-orange-600', bg: 'bg-orange-50', icon: <Eye size={14}/> },
              { label: 'Novos Utilizadores', val: '12', change: '+18%', color: 'text-purple-600', bg: 'bg-purple-50', icon: <Users size={14}/> },
            ].map((s, i) => (
              <div key={i} className="bg-white p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-1.5 rounded-lg ${s.bg} ${s.color}`}>{s.icon}</div>
                  <div className={`text-[6px] font-bold px-1.5 py-0.5 rounded-full ${s.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{s.change}</div>
                </div>
                <div className="text-lg font-black text-[#1c2d51]">{s.val}</div>
                <div className="text-[8px] text-slate-400 font-bold">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-100">
               <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-[#1c2d51] text-[10px]">Crescimento de Leads</span>
                  <div className="text-[8px] bg-slate-50 px-2 py-1 rounded">Últimos 6 meses</div>
               </div>
               <div className="h-24 flex items-end gap-1 px-2">
                  {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-50 rounded-t relative group overflow-hidden">
                       <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-[#357fb2]/20"></div>
                       <div style={{ height: `${h-10}%` }} className="absolute bottom-0 w-full border-t-2 border-[#357fb2]"></div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100">
               <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-[#1c2d51] text-[10px]">Visualizações de Imóveis</span>
                  <span className="text-[8px] text-[#357fb2] font-black">Ver relatório</span>
               </div>
               <div className="h-24 flex items-end gap-2 px-2">
                  {[30, 20, 100, 45, 55, 40, 50].map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-[#5ab8ba] rounded-sm"></div>
                  ))}
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
