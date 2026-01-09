
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
  hero_image_url?: string; // Novo campo
  slogan?: string;
  template_id?: string;
  cor_primaria: string;
  cor_secundaria: string;
  ativo: boolean;
  onboarding_completed?: boolean;
  created_at: any;
  updated_at?: any;
}

export type TipoImovel = 'apartamento' | 'moradia' | 'casa_rustica' | 'ruina' | 'escritorio' | 'comercial' | 'armazem' | 'garagem' | 'arrecadacao' | 'predio' | 'terreno';

export interface Imovel {
  id: string;
  tenant_id: string;
  ref: string;
  slug: string;
  titulo: string;
  tipo_imovel: TipoImovel;
  subtipo_imovel: string | null;
  tipology: string; // Tipologia
  tipologia: string;
  estado_conservacao: 'novo' | 'usado' | 'renovado' | 'para_renovar';
  ano_construcao: number | null;

  operacao: 'venda' | 'arrendamento' | 'venda_arrendamento';
  arrendamento_tipo: 'residencial' | 'temporario' | 'ferias' | null;
  arrendamento_duracao_min_meses: number | null;
  disponivel_imediato: boolean;

  localizacao: {
    pais: string;
    distrito: string;
    concelho: string;
    freguesia: string | null;
    codigo_postal: string | null;
    morada: string | null;
    porta: string | null;
    lat: number | null;
    lng: number | null;
    expor_morada: boolean;
  };

  areas: {
    area_util_m2: number | null;
    area_bruta_m2: number | null;
    area_terreno_m2: number | null;
    pisos: number | null;
    andar: number | string | null;
    elevador: boolean;
  };

  divisoes: {
    quartos: number;
    casas_banho: number;
    garagem: {
      tem: boolean;
      lugares: number;
    };
  };

  caracteristicas: string[];

  certificacao: {
    certificado_energetico: string;
    licenca_utilizacao: string | null;
    licenca_utilizacao_numero: string | null;
    licenca_utilizacao_data: string | null;
    isento_licenca_utilizacao: boolean;
  };

  financeiro: {
    preco_venda: number | null;
    preco_arrendamento: number | null;
    negociavel: boolean;
    condominio_mensal: number | null;
    imi_anual: number | null;
    caucao_meses: number | null;
    despesas_incluidas: string[];
  };

  descricao: {
    curta: string;
    completa_md: string;
    gerada_por_ia: boolean;
    ultima_geracao_ia_at: any | null;
  };

  media: {
    cover_media_id: string | null;
    total: number;
    items?: ImovelMedia[];
  };

  publicacao: {
    estado: 'rascunho' | 'publicado' | 'reservado' | 'vendido' | 'arrendado';
    publicar_no_site: boolean;
    destaque: boolean;
    badges: string[];
    data_publicacao: any | null;
  };

  tracking: {
    views: number;
    favorites: number;
  };

  owner_uid: string;
  created_at: any;
  updated_at: any;
}

export interface ImovelMedia {
  id: string;
  type: 'image' | 'video' | 'floorplan' | 'document' | 'tour360';
  url: string;
  storage_path: string;
  order: number;
  is_cover: boolean;
  alt: string;
  created_at: any;
}

export interface Lead {
  id: string;
  tipo: 'contacto' | 'visita';
  nome: string;
  email: string;
  telefone?: string;
  mensagem: string;
  property_id: string;
  property_ref: string;
  estado: 'novo' | 'em_analise' | 'respondido' | 'arquivado';
  lido: boolean;
  created_at: any;
}
