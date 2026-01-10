
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from '../lib/firebase';

interface UserProfile {
  id: string;
  role: 'admin' | 'user' | 'super_admin';
  tenantId: string;
  displayName: string;
  email: string;
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
        
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            setLoading(false);
          } else {
            // Se o documento não existe, definimos um perfil básico para não travar a UI
            // mas mantemos o tenantId como 'pending' para forçar a inicialização se necessário
            setProfile({
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Utilizador',
              role: 'admin',
              tenantId: 'pending'
            });
            setLoading(false); // Definimos logo como false para permitir a interação
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
