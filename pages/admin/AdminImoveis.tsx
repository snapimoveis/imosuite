
import React, { useState, useEffect } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useTenant } from '../../contexts/TenantContext';
import { Imovel } from '../../types';
import { Plus, Search, Filter, Edit2, Trash2, Eye } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const AdminImoveis: React.FC = () => {
  const { tenant } = useTenant();
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await PropertyService.getProperties(tenant.id);
        setProperties(data);
      } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProperties();
  }, [tenant.id]);

  const filteredProperties = properties.filter(p => 
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.referencia.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6 font-brand">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1c2d51]">Gestão de Imóveis</h1>
          <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Inventário de {tenant.nome}</p>
        </div>
        <button className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-slate-900/10">
          <Plus size={20} />
          Novo Imóvel
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Filtros */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por referência ou título..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none text-sm font-bold focus:ring-2 focus:ring-[#1c2d51] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-[#1c2d51] transition-colors">
              <Filter size={20} />
            </button>
            <select className="bg-slate-50 border-none rounded-xl px-5 py-3 text-sm font-black text-[#1c2d51] outline-none appearance-none">
              <option>Todos os tipos</option>
              <option>Apartamento</option>
              <option>Moradia</option>
            </select>
          </div>
        </div>

        {/* Lista */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Imóvel</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5">Negócio</th>
                <th className="px-8 py-5">Preço</th>
                <th className="px-8 py-5">Views</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center font-bold text-slate-300">A carregar inventário...</td></tr>
              ) : filteredProperties.map((imovel) => (
                <tr key={imovel.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                        <img src={imovel.media[0]?.url} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-black text-[#1c2d51] text-sm">{imovel.titulo}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">REF: {imovel.referencia}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${imovel.publicado ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {imovel.publicado ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{imovel.tipo_negocio}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-black text-[#1c2d51] text-sm">
                      {imovel.tipo_negocio === 'venda' ? formatCurrency(imovel.preco) : `${formatCurrency(imovel.preco_arrendamento)}/mês`}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Eye size={14} />
                      {imovel.visualizacoes}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-[#1c2d51] hover:bg-white rounded-xl border border-transparent hover:border-slate-100 shadow-sm transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 shadow-sm transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-6 border-t border-slate-50 flex justify-between items-center bg-slate-50/20">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">A mostrar {filteredProperties.length} imóveis</div>
          <div className="flex gap-2">
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-400 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-400">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminImoveis;
