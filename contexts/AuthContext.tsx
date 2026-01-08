
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';

// Added 'super_admin' to role type to ensure type safety in role comparisons throughout the app
interface UserProfile {
  id: string;
  role: 'admin' | 'user' | 'super_admin';
  tenantId: string;
  displayName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Usar onSnapshot em vez de getDoc para o perfil ser reativo
        // Isto resolve o problema do perfil não aparecer logo após o registo
        const profileRef = doc(db, 'users', currentUser.uid);
        
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            setLoading(false);
          } else {
            // Se o doc não existe, definimos um estado temporário mas não bloqueamos o loading para sempre
            setProfile({
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Utilizador',
              role: 'admin',
              tenantId: 'pending'
            });
            // Damos uma chance de o documento ser criado (ex: no Register.tsx)
            // Se após 5 segundos não existir, paramos o loading
            setTimeout(() => setLoading(false), 5000);
          }
        }, (error) => {
          console.error("Erro ao escutar perfil:", error);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
