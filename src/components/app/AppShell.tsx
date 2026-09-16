"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/types";

const NotificationsBadgeContext = createContext<{ refresh: () => void } | null>(
  null,
);

export function useNotificationsBadge() {
  const ctx = useContext(NotificationsBadgeContext);
  return ctx?.refresh ?? (() => {});
}

type IconName =
  | "bell"
  | "box"
  | "building"
  | "chevron"
  | "clipboard"
  | "close"
  | "commission"
  | "file"
  | "flag"
  | "home"
  | "impact"
  | "inbox"
  | "listings"
  | "logout"
  | "menu"
  | "plus"
  | "policy"
  | "shield"
  | "users"
  | "waitlist"
  | "waterfall"
  | "zap";

function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-[18px] w-[18px] shrink-0"}
      aria-hidden="true"
    >
      {name === "bell" ? (
        <>
          <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" />
          <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
        </>
      ) : null}
      {name === "box" ? (
        <>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="M3.3 7 12 12l8.7-5" />
          <path d="M12 22V12" />
        </>
      ) : null}
      {name === "building" ? (
        <>
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
          <path d="M6 12h12" />
          <path d="M10 6h.01" />
          <path d="M14 6h.01" />
          <path d="M10 10h.01" />
          <path d="M14 10h.01" />
          <path d="M4 22h16" />
        </>
      ) : null}
      {name === "chevron" ? <path d="m15 18-6-6 6-6" /> : null}
      {name === "clipboard" ? (
        <>
          <rect x="8" y="3" width="8" height="4" rx="1" />
          <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
        </>
      ) : null}
      {name === "close" ? (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      ) : null}
      {name === "commission" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M16 8h-5.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H8" />
          <path d="M12 6v2" />
          <path d="M12 16v2" />
        </>
      ) : null}
      {name === "file" ? (
        <>
          <path d="M14 3v5h5" />
          <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
        </>
      ) : null}
      {name === "flag" ? <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v16" /> : null}
      {name === "home" ? (
        <>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </>
      ) : null}
      {name === "impact" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18" />
          <path d="M12 3a14 14 0 0 0 0 18" />
        </>
      ) : null}
      {name === "inbox" ? (
        <>
          <path d="M22 12h-6l-2 3H10l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
        </>
      ) : null}
      {name === "listings" ? (
        <>
          <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </>
      ) : null}
      {name === "logout" ? (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </>
      ) : null}
      {name === "menu" ? (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      ) : null}
      {name === "plus" ? (
        <>
          <rect x="3" y="3" width="18" height="18" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </>
      ) : null}
      {name === "policy" ? (
        <>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      ) : null}
      {name === "shield" ? (
        <>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </>
      ) : null}
      {name === "users" ? (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      ) : null}
      {name === "waitlist" ? (
        <>
          <path d="M8 6h13" />
          <path d="M8 12h13" />
          <path d="M8 18h13" />
          <path d="M3 6h.01" />
          <path d="M3 12h.01" />
          <path d="M3 18h.01" />
        </>
      ) : null}
      {name === "waterfall" ? (
        <>
          <path d="M4 4h6v6H4z" />
          <path d="M14 8h6v6h-6z" />
          <path d="M8 14h6v6H8z" />
        </>
      ) : null}
      {name === "zap" ? <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /> : null}
    </svg>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  badge?: "notifications";
};

type NavSection = {
  label?: string;
  items: NavItem[];
};

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Owner",
  FUNDER: "Funder",
  CARRIER: "Carrier",
  ADMIN: "Admin",
};

