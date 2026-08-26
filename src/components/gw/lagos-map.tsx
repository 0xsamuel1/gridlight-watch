import { Suspense, lazy, useEffect, useState } from "react";

import { MapSkeleton } from "@/components/gw/loading-skeleton";
import type { Neighbourhood } from "@/lib/types";
import { cn } from "@/lib/utils";

// Leaflet touches `window` at import time, so the map module is only loaded
// in the browser after hydration.
const LagosMapClient = lazy(() => import("./lagos-map.client"));

export function LagosMap({
  areas,
  selectedId,
  onSelect,
  zoom,
  className,
}: {
  areas: Neighbourhood[];
  selectedId?: string | null;
  onSelect?: (area: Neighbourhood) => void;
  zoom?: number;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border", className)}>
      {mounted ? (
        <Suspense fallback={<MapSkeleton />}>
          <LagosMapClient areas={areas} selectedId={selectedId} onSelect={onSelect} zoom={zoom} />
        </Suspense>
      ) : (
        <MapSkeleton />
      )}
    </div>
  );
}

export function MapLegend({ className }: { className?: string }) {
  const items = [
    { label: "Power available", className: "bg-success" },
    { label: "Verified outage", className: "bg-danger" },
    { label: "Conflicting reports", className: "bg-warning" },
    { label: "Restoration predicted", className: "bg-info" },
    { label: "Insufficient data", className: "bg-neutralstate" },
  ];
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("h-2.5 w-2.5 rounded-full", i.className)} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
