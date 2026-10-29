export type SourceType = "web" | "api" | "reseau";

export type SourceNewStep = "informations" | "validation" | "recap";

export interface SourceNewLimits {
  timeout_seconds: number;
  concurrency: number;
  requests_per_second: number;
  max_depth: number;
  max_pages: number;
  max_response_bytes: number;
}

export interface SourceNewFormValues {
  name: string;
  type: SourceType;
  base_url: string;
  allowed_hosts: string;
  limits: SourceNewLimits;
}

export interface SourceNewChecklist {
  protocol_https: boolean;
  dns: boolean;
  accessibilite: boolean;
}

export const SOURCE_NEW_STEPS: Array<{ value: SourceNewStep; label: string }> = [
  { value: "informations", label: "Informations" },
  { value: "validation", label: "Validation" },
  { value: "recap", label: "Récapitulatif" },
];

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  web: "Site web",
  api: "API",
  reseau: "Réseau",
};
