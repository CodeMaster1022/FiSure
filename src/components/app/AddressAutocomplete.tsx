"use client";

import { useEffect, useRef, useState } from "react";
import { inputClass } from "@/components/ui/forms";

export type ResolvedAddress = {
  address: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
};

type MapboxFeature = {
  place_name: string;
  text: string;
  address?: string;
  center: [number, number];
  context?: Array<{ id: string; text: string; short_code?: string }>;
};

function contextText(feature: MapboxFeature, prefix: string) {
  return feature.context?.find((c) => c.id.startsWith(`${prefix}.`))?.text ?? "";
}

function resolveFromFeature(feature: MapboxFeature): ResolvedAddress {
  const region = feature.context?.find((c) => c.id.startsWith("region."));
  const stateCode = region?.short_code?.split("-")[1]?.toUpperCase() ?? "";
  const streetAddress = feature.address ? `${feature.address} ${feature.text}` : feature.text;
  return {
    address: streetAddress,
    city: contextText(feature, "place"),
    county: contextText(feature, "district").replace(/ County$/i, ""),
    state: stateCode,
    zip: contextText(feature, "postcode"),
    lat: feature.center[1],
    lng: feature.center[0],
  };
}

export function AddressAutocomplete({
  onResolve,
}: {
  onResolve: (resolved: ResolvedAddress | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [resolved, setResolved] = useState<ResolvedAddress | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (resolved || query.trim().length < 4 || !token) {
      return;
    }
    debounceRef.current = setTimeout(() => {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?autocomplete=true&country=us&types=address&limit=5&access_token=${token}`;
      fetch(url)
        .then((res) => res.json())
        .then((data: { features?: MapboxFeature[] }) => {
          setSuggestions(data.features ?? []);
          setOpen(true);
        })
        .catch(() => setSuggestions([]));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, resolved, token]);

  function selectFeature(feature: MapboxFeature) {
    const next = resolveFromFeature(feature);
    setQuery(feature.place_name);
    setResolved(next);
    setOpen(false);
    setSuggestions([]);
    onResolve(next);
  }

  function onChange(value: string) {
    setQuery(value);
    if (resolved) {
      setResolved(null);
      onResolve(null);
    }
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={token ? "Start typing a street address…" : "Address autocomplete unavailable"}
        disabled={!token}
        autoComplete="off"
        className={inputClass()}
      />
      {open && !resolved && query.trim().length >= 4 && suggestions.length > 0 ? (
        <ul className="absolute z-10 mt-1 w-full border border-line bg-background shadow-lg">
          {suggestions.map((feature) => (
            <li key={feature.place_name}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectFeature(feature)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-surface"
              >
                {feature.place_name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {resolved && resolved.state !== "FL" && resolved.state !== "CA" ? (
        <p className="mt-2 text-xs text-sand">
          FiSure currently only covers Florida and California properties. Search for an
          address in one of those states.
        </p>
      ) : null}
      {!token ? (
        <p className="mt-2 text-xs text-sand">
          Address autocomplete is not configured (missing Mapbox token).
        </p>
      ) : null}
    </div>
  );
}
