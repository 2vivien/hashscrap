import {
  RapportsResponseSchema,
  type RapportsResponse,
} from "../validators/rapports.schema";
import raw from "./rapports.mock.json";

/**
 * Typed view over the JSON fixture.
 *
 * The contract is applied at load time, so a fixture that drifts from the
 * schema fails the test suite instead of the interface.
 */
export const MOCK_RAPPORTS: RapportsResponse = RapportsResponseSchema.parse(raw);
