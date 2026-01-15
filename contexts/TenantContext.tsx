
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Correct modular imports for Firestore
import { doc, onSnapshot, collection, query, where, getDocs, limit } from 'firebase/firestore';
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

  // Efeito para resolução de Tenant via Domínio/Hostname (Public Facing)
  useEffect(() => {
    const resolveTenantByHost = async () => {
      const hostname = window.location.hostname;
      
      // Lista expandida de domínios que NÃO devem disparar consulta de Tenant (SaaS Principal ou Dev)
      const isMainDomain = 
        hostname === 'imosuite.pt' || 
        hostname === 'www.imosuite.pt' ||
        hostname === 'localhost' || 
        hostname === '127.0.0.1' ||
        hostname.includes('vercel.app') || 
        hostname.includes('firebaseapp.com') || 
        hostname.includes('web.app');

      const isSystemSubdomain = hostname.endsWith('.imosuite.pt');

      if (!isMainDomain) {
        try {
          let q;
          if (isSystemSubdomain) {
            const slug = hostname.split('.')[0];
            if (slug === 'demo' || slug === 'www' || slug === 'app') return; 
            q = query(collection(db, 'tenants'), where('slug', '==', slug), limit(1));
          } else {
            // Domínio Personalizado
            q = query(collection(db, 'tenants'), where('custom_domain', '==', hostname), where('domain_status', '==', 'active'), limit(1));
          }

          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const tenantData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Tenant;
            applyBranding(tenantData);
            setTenant(tenantData);
          }
        } catch (err: any) {
          // Silenciamos erros de permissão na resolução de host para não quebrar o carregamento inicial
          // em domínios de preview ou se as regras de Firestore ainda não permitirem leitura pública.
          if (err.code !== 'permission-denied') {
            console.debug("Info: Resolução de host ignorada ou sem permissão pública.");
          }
        }
      }
    };

    resolveTenantByHost();
  }, []);

  const applyBranding = (tenantData: Tenant) => {
    const root = document.documentElement;
    if (tenantData.cor_primaria) {
      root.style.setProperty('--primary', tenantData.cor_primaria);
    }
    if (tenantData.cor_secundaria) {
      root.style.setProperty('--secondary', tenantData.cor_secundaria);
    } else {
      root.style.setProperty('--secondary', tenantData.cor_primaria);
    }
  };

  useEffect(() => {
    // Lógica para Admin (Baseada no Perfil/Login)
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
        applyBranding(tenantData);
      }
      setIsLoading(false);
    }, (error) => {
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
