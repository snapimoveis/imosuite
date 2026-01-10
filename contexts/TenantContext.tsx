
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Correct modular imports for Firestore
import { doc, onSnapshot } from 'firebase/firestore';
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
    // Determinar o ID real do tenant: 
    // 1. Do perfil sincronizado
    // 2. Fallback previsível baseado no UID do utilizador
    let effectiveTenantId = profile?.tenantId;
    
    if ((!effectiveTenantId || effectiveTenantId === 'pending') && user) {
      effectiveTenantId = `tnt_${user.uid.slice(0, 12)}`;
    }

    if (!effectiveTenantId || effectiveTenantId === 'pending') {
      const timer = setTimeout(() => setIsLoading(false), 1500);
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
        
        // Aplicar cores ao CSS
        const root = document.documentElement;
        root.style.setProperty('--primary', tenantData.cor_primaria);
        root.style.setProperty('--secondary', tenantData.cor_secundaria || tenantData.cor_primaria);
      } else if (user) {
        // Se o documento ainda não existe, mantemos o ID para permitir a criação via gravação
        setTenant(prev => ({ ...prev, id: effectiveTenantId }));
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Erro no TenantContext:", error);
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
