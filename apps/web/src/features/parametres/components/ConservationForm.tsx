import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/toggle-group";
import { Switch } from "../../../components/ui/switch";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { CONSERVATION_LABELS } from "../types/parametres.types";
import type { ParametresPayload } from "../validators/parametres.schema";

interface Props { initialData: ParametresPayload["conservation"]; onSave: (value: ParametresPayload["conservation"]) => Promise<void>; }
export function ConservationForm({ initialData, onSave }: Props) {
  const [value, setValue] = useState(initialData);
  const [saving, setSaving] = useState(false);
  useEffect(() => setValue(initialData), [initialData]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try { await onSave(value); } finally { setSaving(false); }
  }
  return <Card><CardHeader><CardTitle>Rétention</CardTitle></CardHeader><CardContent>
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2"><Label>Durée de conservation des preuves</Label>
        <ToggleGroup type="single" value={value.preuves} onValueChange={(v) => { if (v === "90" || v === "365" || v === "illimite") setValue((current) => ({ ...current, preuves: v })); }}>
          <ToggleGroupItem value="90">{CONSERVATION_LABELS.preuves["90"]}</ToggleGroupItem><ToggleGroupItem value="365">{CONSERVATION_LABELS.preuves["365"]}</ToggleGroupItem><ToggleGroupItem value="illimite">{CONSERVATION_LABELS.preuves.illimite}</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex items-center gap-3"><Switch id="auto-suppression" checked={value.auto_suppression_logs.active} onCheckedChange={(checked) => setValue((current) => ({ ...current, auto_suppression_logs: { ...current.auto_suppression_logs, active: checked } }))} /><Label htmlFor="auto-suppression">Activer l’auto-suppression des logs</Label></div>
      <div className="max-w-xs space-y-1.5"><Label htmlFor="auto-suppression-jours">Délai (jours)</Label><Input id="auto-suppression-jours" type="number" min={0} max={365} value={value.auto_suppression_logs.jours} onChange={(e) => setValue((current) => ({ ...current, auto_suppression_logs: { ...current.auto_suppression_logs, jours: Number(e.target.value) } }))} required /></div>
      <Button type="submit" variant="primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
    </form>
  </CardContent></Card>;
}
