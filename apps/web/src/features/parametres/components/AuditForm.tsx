import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { type Parametres } from "../types/parametres.types";

interface AuditFormProps { initialData: Parametres["audit"]; }
export function AuditForm({ initialData }: AuditFormProps) {
  return <div className="space-y-4">
    <Card><CardHeader><CardTitle>Journalisation (événements récents)</CardTitle></CardHeader><CardContent>
      {initialData.logs.length ? <div className="space-y-2">{initialData.logs.map((log, index) => <div key={index} className="flex flex-wrap items-start gap-2"><span className="mono text-xs text-ink-muted">{log.at}</span><Badge variant={{ INFO: "blue", DEBUG: "green", WARN: "orange", ERROR: "red" }[log.level]}>{log.level}</Badge><span className="text-xs text-ink">{log.message}</span></div>)}</div> : <p className="text-xs text-ink-muted">Aucun événement d’audit retourné par l’API.</p>}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Audit & conformité</CardTitle></CardHeader><CardContent className="space-y-2">
      <Info label="Dernière mise à jour" value={initialData.derniere_maj} /><Info label="Version" value={initialData.version} /><Info label="Licence" value={initialData.licence} />
    </CardContent></Card>
  </div>;
}
function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-xs text-ink-secondary">{label}</span><span className="mono text-xs text-ink">{value}</span></div>;
}
