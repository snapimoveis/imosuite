
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Tenant } from '../types';
import { DEFAULT_TENANT } from '../constants.tsx';
import { useAuth } from './AuthContext.tsx';

interface TenantContextType {
  tenant: Tenant;
  setTenant: (tenant: Tenant) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [tenant, setTenant] = useState<Tenant>(DEFAULT_TENANT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Se o perfil está pendente, não tentamos carregar ainda, mas também não ficamos em loading eterno
    if (!profile?.tenantId || profile.tenantId === 'pending') {
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }

    if (profile.tenantId === 'default-tenant-uuid') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Timeout de segurança: Se o Firestore não responder em 3.5s, paramos o spinner
    const safetyTimeout = setTimeout(() => {
      console.warn("TenantContext: Firestore demorou demasiado. A libertar UI...");
      setIsLoading(false);
    }, 3500);

    const tenantRef = doc(db, 'tenants', profile.tenantId);
    
    const unsubscribe = onSnapshot(tenantRef, (docSnap) => {
      clearTimeout(safetyTimeout);
      if (docSnap.exists()) {
        const tenantData = { id: docSnap.id, ...docSnap.data() } as Tenant;
        setTenant(tenantData);
        
        // Aplicar cores
        const root = document.documentElement;
        root.style.setProperty('--primary', tenantData.cor_primaria);
        root.style.setProperty('--secondary', tenantData.cor_secundaria || tenantData.cor_primaria);
      }
      setIsLoading(false);
    }, (error) => {
      clearTimeout(safetyTimeout);
      console.error("Erro ao carregar dados da agência:", error);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [profile?.tenantId]);

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
