import { z } from "zod";

/** Exact source creation fields and limits from SourceCreateIn. */
export const SourceTypeSchema = z.enum(["web", "api", "reseau"]);
export const SourceNewFormSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est obligatoire").max(120),
  url: z.string().trim().min(1, "L’URL est obligatoire").max(4096),
  type: SourceTypeSchema,
  domaines: z.array(z.string().trim().min(1)).min(1, "Ajoutez au moins un domaine autorisé"),
}).strict();
export type SourceNewFormPayload = z.infer<typeof SourceNewFormSchema>;
