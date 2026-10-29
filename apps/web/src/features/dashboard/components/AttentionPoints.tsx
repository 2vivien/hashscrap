import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export interface AttentionPointsProps {
  points: string[];
}

export function AttentionPoints({ points }: AttentionPointsProps) {
  return (
    <Card className="border-orange/30 bg-orange-dim">
      <CardHeader className="border-orange/20">
        <CardTitle className="flex items-center gap-2 text-orange">
          <AlertTriangle className="size-4" />
          Points d'attention
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {points.map((point) => (
            <li key={point} className="text-[12px] text-ink-secondary">
              • {point}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
