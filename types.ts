
export type AppRole = 'user' | 'admin' | 'super_admin';

export interface CMSSection {
  id: string;
  type: 'hero' | 'featured' | 'services' | 'recent' | 'cta' | 'testimonials' | 'about_mini';
  enabled: boolean;
  order: number;
  content: {
    title?: string;
    subtitle?: string;
    text?: string;
    button_text?: string;
    button_link?: string;
    image_url?: string;
    items?: any[];
  };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar_url: string;
}

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content_md: string;
  enabled: boolean;
  seo?: { title: string; description: string; };
  missao?: string;
  visao?: string;
  valores?: string[];
  galeria_fotos?: string[];
  equipa?: TeamMember[];
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  order: number;
  is_external: boolean;
}

export interface TenantCMS {
  homepage_sections: CMSSection[];
  pages: CMSPage[];
  menus: {
    main: MenuItem[];
    footer: MenuItem[];
  };
  social: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
    complaints_book_link?: string;
  };
}

export interface TenantSubscription {
  status: 'trialing' | 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete';
  plan_id: 'starter' | 'business';
  trial_ends_at: any;
  current_period_end?: any;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  cancel_at_period_end?: boolean;
}

export interface SEOSettings {
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  google_analytics_id?: string;
}

export interface Tenant {
  id: string;
  slug: string;
  nome: string;
  email: string;
  professional_email?: string;
  telefone?: string;
  morada?: string;
  nif?: string;
  logo_url?: string;
  hero_image_url?: string;
  slogan?: string;
  template_id: 'heritage' | 'canvas' | 'prestige' | 'skyline' | 'luxe';
  cor_primaria: string;
  cor_secundaria: string;
  ativo: boolean;
  onboarding_completed?: boolean;
  subscription: TenantSubscription;
  cms: TenantCMS;
  seo_settings?: SEOSettings;
  custom_domain?: string;
  domain_status?: 'pending' | 'verified' | 'active';
  domain_checked_at?: any;
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
  tipology: string;
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
    garagem: { tem: boolean; lugares: number; };
    varanda: boolean;
    arrecadacao: boolean;
    piscina: boolean;
    jardim: boolean;
  };
  caracteristicas: string[];
  certificacao: {
    certificado_energetico: string;
    licenca_util_numero: string | null;
    licenca_util_data: string | null;
    isento_licenca: boolean;
    estado_licenca: 'sim' | 'processo' | 'isento';
    certificado_energetico_valido_ate?: any;
  };
  financeiro: {
    preco_venda: number | null;
    preco_arrendamento: number | null;
    negociavel: boolean;
    comissao_incluida: boolean;
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
    cover_url?: string | null;
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
  tracking: { views: number; favorites: number; };
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
  tag?: string;
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
  tenant_id: string;
  source_url: string;
  gdpr_consent: boolean;
  gdpr_consent_text: string;
  gdpr_timestamp: any;
  gdpr_ip: string;
  user_agent?: string;
  created_at: any;
}
