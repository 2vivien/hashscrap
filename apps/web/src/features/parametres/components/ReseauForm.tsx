import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import type { ParametresPayload } from "../validators/parametres.schema";

interface Props { initialData: ParametresPayload["reseau"]; onSave: (value: ParametresPayload["reseau"]) => Promise<void>; }
export function ReseauForm({ initialData, onSave }: Props) {
  const [value, setValue] = useState(initialData);
  const [saving, setSaving] = useState(false);
  useEffect(() => setValue(initialData), [initialData]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try { await onSave(value); } finally { setSaving(false); }
  }
  return <Card><CardHeader><CardTitle>Réseau et périmètre</CardTitle></CardHeader><CardContent>
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5"><Label htmlFor="proxy">Proxy sortant</Label><Input id="proxy" value={value.proxy} onChange={(e) => setValue((v) => ({ ...v, proxy: e.target.value }))} /></div>
      <div className="flex items-center gap-3"><Switch id="user-agent" checked={value.user_agent_rotation} onCheckedChange={(checked) => setValue((v) => ({ ...v, user_agent_rotation: checked }))} /><Label htmlFor="user-agent">Rotation du User-Agent</Label></div>
      <div className="flex items-center gap-3"><Switch id="robots-txt" checked={value.robots_txt} onCheckedChange={(checked) => setValue((v) => ({ ...v, robots_txt: checked }))} /><Label htmlFor="robots-txt">Respecter robots.txt</Label></div>
      <Button type="submit" variant="primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
    </form>
  </CardContent></Card>;
}
