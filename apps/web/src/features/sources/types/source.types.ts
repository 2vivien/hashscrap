export type SourceType = "website" | "api" | "network";

export interface SourceLimits {
  timeout_seconds: number;
  concurrency: number;
  requests_per_second: number;
  max_depth: number;
  max_pages: number;
  max_response_bytes: number;
}

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  base_url: string;
  enabled: boolean;
  allowed_hosts: string[];
  limits: SourceLimits;
  created_at?: string;
}

export interface SourceFormValues {
  name: string;
  type: SourceType;
  base_url: string;
  enabled: boolean;
  allowed_hosts: string[];
  limits: SourceLimits;
}

export interface SourceFilters {
  search?: string;
  enabled?: boolean;
  type?: SourceType;
}
