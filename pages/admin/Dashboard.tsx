import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, MessageSquare, Users, Eye, Loader2, Globe, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { name: 'IMÓVEIS ATIVOS', value: '0', icon: <Building2 size={20} className="text-blue-600" /> },
    { name: 'LEADS (MÊS)', value: '0', icon: <MessageSquare size={20} className="text-emerald-600" /> },
    { name: 'VISITAS SITE', value: '0', icon: <Eye size={20} className="text-orange-600" /> },
    { name: 'EQUIPA', value: '0', icon: <Users size={20} className="text-purple-600" /> },
  ]);

  useEffect(() => {
    const fetchRealStats = async () => {
      if (authLoading || !profile?.tenantId || profile.tenantId === 'pending') {
        setIsLoading(false);
        return;
      }

      try {
        const propsSnap = await getDocs(query(collection(db, "tenants", profile.tenantId, "properties"), limit(100)));
        const leadsSnap = await getDocs(query(collection(db, "tenants", profile.tenantId, "leads"), limit(100)));
        
        let teamSize = '1';
        try {
          const teamSnap = await getDocs(query(collection(db, "users"), where("tenantId", "==", profile.tenantId)));
          teamSize = teamSnap.size.toString();
        } catch (e) { }

        setStats(prev => [
          { ...prev[0], value: propsSnap.size.toString() },
          { ...prev[1], value: leadsSnap.size.toString() },
          { ...prev[2], value: '0' },
          { ...prev[3], value: teamSize }
        ]);
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealStats();
  }, [profile?.tenantId, authLoading]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="animate-spin mb-4 text-[#1c2d51]" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black text-[#1c2d51] tracking-tighter">Olá, {tenant.nome || 'ImoSuite'}</h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Visão geral da sua imobiliária</p>
      </header>

      {/* Stats Cards - Rigorosos ao Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm relative group overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">Ativo</span>
            </div>
            <div className="text-4xl font-black text-[#1c2d51] tracking-tighter mb-1">{stat.value}</div>
            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gráfico Crescimento */}
        <div className="lg:col-span-7 bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm">
          <h3 className="font-black text-[#1c2d51] uppercase text-[10px] tracking-[0.2em] mb-12">Crescimento de Inventário</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{name: 'JAN', val: 0}, {name: 'FEV', val: 0}, {name: 'MAR', val: parseInt(stats[0].value) || 0}]}>
                <defs>
                  {/* Fix: Changed second x1="0" to y1="0" to resolve duplicate attribute error */}
                  <linearGradient id="color" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1c2d51" stopOpacity={0.05}/><stop offset="95%" stopColor="#1c2d51" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: '#cbd5e1'}} />
                <Area type="monotone" dataKey="val" stroke="#1c2d51" strokeWidth={4} fillOpacity={1} fill="url(#color)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bloco Site Online Escuro */}
        <div className="lg:col-span-5 bg-[#1c2d51] p-12 rounded-[3rem] shadow-2xl text-white flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <Globe size={32} />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-4">O seu Site está Online</h3>
            <p className="text-white/60 text-sm font-medium mb-10 max-w-xs leading-relaxed">Partilhe o link da sua agência com clientes e nas redes sociais.</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <a href={`#/agencia/${tenant.slug}`} target="_blank" rel="noreferrer" className="flex-1 bg-white text-[#1c2d51] px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                <Eye size={14} /> Ver Site
              </a>
              <Link to="/admin/cms" className="flex-1 bg-white/10 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10">
                <Edit3 size={14} /> Editar CMS
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;