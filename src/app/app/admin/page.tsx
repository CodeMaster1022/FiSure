"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { STATUS_LABEL } from "@/lib/labels";
import { PageTitle } from "@/components/app/ui";
import { Button } from "@/components/ui/forms";

type Overview = {
  listings: number;
  waitlist: number;
  policies: number;
  users: number;
  byStatus: Array<{ status: string; _count: { status: number } }>;
};

const PIPELINE_ORDER = [
  "DRAFT",
  "SUBMITTED",
  "ELIGIBILITY_FAILED",
  "AWAITING_QUOTE",
  "QUOTED",
  "AWAITING_OWNER_FUNDS",
  "LIVE",
  "FULLY_FUNDED",
  "AWAITING_LENDER",
  "BINDING",
  "ACTIVE",
  "EXPIRED",
  "TOPUP_WINDOW",
  "TOPUP_LAPSED",
  "DECLINED",
  "ARCHIVED",
];

const ATTENTION_STATUSES = new Set([
  "ELIGIBILITY_FAILED",
  "AWAITING_QUOTE",
  "AWAITING_OWNER_FUNDS",
  "AWAITING_LENDER",
  "TOPUP_WINDOW",
  "TOPUP_LAPSED",
]);

function plural(count: number, singular: string) {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

export default function AdminHome() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Overview>("/admin/overview")
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  function retry() {
    setError(null);
    api<Overview>("/admin/overview")
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }

  const pipeline = useMemo(() => {
    if (!data) return [];
    const counts = new Map(data.byStatus.map((row) => [row.status, row._count.status]));
    const known = PIPELINE_ORDER.filter((status) => counts.has(status)).map((status) => ({
      status,
      count: counts.get(status) ?? 0,
    }));
    const extras = data.byStatus
      .filter((row) => !PIPELINE_ORDER.includes(row.status))
      .map((row) => ({ status: row.status, count: row._count.status }));
    return [...known, ...extras];
  }, [data]);

  const attention = useMemo(() => {
    if (!data) return [];
    const items: Array<{ href: string; label: string; hint: string }> = [];
    if (data.waitlist > 0) {
      items.push({
        href: "/app/admin/waitlist",
        label: plural(data.waitlist, "waitlist signup"),
        hint: "Review requests and send invite links",
      });
    }
    for (const row of pipeline) {
      if (!ATTENTION_STATUSES.has(row.status) || row.count === 0) continue;
      items.push({
        href: "/app/admin/listings",
        label: plural(row.count, "listing") + ` · ${STATUS_LABEL[row.status] ?? row.status}`,
        hint: "Open the listings book",
      });
    }
    return items;
  }, [data, pipeline]);

  const maxCount = Math.max(...pipeline.map((row) => row.count), 1);
  const bindRate =
    data && data.listings > 0 ? Math.round((data.policies / data.listings) * 100) : 0;

  return (
    <div>
      <PageTitle
        kicker="Admin"
        title="Overview"
        body="Live counts for the closed-pilot book. Open a tile to manage that part of the platform."
      />

      {error ? (
        <div className="mb-8 border border-line bg-surface px-5 py-4">
          <p className="text-sm text-sand">{error}</p>
          <Button type="button" variant="ghost" className="mt-3" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : null}

      {!data && !error ? (
        <div className="grid gap-px bg-line sm:grid-cols-4">
          {["Listings", "Policies", "Users", "Waitlist"].map((label) => (
            <div key={label} className="bg-surface p-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
              <p className="mt-3 font-serif text-4xl tracking-tight text-muted">—</p>
            </div>
          ))}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              href="/app/admin/listings"
              label="Listings"
              value={data.listings}
              hint="Properties in market or binding"
            />
            <StatCard
              href="/app/admin/waterfall"
              label="Policies"
              value={data.policies}
              hint={
                data.listings > 0
                  ? `${bindRate}% of listings have a bound policy`
                  : "No listings have bound yet"
              }
            />
            <StatCard
              href="/app/admin/users"
              label="Users"
              value={data.users}
              hint="Owners, funders, carriers, admins"
            />
            <StatCard
              href="/app/admin/waitlist"
              label="Waitlist"
              value={data.waitlist}
              hint="Access requests for the closed pilot"
            />
          </div>

          <div className="mt-12 grid gap-10 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.9fr)]">
            <section>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-sand">Book</p>
                  <h2 className="mt-2 font-serif text-2xl tracking-tight">Listing pipeline</h2>
                </div>
                <Link
                  href="/app/admin/listings"
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  View listings
                </Link>
              </div>
              {pipeline.length === 0 ? (
                <p className="border border-line px-5 py-8 text-sm text-muted">
                  No listings in the book yet.
                </p>
              ) : (
                <div className="grid gap-4">
                  {pipeline.map((row) => {
                    const share = data.listings > 0 ? Math.round((row.count / data.listings) * 100) : 0;
                    const width = Math.max((row.count / maxCount) * 100, row.count > 0 ? 8 : 0);
                    return (
                      <div key={row.status} className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-end gap-4">
                        <div>
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="text-sm">{STATUS_LABEL[row.status] ?? row.status}</p>
                            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{share}%</p>
                          </div>
                          <div className="mt-2 h-1.5 bg-surface-2">
                            <div className="h-full bg-sand" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                        <p className="pb-0.5 text-right font-serif text-xl leading-none">{row.count}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <p className="text-[11px] uppercase tracking-[0.22em] text-sand">Needs attention</p>
              <h2 className="mt-2 font-serif text-2xl tracking-tight">Queues</h2>
              <div className="mt-5 grid gap-px bg-line">
                {attention.length === 0 ? (
                  <p className="bg-background px-5 py-5 text-sm text-muted">
                    Nothing in the exception queues.
                  </p>
                ) : (
                  attention.map((item) => (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      className="block bg-background px-5 py-4 transition-colors hover:bg-surface"
                    >
                      <p className="text-sm text-foreground">{item.label}</p>
                      <p className="mt-1 text-xs text-muted">{item.hint}</p>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({
  href,
  label,
  value,
  hint,
}: {
  href: string;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Link href={href} className="group bg-background p-6 transition-colors hover:bg-surface">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-3 font-serif text-4xl tracking-tight">{value}</p>
      <p className="mt-3 text-sm leading-5 text-muted transition-colors group-hover:text-foreground">
        {hint}
      </p>
    </Link>
  );
}
