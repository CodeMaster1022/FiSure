import { Container, SectionHeading } from "@/components/landing/primitives";

const steps = [
  {
    title: "List the property",
    copy: "Address, ownership, mortgage, and value. FiSure checks the 35% equity buffer, KYC, existing cover, and whether the asset sits in a qualifying risk zone.",
  },
  {
    title: "Carrier quotes",
    copy: "Eligible assets are matched to parametric products. A structured submission pack goes to the carrier by secure file transfer. The carrier returns premium, triggers, coverage, and quote validity.",
  },
  {
    title: "Owner funds 15%",
    copy: "The listing is not public until the owner’s minimum contribution is in segregated escrow. That percentage also sets their floor on any later net proceeds.",
  },
  {
    title: "Community completes the premium",
    copy: "Contributors browse by place, peril, and funding status. First contribution requires a risk disclosure. If the listing does not reach 100% by the deadline, every dollar is returned — including the owner’s 15%.",
  },
  {
    title: "Policy binds",
    copy: "At full funding, FiSure deducts its platform fee and remits net premium. The carrier issues the policy. The mortgage lender is named as loss payee. Documents go to owner, lender, and contributors.",
  },
  {
    title: "Watch the public trigger",
    copy: "NOAA, FEMA, USGS, and NASA FIRMS feeds are monitored. The carrier alone decides whether the parametric condition is met. FiSure alerts parties and routes proceeds if a claim is paid.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-b border-line py-20 sm:py-24">
      <Container>
        <SectionHeading
          kicker="03 — The loop"
          title="Nothing binds until the premium is whole."
          body="A listing that expires unfunded is refunded in full. The owner has a short top-up window. There is no policy, and no carrier remittance, until 100%."
        />
        <ol className="mt-14 grid gap-px bg-line sm:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step.title} className="bg-background p-8">
              <p className="font-mono text-xs text-sand">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-serif text-2xl tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">{step.copy}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
