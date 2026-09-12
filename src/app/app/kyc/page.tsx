"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, homeForRole } from "@/lib/api";
import { useSessionUser } from "@/components/app/SessionProvider";
import { PageTitle } from "@/components/app/ui";
import { Button } from "@/components/ui/forms";
import type { SessionUser } from "@/lib/types";

export default function KycPage() {
  const { user, refresh } = useSessionUser();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function simulate() {
    try {
      await api<{ user: SessionUser }>("/auth/simulate-kyc", { method: "POST" });
      await refresh();
      if (user) router.push(homeForRole(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not simulate identity check");
    }
  }

  return (
    <div>
      <PageTitle
        kicker="Identity"
        title="Know-your-customer"
        body="Stripe Identity is not live in this mock. Seed users are already passed."
      />
      <p className="text-sm text-muted">Current status: {user?.kycStatus}</p>
      <div className="mt-6">
        <Button type="button" onClick={simulate}>
          Simulate identity pass
        </Button>
      </div>
      {error ? <p className="mt-4 text-sm text-sand">{error}</p> : null}
    </div>
  );
}
