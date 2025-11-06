"use client";

import { useCurrentUser, useLogin, useLogout, useRefreshToken } from '@/hooks/useAuth';
import { ReactNode, createContext, useContext, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT';
  avatar?: string;
  twoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: userData, isLoading, error: userError, refetch } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshMutation = useRefreshToken();

  const user = userData?.user || null;
  const error = userError || loginMutation.error || logoutMutation.error;

  // Auto-refresh token on mount if user exists
  useEffect(() => {
    if (user) {
      const refreshInterval = setInterval(async () => {
        try {
          await refreshMutation.mutateAsync();
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }, 14 * 60 * 1000); // Refresh every 14 minutes (before 15 min expiry)

      return () => clearInterval(refreshInterval);
    }
  }, [user, refreshMutation]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.user) {
        await refetch();
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
      await refetch();
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user as User | null, 
        login,
        logout,
        isAuthenticated: !!user,
        isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
        error: error as Error | null,
      }}
    >
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
