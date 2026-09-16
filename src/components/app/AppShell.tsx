"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Role } from "@/lib/types";

const NotificationsBadgeContext = createContext<{ refresh: () => void } | null>(
  null,
);

export function useNotificationsBadge() {
  const ctx = useContext(NotificationsBadgeContext);
  return ctx?.refresh ?? (() => {});
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

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

  const refreshUnreadCount = useCallback(() => {
    api<{ unreadCount: number }>("/notifications")
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <NotificationsBadgeContext.Provider value={{ refresh: refreshUnreadCount }}>
      <div className="min-h-full">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-6 px-6 py-4">
            <div className="flex items-center gap-6">
              <Link
                href="/app"
                className="text-sm font-medium tracking-[0.18em] uppercase"
              >
                FiSure
              </Link>
              <nav className="hidden gap-4 md:flex">
                {nav[role]
                  .filter((item) => item.href !== "/app/notifications")
                  .map((item) => (
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
              <Link
                href="/app/notifications"
                aria-label="Notifications"
                className="relative text-muted hover:text-foreground"
              >
                <BellIcon />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 rounded-full bg-sand px-1 py-0 text-[10px] leading-[14px] text-background">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>
              <span className="hidden sm:inline">{email}</span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-sand">
                {role.toLowerCase()}
              </span>
              <button
                type="button"
                className="hover:text-foreground"
                onClick={logout}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>
        <div className="border-b border-line md:hidden">
          <nav className="mx-auto flex max-w-[1120px] gap-4 overflow-x-auto px-6 py-3">
            {nav[role]
              .filter((item) => item.href !== "/app/notifications")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap text-sm text-muted"
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        </div>
        <div className="mx-auto max-w-[1120px] px-6 py-10">{children}</div>
      </div>
    </NotificationsBadgeContext.Provider>
  );
}
