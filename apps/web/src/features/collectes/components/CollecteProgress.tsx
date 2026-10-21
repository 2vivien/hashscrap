import { Progress } from "../../../components/ui/progress";
import type { Collecte } from "../types/collectes.types";

export interface CollecteProgressProps {
  collecte: Collecte;
}

export function CollecteProgress({ collecte }: CollecteProgressProps) {
  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <Progress value={collecte.progress} className="flex-1" />
      <span className="mono w-9 text-right text-[12px] text-ink-secondary">
        {collecte.progress}%
      </span>
    </div>
  );
}
