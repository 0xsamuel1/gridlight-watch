import { useState } from "react";
import { Check, Copy, FileSignature, Radio, ShieldCheck, Coins, CircuitBoard } from "lucide-react";
import { toast } from "sonner";

import { shortHash } from "@/lib/mock-data";
import type { ChainTx, TxKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const kindMeta: Record<TxKind, { icon: typeof Radio; className: string }> = {
  meter_registered: { icon: CircuitBoard, className: "bg-muted text-foreground" },
  report_submitted: { icon: FileSignature, className: "bg-info/12 text-info" },
  consensus_reached: { icon: Radio, className: "bg-warning/15 text-warning" },
  outage_verified: { icon: ShieldCheck, className: "bg-danger/12 text-danger" },
  reward_issued: { icon: Coins, className: "bg-success/12 text-success" },
};

export function TransactionItem({ tx, className }: { tx: ChainTx; className?: string }) {
  const [copied, setCopied] = useState(false);
  const meta = kindMeta[tx.kind];
  const Icon = meta.icon;

  async function copy() {
    try {
      await navigator.clipboard.writeText(tx.hash);
      setCopied(true);
      toast.success("Transaction hash copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy the hash");
    }
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl border border-border p-3",
        className,
      )}
    >
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", meta.className)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
          <p className="truncate text-sm font-semibold">{tx.label}</p>
          <span className="shrink-0 text-[11px] text-muted-foreground">{tx.timestamp}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{tx.detail}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {shortHash(tx.hash)}
          </code>
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy transaction hash ${shortHash(tx.hash)}`}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="text-[11px] text-muted-foreground">Block #{tx.block}</span>
        </div>
      </div>
    </div>
  );
}
