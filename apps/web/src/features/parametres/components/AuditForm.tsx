import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { formatDateTime } from "../../../lib/format";
import { type Parametres } from "../types/parametres.types";

interface AuditFormProps {
  initialData: Parametres["audit"];
}

export function AuditForm({ initialData }: AuditFormProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Journalisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {initialData.logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="mono text-[12px] text-ink-muted">{log.at}</span>
                <Badge variant={{
                  INFO: "blue",
                  DEBUG: "green",
                  WARN: "orange",
                  ERROR: "red",
                }[log.level]}>
                  {log.level}
                </Badge>
                <span className="text-[12px] text-ink">{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit & conformité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-secondary">Dernière MAJ</span>
            <span className="mono text-[12px] text-ink">{formatDateTime(initialData.derniere_maj)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-secondary">Version</span>
            <span className="mono text-[12px] text-ink">{initialData.version}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-secondary">Licence</span>
            <span className="mono text-[12px] text-ink">{initialData.licence}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
