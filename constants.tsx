import React from 'react';
import { Home, Building2, Landmark, LayoutGrid, Users, MessageSquare, Settings, BarChart3, Search, Globe } from 'lucide-react';
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
        title: 'Sobre a ImoSuite Demo', 
        text: 'Líderes no mercado local com mais de uma década de experiência a transformar sonhos em moradas reais. A nossa equipa combina tecnologia de ponta com um atendimento profundamente humano.',
        image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'
      } 
    },
    { 
      id: 'h5', 
      type: 'cta', 
      enabled: true, 
      order: 4, 
      content: { 
        title: 'Pronto para valorizar o seu património?', 
        subtitle: 'Venda o seu imóvel com quem entende do mercado.',
        button_text: 'Agendar Consultoria' 
      } 
    }
  ],
  menus: {
    main: [
      { id: 'm1', label: 'Início', path: '/', order: 0, is_external: false },
      { id: 'm2', label: 'Propriedades', path: '/imoveis', order: 1, is_external: false },
      { id: 'm3', label: 'Agência', path: '/quem-somos', order: 2, is_external: false },
      { id: 'm4', label: 'Contactos', path: '/contactos', order: 3, is_external: false }
    ],
    footer: [
      { id: 'f1', label: 'Política de Privacidade', path: '/privacidade', order: 0, is_external: false },
      { id: 'f2', label: 'Termos de Serviço', path: '/termos', order: 1, is_external: false }
    ]
  },
  pages: [
    { id: 'p1', title: 'A Nossa Agência', slug: 'quem-somos', content_md: 'Fundada com o propósito de simplificar o mercado imobiliário em Portugal, a nossa agência destaca-se pela transparência e eficácia.', enabled: true },
    { id: 'p2', title: 'Fale Connosco', slug: 'contactos', content_md: 'Estamos localizados no coração de Lisboa, prontos para o receber para um café e uma conversa sobre o seu próximo investimento.', enabled: true }
  ],
  social: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com'
  }
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
  cms: DEFAULT_TENANT_CMS,
  ativo: true,
  onboarding_completed: true,
  created_at: new Date().toISOString()
};