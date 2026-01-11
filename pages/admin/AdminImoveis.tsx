
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Imovel, TipoImovel, ImovelMedia } from '../../types';
import { 
  Plus, X, Loader2, AlertCircle, Sparkles, Check, ChevronRight, ChevronLeft, 
  Trash, UploadCloud, Building2, Star, Zap, Brush, MoveUp, MoveDown,
  Info, MapPin, Eye, FileText, Camera, Video, Layers, Map, Globe, Trash2, Edit3
} from 'lucide-react';
import { formatCurrency, generateSlug, compressImage } from '../../lib/utils';
import { generatePropertyDescription } from '../../services/geminiService';

const DISTRICTS_DATA: Record<string, string[]> = {
  "Aveiro": ["Águeda", "Albergaria-a-Velha", "Anadia", "Arouca", "Aveiro", "Castelo de Paiva", "Espinho", "Estarreja", "Ílhavo", "Mealhada", "Murtosa", "Oliveira de Azeméis", "Oliveira do Bairro", "Ovar", "Santa Maria da Feira", "São João da Madeira", "Sever do Vouga", "Vagos", "Vale de Cambra"],
  "Beja": ["Aljustrel", "Almodôvar", "Alvito", "Barrancos", "Beja", "Castro Verde", "Cuba", "Ferreira do Alentejo", "Mértola", "Moura", "Odemira", "Ourique", "Serpa", "Vidigueira"],
  "Braga": ["Amares", "Barcelos", "Braga", "Cabeceiras de Basto", "Celorico de Basto", "Esposende", "Fafe", "Guimarães", "Póvoa de Lanhoso", "Terras de Bouro", "Vieira do Minho", "Vila Nova de Famalicão", "Vila Verde", "Vizela"],
  "Bragança": ["Alfândega da Fé", "Bragança", "Carrazeda de Ansiães", "Freixo de Espada à Cinta", "Macedo de Cavaleiros", "Miranda do Douro", "Mirandela", "Mogadouro", "Torre de Moncorvo", "Vila Flor", "Vimioso", "Vinhais"],
  "Castelo Branco": ["Belmonte", "Castelo Branco", "Covilhã", "Fundão", "Idanha-a-Nova", "Oleiros", "Penamacor", "Proença-a-Nova", "Sertã", "Vila de Rei", "Vila Velha de Ródão"],
  "Coimbra": ["Arganil", "Cantanhede", "Coimbra", "Condeixa-a-Nova", "Figueira da Foz", "Góis", "Lousã", "Mira", "Miranda do Corvo", "Montemor-o-Velho", "Oliveira do Hospital", "Pampilhosa da Serra", "Penacova", "Penela", "Soure", "Tábua", "Vila Nova de Poiares"]
};

// Fix: Added missing default export and basic implementation for AdminImoveis to satisfy App.tsx import and provide basic functionality
const AdminImoveis: React.FC = () => {
  const { profile } = useAuth();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProperties = useCallback(async () => {
    if (!profile?.tenantId || profile.tenantId === 'pending') return;
    try {
      const data = await PropertyService.getProperties(profile.tenantId);
      setImoveis(data);
    } catch (err) {
      console.error("Erro ao carregar imóveis:", err);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.tenantId]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleDelete = async (id: string) => {
    if (!profile?.tenantId) return;
    if (!window.confirm("Tem a certeza que deseja eliminar este imóvel?")) return;
    
    try {
      await PropertyService.deleteProperty(profile.tenantId, id);
      setImoveis(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Erro ao eliminar imóvel:", err);
    }
  };

  return (
    <div className="space-y-8 font-brand animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[#1c2d51] tracking-tighter">Imóveis</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gestão da sua carteira imobiliária</p>
        </div>
        <button className="bg-[#1c2d51] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:-translate-y-1 transition-all">
          <Plus size={18} /> Adicionar Imóvel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="animate-spin text-slate-200" size={40} />
          </div>
        ) : imoveis.length === 0 ? (
          <div className="col-span-full bg-white p-20 rounded-[3rem] text-center border border-dashed border-slate-200">
             <Building2 className="mx-auto text-slate-200 mb-4" size={48} />
             <p className="font-black text-slate-300 uppercase text-xs tracking-widest">Ainda não tem imóveis listados.</p>
          </div>
        ) : (
          imoveis.map((imovel) => (
            <div key={imovel.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="relative h-48 bg-slate-100">
                {imovel.media?.cover_url ? (
                  <img src={imovel.media.cover_url} className="w-full h-full object-cover" alt={imovel.titulo} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Building2 size={40}/></div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase text-[#1c2d51]">
                  {imovel.ref}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-black text-[#1c2d51] text-lg line-clamp-1 mb-2">{imovel.titulo}</h3>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mb-4">
                  <MapPin size={12} className="text-blue-500" /> {imovel.localizacao.concelho}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <p className="font-black text-[#1c2d51]">
                     {formatCurrency((imovel.operacao === 'venda' ? imovel.financeiro?.preco_venda : imovel.financeiro?.preco_arrendamento) || 0)}
                   </p>
                   <div className="flex gap-2">
                      <button onClick={() => handleDelete(imovel.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                      <button className="p-2 text-slate-300 hover:text-[#1c2d51] transition-colors"><Edit3 size={18}/></button>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminImoveis;
