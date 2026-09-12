import { Container, SectionHeading } from "@/components/landing/primitives";

const stats = [
  {
    value: "150,000+",
    label: "California homeowners uninsured in high-risk wildfire zones",
  },
  {
    value: "555,000+",
    label: "California FAIR Plan policies — 4× in five years",
  },
  {
    value: "2–3×",
    label: "Florida average premium versus the U.S. average",
  },
  {
    value: "$223B",
    label: "Global uninsured disaster losses in 2024",
  },
];

export function Problem() {
  return (
    <section className="border-b border-line py-20 sm:py-24">
      <Container>
        <SectionHeading
          kicker="01 — The gap"
          title="The cover exists. The premium is the barrier."
          body="A growing share of owners cannot fund the premium required for adequate cover, and indemnity settlement is slow. FiSure’s thesis does not depend on rates rising forever. It depends on those two conditions."
        />
        <div className="mt-14 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-background p-6">
              <p className="font-serif text-3xl tracking-tight sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted">
          Indicative market figures from the FiSure BRD v2.0 (2025–2026). Subject
          to confirmation with qualified advisors.
        </p>
      </Container>
    </section>
  );
}
