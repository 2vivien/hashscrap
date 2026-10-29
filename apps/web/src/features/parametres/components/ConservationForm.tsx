import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/toggle-group";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { CONSERVATION_LABELS, type Parametres } from "../types/parametres.types";

interface ConservationFormProps {
  initialData: Parametres["conservation"];
}

export function ConservationForm({ initialData }: ConservationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rétention</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-2 block">Conservation preuves</Label>
          <ToggleGroup type="single" value={initialData.preuves} disabled>
            <ToggleGroupItem value="90" aria-label={CONSERVATION_LABELS.preuves["90"]}>
              {CONSERVATION_LABELS.preuves["90"]}
            </ToggleGroupItem>
            <ToggleGroupItem value="365" aria-label={CONSERVATION_LABELS.preuves["365"]}>
              {CONSERVATION_LABELS.preuves["365"]}
            </ToggleGroupItem>
            <ToggleGroupItem value="illimite" aria-label={CONSERVATION_LABELS.preuves.illimite}>
              {CONSERVATION_LABELS.preuves.illimite}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex items-center gap-4">
          <Switch
            id="auto-suppression"
            checked={initialData.auto_suppression_logs.active}
            disabled
          />
          <Label htmlFor="auto-suppression" className="flex-1">
            Auto-suppression logs
            <span className="block text-[12px] text-ink-secondary">Activé • {initialData.auto_suppression_logs.jours} jours</span>
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
