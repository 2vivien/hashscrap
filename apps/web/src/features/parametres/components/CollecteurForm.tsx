import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { ParametresPayload } from "../validators/parametres.schema";

interface Props {
  initialData: ParametresPayload["collecteur"];
  onSave: (value: ParametresPayload["collecteur"]) => Promise<void>;
}
export function CollecteurForm({ initialData, onSave }: Props) {
  const [value, setValue] = useState(initialData);
  const [saving, setSaving] = useState(false);
  useEffect(() => setValue(initialData), [initialData]);
  function numberField(key: keyof typeof value, raw: string) {
    setValue((current) => ({ ...current, [key]: raw === "" ? 0 : Number(raw) }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try { await onSave(value); } finally { setSaving(false); }
  }
  return (
    <Card><CardHeader><CardTitle>Limites du collecteur</CardTitle></CardHeader><CardContent>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="requests_per_second">Requêtes / seconde</Label><Input id="requests_per_second" type="number" step="0.1" value={value.requests_per_second} onChange={(e) => numberField("requests_per_second", e.target.value)} required /></div>
          <div className="space-y-1.5"><Label htmlFor="depth">Profondeur</Label><Input id="depth" type="number" step="1" value={value.depth} onChange={(e) => numberField("depth", e.target.value)} required /></div>
          <div className="space-y-1.5"><Label htmlFor="max_pages">Pages max / job</Label><Input id="max_pages" type="number" step="1" value={value.max_pages} onChange={(e) => numberField("max_pages", e.target.value)} required /></div>
          <div className="space-y-1.5"><Label htmlFor="timeout">Timeout (secondes)</Label><Input id="timeout" type="number" step="1" value={value.timeout} onChange={(e) => numberField("timeout", e.target.value)} required /></div>
        </div>
        <p className="text-xs text-ink-muted">Les clés envoyées sont exactement requests_per_second, depth, max_pages et timeout.</p>
        <Button type="submit" variant="primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
      </form>
    </CardContent></Card>
  );
}
