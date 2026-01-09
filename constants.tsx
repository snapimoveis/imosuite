
import React from 'react';
import { Home, Building2, Landmark, LayoutGrid, Users, MessageSquare, Settings, BarChart3, Search, Globe } from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin', icon: <BarChart3 className="w-5 h-5" /> },
  { name: 'Imóveis', path: '/admin/imoveis', icon: <Building2 className="w-5 h-5" /> },
  { name: 'Website & CMS', path: '/admin/cms', icon: <Globe className="w-5 h-5" /> },
  { name: 'Leads', path: '/admin/leads', icon: <MessageSquare className="w-5 h-5" /> },
  { name: 'Utilizadores', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { name: 'Configurações', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

export const DEFAULT_TENANT_CMS = {
  homepage_sections: [
    { id: 'h1', type: 'hero', enabled: true, order: 0, content: { title: 'Encontre o seu lar perfeito', subtitle: 'As melhores oportunidades em Portugal.' } },
    { id: 'h2', type: 'featured', enabled: true, order: 1, content: { title: 'Imóveis em Destaque' } },
    { id: 'h3', type: 'about_mini', enabled: true, order: 2, content: { title: 'Sobre Nós', text: 'Somos especialistas no mercado imobiliário com foco no cliente.' } },
    { id: 'h4', type: 'recent', enabled: true, order: 3, content: { title: 'Adições Recentes' } },
    { id: 'h5', type: 'cta', enabled: true, order: 4, content: { title: 'Quer vender o seu imóvel?', button_text: 'Contacte-nos agora' } }
  ],
  menus: {
    main: [
      { id: 'm1', label: 'Início', path: '/', order: 0, is_external: false },
      { id: 'm2', label: 'Imóveis', path: '/imoveis', order: 1, is_external: false },
      { id: 'm3', label: 'Sobre Nós', path: '/quem-somos', order: 2, is_external: false },
      { id: 'm4', label: 'Contactos', path: '/contactos', order: 3, is_external: false }
    ],
    footer: [
      { id: 'f1', label: 'Privacidade', path: '/privacidade', order: 0, is_external: false },
      { id: 'f2', label: 'Termos', path: '/termos', order: 1, is_external: false }
    ]
  },
  pages: {
    'quem-somos': { title: 'Quem Somos', slug: 'quem-somos', content_md: '# Nossa História\nTrabalhamos para realizar sonhos.', enabled: true },
    'contactos': { title: 'Contactos', slug: 'contactos', content_md: 'Pode encontrar-nos na morada principal.', enabled: true }
  }
};

export const DEFAULT_TENANT = {
  id: 'default-tenant-uuid',
  slug: 'demo-imosuite',
  nome: 'ImoSuite Demo',
  email: 'contato@demo.pt',
  telefone: '+351 210 000 000',
  cor_primaria: '#1c2d51',
  cor_secundaria: '#1c2d51',
  template_id: 'heritage',
  cms: DEFAULT_TENANT_CMS,
  ativo: true,
  created_at: new Date().toISOString()
};
