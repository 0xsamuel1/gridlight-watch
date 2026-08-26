import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { shortHash } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function CopyHash({
  hash,
  label,
  className,
}: {
  hash: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      toast.success("Transaction hash copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy the hash");
    }
  }

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}>
      <code className="truncate rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
        {shortHash(hash)}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy transaction hash ${shortHash(hash)}`}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      {label && <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>}
    </div>
  );
}
