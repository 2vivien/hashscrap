import { z } from "zod";
import { CollecteSchema } from "../../collectes/validators/collectes.schema";
export const CollecteObservationsSchema = z.object({
  total: z.number().int().min(0), validated: z.number().int().min(0), rejected: z.number().int().min(0),
}).strict();
export const CollecteErreurSchema = z.object({ code: z.string(), message: z.string(), type: z.string(), count: z.number().int().min(0) }).strict();
export const CollecteEvenementSchema = z.object({ at: z.string().datetime({ offset: true }), label: z.string(), detail: z.string() }).strict();
export const CollecteDetailSchema = CollecteSchema.extend({
  observations: CollecteObservationsSchema, erreurs: z.array(CollecteErreurSchema), evenements: z.array(CollecteEvenementSchema),
}).strict();
export type CollecteDetail = z.infer<typeof CollecteDetailSchema>;
