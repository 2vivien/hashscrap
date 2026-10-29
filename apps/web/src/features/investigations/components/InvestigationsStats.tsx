import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

interface InvestigationsStatsProps {
  // Add any props if needed
}

export function InvestigationsStats({}: InvestigationsStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Actives</span>
            <span className="mono">2</span>
          </div>
          <div className="flex justify-between">
            <span>Terminées</span>
            <span className="mono">1</span>
          </div>
          <div className="flex justify-between">
            <span>Total obs.</span>
            <span className="mono">4 567</span>
          </div>
          <div className="flex justify-between">
            <span>Entités</span>
            <span className="mono">156</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}