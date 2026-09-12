import type { SessionUser } from "@/lib/types";
import { DISCLOSURE_TEXT, DISCLOSURE_VERSION } from "@/lib/copy";
import { bps, requiredCoverageCents, waterfall } from "@/lib/money";

const PASSWORD = "pilot-pass-2026";
const STORAGE_KEY = "fisure.mock.v2";
const SESSION_KEY = "fisure.mock.session";

type User = SessionUser & { password: string };

type Property = {
  id: string;
  ownerId: string;
  address: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  peril: string;
  estimatedValueCents: number;
  mortgage: { lenderName: string; outstandingBalanceCents: number; notifiedAt: string | null };
  eligibility: Array<{ bufferPassed: boolean; notes: string | null; requiredCoverageCents: number }>;
};

type QuoteRequest = {
  id: string;
  propertyId: string;
  status: string;
  filePackKey: string | null;
  carrierProduct: { name: string; triggerDescription: string };
  quote: { decision: string } | null;
};

type ListingRow = {
  id: string;
  propertyId: string;
  status: string;
  premiumTargetCents: number;
  fundedCents: number;
  ownerContributionCents: number;
  expiresAt: string | null;
  topUpEndsAt: string | null;
  lenderNamedLossPayee: boolean;
  liveAt: string | null;
  triggerText: string;
  productName: string;
  coverageCents: number;
  contributions: Array<{
    id: string;
    amountCents: number;
    status: string;
    userId: string;
    user?: { email: string; name: string | null };
  }>;
  policy: { id: string; policyNumber: string } | null;
};

type TriggerEvent = {
  id: string;
  source: string;
  matched: boolean;
  confirmation: string;
  notes: string | null;
  evaluatedAt: string;
  policyId: string;
  city: string;
  peril: string;
  policyNumber: string;
};

type Store = {
  users: User[];
  properties: Property[];
  quoteRequests: QuoteRequest[];
  listings: ListingRow[];
  waitlist: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    disclosureAccepted: boolean;
    createdAt: string;
  }>;
  disclosures: string[];
  events: TriggerEvent[];
};

