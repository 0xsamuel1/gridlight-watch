import { motion } from "motion/react";
import { AlertTriangle, Brain, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

export type InsightTone = "info" | "warning" | "danger" | "success";

const toneMap: Record<InsightTone, { className: string; icon: typeof Brain }> = {
  info: { className: "bg-info/12 text-info", icon: Sparkles },
  warning: { className: "bg-warning/15 text-warning", icon: AlertTriangle },
  danger: { className: "bg-danger/12 text-danger", icon: ShieldAlert },
  success: { className: "bg-success/12 text-success", icon: TrendingUp },
};

export function AiInsightCard({
  title,
  body,
  tag,
  tone = "info",
  className,
}: {
  title: string;
  body: string;
  tag: string;
  tone?: InsightTone;
  className?: string;
}) {
  const meta = toneMap[tone];
  const Icon = meta.icon;
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("surface-card grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4 sm:p-5", className)}
    >
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", meta.className)}>
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {tag}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">{body}</p>
        <p className="mt-2 text-[11px] text-muted-foreground/80">
          AI estimate — not a guarantee of grid behaviour.
        </p>
      </div>
    </motion.article>
  );
}
