
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Imovel } from '../types';
import { formatCurrency } from '../lib/utils';
import { Bed, Bath, Square, MapPin, MessageSquare } from 'lucide-react';

interface ImovelCardProps {
  imovel: Imovel;
}

const ImovelCard: React.FC<ImovelCardProps> = ({ imovel }) => {
  const navigate = useNavigate();
  const { slug: agencySlug } = useParams<{ slug: string }>();
  
  // Fix: Handle updated media structure. Use items list if present, otherwise fallback.
  const mainImage = imovel.media.items?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Constrói a rota dependendo de onde o card está a ser exibido (marketing vs portal agência)
    const basePath = agencySlug ? `/agencia/${agencySlug}` : '';
    navigate(`${basePath}/imovel/${imovel.slug}?contact=true`);
  };

  return (
    <Link to={agencySlug ? `/agencia/${agencySlug}/imovel/${imovel.slug}` : `/imovel/${imovel.slug}`} className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={mainImage} 
          alt={imovel.titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black uppercase text-slate-800 shadow-sm border border-white/20">
            {imovel.operacao === 'venda' ? 'Venda' : 'Arrendamento'}
          </span>
          {imovel.publicacao.destaque && (
            <span className="bg-[#1c2d51] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-sm">
              Destaque
            </span>
          )}
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">
          <MapPin size={12} className="text-blue-500" />
          <span>{imovel.localizacao.concelho}</span>
        </div>
        <h3 className="text-lg font-black text-[#1c2d51] mb-6 line-clamp-2 leading-tight flex-1">{imovel.titulo}</h3>
        
        <div className="flex items-center justify-between border-t border-slate-50 py-5 mb-6 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
          <div className="flex items-center gap-1.5"><Bed size={14} className="text-slate-900" /> <span>{imovel.divisoes.quartos || 0}</span></div>
          <div className="flex items-center gap-1.5"><Bath size={14} className="text-slate-900" /> <span>{imovel.divisoes.casas_banho || 0}</span></div>
          <div className="flex items-center gap-1.5"><Square size={14} className="text-slate-900" /> <span>{imovel.areas.area_util_m2 || 0}m²</span></div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-2xl font-black text-[#1c2d51] mb-2">
            {imovel.operacao === 'venda' ? formatCurrency(imovel.financeiro.preco_venda || 0) : `${formatCurrency(imovel.financeiro.preco_arrendamento || 0)}/mês`}
          </div>
          <button 
            onClick={handleContactClick}
            className="w-full bg-[#1c2d51] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-[#357fb2] shadow-xl shadow-slate-900/10 transition-all active:scale-95"
          >
            <MessageSquare size={14} /> Contactar Agente
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ImovelCard;
