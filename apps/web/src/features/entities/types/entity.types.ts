export type EntityType = "organization" | "domain" | "ip" | "url";

export interface Entity {
  id: string;
  entity_type: EntityType;
  raw_identifier: string;
  normalized_identifier: string;
  normalization_method: string;
  review_status: "unreviewed" | "accepted_exact" | "needs_review" | "rejected";
  created_at: string;
}

export interface EntityFilters {
  entity_type?: EntityType;
  review_status?: "unreviewed" | "accepted_exact" | "needs_review" | "rejected";
}