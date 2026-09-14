"use client";

import { useEffect, useState } from "react";
import { api, ApiError, API_URL } from "@/lib/api";
import { usd } from "@/lib/money";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";

type Impact = {
  organization: { id: string; name: string };
  totalContributedCents: number;
  propertiesSupported: number;
  communitiesCovered: number;
  byPeril: Record<string, number>;
  listings: Array<{
    listingId: string;
    address: string;
    city: string;
    state: string;
    peril: string;
    status: string;
    amountCents: number;
  }>;
};

export default function CorporateCsrPage() {
  const [impact, setImpact] = useState<Impact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notLinked, setNotLinked] = useState(false);

  useEffect(() => {
    api<Impact>("/organizations/me/impact")
      .then((data) => setImpact(data))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotLinked(true);
          return;
        }
        setError(err instanceof Error ? err.message : "Could not load impact data");
      });
  }, []);

  return (
    <div>
      <PageTitle
        kicker="Corporate CSR"
        title="Community impact dashboard"
        body="Aggregate impact across your organization's contributions, for internal reporting and annual ESG filings."
      />
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      {notLinked ? (
        <p className="text-sm text-muted">
          This account isn&apos;t linked to a corporate organization yet.
        </p>
      ) : null}
      {impact ? (
        <>
          <div className="mb-8 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
            <Stat label="Total contributed" value={usd(impact.totalContributedCents)} />
            <Stat label="Properties supported" value={String(impact.propertiesSupported)} />
            <Stat label="Communities covered" value={String(impact.communitiesCovered)} />
            <Stat label="Organization" value={impact.organization.name} />
          </div>

          <div className="mb-8">
            <a
              href={`${API_URL}/organizations/me/impact/report`}
              target="_blank"
              rel="noreferrer"
              className="border border-sand bg-sand px-4 py-2 text-sm font-medium text-background hover:bg-foreground"
            >
              Download ESG report
            </a>
          </div>

          <h2 className="mb-3 font-serif text-xl">By disaster type</h2>
          <div className="mb-8 grid gap-px bg-line">
            {Object.entries(impact.byPeril).map(([peril, cents]) => (
              <div key={peril} className="flex justify-between bg-background px-5 py-3 text-sm">
                <span>{PERIL_LABEL[peril] ?? peril}</span>
                <span className="text-muted">{usd(cents)}</span>
              </div>
            ))}
          </div>

          <h2 className="mb-3 font-serif text-xl">Properties supported</h2>
          <div className="grid gap-px bg-line">
            {impact.listings.map((l) => (
              <div
                key={l.listingId}
                className="flex flex-wrap items-center justify-between gap-4 bg-background px-5 py-4"
              >
                <div>
                  <p className="font-serif text-lg">
                    {l.city}, {l.state}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {PERIL_LABEL[l.peril] ?? l.peril} · contributed {usd(l.amountCents)}
                  </p>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
            {impact.listings.length === 0 ? (
              <p className="bg-background px-5 py-8 text-sm text-muted">No contributions yet.</p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}
