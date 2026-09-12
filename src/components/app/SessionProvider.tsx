"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { SessionUser } from "@/lib/types";

const SessionContext = createContext<{
  user: SessionUser | null;
  refresh: () => Promise<void>;
}>({ user: null, refresh: async () => {} });

export function useSessionUser() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function refresh() {
    try {
      const data = await api<{ user: SessionUser }>("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
      router.replace("/login");
    }
  }

  useEffect(() => {
    refresh().finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!ready) {
    return <p className="px-6 py-16 text-sm text-muted">Loading session…</p>;
  }
  if (!user) return null;

  return (
    <SessionContext.Provider value={{ user, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}
