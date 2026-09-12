"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { usd } from "@/lib/money";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import type { Listing } from "@/lib/types";
import { useSessionUser } from "@/components/app/SessionProvider";

export default function PortfolioPage() {
  const { user } = useSessionUser();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    api<{ listings: Listing[] }>("/listings").then((data) => {
      setListings(
        data.listings.filter((listing) =>
          listing.contributions?.some((row) => row.userId === user?.id),
        ),
      );
    });
  }, [user?.id]);

  return (
    <div>
      <PageTitle
        kicker="Community impact"
        title="Coverage you helped complete"
        body="This is a record of premium support — not an investment portfolio. No trigger means no proceeds."
      />
      <div className="grid gap-px bg-line">
        {listings.map((listing) => {
          const mine =
            listing.contributions
              ?.filter((row) => row.userId === user?.id)
              .reduce((sum, row) => sum + row.amountCents, 0) ?? 0;
          return (
            <Link
              key={listing.id}
              href={`/app/funder/listings/${listing.id}`}
              className="flex flex-wrap items-center justify-between gap-4 bg-background px-5 py-4 hover:bg-surface"
            >
              <div>
                <p className="font-serif text-xl">
                  {listing.property.city} · {PERIL_LABEL[listing.property.peril]}
                </p>
                <p className="mt-1 text-sm text-muted">Your contribution {usd(mine)}</p>
              </div>
              <StatusBadge status={listing.status} />
            </Link>
          );
        })}
        {listings.length === 0 ? (
          <p className="bg-background px-5 py-8 text-sm text-muted">No contributions yet.</p>
        ) : null}
      </div>
    </div>
  );
}
