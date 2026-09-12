"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { usd } from "@/lib/money";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import { Button } from "@/components/ui/forms";
import type { Listing } from "@/lib/types";

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    api<{ listings: Listing[] }>("/listings").then((data) => setListings(data.listings));
  }

  useEffect(() => {
    load();
  }, []);

  async function expire() {
    const result = await api<{ expired: number; lapsed: number }>("/admin/expire", {
      method: "POST",
    });
    setMessage(`Moved ${result.expired} to top-up; lapsed ${result.lapsed}.`);
    load();
  }

  return (
    <div>
      <PageTitle kicker="Admin" title="Listings" body="Run the expiry / top-up job against mock clocks." />
      <Button type="button" variant="ghost" onClick={expire}>
        Run expiry / top-up
      </Button>
      {message ? <p className="mt-4 text-sm text-teal">{message}</p> : null}
      <div className="mt-8 grid gap-px bg-line">
        {listings.map((listing) => (
          <div key={listing.id} className="flex flex-wrap items-center justify-between gap-4 bg-background px-5 py-4">
            <div>
              <p className="font-serif text-xl">
                {listing.property.city} · {listing.property.peril}
              </p>
              <p className="text-sm text-muted">
                {usd(listing.fundedCents)} / {usd(listing.premiumTargetCents)}
              </p>
            </div>
            <StatusBadge status={listing.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
