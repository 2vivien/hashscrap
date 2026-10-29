import { AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { type Parametres } from "../types/parametres.types";

interface SecuriteFormProps {
  initialData: Parametres["securite"];
}

export function SecuriteForm({ initialData }: SecuriteFormProps) {
  const warning = initialData.reset_warning;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sécurité</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-[10px] border border-red/30 bg-red-dim p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 text-red" />
            <p className="text-[12px] text-ink-secondary">{warning}
              La réinitialisation supprime toutes les collectes et preuves. Action irréversible.
            </p>
          </div>
        </div>

        <Button
          variant="danger"
          disabled
          title="Disponible quand l'API de réinitialisation sera exposée"
        >
          Réinitialiser le moteur
        </Button>
      </CardContent>
    </Card>
  );
}
