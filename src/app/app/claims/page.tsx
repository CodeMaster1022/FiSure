"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import { Button, Field, inputClass } from "@/components/ui/forms";
import type { Listing } from "@/lib/types";

type Claim = {
  id: string;
  status: "OPEN" | "SETTLED";
  description: string | null;
  openedAt: string;
  settledAt: string | null;
  property: {
    address: string;
    city: string;
    state: string;
    peril: string;
  };
  policy: {
    id: string;
    policyNumber: string;
  } | null;
};

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [boundListings, setBoundListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    api<{ claims: Claim[] }>("/claims")
      .then((data) => setClaims(data.claims))
      .catch((err: Error) => setError(err.message));
    api<{ listings: Listing[] }>("/listings")
      .then((data) => setBoundListings(data.listings.filter((l) => l.policy)))
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function openClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      await api("/claims", {
        method: "POST",
        body: JSON.stringify({
          policyId: form.get("policyId"),
          description: form.get("description"),
        }),
      });
      setMessage("Claim opened. The property owner has been notified.");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open claim");
    }
  }

  async function settle(id: string) {
    setError(null);
    try {
      await api(`/claims/${id}/settle`, { method: "POST" });
      setMessage("Claim settled.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not settle claim");
    }
  }

  return (
    <div>
      <PageTitle
        kicker="Claims"
        title="Open claims"
        body="An open claim blocks the owner from listing a new property for the same peril until it's settled."
      />
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      {message ? <p className="mb-4 text-sm text-teal">{message}</p> : null}

      <div className="mb-8">
        <Button type="button" variant="ghost" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Open a claim"}
        </Button>
        {showForm ? (
          <form onSubmit={openClaim} className="mt-4 grid max-w-lg gap-3">
            <Field label="Bound policy">
              <select name="policyId" required className={inputClass()}>
                <option value="">Select a policy…</option>
                {boundListings.map((listing) => (
                  <option key={listing.policy!.id} value={listing.policy!.id}>
                    {listing.policy!.policyNumber} — {listing.property.address}, {listing.property.city}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description (optional)">
              <input name="description" className={inputClass()} />
            </Field>
            <Button type="submit">Open claim</Button>
          </form>
        ) : null}
      </div>

      <div className="grid gap-px bg-line">
        {claims.map((claim) => (
          <div key={claim.id} className="flex flex-wrap items-start justify-between gap-4 bg-background p-5">
            <div>
              <p className="font-serif text-xl">
                {claim.property.address}, {claim.property.city}, {claim.property.state}
              </p>
              <p className="mt-1 text-sm text-muted">
                {PERIL_LABEL[claim.property.peril] ?? claim.property.peril} ·{" "}
                {claim.policy?.policyNumber ?? "policy removed"}
              </p>
              {claim.description ? <p className="mt-1 text-sm text-muted">{claim.description}</p> : null}
              <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                Opened {new Date(claim.openedAt).toLocaleDateString()}
                {claim.settledAt ? ` · Settled ${new Date(claim.settledAt).toLocaleDateString()}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={claim.status} />
              {claim.status === "OPEN" ? (
                <Button type="button" variant="ghost" onClick={() => settle(claim.id)}>
                  Settle
                </Button>
              ) : null}
            </div>
          </div>
        ))}
        {claims.length === 0 ? (
          <p className="bg-background p-5 text-sm text-muted">No claims yet.</p>
        ) : null}
      </div>
    </div>
  );
}
