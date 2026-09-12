import { Container, SectionHeading } from "@/components/landing/primitives";

const parties = [
  {
    who: "Property owners",
    role: "Named insured",
    copy: "List a residential or commercial asset. Pass ownership, KYC, and the 35% equity buffer. Fund at least 15% of the premium before the listing goes live. You are the named insured. After a trigger, you receive a share of net proceeds equal to your contribution percentage — after the lender is settled.",
  },
  {
    who: "Insurance carriers",
    role: "Risk bearer",
    copy: "List parametric products, set price and triggers, and underwrite each submission. FiSure sends a structured file pack. You bind the policy and remain solely responsible for adjudication. New premium from a segment that could not reach you on price.",
  },
  {
    who: "Crowdfunders",
    role: "Premium contributors",
    copy: "Corporate CSR programs and individuals help complete the premium. If a qualifying trigger occurs, you receive a pro-rata share of net proceeds after the lender and the owner allocation. If it does not — the expected year for most policies — the premium is consumed. There is no refund.",
  },
];

export function Parties() {
  return (
    <section className="border-b border-line py-20 sm:py-24">
      <Container>
        <SectionHeading
          kicker="02 — Three parties"
          title="A marketplace. Not a carrier."
          body="Structurally closer to a matching platform than to an insurer. FiSure lists, vets, escrows, and routes. The carrier underwrites and pays."
        />
        <div className="mt-14 grid gap-px bg-line lg:grid-cols-3">
          {parties.map((party, index) => (
            <article key={party.who} className="bg-background p-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-sand">
                0{index + 1}
              </p>
              <h3 className="mt-4 font-serif text-2xl tracking-tight">
                {party.who}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                {party.role}
              </p>
              <p className="mt-5 text-sm leading-7 text-muted">{party.copy}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