const nav: Record<Role, NavSection[]> = {
  OWNER: [
    {
      items: [
        { href: "/app/owner", label: "Dashboard", icon: "home" },
        { href: "/app/owner/new", label: "List a property", icon: "plus" },
        { href: "/app/documents", label: "Documents", icon: "file" },
        { href: "/app/notifications", label: "Notifications", icon: "bell", badge: "notifications" },
      ],
    },
  ],
  FUNDER: [
    {
      label: "Marketplace",
      items: [{ href: "/app/funder", label: "Dashboard", icon: "home" }],
    },
    {
      label: "Impact",
      items: [
        { href: "/app/funder/portfolio", label: "Community impact", icon: "impact" },
        { href: "/app/funder/csr", label: "Corporate CSR", icon: "building" },
        { href: "/app/funder/disclosure", label: "Risk disclosure", icon: "shield" },
      ],
    },
    {
      label: "Workspace",
      items: [
        { href: "/app/documents", label: "Documents", icon: "file" },
        { href: "/app/notifications", label: "Notifications", icon: "bell", badge: "notifications" },
      ],
    },
  ],
  CARRIER: [
    {
      label: "Underwriting",
      items: [
        { href: "/app/carrier", label: "Queue", icon: "inbox" },
        { href: "/app/carrier/products", label: "Products", icon: "box" },
        { href: "/app/carrier/policies", label: "Policies", icon: "policy" },
      ],
    },
    {
      label: "Operations",
      items: [
        { href: "/app/carrier/triggers", label: "Triggers", icon: "zap" },
        { href: "/app/claims", label: "Claims", icon: "clipboard" },
      ],
    },
    {
      label: "Workspace",
      items: [
        { href: "/app/notifications", label: "Notifications", icon: "bell", badge: "notifications" },
      ],
    },
  ],
  ADMIN: [
    {
      label: "Control",
      items: [
        { href: "/app/admin", label: "Overview", icon: "home" },
        { href: "/app/admin/users", label: "Users", icon: "users" },
        { href: "/app/admin/waitlist", label: "Waitlist", icon: "waitlist" },
      ],
    },
    {
      label: "Book",
      items: [
        { href: "/app/admin/listings", label: "Listings", icon: "listings" },
        { href: "/app/admin/waterfall", label: "Waterfall", icon: "waterfall" },
        { href: "/app/admin/commissions", label: "Commissions", icon: "commission" },
        { href: "/app/claims", label: "Claims", icon: "clipboard" },
      ],
    },
    {
      label: "System",
      items: [
        { href: "/app/admin/flags", label: "Flags", icon: "flag" },
        { href: "/app/notifications", label: "Notifications", icon: "bell", badge: "notifications" },
      ],
    },
  ],
};

function isNavActive(pathname: string, href: string, allHrefs: string[]) {
  const matches = pathname === href || pathname.startsWith(`${href}/`);
  if (!matches) return false;
  return !allHrefs.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      (pathname === other || pathname.startsWith(`${other}/`)),
  );
}

function formatBadge(count: number) {
  if (count > 99) return "99+";
  return String(count);
}

const COLLAPSED_EVENT = "fisure-sidebar-collapsed";

function subscribeCollapsed(onStoreChange: () => void) {
  window.addEventListener(COLLAPSED_EVENT, onStoreChange);
  return () => window.removeEventListener(COLLAPSED_EVENT, onStoreChange);
}

function getCollapsedSnapshot() {
  return window.localStorage.getItem("fisure.sidebar.collapsed") === "1";
}

function getCollapsedServerSnapshot() {
  return false;
}

function setCollapsedPersist(next: boolean) {
  window.localStorage.setItem("fisure.sidebar.collapsed", next ? "1" : "0");
  window.dispatchEvent(new Event(COLLAPSED_EVENT));
}

