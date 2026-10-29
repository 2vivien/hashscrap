import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Progress } from "../../../components/ui/progress";
import type { Source } from "../types/sources.types";

export interface SourcesSidePanelProps {
  sources: Source[];
}

export function SourcesSidePanel({ sources }: SourcesSidePanelProps) {
  const validated = sources.filter((source) => source.statut === "validee").length;
  const ratio = sources.length === 0 ? 0 : Math.round((validated / sources.length) * 100);
  const domains = sources.flatMap((source) => source.domaines).slice(0, 8);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Validation des domaines</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {domains.map((domain) => (
            <span
              key={domain}
              className="rounded-full border border-line bg-card-2 px-2 py-0.5 text-[11px] text-ink-secondary"
            >
              {domain}
            </span>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-ink-secondary">Validées</span>
            <span className="mono text-ink">
              {validated}/{sources.length}
            </span>
          </div>
          <Progress value={ratio} />
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-ink-secondary">Taux succès</span>
            <span className="mono text-lime">{ratio}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
