import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search, ShieldCheck, Wifi, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/gw/app-shell";
import { MeterCard } from "@/components/gw/meter-card";
import { StatusBadge } from "@/components/gw/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const {
    meters,
    walletConnected,
    address,
    blockchainEnabled,
    contractConfigured,
    pendingAction,
    txMessage,
    registerMeter,
  } = useGrid();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Meter | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [newMeterId, setNewMeterId] = useState("GW-YB-004");
  const [newMeterLocation, setNewMeterLocation] = useState("Yaba");
  const registering = pendingAction === "Registering meter";
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
        actions={
          <Button variant="outline" onClick={() => setRegisterOpen(true)}>
            Register New Meter
          </Button>
        }
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
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register smart meter</DialogTitle>
            <DialogDescription>
              {blockchainEnabled
                ? "Register a meter ID to the connected wallet and neighbourhood on the GridWitness contract."
                : "The mock demo uses preloaded meters. Enable blockchain mode to submit a real registration transaction."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="meter-id">Meter ID</Label>
              <Input
                id="meter-id"
                value={newMeterId}
                onChange={(event) => setNewMeterId(event.target.value)}
                placeholder="GW-YB-004"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meter-location">Location</Label>
              <Input
                id="meter-location"
                value={newMeterLocation}
                onChange={(event) => setNewMeterLocation(event.target.value)}
                placeholder="Yaba"
              />
            </div>
            {blockchainEnabled && (
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Owner wallet</p>
                <p className="mt-1 break-all">{address || "Connect a wallet first"}</p>
                {txMessage && <p className="mt-2">{txMessage}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={registering}
              onClick={async () => {
                if (!blockchainEnabled) {
                  toast.info("Mock mode uses preloaded meters", {
                    description: "Set VITE_USE_BLOCKCHAIN=true to register meters on-chain.",
                  });
                  setRegisterOpen(false);
                  return;
                }
                if (!contractConfigured) {
                  toast.error("Contract address is not configured");
                  return;
                }
                if (!walletConnected) {
                  toast.error("Connect your wallet before registering a meter");
                  return;
                }
                try {
                  await registerMeter(newMeterId.trim(), newMeterLocation.trim());
                  toast.success("Meter registration confirmed", {
                    description: `${newMeterId.trim()} registered in ${newMeterLocation.trim()}`,
                  });
                  setRegisterOpen(false);
                } catch (error) {
                  toast.error("Meter registration failed", {
                    description: error instanceof Error ? error.message : String(error),
                  });
                }
              }}
            >
              {registering && <Loader2 className="h-4 w-4 animate-spin" />}
              {blockchainEnabled ? "Register on-chain" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
