"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, getStoredToken, removeStoredToken, setStoredToken } from "@/lib/api";
import { Role, UIDensity } from "@/lib/enums";

export interface UserProfile {
  id: number;
  email: string;
  phone?: string;
  full_name: string;
  role: Role;
  ui_density: UIDensity;
  organization?: string;
  designation?: string;
  expertise_tags?: string;
  district?: string;
  first_login: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  lang: "en" | "hi";
  setLang: (lang: "en" | "hi") => void;
  login: (email: string, password: string) => Promise<UserProfile>;
  signupCitizen: (data: any) => Promise<UserProfile>;
  signupSolver: (data: any) => Promise<UserProfile>;
  logout: () => void;
  completeTour: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lang, setLang] = useState<"en" | "hi">("hi"); // Default to Hindi for citizens

  useEffect(() => {
    async function loadUser() {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await apiRequest<UserProfile>("/auth/me");
        setUser(profile);
      } catch (err) {
        console.error("Failed to load user session:", err);
        removeStoredToken();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const res = await apiRequest<{
      access_token: string;
      role: Role;
      ui_density: UIDensity;
      user_id: number;
      full_name: string;
      first_login: boolean;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setStoredToken(res.access_token);
    const profile = await apiRequest<UserProfile>("/auth/me");
    setUser(profile);
    return profile;
  };

  const signupCitizen = async (data: any): Promise<UserProfile> => {
    const res = await apiRequest<{ access_token: string }>("/auth/signup/citizen", {
      method: "POST",
      body: JSON.stringify(data),
    });

    setStoredToken(res.access_token);
    const profile = await apiRequest<UserProfile>("/auth/me");
    setUser(profile);
    return profile;
  };

  const signupSolver = async (data: any): Promise<UserProfile> => {
    const res = await apiRequest<{ access_token: string }>("/auth/signup/solver", {
      method: "POST",
      body: JSON.stringify(data),
    });

    setStoredToken(res.access_token);
    const profile = await apiRequest<UserProfile>("/auth/me");
    setUser(profile);
    return profile;
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
  };

  const completeTour = async () => {
    if (!user) return;
    try {
      const updated = await apiRequest<UserProfile>("/auth/complete-tour", {
        method: "POST",
      });
      setUser(updated);
    } catch (err) {
      console.error("Failed to update tour status:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        lang,
        setLang,
        login,
        signupCitizen,
        signupSolver,
        logout,
        completeTour,
      }}
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
