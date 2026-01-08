
import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { TenantProvider } from './contexts/TenantContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Marketing from './pages/Marketing';
import PricingPage from './pages/Pricing';
import Register from './pages/onboarding/Register';
import Login from './pages/Login';
import OnboardingFlow from './pages/onboarding/OnboardingFlow';
import Dashboard from './pages/admin/Dashboard';
import AdminImoveis from './pages/admin/AdminImoveis';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminShell from './components/admin/AdminShell';

// Protected Route Component - Made children optional to fix TypeScript "property children is missing" errors
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

// Placeholder Component - Made children optional to fix TypeScript "property children is missing" errors on lines 90 and 95
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
