import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/gw/app-shell";
import { OutageCard } from "@/components/gw/outage-card";
import { Button } from "@/components/ui/button";
import { useGrid } from "@/lib/grid-store";
import type { OutageStatus } from "@/lib/types";

export const Route=createFileRoute("/outages")({component:OutagesRoute}); function OutagesRoute(){return <AppShell><Outages/></AppShell>}
function Outages(){const {outages}=useGrid(); const [tab,setTab]=useState<"all"|OutageStatus>("active"); const shown=tab==="all"?outages:outages.filter(o=>o.status===tab); return <><PageHeader eyebrow="Verified events" title="Outage history" description="Active, pending and restored electricity events backed by neighbourhood meter consensus."/><div className="mb-5 flex flex-wrap gap-2">{[["active","Active"],["pending","Pending Verification"],["restored","Restored"],["all","All Events"]].map(([v,l])=><Button key={v} size="sm" variant={tab===v?"default":"outline"} onClick={()=>setTab(v as typeof tab)}>{l} <span className="ml-1 opacity-60">{v==="all"?outages.length:outages.filter(o=>o.status===v).length}</span></Button>)}</div><div className="grid gap-4 xl:grid-cols-2">{shown.map(o=><OutageCard outage={o} key={o.id}/>)}</div></>}
