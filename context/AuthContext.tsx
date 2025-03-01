"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

interface User {
  userId: string;
  username: string | null;
  email: string | null;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Compute isAuthenticated based on user state
  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie("jwt") as string;
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (!decoded?.userId) throw new Error("Invalid token");

        const response = await axios.get(
          `/api/auth/user?userId=${decoded.userId}`
        );
        setUser({
          userId: decoded.userId,
          ...response.data,
        });
      } catch (error) {
        console.error("Error verifying authentication:", error);
        deleteCookie("jwt");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (token: string) => {
    try {
      setCookie("jwt", token, { maxAge: 86400, path: "/" });

      const decoded = JSON.parse(atob(token.split(".")[1]));

      setUser({
        userId: decoded.userId,
        username: decoded.username || null,
        email: decoded.email || null,
      });
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    deleteCookie("jwt");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, login, logout }}
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
