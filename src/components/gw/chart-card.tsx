import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card p-4 sm:p-5", className)}>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold sm:text-base">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-[13px]">{description}</p>
          )}
        </div>
        {action}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}
