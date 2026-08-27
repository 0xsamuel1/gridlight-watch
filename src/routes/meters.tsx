import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ShieldCheck, Wifi, X } from "lucide-react";
import { AppShell, PageHeader } from "@/components/gw/app-shell";
import { MeterCard } from "@/components/gw/meter-card";
import { StatusBadge } from "@/components/gw/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGrid } from "@/lib/grid-store";
import type { Meter } from "@/lib/types";

export const Route = createFileRoute("/meters")({ component: MetersRoute });
function MetersRoute() {
  return (
    <AppShell>
      <Meters />
    </AppShell>
  );
}
function Meters() {
  const { meters } = useGrid();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Meter | null>(null);
  const list = useMemo(
    () =>
      meters.filter(
        (m) =>
          (status === "all" || (status === "online" ? m.online : !m.online)) &&
          `${m.name} ${m.id} ${m.location}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [meters, q, status],
  );
  return (
    <>
      <PageHeader
        eyebrow="Device network"
        title="Smart meters"
        description="Inspect signed reports, trust scores and contribution rewards from connected devices."
        actions={<Button variant="outline">Register New Meter</Button>}
      />
      <div className="surface-card mb-5 flex flex-col gap-3 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search meter, ID or location"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["all", "online", "offline"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => setStatus(s)}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((m) => (
          <MeterCard key={m.id} meter={m} onView={setSelected} />
        ))}
      </div>
      {selected && (
        <>
          <button
            className="fixed inset-0 z-40 bg-navy/50"
            onClick={() => setSelected(null)}
            aria-label="Close details"
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-background p-6 shadow-2xl">
            <div className="flex justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">{selected.id}</p>
                <h2 className="text-2xl font-bold">{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)}>
                <X />
              </button>
            </div>
            <StatusBadge
              className="mt-4"
              state={selected.status === "on" ? "on" : "outage"}
              label={`Power ${selected.status.toUpperCase()}`}
            />
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Location", selected.location],
                ["Owner", selected.owner],
                ["Total reports", selected.totalReports.toLocaleString()],
                ["Rewards", `${selected.rewards.toLocaleString()} GRID`],
                ["Last report", selected.lastReport],
                ["Connection", selected.online ? "Online" : "Offline"],
              ].map(([l, v]) => (
                <div className="rounded-xl border p-3" key={l}>
                  <p className="text-xs text-muted-foreground">{l}</p>
                  <p className="mt-1 text-sm font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 surface-card p-4">
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Trust score
                </span>
                <strong>{selected.trust}%</strong>
              </div>
              <Progress value={selected.trust} className="mt-3" />
              <p className="mt-3 text-xs text-muted-foreground">
                {selected.accuracy}% historic reporting accuracy across{" "}
                {selected.totalReports.toLocaleString()} signed readings.
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-success/8 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-success">
                <Wifi className="h-4 w-4" />
                Device health
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {selected.online
                  ? "Connected and reporting normally."
                  : "Device is offline. Its trust score will not change until reporting resumes."}
              </p>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
