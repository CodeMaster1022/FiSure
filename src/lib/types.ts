export type Role = "OWNER" | "FUNDER" | "CARRIER" | "ADMIN";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  kycStatus: string;
  carrierId: string | null;
  organizationId: string | null;
  organization: { id: string; name: string; approved: boolean } | null;
};

export type Listing = {
  id: string;
  status: string;
  premiumTargetCents: number;
  fundedCents: number;
  ownerContributionCents: number;
  expiresAt: string | null;
  topUpEndsAt: string | null;
  lenderNamedLossPayee: boolean;
  liveAt: string | null;
  property: {
    id: string;
    address: string;
    city: string;
    county: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
    peril: string;
    estimatedValueCents: number;
    ownerId: string;
    owner?: { id: string; name: string | null; email: string };
    mortgage?: {
      lenderName: string;
      outstandingBalanceCents: number;
      notifiedAt: string | null;
    } | null;
  };
  quote: {
    premiumCents: number | null;
    coverageCents: number | null;
    validUntil: string | null;
    triggerJson: { text?: string; radiusKm?: number } | null;
    quoteRequest?: { carrierProduct?: { name: string; triggerDescription: string } };
  };
  contributions?: Array<{
    id: string;
    amountCents: number;
    status: string;
    userId: string;
    user?: { email: string; name: string | null };
  }>;
  policy?: { id: string; policyNumber: string } | null;
};
