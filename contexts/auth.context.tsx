"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { setCookie, deleteCookie, getCookie, apiFetch } from "../lib/api-client";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  lastname?: string | null;
  phone?: string | null;
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

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Attempt to hydrate user from local storage or an API call if needed.
    // Wrapping this in a function helps avoid the linter warning about 
    // calling setState directly and synchronously inside the effect body.
    const hydrateAuth = () => {
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
    };

    hydrateAuth();

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

  const logout = useCallback(async () => {
    const refreshToken = getCookie("refreshToken");
    if (refreshToken) {
      try {
        await apiFetch("/v1/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      } catch (e) {
        console.error("Error logging out from server", e);
      }
    }
    
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
