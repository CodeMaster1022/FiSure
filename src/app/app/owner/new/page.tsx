"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";
import { Field, inputClass, Button } from "@/components/ui/forms";
import { AddressAutocomplete, type ResolvedAddress } from "@/components/app/AddressAutocomplete";

const PERILS_BY_STATE: Record<string, Array<{ value: string; label: string }>> = {
  FL: [
    { value: "FL_HURRICANE", label: "Florida hurricane" },
    { value: "FL_FLOOD", label: "Florida flood" },
  ],
  CA: [
    { value: "CA_WILDFIRE", label: "California wildfire" },
    { value: "CA_EARTHQUAKE", label: "California earthquake" },
  ],
};
const ALL_PERILS = [...PERILS_BY_STATE.FL, ...PERILS_BY_STATE.CA];

export default function NewPropertyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [place, setPlace] = useState<ResolvedAddress | null>(null);

  const perilOptions = useMemo(
    () => (place ? (PERILS_BY_STATE[place.state] ?? []) : ALL_PERILS),
    [place],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!place) {
      setError("Choose an address from the suggestions list.");
      return;
    }
    if (place.state !== "FL" && place.state !== "CA") {
      setError("FiSure currently only covers Florida and California properties.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const form = new FormData(event.currentTarget);
      form.set("address", place.address);
      form.set("city", place.city);
      form.set("county", place.county);
      form.set("state", place.state);
      form.set("zip", place.zip);
      form.set("lat", String(place.lat));
      form.set("lng", String(place.lng));
      const data = await api<{ propertyId: string; eligibility: string }>("/properties", {
        method: "POST",
        body: form,
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
        body="Search for the property address below. Coverage must clear mortgage × 1.35."
      />
      <form onSubmit={onSubmit} className="grid max-w-xl gap-5">
        <Field label="Street address" hint="Search and select an address — Florida and California only.">
          <AddressAutocomplete onResolve={setPlace} />
        </Field>
        <Field label="Peril">
          <select
            required
            name="peril"
            className={inputClass()}
            defaultValue=""
            key={place?.state ?? "none"}
          >
            <option value="" disabled>
              {place ? "Select a peril" : "Choose an address first"}
            </option>
            {perilOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Property type"
          hint="Determines which carrier products this property can be matched to."
        >
          <select required name="propertyType" className={inputClass()} defaultValue="RESIDENTIAL">
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
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
        <Field
          label="Servicer"
          hint="The company that collects your mortgage payments, if different from the lender above. Optional."
        >
          <input name="servicer" className={inputClass()} />
        </Field>
        <Field label="Listing window (days)">
          <input name="ownerDays" type="number" defaultValue={45} className={inputClass()} />
        </Field>
        <Field label="Deed (optional)">
          <input name="deed" type="file" className={inputClass()} />
        </Field>
        <label className="flex flex-col gap-2 text-sm text-muted">
          <span className="flex gap-3">
            <input type="checkbox" name="sameRiskCovered" />
            I already have insurance for this peril at or above the required
            coverage
          </span>
          <span className="text-xs">
            Only check this if you already hold adequate coverage — FiSure is
            for owners who are uninsured or underinsured for this peril.
            Checking this box will make the property ineligible to list.
          </span>
        </label>
        {error ? <p className="text-sm text-sand">{error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting…" : "Run eligibility"}
        </Button>
      </form>
    </div>
  );
}
