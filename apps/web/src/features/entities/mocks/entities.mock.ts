import {
  EntitiesResponseSchema,
  type EntitiesResponse,
} from "../validators/entities.schema";
import raw from "./entities.mock.json";

/** Typed view over the JSON fixture. */
export const MOCK_ENTITIES: EntitiesResponse = EntitiesResponseSchema.parse(raw);