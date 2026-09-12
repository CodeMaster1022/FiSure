"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { usd } from "@/lib/money";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import { Button, Field, inputClass } from "@/components/ui/forms";

type Detail = {
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    peril: string;
    estimatedValueCents: number;
    mortgage: { lenderName: string; outstandingBalanceCents: number } | null;
    eligibility: Array<{ bufferPassed: boolean; notes: string | null; requiredCoverageCents: number }>;
    listings: Array<{
      id: string;
      status: string;
      premiumTargetCents: number;
      fundedCents: number;
      ownerContributionCents: number;
    }>;
    quoteRequests: Array<{ status: string; carrierProduct: { name: string } }>;
  };
};

export default function OwnerPropertyPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Detail["property"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await api<Detail>(`/properties/${params.id}`);
    setData(res.property);
  }

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function fundOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const listing = data?.listings[0];
    if (!listing) return;
    const form = new FormData(event.currentTarget);
    try {
      await api(`/listings/${listing.id}/contribute`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(form.get("amount")),
          asOwner: true,
        }),
      });
      setMessage("Simulated collection recorded.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fund");
    }
  }

  if (!data) return <p className="text-sm text-muted">{error ?? "Loading…"}</p>;
  const check = data.eligibility[0];
  const listing = data.listings[0];
  const minOwner = listing ? Math.ceil(listing.premiumTargetCents * 0.15) / 100 : 0;

  return (
    <div>
      <PageTitle
        kicker={PERIL_LABEL[data.peril]}
        title={`${data.address}, ${data.city}`}
        body={`${data.state} ${data.zip} · lender ${data.mortgage?.lenderName ?? "none"}`}
      />
      {check && !check.bufferPassed ? (
        <aside className="mb-8 border border-line bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-sand">Eligibility failed</p>
          <p className="mt-2 text-sm text-muted">
            {check.notes} Required coverage {usd(check.requiredCoverageCents)}.
          </p>
        </aside>
      ) : null}
      {listing ? (
        <div className="border border-line p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="font-serif text-2xl">{usd(listing.fundedCents)} funded</p>
            <StatusBadge status={listing.status} />
          </div>
          <p className="mt-2 text-sm text-muted">
            Target {usd(listing.premiumTargetCents)} · owner in {usd(listing.ownerContributionCents)}
          </p>
          <div className="mt-4 h-1.5 bg-surface-2">
            <div
              className="h-full bg-sand"
              style={{
                width: `${Math.min(100, (listing.fundedCents / listing.premiumTargetCents) * 100)}%`,
              }}
            />
          </div>
          {(listing.status === "AWAITING_OWNER_FUNDS" || listing.status === "TOPUP_WINDOW") && (
            <form onSubmit={fundOwner} className="mt-6 flex max-w-sm flex-col gap-3">
              <Field label={`Owner contribution (minimum ${usd(minOwner * 100)} to go live)`}>
                <input
                  name="amount"
                  type="number"
                  step="1"
                  min={1}
                  defaultValue={minOwner}
                  className={inputClass()}
                />
              </Field>
              <Button type="submit">Simulate 15% escrow</Button>
            </form>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">
          {data.quoteRequests[0]
            ? `Quote request ${data.quoteRequests[0].status} with ${data.quoteRequests[0].carrierProduct.name}.`
            : "No listing yet."}
        </p>
      )}
      {message ? <p className="mt-4 text-sm text-teal">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-sand">{error}</p> : null}
    </div>
  );
}
