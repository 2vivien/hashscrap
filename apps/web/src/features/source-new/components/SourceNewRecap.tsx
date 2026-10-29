import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { SOURCE_TYPE_LABEL, type SourceNewFormValues } from "../types/source-new.types";

export interface SourceNewRecapProps { values: SourceNewFormValues; }

export function SourceNewRecap({ values }: SourceNewRecapProps) {
  return (
    <Card><CardHeader><CardTitle>Récapitulatif de la source</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RecapField label="Nom" value={values.nom} />
        <RecapField label="Type" value={SOURCE_TYPE_LABEL[values.type]} />
        <RecapField label="URL de base" value={values.url} />
        <RecapField label="Domaines autorisés" value={values.domaines.join(", ")} />
      </CardContent>
    </Card>
  );
}
function RecapField({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col gap-1"><span className="text-[10px] tracking-[0.12em] text-ink-muted uppercase">{label}</span><span className="text-[13px] text-ink">{value || "—"}</span></div>;
}
