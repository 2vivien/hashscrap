import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { formatDate } from "../../../lib/format";
import { EVENT_TYPE_LABEL, type ChronologieEvent } from "../types/chronologie.types";

interface ChronologieTimelineProps {
  events: ChronologieEvent[];
}

export function ChronologieTimeline({ events }: ChronologieTimelineProps) {
  const groupedEvents = events.reduce((acc, event) => {
    const date = formatDate(event.date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, ChronologieEvent[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedEvents).map(([date, events]) => (
        <div key={date} className="space-y-4">
          <h2 className="text-[15px] font-semibold text-ink">{date}</h2>
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-line" />
            {events.map((event) => (
              <div key={event.id} className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="grid size-5 place-items-center rounded-full bg-lime text-[#0b1204]">
                    <span className="text-[10px] font-bold">{event.heure}</span>
                  </div>
                  <Badge variant={getBadgeVariant(event.type)}>{EVENT_TYPE_LABEL[event.type]}</Badge>
                </div>
                <Card className="mt-2">
                  <CardContent className="p-4">
                    <h3 className="text-[13px] font-medium text-ink">{event.titre}</h3>
                    <p className="mt-1 text-[12px] text-ink-secondary">{event.description}</p>
                    {event.source ? (
                      <p className="mt-2 text-[11px] text-ink-muted">Source: {event.source}</p>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getBadgeVariant(type: string): string {
  switch (type) {
    case "collecte": return "lime";
    case "observation": return "blue";
    case "evenement": return "orange";
    case "preuve": return "green";
    case "relation": return "cyan";
    default: return "neutral";
  }
}