import { cn } from "@/lib/utils";
import type { PowerState } from "@/lib/types";

const stateMap: Record<PowerState, { label: string; className: string; dot: string }> = {
  on: {
    label: "Power available",
    className: "bg-success/12 text-success-foreground/90 ring-success/35",
    dot: "bg-success",
  },
  outage: {
    label: "Verified outage",
    className: "bg-danger/12 text-danger ring-danger/35",
    dot: "bg-danger",
  },
  conflict: {
    label: "Conflicting reports",
    className: "bg-warning/14 text-warning-foreground ring-warning/40",
    dot: "bg-warning",
  },
  predicted: {
    label: "Restoration predicted",
    className: "bg-info/12 text-info ring-info/35",
    dot: "bg-info",
  },
  unknown: {
    label: "Insufficient data",
    className: "bg-muted text-muted-foreground ring-border",
    dot: "bg-neutralstate",
  },
};

export function StatusBadge({
  state,
  label,
  className,
  size = "md",
}: {
  state: PowerState;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const cfg = stateMap[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        cfg.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", cfg.dot)} aria-hidden />
      {label ?? cfg.label}
    </span>
  );
}

export function stateColorVar(state: PowerState) {
  switch (state) {
    case "on":
      return "var(--success)";
    case "outage":
      return "var(--danger)";
    case "conflict":
      return "var(--warning)";
    case "predicted":
      return "var(--info)";
    default:
      return "var(--neutralstate)";
  }
}

export const powerStateLabel: Record<PowerState, string> = {
  on: "Power available",
  outage: "Verified outage",
  conflict: "Conflicting reports",
  predicted: "Restoration predicted",
  unknown: "Insufficient data",
};
