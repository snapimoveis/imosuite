import React from 'react';
import { BarChart3, Building2, Globe, MessageSquare, Users, Settings } from 'lucide-react';
import { Tenant, TenantCMS } from './types';

export const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin', icon: <BarChart3 className="w-5 h-5" /> },
  { name: 'Imóveis', path: '/admin/imoveis', icon: <Building2 className="w-5 h-5" /> },
  { name: 'Website & CMS', path: '/admin/cms', icon: <Globe className="w-5 h-5" /> },
  { name: 'Leads', path: '/admin/leads', icon: <MessageSquare className="w-5 h-5" /> },
  { name: 'Utilizadores', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { name: 'Configurações', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

export const DEFAULT_TENANT_CMS: TenantCMS = {
  homepage_sections: [
    { 
      id: 'h1', 
      type: 'hero', 
      enabled: true, 
      order: 0, 
      content: { 
        title: 'O seu novo capítulo começa aqui.', 
        subtitle: 'Consultoria imobiliária premium com foco em resultados e satisfação.',
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600'
      } 
    },
    { 
      id: 'h2', 
      type: 'featured', 
      enabled: true, 
      order: 1, 
      content: { title: 'Seleção Premium' } 
    },
    { 
      id: 'h3', 
      type: 'about_mini', 
      enabled: true, 
      order: 2, 
      content: { 
        title: 'Sobre a nossa Agência', 
        text: 'Líderes no mercado local com mais de uma década de experiência a transformar sonhos em moradas reais.',
        image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'
      } 
    }
  ],
  menus: {
    main: [
      { id: 'm1', label: 'Início', path: '/', order: 0, is_external: false },
      { id: 'm2', label: 'Propriedades', path: 'imoveis', order: 1, is_external: false },
      { id: 'm3', label: 'Agência', path: 'quem-somos', order: 2, is_external: false },
      { id: 'm4', label: 'Contactos', path: 'contactos', order: 3, is_external: false }
    ],
    footer: [
      { id: 'f1', label: 'Política de Privacidade', path: 'privacidade', order: 0, is_external: false },
      { id: 'f2', label: 'Termos de Serviço', path: 'termos', order: 1, is_external: false },
      { id: 'f3', label: 'RAL - Litígios', path: 'resolucao-de-litigios', order: 2, is_external: false },
      { id: 'f4', label: 'Livro de Reclamações', path: 'https://www.livroreclamacoes.pt/Inicio/', order: 3, is_external: true }
    ]
  },
  pages: [
    { 
      id: 'p1', 
      title: 'A Nossa Agência', 
      slug: 'quem-somos', 
      content_md: 'Fundada com o propósito de simplificar o mercado imobiliário em Portugal, a nossa agência destaca-se pela transparência e eficácia.', 
      enabled: true
    },
    { id: 'p2', title: 'Contactos', slug: 'contactos', content_md: 'Estamos localizados no coração de Lisboa.', enabled: true },
    {
      id: 'p3',
      title: 'Resolução Alternativa de Litígios',
      slug: 'resolucao-de-litigios',
      enabled: true,
      content_md: `Em caso de litígio o consumidor pode recorrer a uma Entidade de Resolução Alternativa de Litígios de consumo:

Centro de Arbitragem de Conflitos de Consumo de Lisboa
http://www.centroarbitragemlisboa.pt

Centro de Arbitragem de Conflitos de Consumo do Vale do Ave
http://www.triave.pt

CIAB – Centro de Informação, Mediação e Arbitragem de Consumo
http://www.ciab.pt/pt

CNIACC – Centro Nacional de Informação e Arbitragem
https://www.cniacc.pt/pt/

Mais informações em Portal do Consumidor: www.consumidor.pt`
    },
    {
      id: 'p4',
      title: 'Política de Privacidade',
      slug: 'privacidade',
      enabled: true,
      content_md: 'Os seus dados são tratados com a máxima segurança e confidencialidade, de acordo com o RGPD.'
    },
    {
      id: 'p5',
      title: 'Termos de Serviço',
      slug: 'termos',
      enabled: true,
      content_md: 'Ao utilizar este website, concorda com as nossas condições de utilização.'
    }
  ],
  social: { facebook: '', instagram: '', linkedin: '', whatsapp: '' }
};

export const DEFAULT_TENANT: Tenant = {
  id: 'default-tenant-uuid',
  slug: 'demo-imosuite',
  nome: 'Heritage Real Estate',
  email: 'geral@heritage-demo.pt',
  telefone: '+351 210 000 000',
  cor_primaria: '#1c2d51',
  cor_secundaria: '#357fb2',
  template_id: 'heritage',
  subscription: { status: 'active', plan_id: 'business', trial_ends_at: null },
  cms: DEFAULT_TENANT_CMS,
  ativo: true,
  onboarding_completed: true,
  created_at: new Date().toISOString()
};