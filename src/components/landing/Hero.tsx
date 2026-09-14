import { Container } from "@/components/landing/primitives";
import { ListingPreview } from "@/components/landing/ListingPreview";

export function Hero() {
  return (
    <section className="hero-grid relative overflow-hidden border-b border-line">
      <Container className="grid items-center gap-16 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-sand">
            Florida and California · Closed pilot
          </p>
          <h1 className="mt-5 max-w-xl font-serif text-[2.75rem] leading-[1.08] tracking-tight sm:text-6xl">
            The coverage exists. The premium is what&apos;s out of reach.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted sm:text-lg">
            FiSure is a marketplace, not an insurer. Property owners list.
            Carriers underwrite the parametric policy. Companies and neighbors
            fund the rest of the premium. Building stronger, more resilient
            communities together.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#access"
              className="border border-sand bg-sand px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground"
            >
              Request early access
            </a>
            <a
              href="#how"
              className="border border-line px-5 py-2.5 text-sm text-foreground transition-colors hover:border-foreground"
            >
              See how it works
            </a>
          </div>
          <p className="mt-6 max-w-md text-xs leading-5 text-muted">
            Contributions are not deposits, not insurance policies, and not
            FDIC-insured. FiSure does not underwrite, hold risk, or adjudicate
            claims.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -right-6 -top-6 hidden h-full w-full border border-line lg:block" />
          <ListingPreview />
        </div>
      </Container>
    </section>
  );
}
