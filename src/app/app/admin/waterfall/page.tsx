"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { usd } from "@/lib/money";
import { PageTitle } from "@/components/app/ui";
import { Button, Field, inputClass } from "@/components/ui/forms";

type Policy = {
  id: string;
  policyNumber: string;
  listing: {
    ownerContributionCents: number;
    premiumTargetCents: number;
    property: {
      city: string;
      mortgage: { outstandingBalanceCents: number; lenderName: string } | null;
    };
  };
  payouts: Array<{ id: string; status: string; grossCents: number }>;
};

export default function AdminWaterfall() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [split, setSplit] = useState<{
    lenderCents: number;
    ownerCents: number;
    funderPoolCents: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ policies: Policy[] }>("/payouts/policies").then((data) => setPolicies(data.policies));
  }, []);

  async function instruct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await api<{
        split: { lenderCents: number; ownerCents: number; funderPoolCents: number };
      }>("/payouts", {
        method: "POST",
        body: JSON.stringify({
          policyId: form.get("policyId"),
          gross: Number(form.get("gross")),
          mortgage: Number(form.get("mortgage")),
        }),
      });
      setSplit(data.split);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not instruct");
    }
  }

  const first = policies[0];
  const defaultGross = first ? 675000 : 0;
  const defaultMortgage = first ? (first.listing.property.mortgage?.outstandingBalanceCents ?? 0) / 100 : 0;

  return (
    <div>
      <PageTitle
        kicker="Admin"
        title="Payout waterfall"
        body="Manual instruction only. Lender first, then owner share of net, then contributors pro-rata."
      />
      <form onSubmit={instruct} className="grid max-w-xl gap-4">
        <Field label="Policy">
          <select name="policyId" className={inputClass()} key={first?.id} defaultValue={first?.id}>
            {policies.map((policy) => (
              <option key={policy.id} value={policy.id}>
                {policy.policyNumber} · {policy.listing.property.city}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Gross proceeds (USD)">
          <input name="gross" type="number" defaultValue={defaultGross} className={inputClass()} />
        </Field>
        <Field label="Outstanding mortgage (USD)">
          <input name="mortgage" type="number" defaultValue={defaultMortgage} className={inputClass()} />
        </Field>
        <Button type="submit">Write payout instruction</Button>
      </form>
      {split ? (
        <div className="mt-8 grid gap-px bg-line sm:grid-cols-3">
          <div className="bg-background p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Lender</p>
            <p className="mt-2 font-serif text-2xl">{usd(split.lenderCents)}</p>
          </div>
          <div className="bg-background p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Owner</p>
            <p className="mt-2 font-serif text-2xl">{usd(split.ownerCents)}</p>
          </div>
          <div className="bg-background p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Crowdfunders</p>
            <p className="mt-2 font-serif text-2xl">{usd(split.funderPoolCents)}</p>
          </div>
        </div>
      ) : null}
      {error ? <p className="mt-4 text-sm text-sand">{error}</p> : null}
    </div>
  );
}
