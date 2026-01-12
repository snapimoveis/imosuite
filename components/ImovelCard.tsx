
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Imovel } from '../types';
import { formatCurrency } from '../lib/utils';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

interface ImovelCardProps {
  imovel: Imovel;
}

const ImovelCard: React.FC<ImovelCardProps> = ({ imovel }) => {
  const { slug: agencySlug } = useParams<{ slug: string }>();
  const { tenant } = useTenant();
  
  const targetSlug = agencySlug || imovel.tenant_id;
  const mainImage = imovel.media?.cover_url || imovel.media?.items?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';
  const tid = tenant?.template_id || 'heritage';

  // Configuração de Cards baseada no Template
  const cardStyles: Record<string, any> = {
    heritage: "bg-white rounded-none border border-slate-100 shadow-sm",
    canvas: "bg-white rounded-[2rem] border border-slate-50 shadow-md",
    prestige: "bg-neutral-950 rounded-none border border-white/5 grayscale hover:grayscale-0",
    skyline: "bg-white rounded-3xl border border-slate-100 shadow-xl",
    luxe: "bg-white rounded-[3.5rem] border border-[#EAE3D9] shadow-sm"
  };

  return (
    <Link 
      to={`/agencia/${targetSlug}/imovel/${imovel.slug}`} 
      className={`group overflow-hidden transition-all duration-500 flex flex-col h-full ${cardStyles[tid] || cardStyles.heritage}`}
    >
      {/* 
        Fix: Changed 'luxury' to 'prestige' as 'luxury' is not a valid template_id in the Tenant type definition. 
        'prestige' is the intended template for high-end vertical aspect ratio cards as seen in AdminSettings.
      */}
      <div className={`relative overflow-hidden bg-slate-100 ${tid === 'prestige' ? 'aspect-[3/4]' : 'h-64'}`}>
        <img 
          src={mainImage} 
          alt={imovel.titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        
        <div className="absolute top-4 left-4 flex gap-2">
           <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-lg ${tid === 'prestige' ? 'bg-white text-black' : 'bg-[#1c2d51] text-white'}`}>
             {imovel.operacao}
           </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
           <div className="text-white">
              <p className={`text-xl font-black ${tid === 'prestige' ? 'italic' : ''}`}>
                {formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro?.preco_venda : imovel.financeiro?.preco_arrendamento) || 0)}
              </p>
           </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className={`text-lg font-black mb-1 line-clamp-2 leading-tight transition-colors ${tid === 'prestige' ? 'text-white italic group-hover:text-blue-400' : 'text-[#1c2d51] group-hover:text-[var(--primary)]'}`}>
          {imovel.titulo}
        </h3>
        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-4">
          <MapPin size={10} className="text-blue-500"/> {imovel.localizacao?.concelho}
        </div>
        
        <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 py-4 border-t mt-auto ${tid === 'prestige' ? 'border-white/5 text-slate-400' : 'border-slate-50 text-slate-500'}`}>
           <div className="flex items-center gap-1.5">
             <Bed size={14} /> <span className="text-[9px] font-black">{imovel.divisoes?.quartos || 0}</span>
           </div>
           <div className="flex items-center gap-1.5">
             <Bath size={14} /> <span className="text-[9px] font-black">{imovel.divisoes?.casas_banho || 0}</span>
           </div>
           <div className="flex items-center gap-1.5">
             <Square size={14} /> <span className="text-[9px] font-black">{imovel.areas?.area_util_m2 || 0}m²</span>
           </div>
        </div>
      </div>
    </Link>
  );
};

export default ImovelCard;
