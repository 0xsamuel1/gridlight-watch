import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, BrainCircuit, Coins, Gauge, Map, Menu, RadioTower, X, Zap } from "lucide-react";

import { GridLogo } from "./logo";
import { WalletButton } from "./wallet-button";
import { SimulateReportModal } from "./simulate-report-modal";
import { Button } from "@/components/ui/button";
import { GridProvider } from "@/lib/grid-store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Overview", icon: Gauge },
  { to: "/map", label: "Live Map", icon: Map },
  { to: "/meters", label: "Smart Meters", icon: RadioTower },
  { to: "/outages", label: "Outages", icon: Activity },
  { to: "/insights", label: "AI Insights", icon: BrainCircuit },
  { to: "/rewards", label: "Rewards", icon: Coins },
] as const;

function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [menu, setMenu] = useState(false);
  const [simulate, setSimulate] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-navy text-navy-foreground lg:flex">
        <div className="border-b border-navy-border px-6 py-5"><GridLogo tone="dark" /></div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-foreground/65 transition", path === to ? "bg-primary text-primary-foreground" : "hover:bg-navy-muted hover:text-white")}>
              <Icon className="h-4.5 w-4.5" />{label}
            </Link>
          ))}
        </nav>
        <div className="m-3 rounded-2xl border border-navy-border bg-navy-muted p-4">
          <p className="text-xs font-semibold text-primary">HSK CHAIN</p>
          <p className="mt-1 text-sm font-semibold">Network operational</p>
          <p className="mt-1 text-xs text-navy-foreground/55">Demo records are simulated</p>
        </div>
      </aside>

      {menu && <button className="fixed inset-0 z-40 bg-navy/70 lg:hidden" aria-label="Close navigation" onClick={() => setMenu(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-[86%] max-w-72 bg-navy p-4 text-white transition-transform lg:hidden", menu ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-6 flex items-center justify-between"><GridLogo tone="dark" /><button onClick={() => setMenu(false)}><X /></button></div>
        <nav className="space-y-1">{nav.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setMenu(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm", path === to ? "bg-primary text-primary-foreground" : "text-white/70")}><Icon className="h-4 w-4" />{label}</Link>)}</nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setMenu(true)} aria-label="Open navigation"><Menu /></button>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-success" />248 meters reporting live</div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="hidden sm:inline-flex" onClick={() => setSimulate(true)}><Zap className="h-4 w-4" />Simulate Report</Button>
            <WalletButton compact />
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 pb-24 sm:p-6 lg:p-8">{children}</main>
        <button onClick={() => setSimulate(true)} className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift sm:hidden" aria-label="Simulate meter report"><Zap /></button>
      </div>
      <SimulateReportModal open={simulate} onOpenChange={setSimulate} />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return <GridProvider><Shell>{children}</Shell></GridProvider>;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p></div>{actions}</div>;
}
