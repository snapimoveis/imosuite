
import React, { useState } from 'react';
import { MOCK_IMOVEIS } from '../../mocks';
import { Plus, Search, Filter, Edit2, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const AdminImoveis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Imóveis</h1>
          <p className="text-gray-500">Crie, edite e acompanhe o desempenho dos seus anúncios.</p>
        </div>
        <button className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-teal-900/10">
          <Plus size={20} />
          Novo Imóvel
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por referência ou título..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg outline-none text-sm focus:ring-1 focus:ring-[var(--primary)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              <Filter size={18} />
            </button>
            <select className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm outline-none">
              <option>Todos os tipos</option>
              <option>Apartamento</option>
              <option>Moradia</option>
            </select>
            <select className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm outline-none">
              <option>Publicado</option>
              <option>Rascunho</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Imóvel</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Negócio</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_IMOVEIS.map((imovel) => (
                <tr key={imovel.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={imovel.media[0]?.url} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 line-clamp-1">{imovel.titulo}</div>
                        <div className="text-xs text-gray-400 font-medium">REF: {imovel.referencia}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${imovel.publicado ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {imovel.publicado ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 capitalize">{imovel.tipo_negocio}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 text-sm">
                      {imovel.tipo_negocio === 'venda' ? formatCurrency(imovel.preco) : `${formatCurrency(imovel.preco_arrendamento)}/mês`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Eye size={14} />
                      {imovel.visualizacoes}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-sm transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-sm transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/20">
          <div className="text-sm text-gray-500">A mostrar {MOCK_IMOVEIS.length} de {MOCK_IMOVEIS.length} imóveis</div>
          <div className="flex gap-1">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50" disabled>Anterior</button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminImoveis;
