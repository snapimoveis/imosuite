
import React, { useState, useEffect } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Imovel } from '../../types';
import { Plus, Search, Filter, Edit2, Trash2, Eye, X, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const AdminImoveis: React.FC = () => {
  const { profile } = useAuth();
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    titulo: '',
    tipo_imovel: 'Apartamento',
    preco: '',
    concelho: '',
    distrito: 'Lisboa',
    tipologia: 'T2'
  });

  const loadProperties = async () => {
    if (!profile?.tenantId) return;
    try {
      const data = await PropertyService.getProperties(profile.tenantId);
      setProperties(data);
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProperties(); }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenantId) return;
    setIsSaving(true);
    try {
      await PropertyService.createProperty(profile.tenantId, {
        titulo: formData.titulo,
        tipo_imovel: formData.tipo_imovel,
        preco: Number(formData.preco),
        concelho: formData.concelho,
        distrito: formData.distrito,
        tipologia: formData.tipologia,
        tipo_negocio: 'venda',
        referencia: `REF-${Math.floor(Math.random() * 9999)}`,
        slug: formData.titulo.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
      });
      setIsModalOpen(false);
      loadProperties();
    } catch (err) {
      alert("Erro ao guardar imóvel");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProperties = properties.filter(p => 
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.referencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6 font-brand">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1c2d51]">Gestão de Imóveis</h1>
          <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Inventário Real</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-slate-900/10">
          <Plus size={20} /> Novo Imóvel
        </button>
      </div>

      {/* Modal Novo Imóvel */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-12 relative shadow-2xl overflow-y-auto max-h-[90vh]">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X size={24}/></button>
              <h3 className="text-3xl font-black text-[#1c2d51] mb-8">Adicionar Imóvel</h3>
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Título do Imóvel</label>
                  <input required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" placeholder="Ex: Apartamento Moderno..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Preço (€)</label>
                    <input required type="number" value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Tipo</label>
                    <select value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold">
                      <option>Apartamento</option>
                      <option>Moradia</option>
                      <option>Loja</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Concelho / Localidade</label>
                  <input required value={formData.concelho} onChange={e => setFormData({...formData, concelho: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-[#1c2d51] text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10">
                  {isSaving ? <Loader2 className="animate-spin" /> : 'Criar Imóvel'}
                </button>
              </form>
           </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por título ou referência..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Imóvel</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={2} className="px-8 py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" /></td></tr>
              ) : filteredProperties.length === 0 ? (
                <tr><td colSpan={2} className="px-8 py-20 text-center font-bold text-slate-300">Nenhum imóvel encontrado.</td></tr>
              ) : filteredProperties.map((imovel) => (
                <tr key={imovel.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm flex items-center justify-center text-slate-300 font-black">
                        {imovel.media?.[0]?.url ? <img src={imovel.media[0].url} className="w-full h-full object-cover" /> : imovel.titulo.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-[#1c2d51] text-sm">{imovel.titulo}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{imovel.concelho} • {formatCurrency(imovel.preco)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#1c2d51] bg-white rounded-xl border border-slate-100 shadow-sm"><Edit2 size={16}/></button>
                      <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 bg-white rounded-xl border border-slate-100 shadow-sm"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminImoveis;
