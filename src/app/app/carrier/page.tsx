"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, API_URL } from "@/lib/api";
import { usd, suggestedMinimumCoverageCents } from "@/lib/money";
import { PERIL_LABEL, DOCUMENT_KIND_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import { Button, Field, Pagination, inputClass } from "@/components/ui/forms";

type Request = {
  id: string;
  status: string;
  filePackKey: string | null;
  property: {
    id: string;
    address: string;
    city: string;
    peril: string;
    mortgage: { outstandingBalanceCents: number; lenderName: string } | null;
    owner: { email: string; name: string | null; kycStatus: string };
    documents: Array<{ id: string; kind: string; filename: string; createdAt: string }>;
  };
  carrierProduct: { name: string; triggerDescription: string; payoutSchedule: unknown };
  quote: { decision: string } | null;
};

const KYC_LABEL: Record<string, string> = {
  PASSED: "KYC passed",
  FAILED: "KYC failed",
  PENDING: "KYC pending",
};

export default function CarrierQueue() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  function load() {
    api<{ requests: Request[]; total: number }>(`/quotes/queue?page=${page}&pageSize=${pageSize}`)
      .then((data) => {
        setRequests(data.requests);
        setTotal(data.total);
      })
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  function changePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  async function respond(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api(`/quotes/${id}/respond`, {
        method: "POST",
        body: JSON.stringify({
          decision: form.get("decision"),
          premium: form.get("premium"),
          coverage: form.get("coverage"),
          validDays: form.get("validDays"),
          notes: form.get("notes"),
        }),
      });
      setOpen(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quote failed");
    }
  }

  return (
    <div>
      <PageTitle
        kicker="Carrier"
        title="Underwriting queue"
        body="File packs arrive by upload, not by core-system integration. Buffer is re-checked on the minimum payable band."
      />
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      <div className="grid gap-px bg-line">
        {requests.map((request) => (
          <article key={request.id} className="bg-background p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-serif text-xl">
                  {request.property.address}, {request.property.city}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {PERIL_LABEL[request.property.peril]} · {request.carrierProduct.name} ·{" "}
                  {request.property.owner.email}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Mortgage {usd(request.property.mortgage?.outstandingBalanceCents ?? 0)} ·{" "}
                  {request.property.mortgage?.lenderName}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {KYC_LABEL[request.property.owner.kycStatus] ?? request.property.owner.kycStatus}
                </p>
                {request.property.documents.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {request.property.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={`${API_URL}/documents/${doc.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted underline hover:text-foreground"
                      >
                        {DOCUMENT_KIND_LABEL[doc.kind] ?? doc.kind}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted">No documents submitted yet.</p>
                )}
              </div>
              <StatusBadge status={request.quote?.decision ?? request.status} />
            </div>
            {!request.quote && (
              <div className="mt-4">
                <Button type="button" variant="ghost" onClick={() => setOpen(request.id)}>
                  Record quote
                </Button>
                {open === request.id ? (
                  <form
                    onSubmit={(event) => respond(event, request.id)}
                    className="mt-4 grid max-w-lg gap-3"
                  >
                    <Field label="Decision">
                      <select name="decision" className={inputClass()} defaultValue="ACCEPTED">
                        <option value="ACCEPTED">Accept</option>
                        <option value="DECLINED">Decline</option>
                      </select>
                    </Field>
                    <Field label="Premium (USD)">
                      <input name="premium" type="number" className={inputClass()} />
                    </Field>
                    <Field
                      label="Coverage (USD)"
                      hint={(() => {
                        const suggestion = suggestedMinimumCoverageCents(
                          request.property.mortgage?.outstandingBalanceCents ?? 0,
                          request.carrierProduct.payoutSchedule,
                        );
                        if (!suggestion.achievable) {
                          return "This product's payout schedule cannot clear the required 35% buffer at any coverage amount — a fixed-dollar band is set below the required minimum.";
                        }
                        return `Enter at least ${usd(suggestion.coverageCents)} to clear the 35% buffer after this product's payout schedule is applied — the raw 135%-of-mortgage figure isn't enough unless every band pays 100%.`;
                      })()}
                    >
                      <input name="coverage" type="number" className={inputClass()} />
                    </Field>
                    <Field label="Quote valid (days)">
                      <input name="validDays" type="number" defaultValue={30} className={inputClass()} />
                    </Field>
                    <Field label="Notes">
                      <input name="notes" className={inputClass()} />
                    </Field>
                    <Button type="submit">Save decision</Button>
                  </form>
                ) : null}
              </div>
            )}
          </article>
        ))}
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
