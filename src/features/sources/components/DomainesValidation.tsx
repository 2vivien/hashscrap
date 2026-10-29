import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

interface DomainesValidationProps {
  domaines: string[];
}

export function DomainesValidation({ domaines }: DomainesValidationProps) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Validation des domaines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {domaines.map((domaine, index) => (
            <Badge key={index} variant="neutral" className="text-sm">
              {domaine}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