const PRODUCTS: Record<string, { name: string; triggerDescription: string }> = {
  FL_HURRICANE: {
    name: "Florida Hurricane Cat 3+",
    triggerDescription:
      "Category 3 or higher hurricane landfall confirmed by NOAA NHC within a 50 km radius of the property.",
  },
  FL_FLOOD: {
    name: "Florida Flood Threshold",
    triggerDescription:
      "FEMA-declared flood event reaching a defined water-level threshold at or near the property.",
  },
  CA_WILDFIRE: {
    name: "California Wildfire Perimeter",
    triggerDescription:
      "Satellite-confirmed natural wildfire perimeter (NASA FIRMS / USFS) within 10 km of the property.",
  },
  CA_EARTHQUAKE: {
    name: "California Earthquake M6.0+",
    triggerDescription:
      "USGS-measured seismic event of magnitude 6.0 or greater within 40 km of the property.",
  },
};

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function seed(): Store {
  const users: User[] = [
    {
      id: "u-admin",
      name: "FiSure Admin",
      email: "admin@fisure.local",
      role: "ADMIN",
      kycStatus: "PASSED",
      carrierId: null,
      organizationId: null,
      organization: null,
      password: PASSWORD,
    },
    {
      id: "u-owner",
      name: "Alex Owner",
      email: "owner@fisure.local",
      role: "OWNER",
      kycStatus: "PASSED",
      carrierId: null,
      organizationId: null,
      organization: null,
      password: PASSWORD,
    },
    {
      id: "u-owner2",
      name: "Riley Homeowner",
      email: "owner2@fisure.local",
      role: "OWNER",
      kycStatus: "PASSED",
      carrierId: null,
      organizationId: null,
      organization: null,
      password: PASSWORD,
    },
    {
      id: "u-funder",
      name: "Casey Funder",
      email: "funder@fisure.local",
      role: "FUNDER",
      kycStatus: "PASSED",
      carrierId: null,
      organizationId: "org-harbor",
      organization: { id: "org-harbor", name: "Harbor CSR", approved: true },
      password: PASSWORD,
    },
    {
      id: "u-funder2",
      name: "Morgan Pacific",
      email: "funder2@fisure.local",
      role: "FUNDER",
      kycStatus: "PASSED",
      carrierId: null,
      organizationId: "org-pacific",
      organization: { id: "org-pacific", name: "Pacific Resilience Fund", approved: true },
      password: PASSWORD,
    },
    {
      id: "u-carrier",
      name: "Jordan Underwriter",
      email: "carrier@fisure.local",
      role: "CARRIER",
      kycStatus: "PASSED",
      carrierId: "carrier-anchor",
      organizationId: null,
      organization: null,
      password: PASSWORD,
    },
  ];

  function property(
    id: string,
    ownerId: string,
    addr: string,
    city: string,
    county: string,
    state: string,
    zip: string,
    lat: number,
    lng: number,
    peril: string,
    value: number,
    mortgage: number,
    lender: string,
    bufferPassed = true,
    notes = "Seed eligibility passed.",
  ): Property {
    return {
      id,
      ownerId,
      address: addr,
      city,
      county,
      state,
      zip,
      lat,
      lng,
      peril,
      estimatedValueCents: value,
      mortgage: { lenderName: lender, outstandingBalanceCents: mortgage, notifiedAt: null },
      eligibility: [
        {
          bufferPassed,
          notes,
          requiredCoverageCents: requiredCoverageCents(mortgage),
        },
      ],
    };
  }

  function listing(input: {
    id: string;
    propertyId: string;
    status: string;
    premium: number;
    coverage: number;
    funded: number;
    ownerCents: number;
    ownerId: string;
    funderId: string;
    funderEmail: string;
    funderName: string;
    peril: string;
    daysLeft?: number;
    lenderNamed?: boolean;
    policyNumber?: string;
    topUpDays?: number;
  }): ListingRow {
    const product = PRODUCTS[input.peril] ?? PRODUCTS.FL_HURRICANE;
    const ownerUser = users.find((u) => u.id === input.ownerId);
    const contributions = [];
    if (input.ownerCents > 0) {
      contributions.push({
        id: `c-${input.id}-owner`,
        amountCents: input.ownerCents,
        status: "SUCCEEDED",
        userId: input.ownerId,
        user: { email: ownerUser?.email ?? "", name: ownerUser?.name ?? null },
      });
    }
    const funderCents = Math.max(input.funded - input.ownerCents, 0);
    if (funderCents > 0) {
      contributions.push({
        id: `c-${input.id}-funder`,
        amountCents: funderCents,
        status: "SUCCEEDED",
        userId: input.funderId,
        user: { email: input.funderEmail, name: input.funderName },
      });
    }
    return {
      id: input.id,
      propertyId: input.propertyId,
      status: input.status,
      premiumTargetCents: input.premium,
      fundedCents: input.funded,
      ownerContributionCents: input.ownerCents,
      expiresAt: daysFromNow(input.daysLeft ?? 20),
      topUpEndsAt: input.topUpDays ? daysFromNow(input.topUpDays) : null,
      lenderNamedLossPayee: Boolean(input.lenderNamed || input.policyNumber),
      liveAt: ["LIVE", "ACTIVE"].includes(input.status) ? new Date().toISOString() : null,
      triggerText: product.triggerDescription,
      productName: product.name,
      coverageCents: input.coverage,
      contributions,
      policy: input.policyNumber
        ? { id: `pol-${input.id}`, policyNumber: input.policyNumber }
        : null,
    };
  }

  const properties: Property[] = [
    property("p-naples-fail", "u-owner", "14 Cypress Court", "Naples", "Collier", "FL", "34102", 26.142, -81.7948, "FL_HURRICANE", 18000000, 30000000, "Gulf Coast CU", false, "Failed 35% buffer."),
    property("p-miami-quote", "u-owner", "900 Biscayne Blvd", "Miami", "Miami-Dade", "FL", "33132", 25.7617, -80.1918, "FL_FLOOD", 52000000, 24000000, "First Miami Bank"),
    property("p-sac-owner", "u-owner", "1215 Q Street", "Sacramento", "Sacramento", "CA", "95811", 38.5816, -121.4944, "CA_EARTHQUAKE", 64000000, 28000000, "Sacramento Credit Union"),
    property("p-ftmyers", "u-owner", "2210 McGregor Blvd", "Fort Myers", "Lee", "FL", "33901", 26.6406, -81.8723, "FL_HURRICANE", 41000000, 20000000, "Suncoast Bank"),
    property("p-sac-fire", "u-owner", "88 Fair Oaks Blvd", "Sacramento", "Sacramento", "CA", "95825", 38.5816, -121.41, "CA_WILDFIRE", 78000000, 31000000, "Valley Community Bank"),
    property("p-brickell", "u-owner", "55 Brickell Ave", "Miami", "Miami-Dade", "FL", "33131", 25.761, -80.19, "FL_FLOOD", 90000000, 40000000, "Atlantic Servicing"),
    property("p-la", "u-owner", "400 S Spring Street", "Los Angeles", "Los Angeles", "CA", "90013", 34.0522, -118.2437, "CA_EARTHQUAKE", 110000000, 50000000, "Pacific Mortgage Co"),
    property("p-beach", "u-owner", "19 San Carlos Blvd", "Fort Myers Beach", "Lee", "FL", "33931", 26.45, -81.95, "FL_HURRICANE", 36000000, 19000000, "Island Bank"),
    property("p-tampa", "u-owner2", "77 Bayshore Blvd", "Tampa", "Hillsborough", "FL", "33602", 27.9506, -82.4572, "FL_HURRICANE", 54000000, 26000000, "Tampa Bay Credit Union"),
    property("p-keywest", "u-owner2", "12 Duval Street", "Key West", "Monroe", "FL", "33040", 24.5551, -81.78, "FL_FLOOD", 89000000, 42000000, "Keys Community Bank"),
    property("p-oakland", "u-owner", "2100 Telegraph Ave", "Oakland", "Alameda", "CA", "94612", 37.8044, -122.2712, "CA_WILDFIRE", 95000000, 38000000, "East Bay Credit Union"),
    property("p-santarosa", "u-owner2", "5 Fourth Street", "Santa Rosa", "Sonoma", "CA", "95401", 38.4404, -122.7141, "CA_WILDFIRE", 72000000, 29000000, "Sonoma Valley Bank"),
    property("p-homestead", "u-owner", "330 Krome Ave", "Homestead", "Miami-Dade", "FL", "33030", 25.4687, -80.4776, "FL_HURRICANE", 31000000, 15000000, "Dade Farm Credit"),
    property("p-naples-active", "u-owner2", "1800 Gulf Shore Blvd", "Naples", "Collier", "FL", "34102", 26.142, -81.81, "FL_HURRICANE", 125000000, 62000000, "Collier Mortgage"),
    property("p-hollywood", "u-owner2", "1600 Vine Street", "Los Angeles", "Los Angeles", "CA", "90028", 34.1016, -118.3267, "CA_EARTHQUAKE", 180000000, 70000000, "Hollywood Federal"),
    property("p-miami-declined", "u-owner2", "410 Ocean Drive", "Miami Beach", "Miami-Dade", "FL", "33139", 25.7907, -80.13, "FL_HURRICANE", 240000000, 110000000, "Oceanfront Servicing"),
  ];

  const quoteRequests: QuoteRequest[] = [
    {
      id: "q-miami",
      propertyId: "p-miami-quote",
      status: "PENDING",
      filePackKey: "pack-miami.json",
      carrierProduct: PRODUCTS.FL_FLOOD,
      quote: null,
    },
    {
      id: "q-hollywood",
      propertyId: "p-hollywood",
      status: "PENDING",
      filePackKey: "pack-hollywood.json",
      carrierProduct: PRODUCTS.CA_EARTHQUAKE,
      quote: null,
    },
    {
      id: "q-declined",
      propertyId: "p-miami-declined",
      status: "DECLINED",
      filePackKey: "pack-beach.json",
      carrierProduct: PRODUCTS.FL_HURRICANE,
      quote: { decision: "DECLINED" },
    },
  ];

  const listings: ListingRow[] = [
    listing({ id: "l-sac-owner", propertyId: "p-sac-owner", status: "AWAITING_OWNER_FUNDS", premium: 320000, coverage: 40000000, funded: 0, ownerCents: 0, ownerId: "u-owner", funderId: "u-funder", funderEmail: "funder@fisure.local", funderName: "Casey Funder", peril: "CA_EARTHQUAKE" }),
    listing({ id: "l-ftmyers", propertyId: "p-ftmyers", status: "LIVE", premium: 640000, coverage: 27000000, funded: 396800, ownerCents: 96000, ownerId: "u-owner", funderId: "u-funder", funderEmail: "funder@fisure.local", funderName: "Casey Funder", peril: "FL_HURRICANE", daysLeft: 18 }),
    listing({ id: "l-sac-fire", propertyId: "p-sac-fire", status: "LIVE", premium: 480000, coverage: 42000000, funded: 216000, ownerCents: 72000, ownerId: "u-owner", funderId: "u-funder", funderEmail: "funder@fisure.local", funderName: "Casey Funder", peril: "CA_WILDFIRE", daysLeft: 24 }),
    listing({ id: "l-brickell", propertyId: "p-brickell", status: "AWAITING_LENDER", premium: 720000, coverage: 54000000, funded: 720000, ownerCents: 108000, ownerId: "u-owner", funderId: "u-funder", funderEmail: "funder@fisure.local", funderName: "Casey Funder", peril: "FL_FLOOD" }),
    listing({ id: "l-la", propertyId: "p-la", status: "ACTIVE", premium: 850000, coverage: 67500000, funded: 850000, ownerCents: 127500, ownerId: "u-owner", funderId: "u-funder", funderEmail: "funder@fisure.local", funderName: "Casey Funder", peril: "CA_EARTHQUAKE", lenderNamed: true, policyNumber: "FS-CA-SEED001" }),
    listing({ id: "l-beach", propertyId: "p-beach", status: "TOPUP_WINDOW", premium: 510000, coverage: 27000000, funded: 420000, ownerCents: 76500, ownerId: "u-owner", funderId: "u-funder", funderEmail: "funder@fisure.local", funderName: "Casey Funder", peril: "FL_HURRICANE", topUpDays: 5 }),
    listing({ id: "l-tampa", propertyId: "p-tampa", status: "LIVE", premium: 580000, coverage: 35100000, funded: 174000, ownerCents: 87000, ownerId: "u-owner2", funderId: "u-funder2", funderEmail: "funder2@fisure.local", funderName: "Morgan Pacific", peril: "FL_HURRICANE", daysLeft: 11 }),
    listing({ id: "l-keywest", propertyId: "p-keywest", status: "LIVE", premium: 910000, coverage: 56700000, funded: 546000, ownerCents: 136500, ownerId: "u-owner2", funderId: "u-funder", funderEmail: "funder@fisure.local", funderName: "Casey Funder", peril: "FL_FLOOD", daysLeft: 9 }),
    listing({ id: "l-oakland", propertyId: "p-oakland", status: "LIVE", premium: 620000, coverage: 51300000, funded: 434000, ownerCents: 93000, ownerId: "u-owner", funderId: "u-funder2", funderEmail: "funder2@fisure.local", funderName: "Morgan Pacific", peril: "CA_WILDFIRE", daysLeft: 21 }),
    listing({ id: "l-santarosa", propertyId: "p-santarosa", status: "LIVE", premium: 740000, coverage: 40000000, funded: 222000, ownerCents: 111000, ownerId: "u-owner2", funderId: "u-funder2", funderEmail: "funder2@fisure.local", funderName: "Morgan Pacific", peril: "CA_WILDFIRE", daysLeft: 6 }),
    listing({ id: "l-homestead", propertyId: "p-homestead", status: "LIVE", premium: 410000, coverage: 20250000, funded: 328000, ownerCents: 61500, ownerId: "u-owner", funderId: "u-funder", funderEmail: "funder@fisure.local", funderName: "Casey Funder", peril: "FL_HURRICANE", daysLeft: 14 }),
    listing({ id: "l-naples-act", propertyId: "p-naples-active", status: "ACTIVE", premium: 1120000, coverage: 83700000, funded: 1120000, ownerCents: 168000, ownerId: "u-owner2", funderId: "u-funder", funderEmail: "funder@fisure.local", funderName: "Casey Funder", peril: "FL_HURRICANE", lenderNamed: true, policyNumber: "FS-FL-SEED002" }),
  ];

  return {
    users,
    properties,
    quoteRequests,
    listings,
    waitlist: [
      { id: "w1", name: "Pat Waitlist", email: "pat@example.com", role: "CORPORATE", disclosureAccepted: true, createdAt: new Date().toISOString() },
      { id: "w2", name: "Sam Ortega", email: "sam.ortega@lakeside.org", role: "OWNER", disclosureAccepted: true, createdAt: new Date().toISOString() },
      { id: "w3", name: "Nia Chen", email: "nia@bayview-hoa.test", role: "OWNER", disclosureAccepted: true, createdAt: new Date().toISOString() },
      { id: "w4", name: "Greenleaf CSR", email: "csr@greenleaf.test", role: "CORPORATE", disclosureAccepted: true, createdAt: new Date().toISOString() },
      { id: "w5", name: "Descartes BD", email: "bd@carrier.test", role: "CARRIER", disclosureAccepted: true, createdAt: new Date().toISOString() },
    ],
    disclosures: ["u-funder", "u-funder2"],
    events: [
      {
        id: "e-la",
        source: "MOCK",
        matched: true,
        confirmation: "PENDING",
        notes: "distanceKm=2.1 radiusKm=40",
        evaluatedAt: new Date().toISOString(),
        policyId: "pol-l-la",
        city: "Los Angeles",
        peril: "CA_EARTHQUAKE",
        policyNumber: "FS-CA-SEED001",
      },
      {
        id: "e-naples",
        source: "MOCK",
        matched: false,
        confirmation: "NOT_MET",
        notes: "distanceKm=62.0 radiusKm=50 — below Cat 3",
        evaluatedAt: new Date().toISOString(),
        policyId: "pol-l-naples-act",
        city: "Naples",
        peril: "FL_HURRICANE",
        policyNumber: "FS-FL-SEED002",
      },
    ],
  };
}

