"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";
import { Button, Field, inputClass } from "@/components/ui/forms";

type EventRow = {
  id: string;
  source: string;
  matched: boolean;
  confirmation: string;
  notes: string | null;
  evaluatedAt: string;
  policy: { policyNumber: string; listing: { property: { city: string; peril: string } } };
};

export default function CarrierTriggers() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api<{ events: EventRow[] }>("/triggers")
      .then((data) => setEvents(data.events))
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function confirm(id: string, confirmation: string) {
    await api(`/triggers/${id}/confirm`, {
      method: "POST",
      body: JSON.stringify({ confirmation }),
    });
    load();
  }

  async function mock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api("/triggers/mock", {
        method: "POST",
        body: JSON.stringify({
          lat: Number(form.get("lat")),
          lng: Number(form.get("lng")),
          peril: form.get("peril"),
        }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mock failed");
    }
  }

  async function poll() {
    try {
      await api("/triggers/poll", { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Poll failed");
    }
  }

  return (
    <div>
      <PageTitle
        kicker="Carrier"
        title="Trigger inbox"
        body="The carrier alone confirms whether a qualifying event occurred. Mock inject works offline."
      />
      <div className="mb-8 flex flex-wrap gap-3">
        <Button type="button" variant="ghost" onClick={poll}>
          Poll public feeds
        </Button>
      </div>
      <form onSubmit={mock} className="mb-10 grid max-w-xl gap-3 sm:grid-cols-4">
        <Field label="Lat">
          <input name="lat" defaultValue="34.05" className={inputClass()} />
        </Field>
        <Field label="Lng">
          <input name="lng" defaultValue="-118.24" className={inputClass()} />
        </Field>
        <Field label="Peril">
          <select name="peril" defaultValue="CA_EARTHQUAKE" className={inputClass()}>
            <option value="CA_EARTHQUAKE">CA earthquake</option>
            <option value="CA_WILDFIRE">CA wildfire</option>
            <option value="FL_HURRICANE">FL hurricane</option>
            <option value="FL_FLOOD">FL flood</option>
          </select>
        </Field>
        <div className="flex items-end">
          <Button type="submit">Inject mock event</Button>
        </div>
      </form>
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      <div className="grid gap-px bg-line">
        {events.map((event) => (
          <article key={event.id} className="bg-background p-5">
            <p className="font-serif text-xl">
              {event.policy.listing.property.city} · {event.source}
            </p>
            <p className="mt-1 text-sm text-muted">
              {event.notes} · matched {String(event.matched)} · {event.confirmation}
            </p>
            {event.confirmation === "PENDING" && event.matched ? (
              <div className="mt-3 flex gap-2">
                <Button type="button" onClick={() => confirm(event.id, "CONFIRMED")}>
                  Confirm trigger
                </Button>
                <Button type="button" variant="ghost" onClick={() => confirm(event.id, "NOT_MET")}>
                  Not met
                </Button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
