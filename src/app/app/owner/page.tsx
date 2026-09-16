"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { usd } from "@/lib/money";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import { Pagination } from "@/components/ui/forms";

type PropertyRow = {
  id: string;
  address: string;
  city: string;
  state: string;
  peril: string;
  estimatedValueCents: number;
  eligibility: Array<{ bufferPassed: boolean }>;
  listings: Array<{ id: string; status: string; fundedCents: number; premiumTargetCents: number }>;
  quoteRequests: Array<{ status: string }>;
};

export default function OwnerDashboard() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api<{ properties: PropertyRow[]; total: number }>(`/properties?page=${page}&pageSize=${pageSize}`)
      .then((data) => {
        setProperties(data.properties);
        setTotal(data.total);
      })
      .catch((err: Error) => setError(err.message));
  }, [page, pageSize]);

  function changePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  return (
    <div>
      <PageTitle
        kicker="Owner"
        title="Your properties"
        body="Listings stay in escrow until the premium is whole. A failed 35% buffer never reaches a carrier."
      />
      <Link
        href="/app/owner/new"
        className="inline-flex border border-sand bg-sand px-4 py-2 text-sm font-medium text-background"
      >
        List a property
      </Link>
      {error ? <p className="mt-6 text-sm text-sand">{error}</p> : null}
      <div className="mt-10 grid gap-px bg-line">
        {properties.map((property) => {
          const listing = property.listings[0];
          const status =
            listing?.status ??
            property.quoteRequests[0]?.status ??
            (property.eligibility[0]?.bufferPassed === false ? "ELIGIBILITY_FAILED" : "SUBMITTED");
          return (
            <Link
              key={property.id}
              href={`/app/owner/properties/${property.id}`}
              className="flex flex-wrap items-center justify-between gap-4 bg-background px-5 py-4 hover:bg-surface"
            >
              <div>
                <p className="font-serif text-xl">
                  {property.address}, {property.city}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {PERIL_LABEL[property.peril]} · {usd(property.estimatedValueCents)} estimated
                </p>
              </div>
              <div className="flex items-center gap-3">
                {listing ? (
                  <span className="text-sm text-muted">
                    {usd(listing.fundedCents)} / {usd(listing.premiumTargetCents)}
                  </span>
                ) : null}
                <StatusBadge status={status} />
              </div>
            </Link>
          );
        })}
        {properties.length === 0 ? (
          <p className="bg-background px-5 py-8 text-sm text-muted">No properties yet.</p>
        ) : null}
      </div>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={changePageSize}
      />
    </div>
  );
}
