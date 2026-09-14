"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { usd } from "@/lib/money";
import { PERIL_LABEL, STATUS_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import { ListingMap } from "@/components/app/ListingMap";
import type { Listing } from "@/lib/types";

const ALL = "ALL";

export default function FunderMap() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState(ALL);
  const [peril, setPeril] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  useEffect(() => {
    api<{ listings: Listing[] }>("/listings/map")
      .then((data) => setListings(data.listings))
      .catch((err: Error) => setError(err.message));
  }, []);

  const statusesPresent = useMemo(
    () => Array.from(new Set(listings.map((listing) => listing.status))).sort(),
    [listings],
  );
  const perilsPresent = useMemo(
    () => Array.from(new Set(listings.map((listing) => listing.property.peril))).sort(),
    [listings],
  );

  const filtered = useMemo(
    () =>
      listings.filter(
        (listing) =>
          (state === ALL || listing.property.state === state) &&
          (peril === ALL || listing.property.peril === peril) &&
          (status === ALL || listing.status === status),
      ),
    [listings, state, peril, status],
  );

  return (
    <div>
      <PageTitle
        kicker="Community"
        title="Properties asking for premium support"
        body="A contribution is not a deposit. If no qualifying trigger occurs, the premium is consumed by the carrier."
      />
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="border border-line bg-background px-3 py-2"
        >
          <option value={ALL}>All states</option>
          <option value="FL">Florida</option>
          <option value="CA">California</option>
        </select>
        <select
          value={peril}
          onChange={(e) => setPeril(e.target.value)}
          className="border border-line bg-background px-3 py-2"
        >
          <option value={ALL}>All disaster types</option>
          {perilsPresent.map((p) => (
            <option key={p} value={p}>
              {PERIL_LABEL[p] ?? p}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-line bg-background px-3 py-2"
        >
          <option value={ALL}>All funding status</option>
          {statusesPresent.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s] ?? s}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <ListingMap listings={filtered} />
      </div>
      <p className="mb-10 text-[11px] uppercase tracking-[0.16em] text-muted">
        Click a marker for details &middot; not a FEMA/NOAA/USGS risk overlay yet
      </p>

      <div className="grid gap-px bg-line">
        {filtered.map((listing) => (
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
