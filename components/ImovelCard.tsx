
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Imovel } from '../types';
import { formatCurrency } from '../lib/utils';
import { Bed, Bath, Square, MapPin } from 'lucide-react';

interface ImovelCardProps {
  imovel: Imovel;
}

const ImovelCard: React.FC<ImovelCardProps> = ({ imovel }) => {
  const { slug: agencySlug } = useParams<{ slug: string }>();
  
  // Se não houver slug na URL (ex: na home do SaaS), usamos o tenant_id como fallback
  // mas o ideal é que os cards em portais públicos sempre usem o slug da agência
  const targetSlug = agencySlug || imovel.tenant_id;
  const mainImage = imovel.media?.items?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';

  return (
    <Link 
      to={`/agencia/${targetSlug}/imovel/${imovel.slug}`} 
      className="group bg-white rounded-[2rem] overflow-hidden border border-slate-50 hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <img 
          src={mainImage} 
          alt={imovel.titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        
        <div className="absolute top-4 left-4 flex gap-2">
           <div className="bg-[#1c2d51] text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-lg border border-white/10">
             {imovel.operacao}
           </div>
           {imovel.publicacao?.destaque && (
             <div className="bg-amber-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-lg">
               Destaque
             </div>
           )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
           <div className="text-white">
              <p className="text-xl font-black">
                {formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro?.preco_venda : imovel.financeiro?.preco_arrendamento) || 0)}
              </p>
           </div>
           <div className="text-white/60 text-[7px] font-black uppercase tracking-widest">Ref: {imovel.ref}</div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-black text-[#1c2d51] mb-1 line-clamp-2 leading-tight group-hover:text-[var(--primary)] transition-colors">
          {imovel.titulo}
        </h3>
        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-4">
          <MapPin size={10} className="text-blue-500"/> {imovel.localizacao?.concelho}, {imovel.localizacao?.distrito}
        </div>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 border-t border-slate-50 mt-auto">
           <div className="flex items-center gap-1.5 text-slate-500">
             <span className="text-[9px] font-black">{imovel.tipologia}</span>
           </div>
           <div className="flex items-center gap-1.5 text-slate-400">
             <Bed size={14} /> <span className="text-[9px] font-black">{imovel.divisoes?.quartos || 0}</span>
           </div>
           <div className="flex items-center gap-1.5 text-slate-400">
             <Bath size={14} /> <span className="text-[9px] font-black">{imovel.divisoes?.casas_banho || 0}</span>
           </div>
           <div className="flex items-center gap-1.5 text-slate-400">
             <Square size={14} /> <span className="text-[9px] font-black">{imovel.areas?.area_util_m2 || 0}m²</span>
           </div>
        </div>
      </div>
    </Link>
  );
};

export default ImovelCard;
