import { Container } from "@/components/landing/primitives";

export function Footer() {
  return (
    <footer className="py-16">
      <Container>
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[0.18em] uppercase">
              FiSure
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
              A crowdfunded parametric insurance marketplace. We do not
              underwrite, hold, or adjudicate policies.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted">
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#markets" className="hover:text-foreground">
              Markets
            </a>
            <a href="#proceeds" className="hover:text-foreground">
              Proceeds waterfall
            </a>
            <a href="#access" className="hover:text-foreground">
              Request access
            </a>
          </div>
        </div>
        <p className="mt-12 max-w-3xl text-xs leading-5 text-muted">
          Confidential product in formation. Not an offer of insurance, not an
          offer of securities, and not an invitation to contribute. All
          financial figures on this page are indicative. Legal and regulatory
          requirements must be confirmed with qualified counsel before any
          commercial activity. Florida DFS and California CDI licensing, a
          premium-finance structure, and a securities opinion are required
          before the marketplace can operate.
        </p>
        <p className="mt-6 text-xs text-muted">© {new Date().getFullYear()} FiSure</p>
      </Container>
    </footer>
  );
}
