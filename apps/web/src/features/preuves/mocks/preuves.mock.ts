import {
  PreuvesResponseSchema,
  type PreuvesResponse,
} from "../validators/preuves.schema";
import raw from "./preuves.mock.json";

/**
 * Typed view over the JSON fixture.
 *
 * The contract is applied at load time, so a fixture that drifts from the
 * schema fails the test suite instead of the interface.
 */
export const MOCK_PREUVES: PreuvesResponse = PreuvesResponseSchema.parse(raw);
