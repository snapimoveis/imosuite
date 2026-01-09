
export type AppRole = 'user' | 'admin' | 'super_admin';

export interface Tenant {
  id: string;
  slug: string;
  nome: string;
  email: string;
  telefone?: string;
  morada?: string;
  nif?: string;
  logo_url?: string;
  slogan?: string;
  template_id?: string;
  cor_primaria: string;
  cor_secundaria: string;
  ativo: boolean;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at?: any;
}

export type TipoImovel = 'Apartamento' | 'Moradia' | 'Casa rústica' | 'Ruína' | 'Escritório' | 'Espaço comercial' | 'Armazém' | 'Lugar de garagem' | 'Arrecadação' | 'Prédio' | 'Terreno';

export interface Imovel {
  id: string;
  tenant_id: string;
  referencia: string;
  titulo: string;
  slug: string;
  tipo_negocio: 'venda' | 'arrendamento' | 'venda_arrendamento';
  tipo_arrendamento?: 'residencial' | 'temporario' | 'ferias';
  tipo_imovel: TipoImovel;
  tipologia?: string;
  estado_conservacao?: 'novo' | 'usado' | 'renovado' | 'para_renovar';
  preco?: number;
  preco_arrendamento?: number;
  duracao_minima_contrato?: string;
  disponibilidade_imediata: boolean;
  area_bruta_m2?: number;
  area_util_m2?: number;
  area_terreno_m2?: number;
  quartos?: number;
  casas_banho?: number;
  garagem: number;
  n_lugares_garagem?: number;
  ano_construcao?: number;
  n_pisos?: number;
  andar?: string;
  tem_elevador: boolean;
  tem_piscina: boolean;
  tem_jardim: boolean;
  tem_varanda_terraco: boolean;
  distrito: string;
  concelho: string;
  freguesia?: string;
  morada?: string;
  codigo_postal?: string;
  expor_morada_publica: boolean;
  descricao_curta?: string;
  descricao_md?: string;
  caracteristicas: string[];
  certificado_energetico?: 'A+' | 'A' | 'B' | 'B-' | 'C' | 'D' | 'E' | 'F' | 'G' | 'Isento' | 'Em preparação';
  licenca_utilizacao?: string;
  imi_estimado?: number;
  condominio_mensal?: number;
  negociavel: boolean;
  comissao_incluida: boolean;
  publicado: boolean;
  destaque: boolean;
  estado: 'disponivel' | 'reservado' | 'vendido' | 'arrendado';
  visualizacoes: number;
  media: ImovelMedia[];
  created_at: string;
}

export interface ImovelMedia {
  id: string;
  imovel_id: string;
  url: string;
  tipo: 'foto' | 'video' | 'planta' | 'pdf';
  ordem: number;
  principal: boolean;
  alt?: string;
}

export interface Lead {
  id: string;
  tenant_id: string;
  imovel_id?: string;
  nome: string;
  email: string;
  telefone?: string;
  mensagem: string;
  tipo: 'contacto' | 'visita';
  estado: 'novo' | 'em_analise' | 'respondido' | 'arquivado';
  lido: boolean;
  created_at: string;
}
