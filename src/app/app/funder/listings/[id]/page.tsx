"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { usd, estimatedContributorPayout } from "@/lib/money";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import { Button, Field, inputClass } from "@/components/ui/forms";
import type { Listing } from "@/lib/types";

export default function FunderListingPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    searchParams.get("checkout") === "success"
      ? "Payment received — your contribution will appear below once Stripe confirms it."
      : searchParams.get("checkout") === "cancelled"
        ? "Checkout was cancelled. No charge was made."
        : null,
  );
  const [amount, setAmount] = useState<string>("");
  const defaultAmountSet = useRef(false);

  async function load() {
    const data = await api<{ listing: Listing }>(`/listings/${params.id}`);
    setListing(data.listing);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a sanctioned Effect use case
    load().catch((err: Error) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    if (!listing || defaultAmountSet.current) return;
    defaultAmountSet.current = true;
    const remaining = Math.max((listing.premiumTargetCents - listing.fundedCents) / 100, 0);
    setAmount(String(Math.min(500, remaining)));
  }, [listing]);

  async function contribute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const data = await api<{ checkoutUrl?: string }>(`/listings/${params.id}/contribute`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          asOwner: false,
          returnUrl: window.location.href,
        }),
      });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setMessage("Simulated contribution recorded. This is not an investment.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not contribute");
    }
  }

  if (!listing) return <p className="text-sm text-muted">{error ?? "Loading…"}</p>;
  const remaining = (listing.premiumTargetCents - listing.fundedCents) / 100;
  const trigger =
    listing.quote.triggerJson?.text ??
    listing.quote.quoteRequest?.carrierProduct?.triggerDescription;
  const coverageCents = listing.quote.coverageCents;
  const amountCents = Math.round((Number(amount) || 0) * 100);
  const preview =
    coverageCents && amountCents > 0
      ? estimatedContributorPayout({
          contributionCents: amountCents,
          premiumTargetCents: listing.premiumTargetCents,
          ownerContributionCents: listing.ownerContributionCents,
          coverageCents,
          mortgageCents: listing.property.mortgage?.outstandingBalanceCents ?? 0,
        })
      : null;

  return (
    <div>
      <PageTitle
        kicker={PERIL_LABEL[listing.property.peril]}
        title={`${listing.property.city}, ${listing.property.state}`}
        body={`${listing.property.address} · named insured on file · FiSure is not the insurer.`}
      />
      <StatusBadge status={listing.status} />
      <p className="mt-6 max-w-2xl text-sm leading-7 text-muted">{trigger}</p>
      <div className="mt-8 border border-line p-6">
        <p className="font-serif text-3xl">{usd(listing.fundedCents)}</p>
        <p className="mt-2 text-sm text-muted">of {usd(listing.premiumTargetCents)} premium target</p>
        <div className="mt-4 h-1.5 bg-surface-2">
          <div
            className="h-full bg-sand"
            style={{
              width: `${Math.min(100, (listing.fundedCents / listing.premiumTargetCents) * 100)}%`,
            }}
          />
        </div>
        <p className="mt-4 text-xs leading-5 text-muted">
          If a trigger hits, the lender is paid first. The owner receives a share of the remainder
          equal to their premium contribution. Contributors share what remains, pro-rata. If no
          trigger occurs, the premium is consumed.
        </p>
      </div>
      {listing.status === "LIVE" ? (
        <form onSubmit={contribute} className="mt-8 max-w-sm">
          <Field label={`Amount (remaining ${usd(remaining * 100)})`}>
            <input
              name="amount"
              type="number"
              min={1}
              max={remaining}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={inputClass()}
            />
          </Field>
          {preview ? (
            <p className="mt-3 text-sm text-muted">
              That&apos;s <strong className="text-foreground">{preview.sharePct.toFixed(1)}%</strong>{" "}
              of the total premium. If the trigger fires and the policy pays its full{" "}
              {usd(coverageCents ?? 0)} coverage, your estimated payout would be about{" "}
              <strong className="text-foreground">{usd(preview.estimatedPayoutCents)}</strong>.
              This is an estimate, not a guarantee — actual payouts depend on the real claim size
              and the final mix of contributors once the listing is fully funded.
            </p>
          ) : null}
          <div className="mt-4">
            <Button type="submit">Support this coverage</Button>
          </div>
        </form>
      ) : (
        <p className="mt-6 text-sm text-muted">This listing is not open for new contributions.</p>
      )}
      {message ? <p className="mt-4 text-sm text-teal">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-sand">{error}</p> : null}
    </div>
  );
}
