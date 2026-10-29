import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { SOURCE_TYPE_LABEL, type SourceNewFormValues } from "../types/source-new.types";

export interface SourceNewRecapProps {
  values: SourceNewFormValues;
}

export function SourceNewRecap({ values }: SourceNewRecapProps) {
  const hosts = values.allowed_hosts
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Récapitulatif</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RecapField label="Nom" value={values.name} />
        <RecapField label="Type" value={SOURCE_TYPE_LABEL[values.type]} />
        <RecapField label="URL de base" value={values.base_url} />
        <RecapField label="Domaines autorisés" value={hosts.join(", ") || "—"} />
        <RecapField label="Pages max" value={String(values.limits.max_pages)} />
        <RecapField label="Profondeur max" value={String(values.limits.max_depth)} />
      </CardContent>
    </Card>
  );
}

function RecapField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] tracking-[0.12em] text-ink-muted uppercase">{label}</span>
      <span className="text-[13px] text-ink">{value}</span>
    </div>
  );
}
