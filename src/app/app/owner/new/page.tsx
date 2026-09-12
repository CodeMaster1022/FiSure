"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";
import { Field, inputClass, Button } from "@/components/ui/forms";

export default function NewPropertyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const data = await api<{ propertyId: string; eligibility: string }>("/properties", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      router.push(`/app/owner/properties/${data.propertyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
      setPending(false);
    }
  }

  return (
    <div>
      <PageTitle
        kicker="Owner"
        title="Submit a property"
        body="City presets stand in for geocoding in the closed pilot. Coverage must clear mortgage × 1.35."
      />
      <form onSubmit={onSubmit} className="grid max-w-xl gap-5">
        <Field label="Street address">
          <input required name="address" className={inputClass()} />
        </Field>
        <Field label="Market">
          <select required name="preset" className={inputClass()} defaultValue="fort_myers">
            <option value="fort_myers">Fort Myers, FL</option>
            <option value="miami">Miami, FL</option>
            <option value="sacramento">Sacramento, CA</option>
            <option value="los_angeles">Los Angeles, CA</option>
          </select>
        </Field>
        <Field label="Peril">
          <select required name="peril" className={inputClass()} defaultValue="FL_HURRICANE">
            <option value="FL_HURRICANE">Florida hurricane</option>
            <option value="FL_FLOOD">Florida flood</option>
            <option value="CA_WILDFIRE">California wildfire</option>
            <option value="CA_EARTHQUAKE">California earthquake</option>
          </select>
        </Field>
        <Field label="Estimated value (USD)">
          <input required name="value" type="number" min={1} className={inputClass()} />
        </Field>
        <Field label="Outstanding mortgage (USD)">
          <input required name="mortgage" type="number" min={0} className={inputClass()} />
        </Field>
        <Field label="Lender name">
          <input required name="lenderName" className={inputClass()} />
        </Field>
        <Field label="Lender email" hint="Used to name the loss payee before bind.">
          <input name="lenderEmail" type="email" className={inputClass()} />
        </Field>
        <Field label="Servicer">
          <input name="servicer" className={inputClass()} />
        </Field>
        <Field label="Listing window (days)">
          <input name="ownerDays" type="number" defaultValue={45} className={inputClass()} />
        </Field>
        <Field label="Deed (optional)">
          <input name="deed" type="file" className={inputClass()} />
        </Field>
        <label className="flex gap-3 text-sm text-muted">
          <input type="checkbox" name="sameRiskCovered" />
          This peril is already covered at or above the buffer
        </label>
        {error ? <p className="text-sm text-sand">{error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting…" : "Run eligibility"}
        </Button>
      </form>
    </div>
  );
}
