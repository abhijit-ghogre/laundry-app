"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "~/trpc/react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  email: string | null;
  login: (sessionId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  const { data: session } = api.auth.getSession.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = api.auth.logout.useMutation();

  useEffect(() => {
    if (session !== undefined) {
      setIsAuthenticated(!!session);
      setEmail(session?.email ?? null);
      setIsLoading(false);
    }
  }, [session]);

  const login = useCallback((sessionId: string) => {
    localStorage.setItem("sessionId", sessionId);
    window.location.reload();
  }, []);

  const logout = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("sessionId");
        setIsAuthenticated(false);
        setEmail(null);
        window.location.href = "/login";
      },
    });
  }, [logoutMutation]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, email, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
