import { Database, Eye, Network, PlayCircle } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import type { DashboardStats } from "../types/dashboard.types";

export interface StatCardsProps { stats: DashboardStats; }
const ICONS = { sources: Database, collectes: PlayCircle, observations: Eye, entites: Network } as const;
const LABELS = { sources: "Sources", collectes: "Collectes", observations: "Observations", entites: "Entités" } as const;

export function StatCards({ stats }: StatCardsProps) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    {(Object.keys(LABELS) as Array<keyof DashboardStats>).map((key) => {
      const Icon = ICONS[key];
      const stat = stats[key];
      return <Card key={key}><CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-[10px] border border-lime/30 bg-lime-dim text-lime"><Icon className="size-4" /></span>
          {stat.delta ? <span className="rounded-full border border-line bg-card-2 px-2 py-0.5 text-[11px] text-ink-secondary">{stat.delta}</span> : null}
        </div>
        <p className="text-[28px] leading-none font-semibold text-ink">{stat.value.toLocaleString("fr-FR")}</p>
        <p className="text-[12px] text-ink-secondary">{LABELS[key]}</p>
      </CardContent></Card>;
    })}
  </div>;
}
