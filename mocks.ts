
import { Imovel, Lead } from './types';

export const MOCK_IMOVEIS: Imovel[] = [
  {
    id: '1',
    tenant_id: 'default-tenant-uuid',
    referencia: 'IMO-101',
    titulo: 'Moderno Apartamento T2 com Vista Rio',
    slug: 'apartamento-t2-vista-rio-lisboa',
    tipo_negocio: 'venda',
    tipo_imovel: 'Apartamento',
    tipologia: 'T2',
    preco: 450000,
    area_util_m2: 95,
    area_bruta_m2: 110,
    quartos: 2,
    casas_banho: 2,
    garagem: 1,
    distrito: 'Lisboa',
    concelho: 'Lisboa',
    caracteristicas: ['Ar Condicionado', 'Varanda', 'Cozinha Equipada', 'Elevador'],
    publicado: true,
    destaque: true,
    estado: 'disponivel',
    visualizacoes: 1250,
    media: [
      { id: 'm1', imovel_id: '1', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', tipo: 'foto', ordem: 0, principal: true }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    tenant_id: 'default-tenant-uuid',
    referencia: 'IMO-102',
    titulo: 'Moradia de Luxo V4 com Piscina Privada',
    slug: 'moradia-luxo-v4-cascais',
    tipo_negocio: 'venda',
    tipo_imovel: 'Moradia',
    tipologia: 'V4',
    preco: 1250000,
    area_util_m2: 240,
    area_bruta_m2: 350,
    quartos: 4,
    casas_banho: 4,
    garagem: 2,
    distrito: 'Lisboa',
    concelho: 'Cascais',
    caracteristicas: ['Piscina', 'Jardim', 'Lareira', 'Domótica'],
    publicado: true,
    destaque: true,
    estado: 'disponivel',
    visualizacoes: 890,
    media: [
      { id: 'm2', imovel_id: '2', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', tipo: 'foto', ordem: 0, principal: true }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    tenant_id: 'default-tenant-uuid',
    referencia: 'IMO-103',
    titulo: 'Estúdio Moderno em Pleno Centro Histórico',
    slug: 'estudio-moderno-porto-centro',
    tipo_negocio: 'arrendamento',
    tipo_imovel: 'Apartamento',
    tipologia: 'T0',
    preco_arrendamento: 950,
    area_util_m2: 35,
    area_bruta_m2: 40,
    quartos: 0,
    casas_banho: 1,
    garagem: 0,
    distrito: 'Porto',
    concelho: 'Porto',
    caracteristicas: ['Mobilado', 'Janelas Duplas', 'Metro à porta'],
    publicado: true,
    destaque: true,
    estado: 'disponivel',
    visualizacoes: 4500,
    media: [
      { id: 'm3', imovel_id: '3', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', tipo: 'foto', ordem: 0, principal: true }
    ],
    created_at: new Date().toISOString()
  }
];
