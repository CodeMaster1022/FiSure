"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { usd } from "@/lib/money";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import { Button } from "@/components/ui/forms";
import type { Listing } from "@/lib/types";

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
      <div className="grid gap-px bg-line">
        {listings.map((listing) => (
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
    </div>
  );
}
