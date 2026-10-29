import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ParametresSchema, type ParametresPayload } from "../validators/parametres.schema";

interface CollecteurFormProps {
  initialData: ParametresPayload["collecteur"];
}

export function CollecteurForm({ initialData }: CollecteurFormProps) {
  const { register, handleSubmit } = useForm<ParametresPayload["collecteur"]>({
    resolver: zodResolver(ParametresSchema.shape.collecteur),
    defaultValues: initialData,
  });

  const onSubmit = (data: ParametresPayload["collecteur"]) => {
    console.log(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limites du collecteur</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requests_per_second">Requêtes / seconde</Label>
              <Input
                id="requests_per_second"
                type="number"
                step="0.1"
                min="0"
                max="10"
                {...register("requests_per_second")}
              />
            </div>
            <div>
              <Label htmlFor="depth">Profondeur max</Label>
              <Input
                id="depth"
                type="number"
                min="0"
                max="10"
                {...register("depth")}
              />
            </div>
            <div>
              <Label htmlFor="max_pages">Pages max / job</Label>
              <Input
                id="max_pages"
                type="number"
                min="0"
                max="10000"
                {...register("max_pages")}
              />
            </div>
            <div>
              <Label htmlFor="timeout">Timeout (secondes)</Label>
              <Input
                id="timeout"
                type="number"
                min="0"
                max="60"
                {...register("timeout")}
              />
            </div>
          </div>
          <Button type="submit" disabled title="Disponible quand l'API de sauvegarde sera exposée">
            Enregistrer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
