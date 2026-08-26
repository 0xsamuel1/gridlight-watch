import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";

export function GridLogo({
  className,
  tone = "light",
  showText = true,
}: {
  className?: string;
  tone?: "light" | "dark";
  showText?: boolean;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/40">
        <span className="pulse-ring absolute inset-0 rounded-xl bg-primary/25" />
        <Zap className="relative h-4.5 w-4.5 text-primary" strokeWidth={2.4} />
      </span>
      {showText && (
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate text-base font-bold tracking-tight",
              tone === "dark" ? "text-navy-foreground" : "text-foreground",
            )}
          >
            GridWitness
          </span>
          <span className="block truncate text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Grid intelligence
          </span>
        </span>
      )}
    </span>
  );
}
