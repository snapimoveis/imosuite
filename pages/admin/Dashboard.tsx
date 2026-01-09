
import React, { useEffect, useState } from 'react';
// Correcting modular Firestore imports for version 9+
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, MessageSquare, TrendingUp, Users, Eye, Loader2, AlertCircle, Globe, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState([
    { name: 'Imóveis Ativos', value: '0', change: '0%', trend: 'up', icon: <Building2 className="text-blue-600" /> },
    { name: 'Leads (Mês)', value: '0', change: '0%', trend: 'up', icon: <MessageSquare className="text-emerald-600" /> },
    { name: 'Visitas Site', value: '0', change: '0%', trend: 'up', icon: <Eye className="text-orange-600" /> },
    { name: 'Equipa', value: '0', change: '0%', trend: 'up', icon: <Users className="text-purple-600" /> },
  ]);

  useEffect(() => {
    const fetchRealStats = async () => {
      if (authLoading) return;
      if (!profile?.tenantId || profile.tenantId === 'pending' || profile.tenantId === 'default') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const statsPromises = [
          getDocs(query(collection(db, "tenants", profile.tenantId, "properties"), limit(100))).catch(() => ({ size: 0 })),
          getDocs(query(collection(db, "tenants", profile.tenantId, "leads"), limit(100))).catch(() => ({ size: 0 })),
          getDocs(query(collection(db, "users"), where("tenantId", "==", profile.tenantId))).catch(() => ({ size: 0 }))
        ];

        const [propsSnap, leadsSnap, teamSnap] = await Promise.all(statsPromises);

        setStats(prev => [
          { ...prev[0], value: propsSnap.size.toString() },
          { ...prev[1], value: leadsSnap.size.toString() },
          { ...prev[2], value: 'N/A' },
          { ...prev[3], value: teamSnap.size.toString() }
        ]);
        setError(null);
      } catch (err: any) {
        console.error("Dashboard Error:", err);
        setError("Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealStats();
  }, [profile?.tenantId, authLoading]);

  if (authLoading || (isLoading && (!profile || profile.tenantId === 'pending'))) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-300 font-brand">
        <Loader2 className="animate-spin mb-4 text-[#1c2d51]" size={32} />
        <p className="text-xs font-black uppercase tracking-widest text-center animate-pulse">A preparar o seu cockpit...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-brand animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Olá, {profile?.displayName?.split(' ')[0] || 'Utilizador'}</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Visão geral da sua imobiliária</p>
        </div>
        {error && (
          <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-amber-100">
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-shrink-0 p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
              <div className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-3 py-1 rounded-full uppercase">Ativo</div>
            </div>
            <div className="text-3xl font-black text-[#1c2d51]">{stat.value}</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest mb-8">Crescimento de Inventário</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{name: 'Mês Ant.', val: 0}, {name: 'Hoje', val: parseInt(stats[0].value) || 0}]}>
                <defs><linearGradient id="color" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1c2d51" stopOpacity={0.1}/><stop offset="95%" stopColor="#1c2d51" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                <Area type="monotone" dataKey="val" stroke="#1c2d51" strokeWidth={3} fillOpacity={1} fill="url(#color)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1c2d51] p-8 rounded-[3rem] shadow-xl shadow-slate-900/10 flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6"><Globe size={32} /></div>
            <h3 className="text-xl font-black mb-2 tracking-tighter">O seu Site está Online</h3>
            <p className="text-slate-300 text-sm font-medium mb-8 max-w-xs">Partilhe o link da sua agência com clientes e nas redes sociais.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <a 
                href={`#/agencia/${tenant.slug || tenant.id}`} 
                target="_blank" 
                className="flex-1 bg-white text-[#1c2d51] px-6 py-4 rounded-2xl font-black text-xs hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Visitar Website <TrendingUp size={14}/>
              </a>
              <Link 
                to="/admin/settings?tab=website" 
                className="flex-1 bg-[#357fb2] text-white px-6 py-4 rounded-2xl font-black text-xs hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Personalizar Site <Edit3 size={14}/>
              </Link>
            </div>

            <div className="mt-6 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
              imosuite.pt/agencia/{tenant.slug || tenant.id}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
