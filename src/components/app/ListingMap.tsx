"use client";

import { useEffect, useRef } from "react";
import mapboxgl, { LngLatBounds, Marker, Map as MapboxMap, NavigationControl, Popup } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { PERIL_LABEL, STATUS_LABEL } from "@/lib/labels";
import { usd } from "@/lib/money";
import type { Listing } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  LIVE: "#c08a3e",
  FULLY_FUNDED: "#4d7c5f",
  AWAITING_LENDER: "#4d7c5f",
  ACTIVE: "#2f5d8a",
  TOPUP_WINDOW: "#b0562f",
};
const DEFAULT_COLOR = "#8a8f98";
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function ListingMap({ listings }: { listings: Listing[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return;
    mapboxgl.accessToken = TOKEN;
    const map = new MapboxMap({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-96, 37.8],
      zoom: 3.2,
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function render() {
      if (!map) return;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const bounds = new LngLatBounds();
      for (const listing of listings) {
        const { lat, lng } = listing.property;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

        const el = document.createElement("div");
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.borderRadius = "999px";
        el.style.border = "2px solid white";
        el.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.2)";
        el.style.cursor = "pointer";
        el.style.background = STATUS_COLOR[listing.status] ?? DEFAULT_COLOR;

        const fundedPct = Math.round(
          (listing.fundedCents / Math.max(1, listing.premiumTargetCents)) * 100,
        );
        const popup = new Popup({ offset: 14, closeButton: false }).setHTML(
          `<div style="font-size:12px;line-height:1.5;min-width:170px">
            <strong>${escapeHtml(listing.property.city)}, ${escapeHtml(listing.property.state)}</strong><br/>
            ${escapeHtml(PERIL_LABEL[listing.property.peril] ?? listing.property.peril)}<br/>
            ${escapeHtml(STATUS_LABEL[listing.status] ?? listing.status)} &middot; ${fundedPct}% funded<br/>
            ${usd(listing.fundedCents)} of ${usd(listing.premiumTargetCents)}<br/>
            <a href="/app/funder/listings/${listing.id}" style="text-decoration:underline">View listing &rarr;</a>
          </div>`,
        );

        const marker = new Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
        markersRef.current.push(marker);
        bounds.extend([lng, lat]);
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 56, maxZoom: 7, duration: 0 });
      }
    }

    if (map.isStyleLoaded()) {
      render();
    } else {
      map.once("load", render);
    }
  }, [listings]);

  if (!TOKEN) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center border border-line text-sm text-muted">
        Map unavailable — Mapbox token is not configured.
      </div>
    );
  }

  return <div ref={containerRef} className="h-[380px] w-full border border-line" />;
}
