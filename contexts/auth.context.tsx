"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { setCookie, deleteCookie, getCookie } from "../lib/api-client";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Attempt to hydrate user from local storage or an API call if needed
    // Since we only have the token, we could store the user in localStorage as well
    // or validate the token with a /me endpoint. For simplicity, we assume if we
    // have a token, we parse the user from localStorage.
    const storedUser = localStorage.getItem("user");
    const token = getCookie("accessToken");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    setIsLoading(false);

    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem("user");
      router.push("/login");
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [router]);

  const login = useCallback((data: AuthResponse) => {
    // Store tokens in cookies
    setCookie("accessToken", data.accessToken, 7); // 7 days expiration for example
    setCookie("refreshToken", data.refreshToken, 30);
    
    // Store user info in localStorage for hydration on reload
    localStorage.setItem("user", JSON.stringify(data.user));
    
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    deleteCookie("accessToken");
    deleteCookie("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
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
