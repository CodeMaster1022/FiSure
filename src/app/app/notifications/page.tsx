"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";
import { Button } from "@/components/ui/forms";
import { useNotificationsBadge } from "@/components/app/AppShell";
import type { Notification } from "@/lib/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const refreshBadge = useNotificationsBadge();

  async function load() {
    const data = await api<{ notifications: Notification[] }>("/notifications");
    setNotifications(data.notifications);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a sanctioned Effect use case
    load().catch((err: Error) => setError(err.message));
  }, []);

  async function markRead(id: string) {
    try {
      await api(`/notifications/${id}/read`, { method: "POST" });
      await load();
      refreshBadge();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update notification");
    }
  }

  async function markAllRead() {
    try {
      await api("/notifications/read-all", { method: "POST" });
      await load();
      refreshBadge();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update notifications");
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageTitle
        kicker="Alerts"
        title="Notifications"
        body="Trigger events, claims, and identity checks that affect your properties or contributions. No email/SMS delivery is wired up yet — check back here."
      />
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      {unreadCount > 0 ? (
        <div className="mb-6">
          <Button type="button" onClick={markAllRead}>
            Mark all {unreadCount} as read
          </Button>
        </div>
      ) : null}
      {notifications.length === 0 ? (
        <p className="text-sm text-muted">No notifications yet.</p>
      ) : (
        <div className="grid gap-px bg-line">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={n.read ? undefined : () => markRead(n.id)}
              className={`flex flex-wrap items-start justify-between gap-4 px-5 py-4 ${
                n.read ? "bg-background" : "bg-surface cursor-pointer"
              }`}
            >
              <div>
                <p className="font-serif text-lg">{n.title}</p>
                <p className="mt-1 text-sm text-muted">{n.body}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                  {new Date(n.createdAt).toLocaleString()}
                  {n.listingId ? (
                    <>
                      {" "}
                      ·{" "}
                      <Link
                        href={`/app/funder/listings/${n.listingId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="underline"
                      >
                        View listing
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
