import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Coins, RadioTower, ShieldAlert, Signal, Sparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell, PageHeader } from "@/components/gw/app-shell";
import { AiInsightCard } from "@/components/gw/ai-insight-card";
import { ChartCard } from "@/components/gw/chart-card";
import { LagosMap } from "@/components/gw/lagos-map";
import { StatCard } from "@/components/gw/stat-card";
import { TransactionItem } from "@/components/gw/transaction-item";
import { StatusBadge } from "@/components/gw/status-badge";
import { Button } from "@/components/ui/button";
import { availability24h, aiInsights } from "@/lib/mock-data";
import { useGrid } from "@/lib/grid-store";

export const Route = createFileRoute("/dashboard")({ component: DashboardRoute });
function DashboardRoute() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

function Dashboard() {
  const { stats, neighbourhoods, reports, transactions, simulationComplete } = useGrid();
  return (
    <>
      <PageHeader
        eyebrow="Live operations"
        title="Good evening, Samuel"
        description={`${stats.activeOutages} active outages across monitored Lagos neighbourhoods. Reports update as meters reach consensus.`}
        actions={
          simulationComplete ? (
            <span className="rounded-full bg-success/12 px-3 py-1.5 text-xs font-semibold text-success">
              Demo consensus completed
            </span>
          ) : undefined
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Live meters"
          value={stats.liveMeters}
          hint="Across 7 areas"
          icon={RadioTower}
          tone="info"
        />
        <StatCard
          label="Online meters"
          value={stats.onlineMeters}
          hint="89.1% connected"
          icon={Signal}
          tone="success"
        />
        <StatCard
          label="Active outages"
          value={stats.activeOutages}
          hint="Community verified"
          icon={ShieldAlert}
          tone="danger"
        />
        <StatCard
          label="Avg. reliability"
          value={`${stats.avgReliability}%`}
          hint="Rolling 7 days"
          icon={Activity}
          tone="warning"
        />
        <StatCard
          label="Rewards issued"
          value={`${(stats.rewardsDistributed / 1000).toFixed(1)}K`}
          hint="GRID demo points"
          icon={Coins}
          tone="success"
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
        <ChartCard
          title="Live Lagos grid"
          description="Select a marker to inspect neighbourhood status"
          action={
            <Button variant="soft" size="sm" asChild>
              <Link to="/map">Full map</Link>
            </Button>
          }
        >
          <LagosMap areas={neighbourhoods} className="h-[390px]" />
        </ChartCard>
        <ChartCard title="AI grid summary" description="Estimates based on verified meter data">
          <div className="rounded-xl bg-info/8 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-info">
              <Sparkles className="h-4 w-4" />
              Evening outlook
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground/75">
              Grid availability is currently below the weekly average. Surulere and Apapa remain
              offline, while Yaba reports require attention. Restoration confidence is strongest for
              Yaba once consensus completes.
            </p>
          </div>
          <div className="mt-3 space-y-3">
            {neighbourhoods.slice(0, 4).map((n) => (
              <div key={n.id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="text-sm font-semibold">{n.name}</p>
                  <p className="text-xs text-muted-foreground">{n.meters} reporting meters</p>
                </div>
                <StatusBadge state={n.state} size="sm" />
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <ChartCard
          title="Electricity availability"
          description="Percentage of monitored meters reporting power in the last 24 hours"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={availability24h}>
                <defs>
                  <linearGradient id="availability" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="availability"
                  stroke="var(--success)"
                  fill="url(#availability)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Recent chain activity" description="Simulated HSK Chain event log">
          <div className="space-y-2">
            {transactions.slice(0, 4).map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        </ChartCard>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Latest meter reports" description="Signed device readings">
          <div className="divide-y">
            {reports.slice(0, 6).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold">{r.meterName}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {r.meterId} · {r.location}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge
                    state={r.status === "on" ? "on" : "outage"}
                    label={`Power ${r.status.toUpperCase()}`}
                    size="sm"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">{r.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
        <div className="grid gap-3 sm:grid-cols-2">
          {aiInsights.slice(0, 4).map((i) => (
            <AiInsightCard key={i.id} {...i} />
          ))}
        </div>
      </div>
    </>
  );
}
