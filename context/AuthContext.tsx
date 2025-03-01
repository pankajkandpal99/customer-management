"use client";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";

interface User {
  userId: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const decodeToken = (
    token: string
  ): { userId: string; email: string } | null => {
    try {
      const decoded = jwt.decode(token) as {
        userId: string;
        email: string;
      } | null;
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await axios.get(`/api/auth/user?userId=${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      logout();
    }
  };

  const initializeUser = async () => {
    const token = getCookie("jwt") as string;
    if (token) {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        await fetchUserDetails(decodedUser.userId);
      } else {
        deleteCookie("jwt");
      }
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  const login = async (token: string) => {
    setCookie("jwt", token, { maxAge: 60 * 60 * 24 * 7 });
    const decodedUser = decodeToken(token);
    if (decodedUser) {
      await fetchUserDetails(decodedUser.userId);
    }
  };

  const logout = () => {
    setUser(null);
    deleteCookie("jwt");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
