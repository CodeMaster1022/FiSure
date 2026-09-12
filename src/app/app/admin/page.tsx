"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";

export default function AdminHome() {
  const [data, setData] = useState<{
    listings: number;
    waitlist: number;
    policies: number;
    users: number;
    byStatus: Array<{ status: string; _count: { status: number } }>;
  } | null>(null);

  useEffect(() => {
    api<NonNullable<typeof data>>("/admin/overview").then(setData);
  }, []);

  return (
    <div>
      <PageTitle
        kicker="Admin"
        title="Overview"
        body="Mock closed-pilot book stored in this browser. The Express API is not connected."
      />
      {data ? (
        <>
          <div className="grid gap-px bg-line sm:grid-cols-4">
            {[
              ["Listings", data.listings],
              ["Policies", data.policies],
              ["Users", data.users],
              ["Waitlist", data.waitlist],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-background p-6">
                <p className="font-serif text-3xl">{value}</p>
                <p className="mt-2 text-sm text-muted">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-2">
            {data.byStatus.map((row) => (
              <p key={row.status} className="text-sm text-muted">
                {row.status}: {row._count.status}
              </p>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">Loading…</p>
      )}
    </div>
  );
}
