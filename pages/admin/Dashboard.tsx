
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Building2, MessageSquare, TrendingUp, Users, Eye, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { name: 'Imóveis Ativos', value: '0', change: '0%', trend: 'up', icon: <Building2 className="text-blue-600" /> },
    { name: 'Leads (Mês)', value: '0', change: '0%', trend: 'up', icon: <MessageSquare className="text-emerald-600" /> },
    { name: 'Visitas Site', value: '0', change: '0%', trend: 'up', icon: <Eye className="text-orange-600" /> },
    { name: 'Equipa', value: '0', change: '0%', trend: 'up', icon: <Users className="text-purple-600" /> },
  ]);

  useEffect(() => {
    const fetchRealStats = async () => {
      if (!profile?.tenantId || profile.tenantId === 'default') {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Contar Imóveis (Leitura da sub-coleção específica do tenant)
        const propsRef = collection(db, "tenants", profile.tenantId, "properties");
        const propsSnap = await getDocs(propsRef);
        
        // 2. Contar Membros da Equipa (Usando Query para evitar erro de permissão na coleção root)
        const usersRef = collection(db, "users");
        const teamQuery = query(usersRef, where("tenantId", "==", profile.tenantId));
        const teamSnap = await getDocs(teamQuery);

        setStats(prev => [
          { ...prev[0], value: propsSnap.size.toString() },
          { ...prev[1], value: '0' },
          { ...prev[2], value: 'N/A' },
          { ...prev[3], value: teamSnap.size.toString() }
        ]);
      } catch (err) {
        console.error("Erro ao carregar stats do dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealStats();
  }, [profile]);

  const data = [
    { name: 'Jan', leads: 0, views: 0 },
    { name: 'Hoje', leads: 5, views: 42 },
  ];

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-xs font-black uppercase tracking-widest">A carregar o seu ecossistema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-brand">
      <div>
        <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Olá, {profile?.displayName?.split(' ')[0]}</h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Visão geral da sua imobiliária</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-black text-[#1c2d51]">{stat.value}</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest">Atividade de Leads</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c2d51" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1c2d51" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontFamily: 'Red Hat Display' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#1c2d51" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-[#357fb2] rounded-2xl flex items-center justify-center mb-6">
               <TrendingUp size={32} />
            </div>
            <h3 className="text-xl font-black text-[#1c2d51] mb-2 tracking-tighter">Inventário Online</h3>
            <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs">Os seus imóveis estão agora visíveis no portal público da sua agência.</p>
            <button className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#1c2d51]/20">Ver Portal</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
