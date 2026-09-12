import { PrismaClient, Peril, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "pilot-pass-2026";

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const carrier = await prisma.carrier.upsert({
    where: { slug: "anchor" },
    update: {},
    create: { name: "Anchor Parametric", slug: "anchor" },
  });

  const products = [
    {
      name: "Florida Hurricane Cat 3+",
      peril: Peril.FL_HURRICANE,
      states: "FL",
      triggerDescription:
        "Category 3 or higher hurricane landfall confirmed by NOAA NHC within a 50 km radius of the property.",
      payoutSchedule: { bands: [{ pct: 40 }, { pct: 70 }, { pct: 100 }] },
    },
    {
      name: "Florida Flood Threshold",
      peril: Peril.FL_FLOOD,
      states: "FL",
      triggerDescription:
        "FEMA-declared flood event reaching a defined water-level threshold at or near the property.",
      payoutSchedule: { bands: [{ pct: 50 }, { pct: 100 }] },
    },
    {
      name: "California Wildfire Perimeter",
      peril: Peril.CA_WILDFIRE,
      states: "CA",
      triggerDescription:
        "Satellite-confirmed natural wildfire perimeter (NASA FIRMS / USFS) within 10 km of the property.",
      payoutSchedule: { bands: [{ pct: 100 }] },
    },
    {
      name: "California Earthquake M6.0+",
      peril: Peril.CA_EARTHQUAKE,
      states: "CA",
      triggerDescription:
        "USGS-measured seismic event of magnitude 6.0 or greater within 40 km of the property.",
      payoutSchedule: { bands: [{ pct: 25 }, { pct: 50 }, { pct: 100 }] },
    },
  ];

  for (const product of products) {
    const existing = await prisma.carrierProduct.findFirst({
      where: { carrierId: carrier.id, peril: product.peril },
    });
    if (!existing) {
      await prisma.carrierProduct.create({
        data: { ...product, carrierId: carrier.id },
      });
    }
  }

  const org = await prisma.organization.upsert({
    where: { id: "seed-csr-org" },
    update: { approved: true },
    create: { id: "seed-csr-org", name: "Harbor CSR", approved: true },
  });

  const users: Array<{
    email: string;
    name: string;
    role: Role;
    carrierId?: string;
    org?: boolean;
  }> = [
    { email: "admin@fisure.local", name: "FiSure Admin", role: Role.ADMIN },
    { email: "owner@fisure.local", name: "Alex Owner", role: Role.OWNER },
    { email: "funder@fisure.local", name: "Casey Funder", role: Role.FUNDER, org: true },
    {
      email: "carrier@fisure.local",
      name: "Jordan Underwriter",
      role: Role.CARRIER,
      carrierId: carrier.id,
    },
  ];

  for (const row of users) {
    const user = await prisma.user.upsert({
      where: { email: row.email },
      update: {
        passwordHash,
        role: row.role,
        kycStatus: "PASSED",
        carrierId: row.carrierId,
      },
      create: {
        email: row.email,
        name: row.name,
        passwordHash,
        role: row.role,
        kycStatus: "PASSED",
        carrierId: row.carrierId,
      },
    });
    if (row.org) {
      await prisma.membership.upsert({
        where: {
          userId_organizationId: { userId: user.id, organizationId: org.id },
        },
        update: {},
        create: { userId: user.id, organizationId: org.id, role: "ADMIN" },
      });
    }
  }

  console.log("Seeded closed-pilot users. Password for all:", PASSWORD);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
