export type SourceNewStep = "informations" | "validation" | "recap";

export interface SourceNewStep1 {
  name: string;
  type: "website" | "api" | "network";
  base_url: string;
}

export interface SourceNewStep2 {
  allowed_hosts: string[];
  checklist: {
    protocol_https: boolean;
    dns: boolean;
    accesibilite_ok: boolean;
  };
}

export interface SourceNewStep3 {
  max_pages: number;
  concurrency: number;
}

export interface SourceNewFormValues {
  step: SourceNewStep;
  step1: SourceNewStep1;
  step2: SourceNewStep2;
  step3: SourceNewStep3;
}