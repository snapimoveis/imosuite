
import React from 'react';
import { Link } from 'react-router-dom';
import { Imovel } from '../types';
import { formatCurrency } from '../lib/utils';
import { Bed, Bath, Square, MapPin } from 'lucide-react';

interface ImovelCardProps {
  imovel: Imovel;
}

const ImovelCard: React.FC<ImovelCardProps> = ({ imovel }) => {
  const mainImage = imovel.media.find(m => m.principal)?.url || 'https://picsum.photos/seed/realestate/600/400';

  return (
    <Link to={`/imovel/${imovel.slug}`} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={mainImage} 
          alt={imovel.titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase text-gray-800 shadow-sm">
            {imovel.tipo_negocio === 'venda' ? 'Venda' : 'Arrendamento'}
          </span>
          {imovel.destaque && (
            <span className="bg-[var(--primary)] text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm">
              Destaque
            </span>
          )}
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-lg font-bold text-lg text-gray-900 shadow-md">
            {imovel.tipo_negocio === 'venda' ? formatCurrency(imovel.preco) : `${formatCurrency(imovel.preco_arrendamento)}/mês`}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
          <MapPin size={14} />
          <span>{imovel.concelho}, {imovel.distrito}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-1">{imovel.titulo}</h3>
        
        <div className="flex items-center justify-between border-t border-gray-50 pt-4 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Bed size={16} />
            <span className="font-medium text-gray-700">{imovel.quartos || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath size={16} />
            <span className="font-medium text-gray-700">{imovel.casas_banho || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Square size={16} />
            <span className="font-medium text-gray-700">{imovel.area_util_m2 || 0}m²</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ImovelCard;
