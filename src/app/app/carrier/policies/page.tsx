"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { usd } from "@/lib/money";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import { Button } from "@/components/ui/forms";
import type { Listing } from "@/lib/types";

const STATE_LABEL: Record<string, string> = { FL: "Florida", CA: "California" };

export default function CarrierPolicies() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    api<{ listings: Listing[] }>("/listings")
      .then((data) =>
        setListings(
          data.listings.filter((row) =>
            ["FULLY_FUNDED", "AWAITING_LENDER", "ACTIVE"].includes(row.status),
          ),
        ),
      )
      .catch((err: Error) => setError(err.message));
  }

  const groups = useMemo(() => {
    const byKey = new Map<string, { state: string; peril: string; listings: Listing[] }>();
    for (const listing of listings) {
      const key = `${listing.property.state}|${listing.property.peril}`;
      const group = byKey.get(key);
      if (group) {
        group.listings.push(listing);
      } else {
        byKey.set(key, { state: listing.property.state, peril: listing.property.peril, listings: [listing] });
      }
    }
    return Array.from(byKey.values()).sort(
      (a, b) => a.state.localeCompare(b.state) || a.peril.localeCompare(b.peril),
    );
  }, [listings]);

  useEffect(() => {
    load();
  }, []);

  async function nameLender(id: string) {
    try {
      await api(`/listings/${id}/lender`, { method: "POST" });
      setMessage("Lender named as loss payee.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not name lender");
    }
  }

  async function bind(id: string) {
    try {
      const data = await api<{ policyNumber: string }>(`/listings/${id}/bind`, { method: "POST" });
      setMessage(`Bound ${data.policyNumber}. Simulated remittance instruction recorded.`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bind failed");
    }
  }

  async function uploadPdf(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    try {
      await api(`/listings/${id}/policy-pdf`, {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      setMessage("Policy PDF stored.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div>
      <PageTitle
        kicker="Carrier"
        title="Policies"
        body="Nothing binds until the premium is whole and the lender is named as loss payee."
      />
      {message ? <p className="mb-4 text-sm text-teal">{message}</p> : null}
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      {groups.length === 0 ? <p className="text-sm text-muted">No active policies yet.</p> : null}
      <div className="flex flex-col gap-8">
        {groups.map((group) => {
          const totalFunded = group.listings.reduce((sum, l) => sum + l.fundedCents, 0);
          return (
            <section key={`${group.state}|${group.peril}`}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-sand">
                  {STATE_LABEL[group.state] ?? group.state} ·{" "}
                  {PERIL_LABEL[group.peril] ?? group.peril}
                </h2>
                <p className="text-xs text-muted">
                  {group.listings.length} {group.listings.length === 1 ? "policy" : "policies"} ·{" "}
                  {usd(totalFunded)} total
                </p>
              </div>
              <div className="grid gap-px bg-line">
                {group.listings.map((listing) => (
                  <article key={listing.id} className="bg-background p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-serif text-xl">
                          {listing.property.address}, {listing.property.city}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {usd(listing.fundedCents)} of {usd(listing.premiumTargetCents)} ·{" "}
                          {listing.policy?.policyNumber ?? "not bound"}
                        </p>
                      </div>
                      <StatusBadge status={listing.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!listing.lenderNamedLossPayee ? (
                        <Button type="button" variant="ghost" onClick={() => nameLender(listing.id)}>
                          Name lender loss payee
                        </Button>
                      ) : null}
                      {listing.status !== "ACTIVE" ? (
                        <Button type="button" onClick={() => bind(listing.id)}>
                          Bind (write remittance instruction)
                        </Button>
                      ) : (
                        <form onSubmit={(event) => uploadPdf(event, listing.id)} className="flex gap-2">
                          <input name="policy" type="file" required className="text-sm" />
                          <Button type="submit" variant="ghost">
                            Upload policy PDF
                          </Button>
                        </form>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
