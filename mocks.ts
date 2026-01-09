
import { Imovel } from './types';

export const MOCK_IMOVEIS: Imovel[] = [
  {
    id: '1',
    tenant_id: 'default-tenant-uuid',
    ref: 'IMO-101',
    titulo: 'Moderno Apartamento T2 com Vista Rio',
    slug: 'apartamento-t2-vista-rio-lisboa',
    tipo_imovel: 'apartamento',
    subtipo_imovel: null,
    // tipology property
    tipology: 'T2',
    tipologia: 'T2',
    estado_conservacao: 'usado',
    ano_construcao: 2020,
    operacao: 'venda',
    arrendamento_tipo: null,
    arrendamento_duracao_min_meses: null,
    disponivel_imediato: true,
    localizacao: {
      pais: 'Portugal',
      distrito: 'Lisboa',
      concelho: 'Lisboa',
      freguesia: null,
      codigo_postal: '1000-001',
      morada: 'Avenida da Liberdade',
      porta: '1',
      lat: 38.7167,
      lng: -9.1392,
      expor_morada: false
    },
    areas: {
      area_util_m2: 95,
      area_bruta_m2: 110,
      area_terreno_m2: null,
      pisos: 1,
      andar: 3,
      elevador: true
    },
    divisoes: {
      quartos: 2,
      casas_banho: 2,
      garagem: {
        tem: true,
        lugares: 1
      }
    },
    caracteristicas: ['Ar Condicionado', 'Varanda', 'Cozinha Equipada', 'Elevador'],
    certificacao: {
      certificado_energetico: 'A',
      licenca_utilizacao: '123/2020',
      licenca_utilizacao_numero: '123',
      licenca_utilizacao_data: '2020-01-01',
      isento_licenca_utilizacao: false
    },
    financeiro: {
      preco_venda: 450000,
      preco_arrendamento: null,
      negociavel: true,
      condominio_mensal: 50,
      imi_anual: 300,
      caucao_meses: null,
      despesas_incluidas: []
    },
    descricao: {
      curta: 'Moderno Apartamento T2 com Vista Rio em Lisboa',
      completa_md: 'Descrição completa aqui...',
      gerada_por_ia: false,
      ultima_geracao_ia_at: null
    },
    media: {
      cover_media_id: 'm1',
      total: 1,
      items: [
        { id: 'm1', type: 'image', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', storage_path: '', order: 0, is_cover: true, alt: 'Vista Rio', created_at: new Date().toISOString() }
      ]
    },
    publicacao: {
      estado: 'publicado',
      publicar_no_site: true,
      destaque: true,
      badges: [],
      data_publicacao: new Date().toISOString()
    },
    tracking: {
      views: 1250,
      favorites: 45
    },
    owner_uid: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    tenant_id: 'default-tenant-uuid',
    ref: 'IMO-102',
    titulo: 'Moradia de Luxo V4 com Piscina Privada',
    slug: 'moradia-luxo-v4-cascais',
    tipo_imovel: 'moradia',
    subtipo_imovel: null,
    // tipology property
    tipology: 'V4',
    tipologia: 'V4',
    estado_conservacao: 'novo',
    ano_construcao: 2023,
    operacao: 'venda',
    arrendamento_tipo: null,
    arrendamento_duracao_min_meses: null,
    disponivel_imediato: true,
    localizacao: {
      pais: 'Portugal',
      distrito: 'Lisboa',
      concelho: 'Cascais',
      freguesia: null,
      codigo_postal: '2750-001',
      morada: 'Quinta da Marinha',
      porta: '12',
      lat: 38.7000,
      lng: -9.4500,
      expor_morada: false
    },
    areas: {
      area_util_m2: 240,
      area_bruta_m2: 350,
      area_terreno_m2: 600,
      pisos: 2,
      andar: null,
      elevador: false
    },
    divisoes: {
      quartos: 4,
      casas_banho: 4,
      garagem: {
        tem: true,
        lugares: 2
      }
    },
    caracteristicas: ['Piscina', 'Jardim', 'Lareira', 'Domótica'],
    certificacao: {
      certificado_energetico: 'A+',
      licenca_utilizacao: '456/2023',
      licenca_utilizacao_numero: '456',
      licenca_utilizacao_data: '2023-05-01',
      isento_licenca_utilizacao: false
    },
    financeiro: {
      preco_venda: 1250000,
      preco_arrendamento: null,
      negociavel: false,
      condominio_mensal: null,
      imi_anual: 800,
      caucao_meses: null,
      despesas_incluidas: []
    },
    descricao: {
      curta: 'Moradia de Luxo V4 com Piscina Privada em Cascais',
      completa_md: 'Descrição completa aqui...',
      gerada_por_ia: false,
      ultima_geracao_ia_at: null
    },
    media: {
      cover_media_id: 'm2',
      total: 1,
      items: [
        { id: 'm2', type: 'image', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', storage_path: '', order: 0, is_cover: true, alt: 'Moradia Cascais', created_at: new Date().toISOString() }
      ]
    },
    publicacao: {
      estado: 'publicado',
      publicar_no_site: true,
      destaque: true,
      badges: [],
      data_publicacao: new Date().toISOString()
    },
    tracking: {
      views: 890,
      favorites: 72
    },
    owner_uid: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    tenant_id: 'default-tenant-uuid',
    ref: 'IMO-103',
    titulo: 'Estúdio Moderno em Pleno Centro Histórico',
    slug: 'estudio-moderno-porto-centro',
    tipo_imovel: 'apartamento',
    subtipo_imovel: null,
    // tipology property
    tipology: 'T0',
    tipologia: 'T0',
    estado_conservacao: 'renovado',
    ano_construcao: 1950,
    operacao: 'arrendamento',
    arrendamento_tipo: 'residencial',
    arrendamento_duracao_min_meses: 12,
    disponivel_imediato: true,
    localizacao: {
      pais: 'Portugal',
      distrito: 'Porto',
      concelho: 'Porto',
      freguesia: 'Cedofeita',
      codigo_postal: '4000-001',
      morada: 'Rua das Flores',
      porta: '45',
      lat: 41.1455,
      lng: -8.6108,
      expor_morada: true
    },
    areas: {
      area_util_m2: 35,
      area_bruta_m2: 40,
      area_terreno_m2: null,
      pisos: 1,
      andar: 2,
      elevador: true
    },
    divisoes: {
      quartos: 0,
      casas_banho: 1,
      garagem: {
        tem: false,
        lugares: 0
      }
    },
    caracteristicas: ['Mobilado', 'Janelas Duplas', 'Metro à porta'],
    certificacao: {
      certificado_energetico: 'C',
      licenca_utilizacao: '789/1950',
      licenca_utilizacao_numero: '789',
      licenca_utilizacao_data: '1950-10-10',
      isento_licenca_utilizacao: false
    },
    financeiro: {
      preco_venda: null,
      preco_arrendamento: 950,
      negociavel: false,
      condominio_mensal: 30,
      imi_anual: null,
      caucao_meses: 2,
      despesas_incluidas: []
    },
    descricao: {
      curta: 'Estúdio Moderno em Pleno Centro Histórico do Porto',
      completa_md: 'Descrição completa aqui...',
      gerada_por_ia: false,
      ultima_geracao_ia_at: null
    },
    media: {
      cover_media_id: 'm3',
      total: 1,
      items: [
        { id: 'm3', type: 'image', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', storage_path: '', order: 0, is_cover: true, alt: 'Estúdio Porto', created_at: new Date().toISOString() }
      ]
    },
    publicacao: {
      estado: 'publicado',
      publicar_no_site: true,
      destaque: true,
      badges: [],
      data_publicacao: new Date().toISOString()
    },
    tracking: {
      views: 4500,
      favorites: 120
    },
    owner_uid: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
