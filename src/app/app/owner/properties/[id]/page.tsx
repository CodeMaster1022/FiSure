"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { usd } from "@/lib/money";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle, StatusBadge } from "@/components/app/ui";
import { Button, Field, inputClass } from "@/components/ui/forms";

type Detail = {
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    peril: string;
    propertyType: "RESIDENTIAL" | "COMMERCIAL";
    estimatedValueCents: number;
    mortgage: { lenderName: string; outstandingBalanceCents: number } | null;
    eligibility: Array<{
      bufferPassed: boolean;
      sameRiskCovered: boolean;
      kycPassed: boolean;
      openClaim: boolean;
      notes: string | null;
      requiredCoverageCents: number;
    }>;
    listings: Array<{
      id: string;
      status: string;
      premiumTargetCents: number;
      fundedCents: number;
      ownerContributionCents: number;
    }>;
    quoteRequests: Array<{ id: string; status: string; carrierProduct: { name: string } }>;
  };
};

type Product = {
  id: string;
  name: string;
  triggerDescription: string;
  propertyType: "RESIDENTIAL" | "COMMERCIAL";
  carrier: { name: string };
};

export default function OwnerPropertyPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [data, setData] = useState<Detail["property"] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    searchParams.get("checkout") === "success"
      ? "Payment received — this will appear as funded once Stripe confirms it."
      : searchParams.get("checkout") === "cancelled"
        ? "Checkout was cancelled. No charge was made."
        : null,
  );
  const [requesting, setRequesting] = useState(false);

  async function load() {
    const res = await api<Detail>(`/properties/${params.id}`);
    setData(res.property);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a sanctioned Effect use case
    load().catch((err: Error) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const check = data?.eligibility[0];
  const isEligible = Boolean(
    check && check.bufferPassed && !check.sameRiskCovered && check.kycPassed && !check.openClaim,
  );
  const hasActiveQuoteRequest = Boolean(
    data?.quoteRequests.some((q) => q.status === "PENDING" || q.status === "ACCEPTED"),
  );

  useEffect(() => {
    if (!data || !isEligible || data.listings[0] || hasActiveQuoteRequest) return;
    api<{ products: Product[] }>(`/properties/${data.id}/products`)
      .then((res) => setProducts(res.products))
      .catch((err: Error) => setError(err.message));
  }, [data, isEligible, hasActiveQuoteRequest]);

  async function requestQuote(carrierProductId: string) {
    if (!data) return;
    setRequesting(true);
    setError(null);
    try {
      await api(`/properties/${data.id}/request-quote`, {
        method: "POST",
        body: JSON.stringify({ carrierProductId }),
      });
      setMessage("Quote requested. The carrier will review your submission.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not request a quote");
    } finally {
      setRequesting(false);
    }
  }

  async function fundOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const listing = data?.listings[0];
    if (!listing) return;
    const form = new FormData(event.currentTarget);
    try {
      const res = await api<{ checkoutUrl?: string }>(`/listings/${listing.id}/contribute`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(form.get("amount")),
          asOwner: true,
          returnUrl: window.location.href,
        }),
      });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setMessage("Simulated collection recorded.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fund");
    }
  }

  async function cancelListing() {
    const listing = data?.listings[0];
    if (!listing) return;
    if (
      !window.confirm(
        "Cancel this listing? Every contribution, including your own, will be refunded in full.",
      )
    ) {
      return;
    }
    setError(null);
    try {
      await api(`/listings/${listing.id}/cancel`, { method: "POST" });
      setMessage("Listing cancelled. All contributions were refunded in full.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel listing");
    }
  }

  if (!data) return <p className="text-sm text-muted">{error ?? "Loading…"}</p>;
  const listing = data.listings[0];
  const minOwner = listing ? Math.ceil(listing.premiumTargetCents * 0.15) / 100 : 0;

  return (
    <div>
      <PageTitle
        kicker={`${PERIL_LABEL[data.peril]} · ${data.propertyType === "COMMERCIAL" ? "Commercial" : "Residential"}`}
        title={`${data.address}, ${data.city}`}
        body={`${data.state} ${data.zip} · lender ${data.mortgage?.lenderName ?? "none"}`}
      />
      {check && !isEligible ? (
        <aside className="mb-8 border border-line bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-sand">Eligibility failed</p>
          <p className="mt-2 text-sm text-muted">
            {check.notes} Required coverage {usd(check.requiredCoverageCents)}.
          </p>
        </aside>
      ) : null}

      {data.quoteRequests.length > 0 ? (
        <div className="mb-8 grid gap-px bg-line">
          {data.quoteRequests.map((q) => (
            <p key={q.id} className="bg-background px-4 py-3 text-sm text-muted">
              Quote request {q.status.toLowerCase()} with {q.carrierProduct.name}.
            </p>
          ))}
        </div>
      ) : null}

      {listing ? (
        <div className="border border-line p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="font-serif text-2xl">{usd(listing.fundedCents)} funded</p>
            <StatusBadge status={listing.status} />
          </div>
          <p className="mt-2 text-sm text-muted">
            Target {usd(listing.premiumTargetCents)} · owner in {usd(listing.ownerContributionCents)}
          </p>
          <div className="mt-4 h-1.5 bg-surface-2">
            <div
              className="h-full bg-sand"
              style={{
                width: `${Math.min(100, (listing.fundedCents / listing.premiumTargetCents) * 100)}%`,
              }}
            />
          </div>
          {listing.status === "AWAITING_OWNER_FUNDS" ? (
            <form onSubmit={fundOwner} className="mt-6 flex max-w-sm flex-col gap-3">
              <Field
                label={`Owner contribution (minimum ${usd(minOwner * 100)} to go live)`}
                hint="You're not capped at the minimum — contribute more now if you'd like a larger share of any future payout."
              >
                <input
                  name="amount"
                  type="number"
                  step="1"
                  min={1}
                  defaultValue={minOwner}
                  className={inputClass()}
                />
              </Field>
              <Button type="submit">Simulate 15% escrow</Button>
            </form>
          ) : listing.status === "LIVE" || listing.status === "TOPUP_WINDOW" ? (
            <form onSubmit={fundOwner} className="mt-6 flex max-w-sm flex-col gap-3">
              <Field
                label="Add to your contribution"
                hint={`Up to ${usd(listing.premiumTargetCents - listing.fundedCents)} remaining. Increasing what you put in raises your share of any future payout.`}
              >
                <input name="amount" type="number" step="1" min={1} className={inputClass()} />
              </Field>
              <Button type="submit">Contribute more</Button>
            </form>
          ) : null}
          {["AWAITING_OWNER_FUNDS", "LIVE", "TOPUP_WINDOW"].includes(listing.status) ? (
            <button
              type="button"
              onClick={cancelListing}
              className="mt-6 text-sm text-muted underline hover:text-sand"
            >
              Cancel this listing and refund everyone
            </button>
          ) : null}
        </div>
      ) : isEligible && !hasActiveQuoteRequest ? (
        <div>
          <p className="mb-4 text-sm text-muted">
            Choose a carrier product to request a quote from. FiSure matches you to
            eligible products only — the carrier confirms pricing and coverage.
          </p>
          {products === null ? (
            <p className="text-sm text-muted">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted">No carrier product is listed for this peril yet.</p>
          ) : (
            <div className="grid gap-px bg-line">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-4 bg-background p-5"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-sand">
                      {product.carrier.name} ·{" "}
                      {product.propertyType === "COMMERCIAL" ? "Commercial" : "Residential"}
                    </p>
                    <h3 className="mt-1 font-serif text-xl">{product.name}</h3>
                    <p className="mt-2 max-w-lg text-sm text-muted">{product.triggerDescription}</p>
                  </div>
                  <Button
                    type="button"
                    disabled={requesting}
                    onClick={() => requestQuote(product.id)}
                  >
                    Request quote
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : !hasActiveQuoteRequest && !isEligible ? (
        <p className="text-sm text-muted">No listing yet.</p>
      ) : null}

      {message ? <p className="mt-4 text-sm text-teal">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-sand">{error}</p> : null}
    </div>
  );
}
