
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Imovel } from '../types';
import { formatCurrency } from '../lib/utils';
import { Bed, Bath, Square, MapPin, MessageSquare } from 'lucide-react';

interface ImovelCardProps {
  imovel: Imovel;
}

const ImovelCard: React.FC<ImovelCardProps> = ({ imovel }) => {
  const navigate = useNavigate();
  const mainImage = imovel.media.find(m => m.principal)?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navega para o detalhe com o parâmetro de scroll
    navigate(`/imovel/${imovel.slug}?contact=true`);
  };

  return (
    <Link to={`/imovel/${imovel.slug}`} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={mainImage} 
          alt={imovel.titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-gray-800 shadow-sm">
            {imovel.tipo_negocio === 'venda' ? 'Venda' : 'Arrendamento'}
          </span>
          {imovel.destaque && (
            <span className="bg-[#1c2d51] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">
              Destaque
            </span>
          )}
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-lg font-black text-lg text-[#1c2d51] shadow-md border border-white/20">
            {imovel.tipo_negocio === 'venda' ? formatCurrency(imovel.preco) : `${formatCurrency(imovel.preco_arrendamento)}/mês`}
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
          <MapPin size={12} />
          <span>{imovel.concelho}</span>
        </div>
        <h3 className="text-lg font-black text-[#1c2d51] mb-4 line-clamp-2 leading-tight flex-1">{imovel.titulo}</h3>
        
        <div className="flex items-center justify-between border-t border-gray-50 py-4 text-slate-400 font-bold text-xs uppercase">
          <div className="flex items-center gap-1.5"><Bed size={14} className="text-slate-900" /> <span>{imovel.quartos || 0}</span></div>
          <div className="flex items-center gap-1.5"><Bath size={14} className="text-slate-900" /> <span>{imovel.casas_banho || 0}</span></div>
          <div className="flex items-center gap-1.5"><Square size={14} className="text-slate-900" /> <span>{imovel.area_util_m2 || 0}m²</span></div>
        </div>

        <button 
          onClick={handleContactClick}
          className="w-full mt-2 bg-slate-50 text-[#1c2d51] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1c2d51] hover:text-white transition-all"
        >
          <MessageSquare size={14} /> Contactar Agente
        </button>
      </div>
    </Link>
  );
};

export default ImovelCard;
