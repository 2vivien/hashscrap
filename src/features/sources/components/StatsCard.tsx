import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

interface StatsCardProps {
  validees: number;
  total: number;
  tauxSucces: number;
}

export function StatsCard({ validees, total, tauxSucces }: StatsCardProps) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Statistiques</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Validées</span>
            <span className="text-sm font-medium">{validees}/{total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Taux succès</span>
            <span className="text-sm font-medium">{tauxSucces}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
