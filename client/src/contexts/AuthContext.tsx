import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@/lib/auth';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, name: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);
  
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: AuthService.getCurrentUser,
    retry: 1, // Retry once on failure
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Check auth when window gains focus
    refetchOnMount: true,
    enabled: true,
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes to extend session
  });

  const user = authData?.user || null;
  const isAuthenticated = !!user && !error;
  
  // Mark initial auth check as complete once we have a result
  useEffect(() => {
    if (!isLoading && !initialAuthCheck) {
      setInitialAuthCheck(true);
    }
  }, [isLoading, initialAuthCheck]);

  const login = async (username: string, password: string) => {
    const response = await AuthService.login({ username, password });
    queryClient.setQueryData(['auth', 'user'], { user: response.user });
  };

  const signup = async (username: string, password: string, name: string, email?: string) => {
    const response = await AuthService.signup({ username, password, name, email });
    queryClient.setQueryData(['auth', 'user'], { user: response.user });
  };

  const logout = async () => {
    await AuthService.logout();
    queryClient.setQueryData(['auth', 'user'], null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading: isLoading || !initialAuthCheck,
      isAuthenticated,
      login,
      signup,
      logout,
    }}>
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