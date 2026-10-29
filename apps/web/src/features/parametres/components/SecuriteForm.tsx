import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import type { ParametresPayload } from "../validators/parametres.schema";

interface Props { initialData: ParametresPayload["securite"]; onSave: (value: ParametresPayload["securite"]) => Promise<void>; }
export function SecuriteForm({ initialData, onSave }: Props) {
  const [value, setValue] = useState(initialData);
  const [saving, setSaving] = useState(false);
  useEffect(() => setValue(initialData), [initialData]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try { await onSave(value); } finally { setSaving(false); }
  }
  return <Card><CardHeader><CardTitle>Sécurité</CardTitle></CardHeader><CardContent>
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-[10px] border border-red/30 bg-red-dim p-4"><div className="flex items-start gap-2"><AlertTriangle className="size-4 text-red" /><p className="text-[12px] text-ink-secondary">Ce réglage configure l’avertissement de sécurité. L’API actuelle n’expose pas de route de réinitialisation du moteur.</p></div></div>
      <div className="flex items-center gap-3"><Switch id="reset-warning" checked={value.reset_warning} onCheckedChange={(checked) => setValue({ reset_warning: checked })} /><Label htmlFor="reset-warning">Afficher l’avertissement avant une réinitialisation</Label></div>
      <Button type="submit" variant="primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
    </form>
  </CardContent></Card>;
}
