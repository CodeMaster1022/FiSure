"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { usd } from "@/lib/money";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle } from "@/components/app/ui";
import { Button } from "@/components/ui/forms";
import type { Listing } from "@/lib/types";

const STATE_LABEL: Record<string, string> = { FL: "Florida", CA: "California" };
const PROPERTY_TYPE_LABEL: Record<string, string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
};

type Row = {
  peril: string;
  state: string;
  propertyType: string;
  policies: number;
  commissionCents: number;
};

function commissionCents(listing: Listing) {
  return (listing.ledger ?? [])
    .filter((entry) => entry.type === "PLATFORM_FEE")
    .reduce((sum, entry) => sum + entry.amountCents, 0);
}

function downloadCsv(rows: Row[], filename: string) {
  const headers = ["Peril", "State", "Property type", "Policies", "Commission (USD)"];
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        PERIL_LABEL[row.peril] ?? row.peril,
        STATE_LABEL[row.state] ?? row.state,
        PROPERTY_TYPE_LABEL[row.propertyType] ?? row.propertyType,
        row.policies,
        (row.commissionCents / 100).toFixed(2),
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminCommissions() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ listings: Listing[] }>("/listings")
      .then((data) => setListings(data.listings))
      .catch((err: Error) => setError(err.message));
  }, []);

  const rows = useMemo(() => {
    const byKey = new Map<string, Row>();
    for (const listing of listings) {
      const cents = commissionCents(listing);
      if (cents <= 0) continue;
      const key = `${listing.property.peril}|${listing.property.state}|${listing.property.propertyType}`;
      const row = byKey.get(key);
      if (row) {
        row.policies += 1;
        row.commissionCents += cents;
      } else {
        byKey.set(key, {
          peril: listing.property.peril,
          state: listing.property.state,
          propertyType: listing.property.propertyType,
          policies: 1,
          commissionCents: cents,
        });
      }
    }
    return Array.from(byKey.values()).sort((a, b) => b.commissionCents - a.commissionCents);
  }, [listings]);

  const totalCommissionCents = rows.reduce((sum, row) => sum + row.commissionCents, 0);
  const totalPolicies = rows.reduce((sum, row) => sum + row.policies, 0);

  return (
    <div>
      <PageTitle
        kicker="Admin"
        title="Commission tracker"
        body="Platform fee revenue collected at bind, broken down by peril, state, and residential/commercial."
      />
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No commission has been collected yet.</p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Total commission</p>
                <p className="mt-1 font-serif text-2xl">{usd(totalCommissionCents)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Bound policies</p>
                <p className="mt-1 font-serif text-2xl">{totalPolicies}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => downloadCsv(rows, `fisure-commissions-${new Date().toISOString().slice(0, 10)}.csv`)}
            >
              Export to Excel (CSV)
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-muted">
                  <th className="py-2 pr-4">Peril</th>
                  <th className="py-2 pr-4">State</th>
                  <th className="py-2 pr-4">Property type</th>
                  <th className="py-2 pr-4">Policies</th>
                  <th className="py-2 pr-4">Commission</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.peril}|${row.state}|${row.propertyType}`} className="border-b border-line">
                    <td className="py-3 pr-4">{PERIL_LABEL[row.peril] ?? row.peril}</td>
                    <td className="py-3 pr-4">{STATE_LABEL[row.state] ?? row.state}</td>
                    <td className="py-3 pr-4">{PROPERTY_TYPE_LABEL[row.propertyType] ?? row.propertyType}</td>
                    <td className="py-3 pr-4">{row.policies}</td>
                    <td className="py-3 pr-4">{usd(row.commissionCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
