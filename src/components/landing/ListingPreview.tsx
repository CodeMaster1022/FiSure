export function ListingPreview() {
  return (
    <article className="relative border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-sand">
            Florida · Hurricane
          </p>
          <h3 className="mt-2 font-serif text-2xl tracking-tight">
            Fort Myers, FL
          </h3>
        </div>
        <span className="border border-line px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-muted">
          Listing
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted">
        Category 3 or higher landfall confirmed by NOAA NHC within the
        carrier-defined radius. Parametric — paid on the trigger, not on a
        loss-adjuster visit.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-px bg-line">
        <div className="bg-surface p-3">
          <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Coverage
          </dt>
          <dd className="mt-1 font-serif text-xl">$270,000</dd>
        </div>
        <div className="bg-surface p-3">
          <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Annual premium
          </dt>
          <dd className="mt-1 font-serif text-xl">$6,400</dd>
        </div>
        <div className="bg-surface p-3">
          <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Owner in escrow
          </dt>
          <dd className="mt-1 font-serif text-xl">15%</dd>
        </div>
        <div className="bg-surface p-3">
          <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Days remaining
          </dt>
          <dd className="mt-1 font-serif text-xl">18</dd>
        </div>
      </dl>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span>62% funded</span>
          <span className="text-muted">$3,968 of $6,400</span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-surface-2">
          <div className="h-full w-[62%] bg-sand" />
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-muted">
        Illustrative listing. A policy is not issued until the premium is fully
        funded. If no qualifying trigger occurs, the premium is consumed by the
        carrier — there is no refund.
      </p>
    </article>
  );
}
