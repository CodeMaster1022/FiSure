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
  const [notice, setNotice] = useState<string | null>(null);

  async function simulate(outcome: "PASS" | "FAIL") {
    setError(null);
    setNotice(null);
    try {
      await api<{ user: SessionUser }>("/auth/simulate-kyc", {
        method: "POST",
        body: JSON.stringify({ outcome }),
      });
      await refresh();
      if (outcome === "PASS") {
        if (user) router.push(homeForRole(user.role));
      } else {
        setNotice(
          "Identity check failed. Per platform policy, any escrowed contributions on not-yet-active listings were refunded in full.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not simulate identity check");
    }
  }

  return (
    <div>
      <PageTitle
        kicker="Identity"
        title="Know-your-customer"
        body="No real KYC/AML vendor is wired up yet — this simulates both outcomes so the pass/fail flow can be tested end to end."
      />
      <p className="text-sm text-muted">Current status: {user?.kycStatus}</p>
      <div className="mt-6 flex gap-3">
        <Button type="button" onClick={() => simulate("PASS")}>
          Simulate identity pass
        </Button>
        <Button type="button" onClick={() => simulate("FAIL")}>
          Simulate identity fail
        </Button>
      </div>
      {notice ? <p className="mt-4 text-sm text-muted">{notice}</p> : null}
      {error ? <p className="mt-4 text-sm text-sand">{error}</p> : null}
    </div>
  );
}
