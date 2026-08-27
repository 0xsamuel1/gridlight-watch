import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  Brain,
  CheckCircle2,
  Coins,
  Cpu,
  Loader2,
  PlugZap,
  Radio,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyHash } from "@/components/gw/copy-hash";
import { useGrid } from "@/lib/grid-store";
import { featuredMeterIds, meters as allMeters } from "@/lib/mock-data";
import type { MeterStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Phase = "form" | "analyzing" | "result";

interface Submitted {
  meterId: string;
  name: string;
  status: MeterStatus;
  time: string;
}

const LOCATIONS = ["Yaba", "Ikeja GRA", "Surulere", "Lekki Phase 1", "Gbagada"];

const ANALYSIS_STEPS = [
  { icon: Radio, label: "Collecting signed neighbourhood reports" },
  { icon: Brain, label: "Analyzing neighbourhood reports" },
  { icon: ShieldCheck, label: "Reaching device consensus" },
  { icon: Zap, label: "Recording verified outage on HSK Chain" },
];

function defaultTime() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function SimulateReportModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { submitReport, runConsensus } = useGrid();
  const featured = useMemo(() => allMeters.filter((m) => featuredMeterIds.includes(m.id)), []);

  const [meterId, setMeterId] = useState(featured[0]?.id ?? "GW-YB-001");
  const [location, setLocation] = useState("Yaba");
  const [status, setStatus] = useState<MeterStatus>("off");
  const [time, setTime] = useState(defaultTime);
  const [submitted, setSubmitted] = useState<Submitted[]>([]);
  const [phase, setPhase] = useState<Phase>("form");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<{
    consensus: number;
    verified: boolean;
    hash: string;
    rewarded: number;
    outageId: string;
  } | null>(null);

  function reset() {
    setSubmitted([]);
    setPhase("form");
    setResult(null);
    setActiveStep(0);
    setStatus("off");
    setMeterId(featured[0]?.id ?? "GW-YB-001");
    setTime(defaultTime());
  }

  function addReport(id: string, s: MeterStatus, t: string, loc: string) {
    const meter = allMeters.find((m) => m.id === id);
    submitReport(id, loc, s, t);
    setSubmitted((prev) => [
      ...prev.filter((p) => p.meterId !== id),
      { meterId: id, name: meter?.name ?? id, status: s, time: t },
    ]);
  }

  function handleSubmitOne() {
    addReport(meterId, status, time, location);
    toast.success("Report signed and submitted", {
      description: `${allMeters.find((m) => m.id === meterId)?.name} • Power ${status === "off" ? "OFF" : "ON"} • ${location}`,
    });
    const next = featured.find(
      (m) => m.id !== meterId && !submitted.some((s) => s.meterId === m.id),
    );
    if (next) {
      setMeterId(next.id);
      setStatus(next.id === "GW-YB-003" ? "on" : "off");
    }
  }

  function runDefaultScenario() {
    const t = defaultTime();
    addReport("GW-YB-001", "off", t, "Yaba");
    addReport("GW-YB-002", "off", t, "Yaba");
    addReport("GW-YB-003", "on", t, "Yaba");
    setLocation("Yaba");
    toast.success("Default scenario submitted", {
      description: "Meter A: OFF · Meter B: OFF · Meter C: ON",
    });
  }

  function analyze() {
    setPhase("analyzing");
    setActiveStep(0);
    const timers = ANALYSIS_STEPS.map((_, i) => setTimeout(() => setActiveStep(i), i * 750));
    setTimeout(
      () => {
        timers.forEach(clearTimeout);
        const outcome = runConsensus(location);
        setResult({
          consensus: outcome.consensus,
          verified: outcome.verified,
          hash: outcome.hash,
          rewarded: outcome.rewarded.length,
          outageId: outcome.outageId,
        });
        setPhase("result");
        toast.success(
          outcome.verified
            ? `${outcome.consensus}% consensus reached — ${location} marked as a verified outage`
            : `${outcome.consensus}% consensus — not enough agreement to verify an outage`,
          {
            description: `${outcome.rewarded.length * 25} GRID demo points issued to accurate meters`,
          },
        );
      },
      ANALYSIS_STEPS.length * 750 + 400,
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTimeout(reset, 200);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlugZap className="h-5 w-5 text-primary" />
            Simulate meter report
          </DialogTitle>
          <DialogDescription>
            Submit signed power-status reports from simulated smart meters and watch the
            neighbourhood reach consensus.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {phase === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sim-meter">Meter</Label>
                  <Select value={meterId} onValueChange={setMeterId}>
                    <SelectTrigger id="sim-meter">
                      <SelectValue placeholder="Select meter" />
                    </SelectTrigger>
                    <SelectContent>
                      {featured.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} — {m.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sim-location">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="sim-location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Power status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={status === "on" ? "default" : "outline"}
                      onClick={() => setStatus("on")}
                      aria-pressed={status === "on"}
                    >
                      Power ON
                    </Button>
                    <Button
                      type="button"
                      variant={status === "off" ? "destructive" : "outline"}
                      onClick={() => setStatus("off")}
                      aria-pressed={status === "off"}
                    >
                      Power OFF
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sim-time">Report time</Label>
                  <Input
                    id="sim-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/50 p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Submitted reports ({submitted.length})
                </p>
                {submitted.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    No reports yet. Use the default scenario for the fastest demo: Meter A OFF,
                    Meter B OFF, Meter C ON.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {submitted.map((s) => (
                      <li
                        key={s.meterId}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-xs"
                      >
                        <Cpu className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">
                          {s.name} · {s.meterId}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            s.status === "off"
                              ? "bg-danger/12 text-danger"
                              : "bg-success/12 text-success",
                          )}
                        >
                          Power {s.status === "off" ? "OFF" : "ON"} · {s.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button type="button" variant="soft" onClick={runDefaultScenario}>
                  Use default scenario
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={handleSubmitOne}>
                    Submit report
                  </Button>
                  <Button type="button" onClick={analyze} disabled={submitted.length === 0}>
                    <Activity className="h-4 w-4" />
                    Run consensus
                  </Button>
                </div>
              </DialogFooter>
            </motion.div>
          )}

          {phase === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 py-4"
            >
              <div className="flex items-center gap-3 rounded-xl bg-navy p-4 text-navy-foreground">
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Analyzing neighbourhood reports</p>
                  <p className="text-xs text-navy-foreground/70">
                    {submitted.length} signed reports from {location}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {ANALYSIS_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done = i < activeStep;
                  const current = i === activeStep;
                  return (
                    <li
                      key={step.label}
                      className={cn(
                        "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border p-3 transition-colors",
                        current ? "border-primary/40 bg-primary/8" : "border-border",
                        !done && !current && "opacity-50",
                      )}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted">
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : current ? (
                          <Loader2 className="h-4 w-4 animate-spin text-info" />
                        ) : (
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                      <span className="truncate text-sm">{step.label}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}

          {phase === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div
                className={cn(
                  "rounded-xl p-4 text-center",
                  result.verified ? "bg-danger/10" : "bg-warning/12",
                )}
              >
                <p className="text-3xl font-bold tabular-nums">{result.consensus}%</p>
                <p className="mt-1 text-sm font-semibold">
                  {result.verified
                    ? `Consensus reached — ${location} marked as a verified outage`
                    : `Consensus below threshold — ${location} stays pending verification`}
                </p>
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Brain className="h-4 w-4 text-info" /> AI restoration estimate
                  </dt>
                  <dd className="text-right font-medium">
                    {result.verified ? "4:30 PM – 5:15 PM" : "Pending more reports"}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {result.verified ? "81% confidence — estimate only" : "Not a guarantee"}
                    </span>
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Coins className="h-4 w-4 text-success" /> Rewards issued
                  </dt>
                  <dd className="text-right font-medium tabular-nums">
                    {result.rewarded * 25} GRID
                    <span className="block text-xs font-normal text-muted-foreground">
                      {result.rewarded} accurate meters · demo points
                    </span>
                  </dd>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Simulated chain confirmation
                  </dt>
                  <dd className="mt-2">
                    <CopyHash hash={result.hash} label={`Event ${result.outageId}`} />
                  </dd>
                </div>
              </dl>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button variant="soft" onClick={reset}>
                  Run another simulation
                </Button>
                <Button onClick={() => onOpenChange(false)}>Done</Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
