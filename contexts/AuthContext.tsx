// contexts/AuthContext.tsx
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

type UserShape = {
  id: string;
  email: string | null;
};

type AuthContextProps = {
  user: UserShape | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserShape | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);


const ensureProfile = (u: UserShape) => {
  // ¡OJO! No devolvemos una promesa que el login deba esperar
  // Hacemos fire-and-forget con un límite de tiempo.
  const task = (async () => {
    // 1 llamada: upsert por id (requiere INSERT y UPDATE en RLS)
    const upsert = supabase
      .from("profiles")
      .upsert(
        { id: u.id, email: u.email, /* otros campos por defecto si quieres */ },
        { onConflict: "id" }
      )
      .select();

    // Limitar a 3s: si tarda más, seguimos sin bloquear el login
    await Promise.race([
      upsert,
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]);
  })();

  // manejamos errores sin romper el flujo
  task.catch((e) => console.warn("ensureProfile error:", e));
};


  
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          const u: UserShape = {
            id: session.user.id,
            email: session.user.email ?? null,
          };
          setUser(u);
          await ensureProfile(u);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.warn("Auth init error:", e);
        setUser(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const u: UserShape = {
          id: session.user.id,
          email: session.user.email ?? null,
        };
        setUser(u);
        await ensureProfile(u);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log("AuthContext login called");
    setIsLoading(true);
    try {
      console.log("Calling supabase.auth.signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Login succeeded but no user returned.");
  
      // Asegura que la sesión ya está lista (importante para RLS)
      await supabase.auth.getSession();
  
      const u: UserShape = { id: data.user.id, email: data.user.email ?? null };
      setUser(u);
  
      // Dispara la creación/actualización del perfil SIN bloquear el login
      ensureProfile(u);
  
      console.log("Login process completed successfully");
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setIsLoading(false); // el botón vuelve a su estado sí o sí
    }
  };
  

  const register = async (email: string, password: string) => {
    console.log("AuthContext register called");
    setIsLoading(true);
    try {
      console.log("Calling supabase.auth.signUp...");
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error("Supabase signup error:", error);
        throw new Error(error.message);
      }

      console.log("Supabase signup successful");
      console.log("User data:", data.user);
      console.log("Session data:", data.session);

      // If email confirmation is enabled, data.session may be null here.
      if (data.session?.user) {
        const u: UserShape = {
          id: data.session.user.id,
          email: data.session.user.email ?? null,
        };
        setUser(u);
        await ensureProfile(u);
        console.log("User registered and logged in");
      } else {
        console.log("No active session - email confirmation may be required");
        // No active session yet; the onAuthStateChange will handle the rest after verification.
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log("AuthContext logout called");
    setIsLoading(true);
    try {
      console.log("Calling supabase.auth.signOut()...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase logout error:", error);
        console.log("Forcing local logout despite error");
      } else {
        console.log("Supabase logout successful");
      }
      // Always clear user state regardless of Supabase response
      setUser(null);
      console.log("User state cleared");
    } catch (error) {
      console.error("Logout error:", error);
      console.log("Forcing local logout despite exception");
      // Even if logout fails, clear the user locally
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
