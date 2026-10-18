"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Ctx = { user: User | null; loading: boolean; isAdmin: boolean; signOut: () => Promise<void> };
const AuthCtx = createContext<Ctx>({ user: null, loading: true, isAdmin: false, signOut: async () => {} });
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const uid = user?.id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid) {
      setIsAdmin(false);
      return;
    }
    supabase.rpc("is_admin").then(({ data, error }) => setIsAdmin(!error && data === true));
  }, [uid]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return <AuthCtx.Provider value={{ user, loading, isAdmin, signOut }}>{children}</AuthCtx.Provider>;
}