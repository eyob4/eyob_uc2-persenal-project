"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiFetch } from "@/app/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/auth/me");
    const json = res ? await res.json().catch(() => null) : null;
    setUser(json?.success ? json.data : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!initialUser) {
      refresh();
    }
  }, [initialUser, refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
