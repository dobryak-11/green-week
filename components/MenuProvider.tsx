"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_MENU, type Menu } from "@/lib/menu";
import { fetchMenu } from "@/lib/menu-db";
import { supabase } from "@/lib/supabase";

type Ctx = { menu: Menu; loading: boolean; reload: () => Promise<void> };
const MenuCtx = createContext<Ctx>({ menu: DEFAULT_MENU, loading: true, reload: async () => {} });
export const useMenu = () => useContext(MenuCtx);

export default function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState<Menu>(DEFAULT_MENU);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setMenu(await fetchMenu(supabase));
    } catch {
      /* остаёмся на текущем меню */
    }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return <MenuCtx.Provider value={{ menu, loading, reload }}>{children}</MenuCtx.Provider>;
}