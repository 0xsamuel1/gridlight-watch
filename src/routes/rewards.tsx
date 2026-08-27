import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Award, Coins, Medal, ShieldCheck, Trophy } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/gw/app-shell";
import { StatCard } from "@/components/gw/stat-card";
import { ConfirmModal } from "@/components/gw/confirm-modal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGrid } from "@/lib/grid-store";
import { leaderboard } from "@/lib/mock-data";

export const Route = createFileRoute("/rewards")({ component: RewardsRoute });
function RewardsRoute() {
  return (
    <AppShell>
      <Rewards />
    </AppShell>
  );
}
function Rewards() {
  const {
    availableRewards,
    pendingRewards,
    lifetimeRewards,
    claimedRewards,
    claimRewards,
    meters,
    walletConnected,
  } = useGrid();
  const [confirm, setConfirm] = useState(false);
  const mine = meters.find((m) => m.id === "GW-YB-001")!;
  function claim() {
    if (!walletConnected) {
      toast.error("Connect your wallet before claiming rewards");
      return;
    }
    const amount = claimRewards();
    toast.success(`${amount} GRID demo points claimed`);
  }
  return (
    <>
      <PageHeader
        eyebrow="Contribution rewards"
        title="Rewards"
        description="Trusted meters earn demo GRID points for accurate and timely electricity reports."
        actions={
          <Button onClick={() => setConfirm(true)} disabled={availableRewards <= 0}>
            Claim {availableRewards.toLocaleString()} GRID
          </Button>
        }
      />
      <div className="mb-5 rounded-xl border border-warning/30 bg-warning/8 p-3 text-xs text-warning-foreground">
        <strong>Demo reward system:</strong> GRID is currently a demonstration point—not a
        cryptocurrency or financial asset.
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Available rewards"
          value={availableRewards.toLocaleString()}
          hint="Ready to claim"
          icon={Coins}
          tone="success"
        />
        <StatCard
          label="Pending rewards"
          value={pendingRewards.toLocaleString()}
          hint="Awaiting validation"
          icon={Award}
          tone="warning"
        />
        <StatCard
          label="Lifetime rewards"
          value={lifetimeRewards.toLocaleString()}
          hint={`${claimedRewards.toLocaleString()} claimed`}
          icon={Trophy}
          tone="info"
        />
        <StatCard
          label="Meter trust"
          value={`${mine.trust}%`}
          hint="GW-YB-001"
          icon={ShieldCheck}
          tone="success"
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
        <section className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Your contribution
          </p>
          <h2 className="mt-2 text-xl font-bold">Meter A · Yaba</h2>
          <p className="font-mono text-xs text-muted-foreground">GW-YB-001</p>
          <div className="mt-6">
            <div className="flex justify-between text-sm">
              <span>Trust score</span>
              <strong>{mine.trust}%</strong>
            </div>
            <Progress value={mine.trust} className="mt-2" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Accurate reports", mine.accuracy + "%"],
              ["Total reports", mine.totalReports.toLocaleString()],
              ["Connection", mine.online ? "Online" : "Offline"],
              ["Rank", "#3 Lagos"],
            ].map(([l, v]) => (
              <div className="rounded-xl bg-muted p-3" key={l}>
                <p className="text-[11px] text-muted-foreground">{l}</p>
                <p className="mt-1 font-bold">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            Accurate meters gain trust and receive points after neighbourhood consensus. Conflicting
            or missing reports may reduce trust.
          </p>
        </section>
        <section className="surface-card overflow-hidden">
          <div className="border-b p-5">
            <h2 className="font-semibold">Community leaderboard</h2>
            <p className="text-xs text-muted-foreground">Top trusted meter contributors in Lagos</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Rank</th>
                  <th className="px-5 py-3">Contributor</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Accurate reports</th>
                  <th className="px-5 py-3 text-right">Rewards</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leaderboard.map((r, i) => (
                  <tr key={r.meter}>
                    <td className="px-5 py-3">
                      {i < 3 ? (
                        <Medal
                          className={`h-4 w-4 ${i === 0 ? "text-warning" : i === 1 ? "text-neutralstate" : "text-amber-700"}`}
                        />
                      ) : (
                        i + 1
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <strong>{r.owner}</strong>
                      <p className="font-mono text-[10px] text-muted-foreground">{r.meter}</p>
                    </td>
                    <td className="px-5 py-3">{r.location}</td>
                    <td className="px-5 py-3 tabular-nums">{r.accurate.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-semibold text-success">
                      {r.rewards.toLocaleString()} GRID
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <ConfirmModal
        open={confirm}
        onOpenChange={setConfirm}
        title="Claim demo rewards?"
        description={`This will simulate claiming ${availableRewards} GRID points to your connected wallet.`}
        confirmLabel="Claim rewards"
        onConfirm={claim}
      />
    </>
  );
}
