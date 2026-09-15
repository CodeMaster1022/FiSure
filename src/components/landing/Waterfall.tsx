import { Container, SectionHeading } from "@/components/landing/primitives";

const legs = [
  {
    share: "74%",
    amount: "$200,000",
    who: "Your mortgage, cleared",
    detail: "First priority. Named loss payee. Settled in full from gross proceeds. Skipped if the property is unencumbered.",
  },
  {
    share: "5%",
    amount: "$14,000",
    who: "Property owner",
    detail: "A share of what remains after the lender, at least equal to the owner’s premium contribution. Here, 20% of $70,000 net.",
  },
  {
    share: "21%",
    amount: "$56,000",
    who: "Crowdfunders",
    detail: "The residual, distributed pro-rata by contribution. Not a deposit and not a guaranteed recovery.",
  },
];

export function Waterfall() {
  return (
    <section
      id="proceeds"
      className="scroll-mt-20 border-b border-line py-20 sm:py-24"
    >
      <Container>
        <SectionHeading
          kicker="05 — If a trigger hits"
          title="The order of proceeds is public before anyone contributes."
          body="An illustrative example: a $270,000 parametric payout on a property with a $200,000 mortgage. Your lender is paid first, clearing the debt. What remains goes to you, then to the people who helped fund your premium."
        />
        <p className="mt-3 max-w-xl text-base leading-7 text-muted">
          Fast cash in weeks after a disaster. It is not a full rebuild
          settlement, and it does not replace your primary policy.
        </p>

        <div className="mt-16">
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-0 bottom-full mb-2 flex text-[11px] uppercase tracking-[0.14em] text-muted">
              <span className="w-[74%]">Mortgage lender</span>
              <span className="w-[5%] whitespace-nowrap">Owner</span>
              <span className="w-[21%] text-right">Crowdfunders</span>
            </div>
            <div className="flex h-3 w-full overflow-hidden bg-surface-2">
              <div className="w-[74%] bg-muted/70" />
              <div className="w-[5%] bg-[#a8cec6]" />
              <div className="w-[21%] bg-[#e4c988]" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Share of gross proceeds · illustrative · $270,000 total
          </p>
        </div>

        <div className="mt-10 grid gap-px bg-line lg:grid-cols-3">
          {legs.map((leg) => (
            <article key={leg.who} className="bg-background p-8">
              <p className="font-serif text-3xl tracking-tight">{leg.amount}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-sand">
                {leg.share} of gross
              </p>
              <h3 className="mt-5 font-serif text-xl">{leg.who}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{leg.detail}</p>
            </article>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted">
          Net position to the owner: <span className="text-sand">$200,000</span> of
          debt cleared plus <span className="text-sand">$14,000</span> cash in
          hand.
        </p>

        <div className="mt-8 border border-line bg-surface p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-sand">
            If no trigger occurs
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            The premium is fully consumed by the insurance carrier. There is no
            refund to the property owner or to contributors. That is the
            statistically expected outcome for most policies in any given year,
            and it is disclosed before a contribution is accepted.
          </p>
        </div>
      </Container>
    </section>
  );
}
