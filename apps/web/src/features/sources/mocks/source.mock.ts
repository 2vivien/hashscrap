import type { Source } from "../types/source.types";

export const MOCK_SOURCES: Source[] = [
  {
    id: "s-2025-04-001",
    name: "HashCode Blog",
    type: "website",
    base_url: "https://blog.hashcode.int",
    enabled: true,
    allowed_hosts: ["blog.hashcode.int"],
    limits: {
      timeout_seconds: 10,
      concurrency: 2,
      requests_per_second: 1.0,
      max_depth: 2,
      max_pages: 100,
      max_response_bytes: 1_000_000,
    },
    created_at: "2025-04-01T10:00:00Z",
  },
  {
    id: "s-2025-04-002",
    name: "Security News",
    type: "api",
    base_url: "https://news.hashcode.int/api",
    enabled: false,
    allowed_hosts: ["news.hashcode.int"],
    limits: {
      timeout_seconds: 15,
      concurrency: 3,
      requests_per_second: 2.0,
      max_depth: 3,
      max_pages: 500,
      max_response_bytes: 5_000_000,
    },
    created_at: "2025-04-05T14:30:00Z",
  },
  {
    id: "s-2025-04-003",
    name: "Network Scans",
    type: "network",
    base_url: "https://scan.hashcode.int",
    enabled: true,
    allowed_hosts: ["scan.hashcode.int"],
    limits: {
      timeout_seconds: 30,
      concurrency: 5,
      requests_per_second: 1.5,
      max_depth: 5,
      max_pages: 5000,
      max_response_bytes: 10_000_000,
    },
    created_at: "2025-04-10T09:15:00Z",
  },
];

export const MOCK_SOURCE_FORM: Source = MOCK_SOURCES[0];