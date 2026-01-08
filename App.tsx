
import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import { TenantProvider } from './contexts/TenantContext.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import Marketing from './pages/Marketing.tsx';
import FeaturesPage from './pages/Features.tsx';
import PricingPage from './pages/Pricing.tsx';
import Register from './pages/onboarding/Register.tsx';
import Login from './pages/Login.tsx';
import OnboardingFlow from './pages/onboarding/OnboardingFlow.tsx';
import Dashboard from './pages/admin/Dashboard.tsx';
import AdminImoveis from './pages/admin/AdminImoveis.tsx';
import AdminSettings from './pages/admin/AdminSettings.tsx';
import AdminUsers from './pages/admin/AdminUsers.tsx';
import AdminShell from './components/admin/AdminShell.tsx';
import PublicPortal from './pages/PublicPortal.tsx';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c2d51]"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const BrandLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1"><Outlet /></main>
    <Footer />
  </div>
);

const AdminLayout = () => <AdminShell><Outlet /></AdminShell>;

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TenantProvider>
        <Router>
          <Routes>
            {/* SaaS Marketing */}
            <Route element={<BrandLayout />}>
              <Route path="/" element={<Marketing />} />
              <Route path="/funcionalidades" element={<FeaturesPage />} />
              <Route path="/planos" element={<PricingPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Portais das Agências (imobiliaria.pt/nome-da-agencia) */}
            <Route path="/agencia/:slug" element={<PublicPortal />} />
            <Route path="/demo" element={<Navigate to="/agencia/demo-imosuite" replace />} />

            {/* Admin & Onboarding */}
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="imoveis" element={<AdminImoveis />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;
