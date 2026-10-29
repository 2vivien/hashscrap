import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { type Parametres } from "../types/parametres.types";

interface ReseauFormProps {
  initialData: Parametres["reseau"];
}

export function ReseauForm({ initialData }: ReseauFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Réseau et périmètre</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="proxy">Proxy sortant</Label>
          <Input id="proxy" value={initialData.proxy} readOnly />
        </div>

        <div className="flex items-center gap-4">
          <Switch id="user-agent" checked={initialData.user_agent_rotation} disabled />
          <Label htmlFor="user-agent">User-Agent rotation</Label>
        </div>

        <div className="flex items-center gap-4">
          <Switch id="robots-txt" checked={initialData.robots_txt} disabled />
          <Label htmlFor="robots-txt">Respect robots.txt</Label>
        </div>
      </CardContent>
    </Card>
  );
}
