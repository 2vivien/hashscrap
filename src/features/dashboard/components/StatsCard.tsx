import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';

interface StatsCardProps {
  title: string;
  value: number;
  delta: number;
  progress?: number;
}

export function StatsCard({ title, value, delta, progress }: StatsCardProps) {
  const deltaColor = delta >= 0 ? 'text-green' : 'text-red';
  const deltaSign = delta >= 0 ? '+' : '';

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          <Badge variant={delta >= 0 ? 'green' : 'red'} className="text-xs">
            {deltaSign}{delta}
          </Badge>
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="mt-2" />
        )}
      </CardContent>
    </Card>
  );
}
