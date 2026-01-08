
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
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

  // Sincronizar dados do Tenant com a base de dados em tempo real
  useEffect(() => {
    // Se o perfil existe e tem um tenantId válido (não pendente ou default)
    if (profile?.tenantId && profile.tenantId !== 'pending' && profile.tenantId !== 'default-tenant-uuid') {
      setIsLoading(true);
      const tenantRef = doc(db, 'tenants', profile.tenantId);
      
      const unsubscribe = onSnapshot(tenantRef, (docSnap) => {
        if (docSnap.exists()) {
          const tenantData = { id: docSnap.id, ...docSnap.data() } as Tenant;
          setTenant(tenantData);
          
          // Aplicar cores da marca ao CSS global
          const root = document.documentElement;
          root.style.setProperty('--primary', tenantData.cor_primaria);
          root.style.setProperty('--secondary', tenantData.cor_secundaria || tenantData.cor_primaria);
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Erro ao carregar dados da agência:", error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Se não há tenantId, mantém o default
      setIsLoading(false);
    }
  }, [profile?.tenantId]);

  // Aplicar cores iniciais
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', tenant.cor_primaria);
    root.style.setProperty('--secondary', tenant.cor_secundaria);
  }, [tenant.cor_primaria, tenant.cor_secundaria]);

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
