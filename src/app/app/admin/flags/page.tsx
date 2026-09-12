"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";

export default function AdminFlags() {
  const [flags, setFlags] = useState<Record<string, string | boolean> | null>(null);
  useEffect(() => {
    api<{ flags: Record<string, string | boolean> }>("/admin/flags").then((data) =>
      setFlags(data.flags),
    );
  }, []);

  return (
    <div>
      <PageTitle
        kicker="Admin"
        title="Runtime flags"
        body="Live Stripe and public individual contributions stay off. These flags are frontend mock values."
      />
      <dl className="max-w-lg divide-y divide-line border border-line">
        {flags
          ? Object.entries(flags).map(([key, value]) => (
              <div key={key} className="flex justify-between px-4 py-3 text-sm">
                <dt className="text-muted">{key}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))
          : null}
      </dl>
    </div>
  );
}
