
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from "@firebase/firestore";
import { db } from '../../lib/firebase';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users, UserPlus, MoreVertical, Shield, Loader2 } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const { tenant } = useTenant();
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      // CRÍTICO: Não tentar ler se o tenantId for inválido ou pendente
      if (!profile?.tenantId || profile.tenantId === 'pending' || profile.tenantId === 'default-tenant-uuid') {
        setIsLoading(false);
        return;
      }

      try {
        const usersRef = collection(db, "users");
        // Nota: Esta query requer que o campo 'tenantId' exista no documento do user
        const q = query(usersRef, where("tenantId", "==", profile.tenantId));
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map(userDoc => ({ id: userDoc.id, ...(userDoc.data() as any) })));
      } catch (err: any) {
        // Silenciamos erro de permissão para não quebrar a UI, mostrando apenas lista vazia
        if (err.code !== 'permission-denied') {
          console.error("Erro ao carregar equipa:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, [profile?.tenantId]);

  if (profile?.tenantId === 'pending') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="animate-spin mb-4 text-[#1c2d51]" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest">A sincronizar acessos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-brand animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1c2d51]">Gestão da Equipa</h1>
          <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Acessos de {tenant.nome}</p>
        </div>
        <button className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl">
          <UserPlus size={20} /> Convidar Consultor
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Nome / Email</th>
                <th className="px-8 py-5">Cargo</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-300" size={32} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-300 text-xs font-bold uppercase tracking-widest italic">
                    Nenhum outro membro encontrado ou sem permissão de listagem.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1c2d51] text-white flex items-center justify-center font-black">
                          {u.displayName?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-[#1c2d51] text-sm">{u.displayName || 'Utilizador'}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Shield size={14} className="text-blue-200" />
                        {u.role === 'admin' ? 'Administrador' : 'Consultor'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">Ativo</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-slate-300 hover:text-[#1c2d51]"><MoreVertical size={20}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
