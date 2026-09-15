"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Role } from "@/lib/types";

const nav: Record<Role, Array<{ href: string; label: string }>> = {
  OWNER: [
    { href: "/app/owner", label: "Dashboard" },
    { href: "/app/owner/new", label: "List a property" },
    { href: "/app/documents", label: "Documents" },
    { href: "/app/notifications", label: "Notifications" },
  ],
  FUNDER: [
    { href: "/app/funder", label: "Dashboard" },
    { href: "/app/funder/portfolio", label: "Community impact" },
    { href: "/app/funder/csr", label: "Corporate CSR" },
    { href: "/app/funder/disclosure", label: "Risk disclosure" },
    { href: "/app/documents", label: "Documents" },
    { href: "/app/notifications", label: "Notifications" },
  ],
  CARRIER: [
    { href: "/app/carrier", label: "Queue" },
    { href: "/app/carrier/products", label: "Products" },
    { href: "/app/carrier/policies", label: "Policies" },
    { href: "/app/carrier/triggers", label: "Triggers" },
    { href: "/app/claims", label: "Claims" },
    { href: "/app/notifications", label: "Notifications" },
  ],
  ADMIN: [
    { href: "/app/admin", label: "Overview" },
    { href: "/app/admin/waitlist", label: "Waitlist" },
    { href: "/app/admin/listings", label: "Listings" },
    { href: "/app/admin/waterfall", label: "Waterfall" },
    { href: "/app/admin/commissions", label: "Commissions" },
    { href: "/app/claims", label: "Claims" },
    { href: "/app/admin/flags", label: "Flags" },
    { href: "/app/notifications", label: "Notifications" },
  ],
};

export function AppShell({
  role,
  email,
  children,
}: {
  role: Role;
  email?: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api<{ unreadCount: number }>("/notifications")
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, []);

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/app" className="text-sm font-medium tracking-[0.18em] uppercase">
              FiSure
            </Link>
            <nav className="hidden gap-4 md:flex">
              {nav[role].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted hover:text-foreground"
                >
                  {item.label}
                  {item.href === "/app/notifications" && unreadCount > 0 ? (
                    <span className="ml-1 rounded-full bg-sand px-1.5 py-0.5 text-[10px] text-background">
                      {unreadCount}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span className="hidden sm:inline">{email}</span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-sand">
              {role.toLowerCase()}
            </span>
            <button type="button" className="hover:text-foreground" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="border-b border-line md:hidden">
        <nav className="mx-auto flex max-w-[1120px] gap-4 overflow-x-auto px-6 py-3">
          {nav[role].map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-sm text-muted">
              {item.label}
              {item.href === "/app/notifications" && unreadCount > 0 ? (
                <span className="ml-1 rounded-full bg-sand px-1.5 py-0.5 text-[10px] text-background">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-[1120px] px-6 py-10">{children}</div>
    </div>
  );
}