export function AppShell({
  role,
  email,
  name,
  children,
}: {
  role: Role;
  email?: string | null;
  name?: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  );

  const sections = nav[role];
  const allItems = useMemo(() => sections.flatMap((section) => section.items), [sections]);
  const allHrefs = useMemo(() => allItems.map((item) => item.href), [allItems]);
  const displayName = name?.trim() || email || ROLE_LABEL[role];
  const initial = (displayName[0] ?? "F").toUpperCase();

  const refreshUnreadCount = useCallback(() => {
    api<{ unreadCount: number }>("/notifications")
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  const compact = collapsed && !mobileOpen;

  return (
    <NotificationsBadgeContext.Provider value={{ refresh: refreshUnreadCount }}>
      <div className="min-h-full">
        <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center border border-line text-foreground"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <Link href="/app" className="flex items-center gap-2.5" onClick={closeMobile}>
            <span className="flex h-7 w-7 items-center justify-center border border-sand/40 text-[11px] font-medium tracking-widest text-sand">
              F
            </span>
            <span className="text-sm font-medium tracking-[0.18em] uppercase">FiSure</span>
          </Link>
          <Link
            href="/app/notifications"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center text-muted hover:text-foreground"
          >
            <Icon name="bell" />
            {unreadCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-sand px-1 text-center text-[10px] leading-[14px] text-background">
                {formatBadge(unreadCount)}
              </span>
            ) : null}
          </Link>
        </header>

        {mobileOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/55 lg:hidden"
            onClick={closeMobile}
          />
        ) : null}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-surface transition-[width,transform] duration-200",
            compact ? "lg:w-[76px]" : "lg:w-[260px]",
            mobileOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full lg:translate-x-0",
          )}
        >
          <div
            className={cn(
              "flex h-14 shrink-0 items-center border-b border-line lg:h-[72px]",
              compact ? "justify-center px-2" : "justify-between px-4",
            )}
          >
            <Link href="/app" className="flex min-w-0 items-center gap-2.5" onClick={closeMobile}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-sand/40 text-[11px] font-medium tracking-widest text-sand">
                F
              </span>
              {compact ? null : (
                <span className="truncate text-sm font-medium tracking-[0.18em] uppercase">
                  FiSure
                </span>
              )}
            </Link>
            {compact ? null : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="hidden h-8 w-8 items-center justify-center text-muted hover:text-foreground lg:flex"
                  aria-label="Collapse sidebar"
                  onClick={() => setCollapsedPersist(true)}
                >
                  <Icon name="chevron" />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center text-muted hover:text-foreground lg:hidden"
                  aria-label="Close menu"
                  onClick={closeMobile}
                >
                  <Icon name="close" />
                </button>
              </div>
            )}
          </div>

          {compact ? (
            <button
              type="button"
              className="hidden h-10 items-center justify-center text-muted hover:text-foreground lg:flex"
              aria-label="Expand sidebar"
              onClick={() => setCollapsedPersist(false)}
            >
              <Icon name="chevron" className="h-[18px] w-[18px] rotate-180" />
            </button>
          ) : (
            <div className="px-4 pt-5 pb-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-sand">
                {ROLE_LABEL[role]}
              </p>
            </div>
          )}

          <nav aria-label="Workspace" className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
            {sections.map((section, index) => (
              <div key={section.label ?? `section-${index}`} className={index === 0 ? "" : "mt-3"}>
                {section.label && !compact ? (
                  <p className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-[0.2em] text-muted">
                    {section.label}
                  </p>
                ) : null}
                {compact && index > 0 ? <div className="mx-3 mb-3 border-t border-line" /> : null}
                <div className="grid gap-0.5">
                  {section.items.map((item) => {
                    const active = isNavActive(pathname, item.href, allHrefs);
                    const badge =
                      item.badge === "notifications" && unreadCount > 0
                        ? formatBadge(unreadCount)
                        : null;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={compact ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        onClick={closeMobile}
                        className={cn(
                          "relative flex items-center gap-3 border-l-2 py-2 text-sm transition-colors",
                          compact ? "justify-center px-2" : "px-3",
                          active
                            ? "border-sand bg-background text-foreground"
                            : "border-transparent text-muted hover:bg-background/70 hover:text-foreground",
                        )}
                      >
                        <span className="relative">
                          <Icon name={item.icon} />
                          {compact && badge ? (
                            <span className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-sand px-1 text-center text-[9px] leading-[13px] text-background">
                              {badge}
                            </span>
                          ) : null}
                        </span>
                        {compact ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
                        {!compact && badge ? (
                          <span className="ml-auto min-w-5 rounded-full bg-sand px-1.5 text-center text-[10px] leading-[18px] text-background">
                            {badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className={cn("shrink-0 border-t border-line", compact ? "p-2" : "p-3")}>
            <div className={cn("flex items-center gap-3", compact && "justify-center")}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-sand/40 text-[11px] font-medium text-sand">
                {initial}
              </span>
              {compact ? null : (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{displayName}</p>
                  <p className="truncate text-[11px] uppercase tracking-[0.16em] text-muted">
                    {email && name?.trim() ? email : ROLE_LABEL[role]}
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className={cn(
                "mt-2 flex w-full items-center gap-3 py-2 text-sm text-muted transition-colors hover:text-foreground",
                compact ? "justify-center" : "px-1",
              )}
            >
              <Icon name="logout" />
              {compact ? <span className="sr-only">Sign out</span> : <span>Sign out</span>}
            </button>
          </div>
        </aside>

        <div
          className={cn(
            "min-h-full transition-[padding] duration-200",
            "pt-14 lg:pt-0",
            compact ? "lg:pl-[76px]" : "lg:pl-[260px]",
          )}
        >
          <main id="main" className="mx-auto max-w-[1120px] px-6 py-10">
            {children}
          </main>
        </div>
      </div>
    </NotificationsBadgeContext.Provider>
  );
}
