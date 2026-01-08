import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// ADICIONADO .tsx EM TODAS AS IMPORTAÇÕES LOCAIS ABAIXO:
import { TenantProvider } from './contexts/TenantContext.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import Home from './pages/Home.tsx';
import Marketing from './pages/Marketing.tsx';
import PricingPage from './pages/Pricing.tsx';
import Register from './pages/onboarding/Register.tsx';
import Login from './pages/Login.tsx';
import OnboardingFlow from './pages/onboarding/OnboardingFlow.tsx';
import Dashboard from './pages/admin/Dashboard.tsx';
import AdminImoveis from './pages/admin/AdminImoveis.tsx';
import AdminSettings from './pages/admin/AdminSettings.tsx';
import AdminUsers from './pages/admin/AdminUsers.tsx';
import AdminShell from './components/admin/AdminShell.tsx';

// Protected Route Component
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c2d51]"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

// Main Brand Layout
const BrandLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Onboarding Layout
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

// Placeholder Component
const Placeholder = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="p-20 text-center bg-white rounded-[2rem] border border-slate-100 mx-4 my-10 max-w-4xl mx-auto shadow-sm font-brand">
    <h2 className="text-3xl font-black text-[#1c2d51] mb-4 tracking-tighter">{title}</h2>
    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Funcionalidade em desenvolvimento</p>
    {children}
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TenantProvider>
        <Router>
          <Routes>
            {/* SaaS Public Routes */}
            <Route element={<BrandLayout />}>
              <Route path="/" element={<Marketing />} />
              <Route path="/planos" element={<PricingPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              
              {/* Site da Imobiliária (Demo) */}
              <Route path="/demo" element={<Home />} />
              <Route path="/imoveis" element={<Placeholder title="Catálogo Completo" />} />
              <Route path="/imovel/:slug" element={<Placeholder title="Detalhe do Imóvel" />} />
              <Route path="/contact" element={<Placeholder title="Contacto Imobiliário" />} />
            </Route>

            {/* Onboarding Flow (Protected) */}
            <Route element={<ProtectedRoute><OnboardingLayout /></ProtectedRoute>}>
              <Route path="/onboarding" element={<OnboardingFlow />} />
            </Route>

            {/* Área Administrativa (Protected) */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="imoveis" element={<AdminImoveis />} />
              <Route path="leads" element={<Placeholder title="Gestão de Leads" />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;