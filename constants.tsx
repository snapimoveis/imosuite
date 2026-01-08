
import React from 'react';
import { Home, Building2, Landmark, LayoutGrid, Users, MessageSquare, Settings, BarChart3, Search } from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin', icon: <BarChart3 className="w-5 h-5" /> },
  { name: 'Imóveis', path: '/admin/imoveis', icon: <Building2 className="w-5 h-5" /> },
  { name: 'Leads', path: '/admin/leads', icon: <MessageSquare className="w-5 h-5" /> },
  { name: 'Utilizadores', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { name: 'Configurações', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

export const DEFAULT_TENANT = {
  id: 'default-tenant-uuid',
  slug: 'demo-imosuite',
  nome: 'ImoSuite Demo',
  email: 'contato@demo.pt',
  telefone: '+351 210 000 000',
  cor_primaria: '#1c2d51',
  cor_secundaria: '#1c2d51',
  ativo: true,
  created_at: new Date().toISOString()
};
