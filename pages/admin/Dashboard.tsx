
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, limit } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, MessageSquare, Users, Eye, Loader2, AlertCircle, Globe, Edit3 } from 'lucide-react';
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
      // 1. Verificar se o auth está pronto
      if (authLoading) return;
      
      // 2. Verificar se temos tenantId válido
      if (!profile?.tenantId || profile.tenantId === 'pending' || profile.tenantId === 'default-tenant-uuid') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Usar subcoleções diretas para evitar erros de leitura na raiz
        const propsSnap = await getDocs(query(collection(db, "tenants", profile.tenantId, "properties"), limit(100)));
        const leadsSnap = await getDocs(query(collection(db, "tenants", profile.tenantId, "leads"), limit(100)));
        
        // A listagem de utilizadores requer regras específicas (garantir que não quebra se falhar)
        let teamSize = '1';
        try {
          const teamSnap = await getDocs(query(collection(db, "users"), where("tenantId", "==", profile.tenantId)));
          teamSize = teamSnap.size.toString();
        } catch (e) { console.warn("Permissão de equipa negada."); }

        setStats(prev => [
          { ...prev[0], value: propsSnap.size.toString() },
          { ...prev[1], value: leadsSnap.size.toString() },
          { ...prev[2], value: 'Ativo' },
          { ...prev[3], value: teamSize }
        ]);
        setError(null);
      } catch (err: any) {
        if (err.code === 'permission-denied') {
          setError("Acesso limitado. Verifique as permissões da agência.");
        } else {
          console.error("Dashboard Error:", err);
        }
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
        <p className="text-[10px] font-black uppercase tracking-widest text-center">A carregar o seu cockpit...</p>
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
          <div key={stat.name} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
              <div className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-3 py-1 rounded-full uppercase">Online</div>
            </div>
            <div className="text-3xl font-black text-[#1c2d51]">{stat.value}</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-[#1c2d51] uppercase text-xs tracking-widest mb-8">Performance de Inventário</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{name: 'Anterior', val: 0}, {name: 'Atual', val: parseInt(stats[0].value) || 0}]}>
                <defs><linearGradient id="color" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1c2d51" stopOpacity={0.1}/><stop offset="95%" stopColor="#1c2d51" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Area type="monotone" dataKey="val" stroke="#1c2d51" strokeWidth={3} fillOpacity={1} fill="url(#color)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1c2d51] p-8 rounded-[3rem] shadow-xl text-white relative overflow-hidden flex flex-col items-center justify-center text-center">
            <Globe size={48} className="mb-6 opacity-20" />
            <h3 className="text-xl font-black mb-2">O seu Site está Ativo</h3>
            <p className="text-slate-300 text-sm font-medium mb-8 max-w-xs">Aceda ao portal público da sua agência.</p>
            <div className="flex gap-3 w-full max-w-sm">
              <a href={`#/agencia/${tenant.slug}`} target="_blank" rel="noreferrer" className="flex-1 bg-white text-[#1c2d51] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                <Eye size={14} /> Ver Website
              </a>
              <Link to="/admin/cms" className="flex-1 bg-white/10 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10">
                <Edit3 size={14} /> Editar CMS
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
