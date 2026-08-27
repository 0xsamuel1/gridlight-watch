import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  MapPinned,
  RadioTower,
  ShieldCheck,
  Sun,
  Users,
  Zap,
} from "lucide-react";
import { GridLogo } from "@/components/gw/logo";
import { Button } from "@/components/ui/button";
import { GridProvider } from "@/lib/grid-store";
import { WalletButton } from "@/components/gw/wallet-button";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <GridProvider>
      <div className="min-h-screen bg-navy text-navy-foreground">
        <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
          <GridLogo tone="dark" />
          <nav className="hidden gap-7 text-sm text-white/65 md:flex">
            <a href="#how">How it works</a>
            <a href="#users">Who it helps</a>
            <a href="#network">Network</a>
          </nav>
          <WalletButton compact />
        </header>
        <main>
          <section className="grid-pattern relative overflow-hidden border-y border-navy-border">
            <div className="absolute left-[65%] top-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Decentralized energy intelligence for Nigeria
                </span>
                <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
                  Know when the power goes out.{" "}
                  <span className="text-primary">Know when it may return.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
                  GridWitness combines community smart-meter reports, AI predictions and blockchain
                  verification to make Nigeria's electricity reality visible.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <Link to="/dashboard">
                      Open Live Dashboard
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <a href="#how">See how it works</a>
                  </Button>
                </div>
                <div className="mt-10 flex flex-wrap gap-6 text-xs text-white/45">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Privacy-first
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Community verified
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Built on HSK Chain
                  </span>
                </div>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl backdrop-blur">
                <div className="rounded-[1.5rem] bg-[#0c1929] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/45">Lagos grid status</p>
                      <p className="mt-1 font-semibold">3 active outages</p>
                    </div>
                    <span className="rounded-full bg-danger/15 px-3 py-1 text-xs text-danger">
                      Live
                    </span>
                  </div>
                  <div className="relative mt-5 h-72 overflow-hidden rounded-2xl bg-[#122438] grid-pattern">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_45%,rgba(34,197,94,.18),transparent_38%)]" />
                    {[
                      ["Yaba", "28%", "43%", "bg-warning"],
                      ["Ikeja", "42%", "24%", "bg-success"],
                      ["Surulere", "29%", "67%", "bg-danger"],
                      ["Lekki", "70%", "58%", "bg-success"],
                      ["Gbagada", "52%", "42%", "bg-info"],
                    ].map(([n, l, t, c]) => (
                      <div key={n} className="absolute" style={{ left: l, top: t }}>
                        <span className={`block h-3 w-3 rounded-full ${c} ring-4 ring-white/10`} />
                        <span className="mt-1 block -translate-x-1/3 rounded bg-navy/80 px-1.5 py-0.5 text-[9px]">
                          {n}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      ["248", "Live meters"],
                      ["68%", "Reliability"],
                      ["12.4K", "GRID issued"],
                    ].map(([v, l]) => (
                      <div className="rounded-xl bg-white/5 p-3" key={l}>
                        <p className="text-lg font-bold text-primary">{v}</p>
                        <p className="text-[10px] text-white/40">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section id="how" className="bg-background py-20 text-foreground">
            <div className="mx-auto max-w-7xl px-5">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                How GridWitness works
              </p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                From meter signal to trusted public record.
              </h2>
              <div className="mt-10 grid gap-4 md:grid-cols-4">
                {[
                  [
                    RadioTower,
                    "Meters detect status",
                    "Devices report whether electricity is on or off.",
                  ],
                  [ShieldCheck, "Reports are signed", "Every reading is tied to a trusted meter."],
                  [
                    Users,
                    "Neighbourhood consensus",
                    "Nearby devices confirm what is really happening.",
                  ],
                  [
                    BrainCircuit,
                    "AI predicts restoration",
                    "Verified data powers useful restoration estimates.",
                  ],
                ].map(([Icon, t, d], i) => (
                  <article className="surface-card p-6" key={String(t)}>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/12 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-5 text-xs font-bold text-muted-foreground">0{i + 1}</p>
                    <h3 className="mt-1 font-bold">{String(t)}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(d)}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section id="users" className="bg-muted py-20 text-foreground">
            <div className="mx-auto max-w-7xl px-5">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    Useful beyond the household
                  </p>
                  <h2 className="mt-2 text-4xl font-bold">One trusted view of the grid.</h2>
                  <p className="mt-4 max-w-lg text-muted-foreground">
                    Residents plan their day, businesses measure losses, solar providers find
                    underserved areas, and researchers work with open reliability data.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    [Sun, "Residents", "See live power conditions nearby."],
                    [Building2, "Businesses", "Track downtime and operating risk."],
                    [Zap, "Solar providers", "Find areas that need alternatives."],
                    [MapPinned, "Researchers", "Study verifiable reliability data."],
                  ].map(([Icon, t, d]) => (
                    <div className="surface-card flex gap-4 p-5" key={String(t)}>
                      <Icon className="h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <h3 className="font-semibold">{String(t)}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{String(d)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section id="network" className="border-y border-navy-border py-16">
            <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-primary">HSK Chain integration</p>
                <h2 className="mt-2 text-3xl font-bold">Infrastructure people can verify.</h2>
                <p className="mt-2 text-white/55">
                  Outage consensus and reward events become tamper-resistant public records.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Explore the demo
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </section>
        </main>
        <footer className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-8 text-xs text-white/40 sm:flex-row">
          <span>© 2026 GridWitness</span>
          <span>Demo data · Not an electricity provider</span>
        </footer>
      </div>
    </GridProvider>
  );
}
