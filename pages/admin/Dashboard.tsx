
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Building2, MessageSquare, TrendingUp, Users, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const stats = [
  { name: 'Imóveis Ativos', value: '124', change: '+12%', trend: 'up', icon: <Building2 className="text-blue-600" /> },
  { name: 'Leads (Mês)', value: '48', change: '+5%', trend: 'up', icon: <MessageSquare className="text-emerald-600" /> },
  { name: 'Visitas Site', value: '2.4k', change: '-2%', trend: 'down', icon: <Eye className="text-orange-600" /> },
  { name: 'Novos Utilizadores', value: '12', change: '+18%', trend: 'up', icon: <Users className="text-purple-600" /> },
];

const data = [
  { name: 'Jan', leads: 400, views: 2400 },
  { name: 'Fev', leads: 300, views: 1398 },
  { name: 'Mar', leads: 200, views: 9800 },
  { name: 'Abr', leads: 278, views: 3908 },
  { name: 'Mai', leads: 189, views: 4800 },
  { name: 'Jun', leads: 239, views: 3800 },
  { name: 'Jul', leads: 349, views: 4300 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo à área de gestão do ImoSuite.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.name}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-gray-800">Crescimento de Leads</h3>
            <select className="text-sm bg-gray-50 border-none rounded px-3 py-1 outline-none">
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00565F" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#00565F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{stroke: '#00565F', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="leads" stroke="#00565F" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-gray-800">Visualizações de Imóveis</h3>
            <button className="text-sm text-[var(--primary)] font-bold">Ver relatório</button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="views" fill="#5ab8ba" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Leads Recentes</h3>
          <button className="text-sm text-[var(--primary)] font-bold hover:underline">Ver todas</button>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { name: 'João Silva', email: 'joao.silva@email.com', property: 'Apartamento T3 em Alvalade', status: 'Novo' },
            { name: 'Maria Santos', email: 'maria.s@gmail.com', property: 'Moradia V4 Cascais', status: 'Respondido' },
            { name: 'Carlos Oliveira', email: 'carlos@outlook.pt', property: 'Terreno Comporta', status: 'Novo' },
          ].map((lead, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{lead.name}</div>
                  <div className="text-xs text-gray-500">{lead.email}</div>
                </div>
              </div>
              <div className="hidden md:block text-sm text-gray-600 italic">"{lead.property}"</div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${lead.status === 'Novo' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                {lead.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
