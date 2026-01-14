
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
// Fix: Using standard modular exports
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  id: string;
  role: 'admin' | 'user' | 'super_admin';
  tenantId: string;
  displayName: string;
  email: string;
  professionalEmail?: string;
  avatar_url?: string;
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
        const profileRef = doc(db, 'users', currentUser.uid);
        
        // Adicionado callback de erro para lidar com permissões insuficientes durante o registo
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Perfil básico temporário enquanto o documento é criado no Register.tsx
            setProfile({
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Utilizador',
              role: 'admin',
              tenantId: 'pending'
            });
          }
          setLoading(false);
        }, (error) => {
          // Erro de permissão é esperado durante os primeiros segundos do registo
          if (error.code !== 'permission-denied') {
             console.error("Erro ao escutar perfil:", error);
          }
          // Se não temos perfil, mantemos o estado carregando ou pendente
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