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
        title: 'Sobre a nossa Agência', 
        text: 'Líderes no mercado local com mais de uma década de experiência a transformar sonhos em moradas reais. A nossa equipa combina tecnologia de ponta com um atendimento profundamente humano.',
        image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'
      } 
    },
    { 
      id: 'h4', 
      type: 'services', 
      enabled: true, 
      order: 3, 
      content: { 
        title: 'Fale Connosco', 
        text: 'Estamos aqui para ajudar a esclarecer as suas dúvidas e encontrar o imóvel ideal para si.'
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
      { id: 'm2', label: 'Propriedades', path: 'imoveis', order: 1, is_external: false },
      { id: 'm3', label: 'Agência', path: 'quem-somos', order: 2, is_external: false },
      { id: 'm4', label: 'Contactos', path: 'contactos', order: 3, is_external: false }
    ],
    footer: [
      { id: 'f1', label: 'Política de Privacidade', path: 'privacidade', order: 0, is_external: false },
      { id: 'f2', label: 'Resolução de Litígios', path: 'resolucao-de-litigios', order: 1, is_external: false },
      { id: 'f3', label: 'Livro de Reclamações', path: 'https://www.livroreclamacoes.pt/Inicio/', order: 2, is_external: true }
    ]
  },
  pages: [
    { 
      id: 'p1', 
      title: 'A Nossa Agência', 
      slug: 'quem-somos', 
      content_md: 'Fundada com o propósito de simplificar o mercado imobiliário em Portugal, a nossa agência destaca-se pela transparência e eficácia. Acreditamos que cada casa conta uma história e estamos aqui para garantir que a sua seja de sucesso.', 
      enabled: true,
      missao: 'Proporcionar um serviço de excelência na mediação imobiliária, focando na personalização e satisfação total do cliente.',
      visao: 'Ser a agência de referência em Portugal pela inovação tecnológica e ética profissional.',
      valores: ['Transparência', 'Integridade', 'Foco no Cliente', 'Inovação'],
      galeria_fotos: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
        'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
        'https://images.unsplash.com/photo-1522071823991-b518ee7f1d98?w=800'
      ],
      equipa: []
    },
    { id: 'p2', title: 'Contactos', slug: 'contactos', content_md: 'Estamos localizados no coração de Lisboa, prontos para o receber para um café e uma conversa sobre o seu próximo investimento.', enabled: true },
    {
      id: 'p3',
      title: 'Resolução Alternativa de Litígios',
      slug: 'resolucao-de-litigios',
      enabled: true,
      content_md: `Em caso de litígio o consumidor pode recorrer a uma Entidade de Resolução Alternativa de Litígios de consumo:

Centro de Arbitragem de Conflitos de Consumo de Lisboa
http://www.centroarbitragemlisboa.pt

Centro de Arbitragem de Conflitos de Consumo do Vale do Ave/Tribunal Arbitral
http://www.triave.pt

CIAB – Centro de Informação, Mediação e Arbitragem de Consumo (Tribunal Arbitral de Consumo)
http://www.ciab.pt/pt

CNIACC – Centro Nacional de Informação e Arbitragem de Conflitos de Consumo
https://www.cniacc.pt/pt/

Centro de Arbitragem de Conflitos de Consumo do Distrito de Coimbra
http://www.centrodearbitragemdecoimbra.com

Centro de Informação, Mediação e Arbitragem de Consumo do Algarve
http://www.consumoalgarve.pt

Centro de Informação de Consumo e Arbitragem do Porto
http://www.cicap.pt

Centro de Arbitragem de Conflitos de Consumo da Madeira
https://www.madeira.gov.pt/cacc

Mais informações em Portal do Consumidor
www.consumidor.pt`
    }
  ],
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
    whatsapp: ''
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
  subscription: {
    status: 'active',
    plan_id: 'business',
    trial_ends_at: null,
  },
  cms: DEFAULT_TENANT_CMS,
  ativo: true,
  onboarding_completed: true,
  created_at: new Date().toISOString()
};