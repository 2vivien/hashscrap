import { z } from "zod";

export const SourceTypeSchema = z.enum(["web", "api", "reseau"]);

export const SourceNewLimitsSchema = z.object({
  timeout_seconds: z.number().int().min(1).max(120),
  concurrency: z.number().int().min(1).max(16),
  requests_per_second: z.number().min(0.1).max(5),
  max_depth: z.number().int().min(0).max(10),
  max_pages: z.number().int().min(1).max(10_000),
  max_response_bytes: z.number().int().min(1).max(10_000_000),
});

export const SourceNewFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(120),
  type: SourceTypeSchema,
  base_url: z.url("L'URL de base doit être une URL absolue"),
  allowed_hosts: z
    .string()
    .min(1, "Au moins un domaine autorisé est requis")
    .refine(
      (value) =>
        value
          .split(",")
          .map((host) => host.trim())
          .filter(Boolean)
          .every((host) => !host.includes("/") && !host.includes("@")),
      "Les domaines autorisés ne doivent contenir que des noms d'hôte",
    ),
  limits: SourceNewLimitsSchema,
});

export const SourceNewDefaultsSchema = z.object({
  limits: SourceNewLimitsSchema,
  checklist: z.object({
    protocol_https: z.boolean(),
    dns: z.boolean(),
    accessibilite: z.boolean(),
  }),
});

export const ParametresSchema = z.object({
  collecteur: z.object({
    requests_per_second: z.number(),
    depth: z.number().int(),
    max_pages: z.number().int(),
    timeout: z.number().int(),
  }),
});

export type SourceNewFormPayload = z.infer<typeof SourceNewFormSchema>;
export type SourceNewDefaults = z.infer<typeof SourceNewDefaultsSchema>;
