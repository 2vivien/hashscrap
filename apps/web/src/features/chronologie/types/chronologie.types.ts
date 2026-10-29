export type EventType = "collecte" | "observation" | "evenement" | "preuve" | "relation";
export interface ChronologieEvent {
  id: string; at: string; date: string; heure: string; type: EventType; titre: string; description: string; source: string;
}
export interface ChronologieFilters {
  startDate: string;
  endDate: string;
  type: EventType | "all";
}
export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  collecte: "Collecte", observation: "Observation", evenement: "Événement", preuve: "Preuve", relation: "Relation",
};
