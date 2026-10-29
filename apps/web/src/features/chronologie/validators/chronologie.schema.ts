import { z } from "zod";
export const EventTypeSchema = z.enum(["collecte", "observation", "evenement", "preuve", "relation"]);
export const ChronologieEventSchema = z.object({
  id: z.string(), at: z.string().datetime({ offset: true }), date: z.string().date(), heure: z.string(),
  type: EventTypeSchema, titre: z.string(), description: z.string(), source: z.string(),
}).strict();
export const ChronologieResponseSchema = z.object({ items: z.array(ChronologieEventSchema), total: z.number().int().min(0) }).strict();
export type ChronologieEventPayload = z.infer<typeof ChronologieEventSchema>;
export type ChronologieResponse = z.infer<typeof ChronologieResponseSchema>;
