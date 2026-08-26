import { motion } from "motion/react";
import { Cpu, MapPin, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/gw/status-badge";
import type { Meter } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MeterCard({
  meter,
  onView,
  className,
}: {
  meter: Meter;
  onView: (meter: Meter) => void;
  className?: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("surface-card flex flex-col gap-4 p-4 sm:p-5", className)}
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted">
            <Cpu className="h-4.5 w-4.5 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{meter.name}</h3>
            <p className="truncate font-mono text-[11px] text-muted-foreground">{meter.id}</p>
          </div>
        </div>
        <StatusBadge
          size="sm"
          state={meter.status === "on" ? "on" : "outage"}
          label={meter.status === "on" ? "Power ON" : "Power OFF"}
        />
      </header>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="min-w-0">
          <p className="text-muted-foreground">Location</p>
          <p className="mt-0.5 flex min-w-0 items-center gap-1 font-medium">
            <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{meter.location}</span>
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground">Last report</p>
          <p className="mt-0.5 truncate font-medium">{meter.lastReport}</p>
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground">Total reports</p>
          <p className="mt-0.5 font-medium tabular-nums">{meter.totalReports.toLocaleString()}</p>
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground">Rewards</p>
          <p className="mt-0.5 font-medium tabular-nums">{meter.rewards.toLocaleString()} GRID</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Trust score
          </span>
          <span className="font-semibold tabular-nums">{meter.trust}%</span>
        </div>
        <Progress value={meter.trust} className="mt-2 h-1.5" />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn("h-2 w-2 shrink-0 rounded-full", meter.online ? "bg-success" : "bg-neutralstate")}
            aria-hidden
          />
          {meter.online ? "Connected" : "Offline"}
        </span>
        <Button size="sm" variant="soft" onClick={() => onView(meter)}>
          View details
        </Button>
      </div>
    </motion.article>
  );
}
