import type { Entity, EntityObservation, EntityRelation } from "../types/entity-detail.types";

export const MOCK_ENTITY: Entity = {
  id: "ent-2025-04-001",
  entity_type: "domain",
  raw_identifier: "example.com",
  normalized_identifier: "example.com",
  normalization_method: "domain_idna_lowercase",
  review_status: "accepted_exact",
  created_at: "2025-04-01T10:00:00Z",
};

export const MOCK_ENTITY_OBSERVATIONS: EntityObservation[] = [
  {
    id: "obs-001",
    champ: "email",
    valeur_brute: "john.doe@company.com",
    valeur_normalisee: "john.doe@company.com",
    extracteur: "hashscrap-html",
    version_extracteur: "1",
    evidence_ref: "css:a[href]:0",
    validation_status: "validated",
  },
  {
    id: "obs-002",
    champ: "telephone",
    valeur_brute: "+33123456789",
    valeur_normalisee: "+33 1 23 45 67 89",
    extracteur: "hashscrap-html",
    version_extracteur: "1",
    evidence_ref: "css:a[href]:1",
    validation_status: "unreviewed",
  },
];

export const MOCK_ENTITY_RELATIONS: EntityRelation[] = [
  {
    id: "rel-001",
    source: "example.com",
    target: "company.com",
    type: "domain",
    review_status: "needs_review",
  },
  {
    id: "rel-002",
    source: "192.168.1.1",
    target: "mail.server.com",
    type: "ip",
    review_status: "unreviewed",
  },
];

export const MOCK_ENTITY_SOURCE_IDS = ["s-2025-04-001", "s-2025-04-002", "s-2025-04-003"];
