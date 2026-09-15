"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { usd, suggestedMinimumCoverageCents } from "@/lib/money";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import { Button, Field, inputClass } from "@/components/ui/forms";

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
    owner: { email: string; name: string | null };
  };
  carrierProduct: { name: string; triggerDescription: string; payoutSchedule: unknown };
  quote: { decision: string } | null;
};

export default function CarrierQueue() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  function load() {
    api<{ requests: Request[] }>("/quotes/queue")
      .then((data) => setRequests(data.requests))
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

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
    </div>
  );
}
