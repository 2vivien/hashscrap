import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Activite } from '../types/dashboard.types';

interface ActiviteCardProps {
  activites: Activite[];
}

export function ActiviteCard({ activites }: ActiviteCardProps) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activites.map((activite) => (
            <li key={activite.id} className="flex">
              <div className="flex-shrink-0 w-12 text-sm text-ink-muted">
                {activite.at}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium">{activite.titre}</div>
                <div className="text-sm text-ink-secondary">{activite.detail}</div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
