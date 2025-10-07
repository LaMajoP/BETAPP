// contexts/AuthContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

type ROL = 'CLIENT' | 'ADMIN';
const DEFAULT_ROLE: ROL = 'CLIENT';

type UserShape = {
  id: string;
  email: string | null;
  rol?: ROL | null;
};

type AuthContextProps = {
  user: UserShape | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function useAuth(): AuthContextProps {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserShape | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function ensureProfile(u: UserShape, patch?: Record<string, any>) {
    if (!u?.id) return;
    const { data: existing, error: selErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', u.id)
      .maybeSingle();
    if (selErr) throw selErr;
    if (!existing) {
      // Inserta perfil con rol por defecto CLIENT
      const { error: insErr } = await supabase.from('profiles').insert({
        id: u.id,
        email: u.email,
        ROL: DEFAULT_ROLE,
        ...(patch ?? {}),
      });
      if (insErr) throw insErr;
    } else if (patch && Object.keys(patch).length) {
      // UPDATE sólo de campos no sensibles (NO ROL)
      const { error: updErr } = await supabase
        .from('profiles')
        .update({ email: u.email, ...patch })
        .eq('id', u.id);
      if (updErr) throw updErr;
    }
    // Trae el rol real desde BD
    const { data: prof } = await supabase
      .from('profiles')
      .select('"ROL"')
      .eq('id', u.id)
      .maybeSingle();
    setUser(prev => prev ? { ...prev, rol: (prof?.ROL as ROL) ?? null } : prev);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          const u: UserShape = { id: session.user.id, email: session.user.email ?? null };
          setUser(u);
          await ensureProfile(u);
        } else {
          setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (!mounted) return;
      if (session?.user) {
        const u: UserShape = { id: session.user.id, email: session.user.email ?? null };
        setUser(u);
        await ensureProfile(u);
      } else {
        setUser(null);
      }
    });

    return () => { mounted = false; sub.subscription?.unsubscribe?.(); };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      const u: UserShape = { id: data.user!.id, email: data.user!.email ?? null };
      setUser(u);
      await supabase.auth.getSession(); // asegurar RLS
      await ensureProfile(u);
    } finally { setIsLoading(false); }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw new Error(error.message);
      if (data.session?.user) {
        const u: UserShape = { id: data.session.user.id, email: data.session.user.email ?? null };
        setUser(u);
        await ensureProfile(u);
      }
      // si hay confirmación por email, el onAuthStateChange terminará el proceso
    } finally { setIsLoading(false); }
  };

  const logout = async () => {
    setIsLoading(true);
    try { await supabase.auth.signOut(); }
    finally { setUser(null); setIsLoading(false); }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
