import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  time: string;
  state: "done" | "current" | "upcoming";
}

export function ActivityTimeline({
  steps,
  className,
}: {
  steps: TimelineStep[];
  className?: string;
}) {
  return (
    <ol className={cn("relative space-y-5 border-l border-border pl-6", className)}>
      {steps.map((step, i) => (
        <motion.li
          key={step.id}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="relative"
        >
          <span
            className={cn(
              "absolute -left-[31px] top-1 grid h-3.5 w-3.5 place-items-center rounded-full ring-4 ring-card",
              step.state === "done" && "bg-success",
              step.state === "current" && "bg-info",
              step.state === "upcoming" && "bg-neutralstate/60",
            )}
            aria-hidden
          />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
            <p className="truncate text-sm font-semibold">{step.title}</p>
            <span className="shrink-0 text-[11px] text-muted-foreground">{step.time}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
        </motion.li>
      ))}
    </ol>
  );
}
