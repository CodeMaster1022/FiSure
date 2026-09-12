import { Container, SectionHeading } from "@/components/landing/primitives";

const perils = [
  {
    market: "Florida",
    peril: "Hurricane",
    trigger: "Category 3+ landfall confirmed by NOAA NHC within a carrier-defined radius.",
  },
  {
    market: "Florida",
    peril: "Flood",
    trigger: "FEMA-declared flood reaching a defined water-level threshold at or near the property.",
  },
  {
    market: "California",
    peril: "Wildfire",
    trigger: "Satellite-confirmed natural-fire perimeter (NASA FIRMS / USFS) within a carrier-defined radius.",
  },
  {
    market: "California",
    peril: "Earthquake",
    trigger: "USGS-measured event of magnitude 6.0 or greater within a carrier-defined radius.",
  },
];

export function Markets() {
  return (
    <section
      id="markets"
      className="scroll-mt-20 border-b border-line py-20 sm:py-24"
    >
      <Container>
        <SectionHeading
          kicker="04 — Launch markets"
          title="Paid on a public index, not a site visit."
          body="Parametric cover pays a pre-defined amount when an objective trigger occurs — whether or not the building is damaged. That speed and transparency is why contributors can see the condition before they contribute. It also creates basis risk, which every listing must disclose."
        />
        <div className="mt-14 overflow-x-auto border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface text-[11px] uppercase tracking-[0.16em] text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Market</th>
                <th className="px-5 py-3 font-medium">Peril</th>
                <th className="px-5 py-3 font-medium">Trigger</th>
              </tr>
            </thead>
            <tbody>
              {perils.map((row) => (
                <tr key={`${row.market}-${row.peril}`} className="border-t border-line">
                  <td className="px-5 py-4 text-foreground">{row.market}</td>
                  <td className="px-5 py-4 text-foreground">{row.peril}</td>
                  <td className="px-5 py-4 text-muted">{row.trigger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm text-muted">
          Phase 2 targets Texas, Louisiana, and the Pacific Northwest. Carriers
          remain solely responsible for confirming whether a qualifying event
          has occurred.
        </p>
      </Container>
    </section>
  );
}