let memory: Store | null = null;

function read(): Store {
  if (typeof window === "undefined") {
    memory ??= seed();
    return memory;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memory = JSON.parse(raw) as Store;
      return memory;
    }
  } catch {
    /* ignore */
  }
  memory = seed();
  persist();
  return memory;
}

function persist() {
  if (typeof window === "undefined" || !memory) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
}

function sessionId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}

function setSession(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(SESSION_KEY, id);
  else window.localStorage.removeItem(SESSION_KEY);
}

function publicUser(user: User): SessionUser {
  const { password: _pw, ...rest } = user;
  return rest;
}

function currentUser() {
  const id = sessionId();
  if (!id) return null;
  return read().users.find((u) => u.id === id) ?? null;
}

function requireUser() {
  const user = currentUser();
  if (!user) {
    const err = new Error("Sign in required.");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  return user;
}

function ownerOf(property: Property) {
  const user = read().users.find((u) => u.id === property.ownerId);
  return { id: user?.id ?? "", name: user?.name ?? null, email: user?.email ?? "" };
}

function assembleListing(row: ListingRow) {
  const property = read().properties.find((p) => p.id === row.propertyId)!;
  return {
    ...row,
    property: {
      ...property,
      owner: ownerOf(property),
    },
    quote: {
      premiumCents: row.premiumTargetCents,
      coverageCents: row.coverageCents,
      validUntil: daysFromNow(30),
      triggerJson: { text: row.triggerText, radiusKm: 40 },
      quoteRequest: { carrierProduct: { name: row.productName, triggerDescription: row.triggerText } },
    },
  };
}

const PRESETS: Record<string, { city: string; county: string; state: string; zip: string; lat: number; lng: number }> = {
  fort_myers: { city: "Fort Myers", county: "Lee", state: "FL", zip: "33901", lat: 26.6406, lng: -81.8723 },
  miami: { city: "Miami", county: "Miami-Dade", state: "FL", zip: "33101", lat: 25.7617, lng: -80.1918 },
  sacramento: { city: "Sacramento", county: "Sacramento", state: "CA", zip: "95814", lat: 38.5816, lng: -121.4944 },
  los_angeles: { city: "Los Angeles", county: "Los Angeles", state: "CA", zip: "90012", lat: 34.0522, lng: -118.2437 },
};

async function parseBody(init?: RequestInit): Promise<Record<string, unknown>> {
  if (!init?.body) return {};
  if (typeof FormData !== "undefined" && init.body instanceof FormData) {
    const out: Record<string, unknown> = {};
    init.body.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (typeof init.body === "string") {
    try {
      return JSON.parse(init.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function handleMock(path: string, init?: RequestInit) {
  const method = (init?.method ?? "GET").toUpperCase();
  const body = await parseBody(init);
  const store = read();

  if (path === "/auth/login" && method === "POST") {
    const email = String(body.email ?? "").toLowerCase();
    const password = String(body.password ?? "");
    const user = store.users.find((u) => u.email === email && u.password === password);
    if (!user) throw new ApiError(401, "Email or password is incorrect.");
    setSession(user.id);
    return { user: publicUser(user) };
  }
  if (path === "/auth/logout" && method === "POST") {
    setSession(null);
    return { ok: true };
  }
  if (path === "/auth/me") {
    const user = currentUser();
    if (!user) throw new ApiError(401, "Sign in required.");
    return { user: publicUser(user) };
  }
  if (path === "/auth/simulate-kyc" && method === "POST") {
    const user = requireUser();
    user.kycStatus = "PASSED";
    persist();
    return { user: publicUser(user) };
  }

  if (path === "/waitlist" && method === "POST") {
    store.waitlist.unshift({
      id: `w-${Date.now()}`,
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      role: String(body.role ?? "OTHER").toUpperCase(),
      disclosureAccepted: true,
      createdAt: new Date().toISOString(),
    });
    persist();
    return { ok: true };
  }
  if (path === "/waitlist") {
    requireUser();
    return { waitlist: store.waitlist };
  }

  if (path === "/listings/disclosure") {
    return { version: DISCLOSURE_VERSION, text: DISCLOSURE_TEXT };
  }
  if (path === "/listings/disclosure/accept" && method === "POST") {
    const user = requireUser();
    if (!store.disclosures.includes(user.id)) store.disclosures.push(user.id);
    persist();
    return { ok: true, version: DISCLOSURE_VERSION };
  }
  if (path === "/listings/map") {
    requireUser();
    return {
      listings: store.listings
        .filter((l) => ["LIVE", "FULLY_FUNDED", "ACTIVE", "TOPUP_WINDOW"].includes(l.status))
        .map(assembleListing),
    };
  }
  if (path === "/listings") {
    const user = requireUser();
    let rows = store.listings;
    if (user.role === "OWNER") rows = rows.filter((l) => store.properties.find((p) => p.id === l.propertyId)?.ownerId === user.id);
    if (user.role === "FUNDER") {
      rows = rows.filter(
        (l) =>
          ["LIVE", "FULLY_FUNDED", "ACTIVE", "TOPUP_WINDOW", "AWAITING_LENDER"].includes(l.status) ||
          l.contributions.some((c) => c.userId === user.id),
      );
    }
    return { listings: rows.map(assembleListing) };
  }

  const listingMatch = path.match(/^\/listings\/([^/]+)(?:\/(.*))?$/);
  if (listingMatch) {
    const id = listingMatch[1];
    const rest = listingMatch[2] ?? "";
    const row = store.listings.find((l) => l.id === id);
    if (!rest && method === "GET") {
      if (!row) throw new ApiError(404, "Listing not found.");
      return { listing: assembleListing(row) };
    }
    if (rest === "disclosure" && method === "POST") {
      const user = requireUser();
      if (!store.disclosures.includes(user.id)) store.disclosures.push(user.id);
      persist();
      return { ok: true };
    }
    if (rest === "contribute" && method === "POST") {
      const user = requireUser();
      if (!row) throw new ApiError(404, "Listing not found.");
      const amount = Math.round(Number(body.amount ?? 0) * 100);
      const asOwner = body.asOwner === true || body.asOwner === "on";
      if (amount <= 0) throw new ApiError(400, "Enter a contribution amount.");
      if (asOwner && !["AWAITING_OWNER_FUNDS", "TOPUP_WINDOW"].includes(row.status)) {
        throw new ApiError(400, "This listing is not open for owner funding.");
      }
      if (!asOwner && row.status !== "LIVE") {
        throw new ApiError(400, "This listing is not open for contributions.");
      }
      if (!asOwner && user.role === "FUNDER" && !store.disclosures.includes(user.id)) {
        throw new ApiError(400, "Accept the risk disclosure before contributing.");
      }
      row.fundedCents += amount;
      if (asOwner) row.ownerContributionCents += amount;
      row.contributions.push({
        id: `c-${Date.now()}`,
        amountCents: amount,
        status: "SUCCEEDED",
        userId: user.id,
        user: { email: user.email, name: user.name },
      });
      const minOwner = Math.ceil(row.premiumTargetCents * 0.15);
      if (asOwner && row.ownerContributionCents >= minOwner && row.status === "AWAITING_OWNER_FUNDS") {
        row.status = "LIVE";
        row.liveAt = new Date().toISOString();
      }
      const fullyFunded = row.fundedCents >= row.premiumTargetCents;
      if (fullyFunded) row.status = "FULLY_FUNDED";
      persist();
      return { ok: true, fullyFunded, status: row.status };
    }
    if (rest === "lender" && method === "POST") {
      if (!row) throw new ApiError(404, "Listing not found.");
      row.lenderNamedLossPayee = true;
      if (row.status === "AWAITING_LENDER") row.status = "FULLY_FUNDED";
      persist();
      return { ok: true };
    }
    if (rest === "bind" && method === "POST") {
      if (!row) throw new ApiError(404, "Listing not found.");
      const property = store.properties.find((p) => p.id === row.propertyId);
      if (!row.lenderNamedLossPayee && property?.mortgage) {
        row.status = "AWAITING_LENDER";
        persist();
        throw new ApiError(400, "Name the lender as loss payee before bind.");
      }
      const policyNumber = `FS-MOCK-${Date.now().toString().slice(-6)}`;
      row.policy = { id: `pol-${row.id}`, policyNumber };
      row.status = "ACTIVE";
      persist();
      return { ok: true, policyNumber };
    }
    if (rest === "policy-pdf" && method === "POST") {
      return { ok: true };
    }
  }

  if (path === "/properties" && method === "POST") {
    const user = requireUser();
    const preset = PRESETS[String(body.preset ?? "fort_myers")];
    const mortgage = Math.round(Number(body.mortgage ?? 0) * 100);
    const value = Math.round(Number(body.value ?? 0) * 100);
    const peril = String(body.peril ?? "FL_HURRICANE");
    const id = `p-${Date.now()}`;
    const bufferOk = value >= requiredCoverageCents(mortgage);
    store.properties.unshift({
      id,
      ownerId: user.id,
      address: String(body.address ?? "New listing"),
      ...preset,
      peril,
      estimatedValueCents: value,
      mortgage: {
        lenderName: String(body.lenderName ?? "Lender"),
        outstandingBalanceCents: mortgage,
        notifiedAt: null,
      },
      eligibility: [
        {
          bufferPassed: bufferOk,
          notes: bufferOk ? "Submission passed 35% buffer." : "Failed 35% buffer.",
          requiredCoverageCents: requiredCoverageCents(mortgage),
        },
      ],
    });
    if (bufferOk) {
      store.quoteRequests.unshift({
        id: `q-${id}`,
        propertyId: id,
        status: "PENDING",
        filePackKey: "pack.json",
        carrierProduct: PRODUCTS[peril] ?? PRODUCTS.FL_HURRICANE,
        quote: null,
      });
    }
    persist();
    return { propertyId: id, eligibility: bufferOk ? "pass" : "fail" };
  }
  if (path === "/properties") {
    const user = requireUser();
    const rows =
      user.role === "ADMIN" || user.role === "CARRIER"
        ? store.properties
        : store.properties.filter((p) => p.ownerId === user.id);
    return {
      properties: rows.map((p) => ({
        ...p,
        listings: store.listings.filter((l) => l.propertyId === p.id),
        quoteRequests: store.quoteRequests.filter((q) => q.propertyId === p.id),
      })),
    };
  }
  const propMatch = path.match(/^\/properties\/([^/]+)$/);
  if (propMatch && method === "GET") {
    const p = store.properties.find((row) => row.id === propMatch[1]);
    if (!p) throw new ApiError(404, "Property not found.");
    return {
      property: {
        ...p,
        listings: store.listings.filter((l) => l.propertyId === p.id),
        quoteRequests: store.quoteRequests.filter((q) => q.propertyId === p.id),
      },
    };
  }

  if (path === "/quotes/queue") {
    requireUser();
    return {
      requests: store.quoteRequests.map((q) => {
        const p = store.properties.find((row) => row.id === q.propertyId)!;
        return {
          ...q,
          property: { ...p, owner: ownerOf(p) },
        };
      }),
    };
  }
  const quoteMatch = path.match(/^\/quotes\/([^/]+)\/respond$/);
  if (quoteMatch && method === "POST") {
    const q = store.quoteRequests.find((row) => row.id === quoteMatch[1]);
    if (!q) throw new ApiError(404, "Quote request not found.");
    const decision = String(body.decision ?? "ACCEPTED");
    q.status = decision;
    q.quote = { decision };
    if (decision === "ACCEPTED") {
      const premium = Math.round(Number(body.premium ?? 0) * 100);
      const coverage = Math.round(Number(body.coverage ?? 0) * 100);
      const p = store.properties.find((row) => row.id === q.propertyId)!;
      const listingId = `l-${Date.now()}`;
      store.listings.unshift({
        id: listingId,
        propertyId: p.id,
        status: "AWAITING_OWNER_FUNDS",
        premiumTargetCents: premium || 400000,
        fundedCents: 0,
        ownerContributionCents: 0,
        expiresAt: daysFromNow(30),
        topUpEndsAt: null,
        lenderNamedLossPayee: false,
        liveAt: null,
        triggerText: q.carrierProduct.triggerDescription,
        productName: q.carrierProduct.name,
        coverageCents: coverage || p.estimatedValueCents,
        contributions: [],
        policy: null,
      });
    }
    persist();
    return { ok: true };
  }

  if (path === "/triggers") {
    requireUser();
    return {
      events: store.events.map((e) => ({
        ...e,
        policy: {
          policyNumber: e.policyNumber,
          listing: { property: { city: e.city, peril: e.peril } },
        },
      })),
      policies: store.listings.filter((l) => l.policy).map((l) => assembleListing(l)),
    };
  }
  if (path === "/triggers/poll" && method === "POST") {
    return { written: 0, liveEvents: 0 };
  }
  if (path === "/triggers/mock" && method === "POST") {
    const listing = store.listings.find((l) => l.policy);
    store.events.unshift({
      id: `e-${Date.now()}`,
      source: "MOCK",
      matched: true,
      confirmation: "PENDING",
      notes: `lat=${body.lat} lng=${body.lng}`,
      evaluatedAt: new Date().toISOString(),
      policyId: listing?.policy?.id ?? "pol-l-la",
      city: listing ? store.properties.find((p) => p.id === listing.propertyId)?.city ?? "Los Angeles" : "Los Angeles",
      peril: String(body.peril ?? "CA_EARTHQUAKE"),
      policyNumber: listing?.policy?.policyNumber ?? "FS-CA-SEED001",
    });
    persist();
    return { written: 1 };
  }
  const confirmMatch = path.match(/^\/triggers\/([^/]+)\/confirm$/);
  if (confirmMatch && method === "POST") {
    const event = store.events.find((e) => e.id === confirmMatch[1]);
    if (event) event.confirmation = String(body.confirmation ?? "CONFIRMED");
    persist();
    return { ok: true };
  }

  if (path === "/admin/overview") {
    requireUser();
    const byStatusMap = new Map<string, number>();
    for (const l of store.listings) {
      byStatusMap.set(l.status, (byStatusMap.get(l.status) ?? 0) + 1);
    }
    return {
      listings: store.listings.length,
      waitlist: store.waitlist.length,
      policies: store.listings.filter((l) => l.policy).length,
      users: store.users.length,
      byStatus: [...byStatusMap.entries()].map(([status, count]) => ({
        status,
        _count: { status: count },
      })),
    };
  }
  if (path === "/admin/flags") {
    return {
      flags: {
        paymentsEnabled: false,
        contributionsPublic: false,
        payoutsAutomated: false,
        paymentsSimulate: true,
        contributeMode: "corporate-only",
        database: "frontend-mock",
        payments: "simulated",
      },
    };
  }
  if (path === "/admin/expire" && method === "POST") {
    let expired = 0;
    for (const l of store.listings) {
      if (l.status === "LIVE") {
        l.status = "TOPUP_WINDOW";
        l.topUpEndsAt = daysFromNow(7);
        expired += 1;
      }
    }
    persist();
    return { expired, lapsed: 0 };
  }

  if (path === "/payouts/policies") {
    requireUser();
    return {
      policies: store.listings
        .filter((l) => l.policy)
        .map((l) => {
          const p = store.properties.find((row) => row.id === l.propertyId)!;
          return {
            id: l.policy!.id,
            policyNumber: l.policy!.policyNumber,
            listing: {
              ownerContributionCents: l.ownerContributionCents,
              premiumTargetCents: l.premiumTargetCents,
              property: { city: p.city, mortgage: p.mortgage },
            },
            payouts: [],
          };
        }),
    };
  }
  if (path === "/payouts" && method === "POST") {
    const listing = store.listings.find((l) => l.policy?.id === body.policyId) ?? store.listings.find((l) => l.policy);
    const ownerBps = listing ? bps(listing.ownerContributionCents, listing.premiumTargetCents) : 1500;
    const split = waterfall({
      grossCents: Math.round(Number(body.gross ?? 0) * 100),
      mortgageCents: Math.round(Number(body.mortgage ?? 0) * 100),
      ownerContributionBps: ownerBps,
    });
    return { ok: true, split };
  }

  throw new ApiError(404, `Mock route not found: ${method} ${path}`);
}
