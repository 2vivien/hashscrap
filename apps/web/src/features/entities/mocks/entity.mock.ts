import type { Entity } from "../types/entity.types";

export const MOCK_ENTITIES: Entity[] = [
  {
    id: "ent-2025-04-001",
    entity_type: "domain",
    raw_identifier: "example.com",
    normalized_identifier: "example.com",
    normalization_method: "domain_idna_lowercase",
    review_status: "accepted_exact",
    created_at: "2025-04-01T10:00:00Z",
  },
  {
    id: "ent-2025-04-002",
    entity_type: "ip",
    raw_identifier: "192.168.1.1",
    normalized_identifier: "192.168.1.1",
    normalization_method: "ipaddress_compressed",
    review_status: "unreviewed",
    created_at: "2025-04-05T14:30:00Z",
  },
];
