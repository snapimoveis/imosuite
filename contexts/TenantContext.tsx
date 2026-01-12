
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Correct modular imports for Firestore
// Fix: Using @firebase/firestore to resolve missing exported members
import { doc, onSnapshot } from '@firebase/firestore';
import { db } from '../lib/firebase';
import { Tenant } from '../types';
import { DEFAULT_TENANT } from '../constants';
import { useAuth } from './AuthContext';

interface TenantContextType {
  tenant: Tenant;
  setTenant: (tenant: Tenant) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile, user } = useAuth();
  const [tenant, setTenant] = useState<Tenant>(DEFAULT_TENANT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let effectiveTenantId = profile?.tenantId;
    
    if ((!effectiveTenantId || effectiveTenantId === 'pending') && user) {
      effectiveTenantId = `tnt_${user.uid.slice(0, 12)}`;
    }

    if (!effectiveTenantId || effectiveTenantId === 'pending') {
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }

    if (effectiveTenantId === 'default-tenant-uuid') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const tenantRef = doc(db, 'tenants', effectiveTenantId);
    
    const unsubscribe = onSnapshot(tenantRef, (docSnap) => {
      if (docSnap.exists()) {
        const tenantData = { id: docSnap.id, ...(docSnap.data() as any) } as Tenant;
        setTenant(tenantData);
        
        const root = document.documentElement;
        root.style.setProperty('--primary', tenantData.cor_primaria);
        root.style.setProperty('--secondary', tenantData.cor_secundaria || tenantData.cor_primaria);
      }
      setIsLoading(false);
    }, (error) => {
      // Ignorar erros de permissão durante o onboarding inicial
      if (error.code !== 'permission-denied') {
        console.error("Erro no TenantContext:", error);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.tenantId, user?.uid]);

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
