import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

interface PointsAttentionCardProps {
  points: string[];
}

export function PointsAttentionCard({ points }: PointsAttentionCardProps) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Points d'attention</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {points.map((point, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 text-red">•</span>
              <span className="text-sm">{point}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
