"use client";

import { FormEvent, useState } from "react";
import { Container, SectionHeading } from "@/components/landing/primitives";
import { api } from "@/lib/api";

const roles = [
  { value: "owner", label: "Property owner" },
  { value: "corporate", label: "Corporate CSR program" },
  { value: "individual", label: "Individual contributor" },
  { value: "carrier", label: "Insurance carrier" },
  { value: "other", label: "Other" },
];

export function Access() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await api("/waitlist", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          role: form.get("role"),
          disclosure: form.get("disclosure") === "on",
        }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join waitlist");
      setPending(false);
    }
  }

  return (
    <section
      id="access"
      className="scroll-mt-20 border-b border-line py-20 sm:py-24"
    >
      <Container className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-start">
        <SectionHeading
          kicker="06 — Closed pilot"
          title="Request access. Ten to twenty properties, one carrier, one state."
          body="We are not taking public contributions yet. Licences, a securities opinion, and an attorney-drafted disclosure come first. This form is a waitlist — not an offer of cover, and not an invitation to contribute."
        />

        <div className="border border-line bg-surface p-6 sm:p-8">
          {submitted ? (
            <div>
              <p className="font-serif text-2xl tracking-tight">Received.</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Thank you. We will be in touch if there is a fit for the closed
                pilot. Nothing in this confirmation is an offer of insurance or
                an invitation to contribute premium.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm">
                Name
                <input
                  required
                  name="name"
                  autoComplete="name"
                  className="border border-line bg-background px-3 py-2.5 text-foreground outline-none focus:border-sand"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="border border-line bg-background px-3 py-2.5 text-foreground outline-none focus:border-sand"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                I am a
                <select
                  required
                  name="role"
                  defaultValue=""
                  className="border border-line bg-background px-3 py-2.5 text-foreground outline-none focus:border-sand"
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex gap-3 text-sm leading-6 text-muted">
                <input
                  required
                  type="checkbox"
                  name="disclosure"
                  className="mt-1 accent-sand"
                />
                <span>
                  I understand FiSure is a marketplace operator, not an insurer,
                  and that a contribution — if one is ever accepted — is not a
                  deposit, not FDIC-insured, and may be fully consumed as
                  premium if no trigger occurs.
                </span>
              </label>
              {error ? <p className="text-sm text-sand">{error}</p> : null}
              <button
                type="submit"
                disabled={pending}
                className="mt-2 self-start border border-sand bg-sand px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground disabled:opacity-60"
              >
                {pending ? "Sending…" : "Join the waitlist"}
              </button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
