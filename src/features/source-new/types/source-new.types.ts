export interface SourceFormData {
  nom: string;
  url: string;
  type: 'web' | 'api' | 'reseau';
  domaines: string[];
}

export interface ValidationStep {
  protocoleHttps: boolean;
  resolutionDns: boolean;
  accessibilite: boolean;
  maxPages: number;
}

export interface SourceNewResponse {
  success: boolean;
  message: string;
}
