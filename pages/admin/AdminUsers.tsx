
import React from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users, UserPlus, MoreVertical, Shield, Mail, Clock, AlertCircle } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const { tenant } = useTenant();
  const { user, profile } = useAuth();

  // Utilizadores mockados, mas agora incluindo o utilizador logado real
  const mockUsers = [
    { 
      id: user?.uid || '1', 
      name: profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Administrador', 
      email: user?.email || 'admin@empresa.pt',
      role: profile?.role === 'admin' ? 'Dono' : 'Membro',
      status: 'Ativo',
      lastLogin: 'Agora'
    },
    { 
      id: '2', 
      name: 'Ricardo Mendes', 
      email: 'ricardo@empresa.pt',
      role: 'Consultor',
      status: 'Ativo',
      lastLogin: 'Há 2 horas'
    },
    { 
      id: '3', 
      name: 'Ana Sofia', 
      email: 'ana@empresa.pt',
      role: 'Consultor',
      status: 'Inativo',
      lastLogin: 'Há 3 dias'
    }
  ];

  return (
    <div className="space-y-6 font-brand">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1c2d51]">Membros da Equipa</h1>
          <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Gestão de acessos para {tenant.nome}</p>
        </div>
        <button className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-slate-900/10">
          <UserPlus size={20} />
          Convidar Membro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#1c2d51]">{mockUsers.length}</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Utilizadores Totais</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 opacity-50">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#1c2d51]">1</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Administrador</div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-4">
        <AlertCircle className="text-amber-600 mt-1" size={20} />
        <div>
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Nota de Desenvolvimento</h4>
          <p className="text-xs text-amber-800 font-medium">A listagem de utilizadores requer integração com o Firebase Admin SDK ou uma coleção 'users' espelhada no Firestore. No momento, a lista abaixo combina o seu utilizador logado com dados de demonstração.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-8 py-5">Nome / Email</th>
              <th className="px-8 py-5">Cargo</th>
              <th className="px-8 py-5">Estado</th>
              <th className="px-8 py-5">Último Acesso</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {mockUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-[#1c2d51] border border-slate-100">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-[#1c2d51] text-sm">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Shield size={14} className="text-slate-300" />
                    {u.role}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-xs text-slate-400 font-medium">
                  {u.lastLogin}
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 text-slate-300 hover:text-[#1c2d51] transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
