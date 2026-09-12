"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Role } from "@/lib/types";

const nav: Record<Role, Array<{ href: string; label: string }>> = {
  OWNER: [
    { href: "/app/owner", label: "Dashboard" },
    { href: "/app/owner/new", label: "List a property" },
  ],
  FUNDER: [
    { href: "/app/funder", label: "Map" },
    { href: "/app/funder/portfolio", label: "Community impact" },
    { href: "/app/funder/disclosure", label: "Risk disclosure" },
  ],
  CARRIER: [
    { href: "/app/carrier", label: "Queue" },
    { href: "/app/carrier/policies", label: "Policies" },
    { href: "/app/carrier/triggers", label: "Triggers" },
  ],
  ADMIN: [
    { href: "/app/admin", label: "Overview" },
    { href: "/app/admin/waitlist", label: "Waitlist" },
    { href: "/app/admin/listings", label: "Listings" },
    { href: "/app/admin/waterfall", label: "Waterfall" },
    { href: "/app/admin/flags", label: "Flags" },
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
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-[1120px] px-6 py-10">{children}</div>
    </div>
  );
}
