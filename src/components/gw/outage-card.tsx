import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/gw/status-badge";
import { CopyHash } from "@/components/gw/copy-hash";
import type { Outage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function OutageCard({ outage, className }: { outage: Outage; className?: string }) {
  const state =
    outage.status === "restored" ? "on" : outage.status === "pending" ? "conflict" : "outage";
  const statusLabel =
    outage.status === "restored"
      ? "Restored"
      : outage.status === "pending"
        ? "Pending verification"
        : "Verified outage";

  return (
    <article className={cn("surface-card p-4 sm:p-5", className)}>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="flex min-w-0 items-center gap-1.5 text-sm font-semibold sm:text-base">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{outage.area}</span>
          </h3>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{outage.id}</p>
        </div>
        <StatusBadge size="sm" state={state} label={statusLabel} />
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div className="min-w-0">
          <dt className="text-muted-foreground">Started</dt>
          <dd className="mt-0.5 truncate font-medium">{outage.startTime}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">Duration</dt>
          <dd className="mt-0.5 flex items-center gap-1 font-medium tabular-nums">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {formatDuration(outage.durationMinutes)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">Reports</dt>
          <dd className="mt-0.5 flex items-center gap-1 font-medium tabular-nums">
            <Users className="h-3 w-3 text-muted-foreground" />
            {outage.reports}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">Consensus</dt>
          <dd className="mt-0.5 font-medium tabular-nums">{outage.consensus}%</dd>
        </div>
      </dl>

      <p className="mt-3 rounded-lg bg-info/8 px-3 py-2 text-xs text-foreground/80">
        <span className="font-semibold text-info">AI estimate:</span> {outage.prediction}
      </p>

      <footer className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <CopyHash hash={outage.txHash} label={`Block #${outage.block}`} />
        <Button asChild size="sm" variant="soft">
          <Link to="/outages/$outageId" params={{ outageId: outage.id }}>
            View event
          </Link>
        </Button>
      </footer>
    </article>
  );
}
