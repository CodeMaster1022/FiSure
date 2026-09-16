"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, homeForRole } from "@/lib/api";
import type { SessionUser } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const data = await api<{ user: SessionUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      router.replace(homeForRole(data.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Back to home
      </Link>
      <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-sand">Closed pilot</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">Sign in</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Closed pilot — seeded demo accounts only, password{" "}
        <code className="text-foreground">pilot-pass-2026</code> for all of them.
        FiSure does not underwrite or hold risk.
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          Email
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            defaultValue="owner@fisure.local"
            className="border border-line bg-surface px-3 py-2.5 outline-none focus:border-sand"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Password
          <input
            required
            name="password"
            type="password"
            autoComplete="current-password"
            defaultValue="pilot-pass-2026"
            className="border border-line bg-surface px-3 py-2.5 outline-none focus:border-sand"
          />
        </label>
        {error ? <p className="text-sm text-sand">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 border border-sand bg-sand px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
