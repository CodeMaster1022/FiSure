"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { usd } from "@/lib/money";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import type { Listing } from "@/lib/types";

function project(lat: number, lng: number) {
  const left = ((lng - -125) / 59) * 100;
  const top = ((50 - lat) / 26) * 100;
  return {
    left: `${Math.min(96, Math.max(4, left))}%`,
    top: `${Math.min(92, Math.max(8, top))}%`,
  };
}

export default function FunderMap() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ listings: Listing[] }>("/listings/map")
      .then((data) => setListings(data.listings))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div>
      <PageTitle
        kicker="Community"
        title="Properties asking for premium support"
        body="A contribution is not a deposit. If no qualifying trigger occurs, the premium is consumed by the carrier."
      />
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      <div className="relative mb-10 h-[320px] border border-line bg-surface">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/app/funder/listings/${listing.id}`}
            className="absolute h-2.5 w-2.5 rounded-full bg-sand"
            style={project(listing.property.lat, listing.property.lng)}
            title={`${listing.property.city} ${listing.status}`}
          />
        ))}
        <p className="absolute bottom-3 left-4 text-[11px] uppercase tracking-[0.16em] text-muted">
          FL and CA markers · not a risk overlay
        </p>
      </div>
      <div className="grid gap-px bg-line">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/app/funder/listings/${listing.id}`}
            className="flex flex-wrap items-center justify-between gap-4 bg-background px-5 py-4 hover:bg-surface"
          >
            <div>
              <p className="font-serif text-xl">
                {listing.property.city}, {listing.property.state}
              </p>
              <p className="mt-1 text-sm text-muted">
                {PERIL_LABEL[listing.property.peril]} · {usd(listing.fundedCents)} of{" "}
                {usd(listing.premiumTargetCents)}
              </p>
            </div>
            <StatusBadge status={listing.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
