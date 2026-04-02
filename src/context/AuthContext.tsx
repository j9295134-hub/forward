import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../utils/api';
import {
  ADMIN_AUTH_EVENT,
  clearStoredAdminSession,
  getStoredAdminSession,
  setStoredAdminSession,
  type AdminSession,
  type AdminUser,
} from '../utils/adminAuth';

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AdminSession | null>(() => getStoredAdminSession());
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredAdminSession()?.token));

  useEffect(() => {
    const syncSession = () => {
      setSession(getStoredAdminSession());
    };

    window.addEventListener(ADMIN_AUTH_EVENT, syncSession);
    window.addEventListener('storage', syncSession);

    return () => {
      window.removeEventListener(ADMIN_AUTH_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const validateSession = async () => {
      if (!session?.token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await authAPI.getCurrentAdmin();
        if (isCancelled) {
          return;
        }

        const nextSession: AdminSession = {
          token: session.token,
          admin: response.admin,
        };

        setStoredAdminSession(nextSession);
        setSession(nextSession);
      } catch {
        if (!isCancelled) {
          clearStoredAdminSession();
          setSession(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    validateSession();

    return () => {
      isCancelled = true;
    };
  }, [session?.token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const nextSession: AdminSession = {
        token: response.token,
        admin: response.admin,
      };

      setStoredAdminSession(nextSession);
      setSession(nextSession);
      setIsLoading(false);
      return true;
    } catch {
      clearStoredAdminSession();
      setSession(null);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    clearStoredAdminSession();
    setSession(null);
    setIsLoading(false);
  };

  const value: AuthContextType = {
    admin: session?.admin ?? null,
    isAuthenticated: Boolean(session?.token && session?.admin),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
