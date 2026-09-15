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
    propertyType: "RESIDENTIAL" | "COMMERCIAL";
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
  ledger?: Array<{ id: string; type: string; amountCents: number; createdAt: string }>;
};

export type Notification = {
  id: string;
  kind:
    | "TRIGGER_MATCH"
    | "CLAIM_OPENED"
    | "CLAIM_SETTLED"
    | "KYC_FAILED"
    | "LISTING_FULLY_FUNDED"
    | "POLICY_BOUND";
  title: string;
  body: string;
  listingId: string | null;
  policyId: string | null;
  read: boolean;
  createdAt: string;
};
