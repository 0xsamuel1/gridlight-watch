import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, BrainCircuit, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, PageHeader } from "@/components/gw/app-shell";
import { AiInsightCard } from "@/components/gw/ai-insight-card";
import { ChartCard } from "@/components/gw/chart-card";
import { Progress } from "@/components/ui/progress";
import {
  aiInsights,
  averageDuration,
  hotspots,
  outageFrequency,
  reliabilityRanking,
  suspiciousMeters,
} from "@/lib/mock-data";

export const Route = createFileRoute("/insights")({ component: InsightsRoute });
function InsightsRoute() {
  return (
    <AppShell>
      <Insights />
    </AppShell>
  );
}
function Insights() {
  return (
    <>
      <PageHeader
        eyebrow="Grid intelligence"
        title="AI insights"
        description="Pattern detection, restoration estimates and meter-integrity signals generated from verified reports."
        actions={
          <span className="rounded-full bg-info/10 px-3 py-1.5 text-xs font-semibold text-info">
            Predictions are estimates
          </span>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {aiInsights.map((i) => (
          <AiInsightCard key={i.id} {...i} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Weekly outage frequency"
          description="Current week compared with last week"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outageFrequency}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar
                  dataKey="thisWeek"
                  name="This week"
                  fill="var(--danger)"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="lastWeek"
                  name="Last week"
                  fill="var(--neutralstate)"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard
          title="Average outage duration"
          description="Hours without electricity by neighbourhood"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={averageDuration} layout="vertical">
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="area" type="category" width={76} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="var(--info)" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <ChartCard title="Predicted hotspots" description="Potential outage risk windows">
          <div className="space-y-4">
            {hotspots.map((h) => (
              <div key={h.area}>
                <div className="flex justify-between text-sm">
                  <strong>{h.area}</strong>
                  <span className="text-muted-foreground">{h.risk}% risk</span>
                </div>
                <Progress value={h.risk} className="mt-2" />
                <p className="mt-1 text-[11px] text-muted-foreground">{h.window}</p>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Reliability ranking" description="Seven-day neighbourhood score">
          <div className="space-y-3">
            {reliabilityRanking.map((r, i) => (
              <div className="flex items-center gap-3" key={r.area}>
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-muted text-xs font-bold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-sm">
                    <strong className="truncate">{r.area}</strong>
                    <span>{r.reliability}%</span>
                  </div>
                  <Progress value={r.reliability} className="mt-1 h-1.5" />
                </div>
                <span className={r.change >= 0 ? "text-success" : "text-danger"}>
                  {r.change > 0 ? "+" : ""}
                  {r.change}%
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Suspicious meters" description="Reports that need attention">
          <div className="space-y-3">
            {suspiciousMeters.map((m) => (
              <div className="rounded-xl border p-3" key={m.meterId}>
                <div className="flex justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    {m.name}
                  </p>
                  <span className="text-xs font-semibold text-danger">{m.trustChange}% trust</span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">{m.meterId}</p>
                <p className="mt-2 text-xs text-muted-foreground">{m.reason}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </>
  );
}
