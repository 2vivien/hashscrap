import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { formatDateTime } from "../../../lib/format";
import type { ActivityItem, ActivityType } from "../types/dashboard.types";

export interface ActivityFeedProps {
  items: ActivityItem[];
}

const DOT: Record<ActivityType, string> = {
  collecte: "bg-blue",
  observation: "bg-lime",
  source: "bg-green",
  rapport: "bg-cyan",
  erreur: "bg-red",
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${DOT[item.type]}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-ink">{item.titre}</p>
              <p className="truncate text-[12px] text-ink-muted">{item.detail}</p>
            </div>
            <span className="mono shrink-0 text-[11px] text-ink-muted">{formatDateTime(item.at)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
