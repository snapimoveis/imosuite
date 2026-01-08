
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

export interface Imovel {
  id: string;
  tenant_id: string;
  referencia: string;
  titulo: string;
  slug: string;
  tipo_negocio: 'venda' | 'arrendamento' | 'venda_arrendamento';
  tipo_imovel: string;
  tipologia?: string;
  preco?: number;
  preco_arrendamento?: number;
  area_bruta_m2?: number;
  area_util_m2?: number;
  quartos?: number;
  casas_banho?: number;
  garagem: number;
  ano_construcao?: number;
  distrito: string;
  concelho: string;
  freguesia?: string;
  morada?: string;
  descricao_curta?: string;
  descricao_md?: string;
  caracteristicas: string[];
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
  tipo: 'foto' | 'video' | 'planta';
  ordem: number;
  principal: boolean;
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
