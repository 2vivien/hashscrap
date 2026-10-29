import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import type { Investigation } from "../types/investigations.types";

export function InvestigationsStats({ investigations }: { investigations: Investigation[] }) {
  const active = investigations.filter((item) => item.statut === "en_cours").length;
  const completed = investigations.filter((item) => item.statut === "terminee").length;
  const observations = investigations.reduce((total, item) => total + item.observations, 0);
  return <Card><CardHeader><CardTitle>Statistiques des investigations</CardTitle></CardHeader><CardContent className="space-y-2">
    <Stat label="En cours" value={active} /><Stat label="Terminées" value={completed} /><Stat label="Observations associées" value={observations} /><Stat label="Total investigations" value={investigations.length} />
  </CardContent></Card>;
}
function Stat({ label, value }: { label: string; value: number }) {
  return <div className="flex justify-between gap-4"><span className="text-sm text-ink-secondary">{label}</span><span className="mono">{value.toLocaleString("fr-FR")}</span></div>;
}
