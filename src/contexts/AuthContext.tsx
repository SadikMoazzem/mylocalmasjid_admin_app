import { createContext, useContext, useEffect, ReactNode } from 'react';
import { authApi, masjidApi } from '../services/api';
import { useStore } from '../store/useStore';

interface AuthContextType {
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setMasjid, setIsAuthenticated, reset } = useStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
          
          if (userData.related_masjid) {
            const masjidData = await masjidApi.getMasjid(userData.related_masjid);
            setMasjid(masjidData);
          }
          
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error initializing auth:', error);
          localStorage.removeItem('token');
          reset();
        }
      }
    };

    initAuth();
  }, [setUser, setMasjid, setIsAuthenticated, reset]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.access_token) {
      localStorage.setItem('token', response.access_token);
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      
      if (userData.related_masjid) {
        const masjidData = await masjidApi.getMasjid(userData.related_masjid);
        setMasjid(masjidData);
      }
      
      setIsAuthenticated(true);
    } else {
      throw new Error('No token received');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    reset();
  };

  return (
    <AuthContext.Provider value={{ isLoading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}