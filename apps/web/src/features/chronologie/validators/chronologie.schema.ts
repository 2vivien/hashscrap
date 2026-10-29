import { z } from "zod";

export const EventTypeSchema = z.enum(["collecte", "observation", "evenement", "preuve", "relation"]);

export const ChronologieEventSchema = z.object({
  id: z.string().min(1),
  at: z.string().min(1),
  date: z.string().min(1),
  heure: z.string().min(1),
  type: EventTypeSchema,
  titre: z.string().min(1),
  description: z.string().min(1),
  source: z.string(),
});

export const ChronologieResponseSchema = z.object({
  items: z.array(ChronologieEventSchema),
  total: z.number().int().min(0),
});

export type ChronologieEventPayload = z.infer<typeof ChronologieEventSchema>;
export type ChronologieResponse = z.infer<typeof ChronologieResponseSchema>;

