
import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { TenantProvider } from './contexts/TenantContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Marketing from './pages/Marketing';
import PricingPage from './pages/Pricing';
import Register from './pages/onboarding/Register';
import OnboardingFlow from './pages/onboarding/OnboardingFlow';
import Dashboard from './pages/admin/Dashboard';
import AdminImoveis from './pages/admin/AdminImoveis';
import AdminSettings from './pages/admin/AdminSettings';
import AdminShell from './components/admin/AdminShell';

// Main Brand Layout (Marketing, Pricing, Onboarding)
const BrandLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Onboarding Layout (No Nav/Footer for focus)
const OnboardingLayout = () => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

// Admin Layout
const AdminLayout = () => (
  <AdminShell>
    <Outlet />
  </AdminShell>
);

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-20 text-center bg-white rounded-[2rem] border border-slate-100 mx-4 my-10 max-w-4xl mx-auto shadow-sm">
    <h2 className="text-3xl font-extrabold text-[#1c2d51] mb-4">{title}</h2>
    <p className="text-slate-400 font-bold">Página em desenvolvimento para este demo do SaaS ImoSuite.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <TenantProvider>
      <Router>
        <Routes>
          {/* SaaS Public Routes */}
          <Route element={<BrandLayout />}>
            <Route path="/" element={<Marketing />} />
            <Route path="/planos" element={<PricingPage />} />
            <Route path="/register" element={<Register />} />
            
            {/* Site da Imobiliária (Demo) */}
            <Route path="/demo" element={<Home />} />
            <Route path="/imoveis" element={<Placeholder title="Catálogo Completo" />} />
            <Route path="/imovel/:slug" element={<Placeholder title="Detalhe do Imóvel" />} />
            <Route path="/contact" element={<Placeholder title="Contacto Imobiliário" />} />
          </Route>

          {/* Onboarding Flow (Focused) */}
          <Route element={<OnboardingLayout />}>
            <Route path="/onboarding" element={<OnboardingFlow />} />
          </Route>

          {/* Área Administrativa (Backoffice) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="imoveis" element={<AdminImoveis />} />
            <Route path="leads" element={<Placeholder title="Gestão de Leads" />} />
            <Route path="users" element={<Placeholder title="Gestão de Utilizadores" />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Router>
    </TenantProvider>
  );
};

export default App;
