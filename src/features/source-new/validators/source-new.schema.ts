import { z } from 'zod';

const SourceFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  url: z.string().url('URL invalide'),
  type: z.enum(['web', 'api', 'reseau'], {
    errorMap: () => ({ message: 'Type de source invalide' }),
  }),
  domaines: z.array(z.string().min(1, 'Domaine invalide')).min(1, 'Au moins un domaine est requis'),
});

const ValidationStepSchema = z.object({
  protocoleHttps: z.boolean(),
  resolutionDns: z.boolean(),
  accessibilite: z.boolean(),
  maxPages: z.number().min(1, 'Le nombre maximum de pages doit être au moins 1'),
});

export const SourceNewResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type SourceFormData = z.infer<typeof SourceFormSchema>;

export type ValidationStep = z.infer<typeof ValidationStepSchema>;

export type SourceNewResponse = z.infer<typeof SourceNewResponseSchema>;
