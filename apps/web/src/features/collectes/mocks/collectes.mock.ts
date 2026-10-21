import {
  CollectesResponseSchema,
  type CollectesResponse,
} from "../validators/collectes.schema";
import raw from "./collectes.mock.json";

/**
 * Typed view over the JSON fixture.
 *
 * The contract is applied at load time, so a fixture that drifts from the
 * schema fails the test suite instead of the interface.
 */
export const MOCK_COLLECTES: CollectesResponse = CollectesResponseSchema.parse(raw);
