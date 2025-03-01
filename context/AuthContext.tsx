"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  login: (token: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(";");
      const jwtCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("jwt=")
      );

      if (jwtCookie) {
        // For simplicity we just check if token exists, In a real app, we might want to verify the token client-side as well
        setIsAuthenticated(true);

        // We might want to decode the JWT to get the userId, For now we'll leave it as null
        setUserId(null);
      } else {
        setIsAuthenticated(false);
        setUserId(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token: string, uid: string) => {
    document.cookie = `jwt=${token}; path=/; max-age=86400; samesite=strict`;
    setIsAuthenticated(true);
    setUserId(uid);
    setIsLoading(false);
  };

  const logout = () => {
    document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    setIsAuthenticated(false);
    setUserId(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, userId, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
