"use client";

import { AppShell } from "@/components/app/AppShell";
import { SessionProvider, useSessionUser } from "@/components/app/SessionProvider";

function Shell({ children }: { children: React.ReactNode }) {
  const { user } = useSessionUser();
  if (!user) return null;
  return (
    <AppShell role={user.role} email={user.email} name={user.name}>
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Shell>{children}</Shell>
    </SessionProvider>
  );
}
