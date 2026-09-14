"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError, homeForRole } from "@/lib/api";
import type { SessionUser } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "property owner",
  FUNDER: "crowdfunder",
  CARRIER: "carrier",
  ADMIN: "admin",
};

export default function RegisterPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [invite, setInvite] = useState<{ email: string; name: string; role: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    api<{ invite: { email: string; name: string; role: string } }>(`/invites/${params.token}`)
      .then((data) => setInvite(data.invite))
      .catch((err: unknown) => {
        setLoadError(
          err instanceof ApiError ? err.message : "This invite link is invalid or has expired.",
        );
      });
  }, [params.token]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setPending(true);
    try {
      const data = await api<{ user: SessionUser }>(`/invites/${params.token}/complete`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      router.replace(homeForRole(data.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete registration");
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-[11px] uppercase tracking-[0.22em] text-sand">Closed pilot — invite</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">Set your password</h1>

      {loadError ? (
        <p className="mt-6 text-sm text-sand">{loadError}</p>
      ) : !invite ? (
        <p className="mt-6 text-sm text-muted">Checking your invite…</p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-muted">
            Welcome, {invite.name}. You&apos;re registering as a{" "}
            <span className="text-foreground">{ROLE_LABEL[invite.role] ?? invite.role.toLowerCase()}</span>{" "}
            with <span className="text-foreground">{invite.email}</span>.
          </p>
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm">
              Password
              <input
                required
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                className="border border-line bg-surface px-3 py-2.5 outline-none focus:border-sand"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Confirm password
              <input
                required
                name="confirm"
                type="password"
                minLength={8}
                autoComplete="new-password"
                className="border border-line bg-surface px-3 py-2.5 outline-none focus:border-sand"
              />
            </label>
            {error ? <p className="text-sm text-sand">{error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="mt-2 border border-sand bg-sand px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground disabled:opacity-60"
            >
              {pending ? "Creating account…" : "Create account"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
