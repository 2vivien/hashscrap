import {
  EntityDetailResponseSchema,
  type EntityDetailResponse,
} from "../validators/entity-detail.schema";
import raw from "./entity-detail.mock.json";

/** Typed view over the JSON fixture. */
export const MOCK_ENTITY_DETAIL: EntityDetailResponse = EntityDetailResponseSchema.parse(raw);