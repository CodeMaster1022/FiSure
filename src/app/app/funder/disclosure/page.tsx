"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";
import { Button } from "@/components/ui/forms";

export default function DisclosurePage() {
  const [text, setText] = useState("");
  const [version, setVersion] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ text: string; version: string }>("/listings/disclosure").then((data) => {
      setText(data.text);
      setVersion(data.version);
    });
  }, []);

  async function accept(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/listings/disclosure/accept", { method: "POST" });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record acceptance");
    }
  }

  return (
    <div>
      <PageTitle
        kicker="Required"
        title="Risk disclosure"
        body={`Version ${version}. Required before any contribution is processed.`}
      />
      <pre className="max-w-3xl whitespace-pre-wrap border border-line bg-surface p-6 font-sans text-sm leading-7 text-muted">
        {text}
      </pre>
      {done ? (
        <p className="mt-6 text-sm text-teal">Accepted. You may support a listing.</p>
      ) : (
        <form onSubmit={accept} className="mt-6">
          <Button type="submit">I have read and accept this disclosure</Button>
        </form>
      )}
      {error ? <p className="mt-4 text-sm text-sand">{error}</p> : null}
    </div>
  );
}
