
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Imovel } from '../types';
import { formatCurrency } from '../lib/utils';
import { Bed, Bath, Square, MapPin, MessageSquare, Car } from 'lucide-react';

interface ImovelCardProps {
  imovel: Imovel;
}

const ImovelCard: React.FC<ImovelCardProps> = ({ imovel }) => {
  const navigate = useNavigate();
  const { slug: agencySlug } = useParams<{ slug: string }>();
  
  const mainImage = imovel.media?.items?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const basePath = agencySlug ? `/agencia/${agencySlug}` : '';
    navigate(`${basePath}/imovel/${imovel.slug}?contact=true`);
  };

  return (
    <Link 
      to={agencySlug ? `/agencia/${agencySlug}/imovel/${imovel.slug}` : `/imovel/${imovel.slug}`} 
      className="group bg-white rounded-[2rem] overflow-hidden border border-slate-50 hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative h-72 overflow-hidden bg-slate-100">
        <img 
          src={mainImage} 
          alt={imovel.titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        
        {/* Badges do Anúncio */}
        <div className="absolute top-5 left-5 flex gap-2">
           <div className="bg-[#1c2d51] text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg border border-white/10">
             {imovel.operacao === 'venda' ? 'Venda' : 'Arrendamento'}
           </div>
           {imovel.publicacao?.destaque && (
             <div className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg">
               Destaque
             </div>
           )}
        </div>

        {/* Overlay de Preço e Ref */}
        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
           <div className="text-white">
              <p className="text-2xl font-black">
                {formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro?.preco_venda : imovel.financeiro?.preco_arrendamento) || 0)}
              </p>
           </div>
           <div className="text-white/60 text-[8px] font-black uppercase tracking-widest">Ref: {imovel.ref}</div>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-xl font-black text-[#1c2d51] mb-2 line-clamp-2 leading-tight group-hover:text-[var(--primary, #1c2d51)] transition-colors">
          {imovel.titulo}
        </h3>
        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6">
          <MapPin size={12} className="text-blue-500"/> {imovel.localizacao?.concelho}, {imovel.localizacao?.distrito}
        </div>
        
        {/* Atributos do Imóvel */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-6 border-t border-slate-50 mb-auto">
           <div className="flex items-center gap-2 text-slate-500">
             <span className="text-[10px] font-black">{imovel.tipologia || 'T?'}</span>
           </div>
           <div className="flex items-center gap-2 text-slate-500">
             <Bed size={16} strokeWidth={2.5}/> <span className="text-[10px] font-black">{imovel.divisoes?.quartos || 0}</span>
           </div>
           <div className="flex items-center gap-2 text-slate-500">
             <Bath size={16} strokeWidth={2.5}/> <span className="text-[10px] font-black">{imovel.divisoes?.casas_banho || 0}</span>
           </div>
           <div className="flex items-center gap-2 text-slate-500">
             <Square size={16} strokeWidth={2.5}/> <span className="text-[10px] font-black">{imovel.areas?.area_util_m2 || 0}m²</span>
           </div>
           {imovel.divisoes?.garagem?.tem && (
             <div className="flex items-center gap-2 text-slate-500">
               <Car size={16} strokeWidth={2.5}/> <span className="text-[10px] font-black">{imovel.divisoes?.garagem?.lugares}</span>
             </div>
           )}
        </div>

        <button 
          onClick={handleContactClick}
          className="mt-6 w-full bg-[#1c2d51] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <MessageSquare size={14} /> Contactar Consultor
        </button>
      </div>
    </Link>
  );
};

export default ImovelCard;
