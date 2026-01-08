
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant } from '../types';
import { DEFAULT_TENANT } from '../constants.tsx';

interface TenantContextType {
  tenant: Tenant;
  setTenant: (tenant: Tenant) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant>(DEFAULT_TENANT);
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, we would detect tenant by hostname/slug
  // For this demo, we use default branding
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', tenant.cor_primaria);
    root.style.setProperty('--secondary', tenant.cor_secundaria);
  }, [tenant]);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within a TenantProvider');
  return context;
};
