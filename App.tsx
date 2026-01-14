import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import { TenantProvider } from './contexts/TenantContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Marketing from './pages/Marketing';
import FeaturesPage from './pages/Features';
import PricingPage from './pages/Pricing';
import Register from './pages/onboarding/Register';
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PrivacyPolicySaaS from './pages/PrivacyPolicySaaS';
import DPA from './pages/DPA';
import TermsOfUse from './pages/TermsOfUse';
import TermsOfUseSaaS from './pages/TermsOfUseSaaS';
import RAL from './pages/RAL';
import OnboardingFlow from './pages/onboarding/OnboardingFlow';
import Dashboard from './pages/admin/Dashboard';
import AdminImoveis from './pages/admin/AdminImoveis';
import AdminLeads from './pages/admin/AdminLeads';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProfile from './pages/admin/AdminProfile';
import AdminCMS from './pages/admin/AdminCMS';
import AdminShell from './components/admin/AdminShell';
import PublicPortal from './pages/PublicPortal';
import PublicImovelDetails from './pages/PublicImovelDetails';
import PublicPage from './pages/PublicPage';
import PublicImoveis from './pages/PublicImoveis';

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
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/privacidade-saas" element={<PrivacyPolicySaaS />} />
              <Route path="/dpa" element={<DPA />} />
              <Route path="/termos" element={<TermsOfUse />} />
              <Route path="/termos-saas" element={<TermsOfUseSaaS />} />
              <Route path="/resolucao-de-litigios" element={<RAL />} />
            </Route>

            {/* Portais das Agências */}
            <Route path="/agencia/:slug" element={<PublicPortal />} />
            <Route path="/agencia/:slug/imoveis" element={<PublicImoveis />} />
            <Route path="/agencia/:slug/imovel/:imovelSlug" element={<PublicImovelDetails />} />
            <Route path="/agencia/:slug/p/:pageSlug" element={<PublicPage />} />
            <Route path="/demo" element={<Navigate to="/agencia/demo-imosuite" replace />} />

            {/* Admin & Onboarding */}
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="imoveis" element={<AdminImoveis />} />
              <Route path="cms" element={<AdminCMS />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;