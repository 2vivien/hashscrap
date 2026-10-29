import { z } from "zod";
import { CollecteSchema } from "../../collectes/validators/collectes.schema";

export const CollecteObservationsSchema = z.object({
  total: z.number().int().min(0),
  validated: z.number().int().min(0),
  rejected: z.number().int().min(0),
});

export const CollecteErreurSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  type: z.string().min(1),
  count: z.number().int().min(1),
});

export const CollecteEvenementSchema = z.object({
  at: z.string().min(1),
  label: z.string().min(1),
  detail: z.string().optional(),
});

export const CollecteDetailSchema = CollecteSchema.extend({
  observations: CollecteObservationsSchema,
  erreurs: z.array(CollecteErreurSchema),
  evenements: z.array(CollecteEvenementSchema),
});

export type CollecteDetail = z.infer<typeof CollecteDetailSchema>;