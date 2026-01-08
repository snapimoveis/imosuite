
import React from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { Palette, Globe, Mail, Phone, Save, Upload } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { tenant, setTenant } = useTenant();

  const handleUpdate = (updates: any) => {
    setTenant({ ...tenant, ...updates });
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações da Imobiliária</h1>
        <p className="text-gray-500">Personalize a identidade visual e dados de contacto do seu portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Branding Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-2xl mb-4 flex items-center justify-center border-2 border-dashed border-gray-200">
               <Upload className="text-gray-400" />
            </div>
            <button className="text-sm font-bold text-[var(--primary)]">Mudar Logótipo</button>
            <p className="text-xs text-gray-400 mt-2">Recomendado: 512x512px (PNG)</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Palette size={18} className="text-gray-400" /> Cores da Marca
             </h3>
             <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Cor Primária</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={tenant.cor_primaria} 
                      onChange={(e) => handleUpdate({ cor_primaria: e.target.value })}
                      className="w-10 h-10 rounded-lg border-none cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={tenant.cor_primaria}
                      className="flex-1 bg-gray-50 border-none rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Form Main */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Imobiliária</label>
                  <input 
                    type="text" 
                    value={tenant.nome}
                    onChange={(e) => handleUpdate({ nome: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
                  <input 
                    type="email" 
                    value={tenant.email}
                    onChange={(e) => handleUpdate({ email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input 
                    type="text" 
                    value={tenant.telefone}
                    onChange={(e) => handleUpdate({ telefone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all"
                  />
               </div>
            </div>

            <div className="pt-6 border-t border-gray-50">
               <button className="w-full bg-[var(--primary)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-teal-900/10">
                  <Save size={20} />
                  Guardar Alterações
               </button>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
             <div className="flex gap-3">
                <Globe className="text-amber-600 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-amber-900">Domínio Personalizado</h4>
                  <p className="text-sm text-amber-800 mt-1">O seu site está atualmente em <strong>{tenant.slug}.imosuite.pt</strong>. Para usar um domínio próprio (ex: www.minhaagencia.pt), faça o upgrade para o plano Pro Business.</p>
                  <button className="mt-4 text-sm font-bold text-amber-900 underline">Fazer Upgrade</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
