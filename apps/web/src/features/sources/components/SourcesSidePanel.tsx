import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Progress } from "../../../components/ui/progress";
import type { Source } from "../types/sources.types";

export interface SourcesSidePanelProps { sources: Source[]; }
export function SourcesSidePanel({ sources }: SourcesSidePanelProps) {
  const validated = sources.filter((source) => source.statut === "validee").length;
  const ratio = sources.length === 0 ? 0 : Math.round((validated / sources.length) * 100);
  const domains = [...new Set(sources.flatMap((source) => source.domaines))].slice(0, 12);
  return <div className="flex flex-col gap-4">
    <Card><CardHeader><CardTitle>Domaines configurés par les sources</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-1.5">
      {domains.length ? domains.map((domain) => <span key={domain} className="rounded-full border border-line bg-card-2 px-2 py-0.5 text-[11px] text-ink-secondary">{domain}</span>) : <p className="text-xs text-ink-muted">Aucun domaine renvoyé par l’API.</p>}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>État des sources affichées</CardTitle></CardHeader><CardContent className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs"><span className="text-ink-secondary">Statut validée</span><span className="mono text-ink">{validated}/{sources.length}</span></div>
      <Progress value={ratio} />
      <div className="flex items-center justify-between text-xs"><span className="text-ink-secondary">Part avec statut validée</span><span className="mono text-lime">{ratio}%</span></div>
      <p className="text-[11px] text-ink-muted">Le statut est celui calculé par l’API ; il ne constitue pas une validation individuelle de chaque domaine.</p>
    </CardContent></Card>
  </div>;
}
