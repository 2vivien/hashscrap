import {
  InvestigationsResponseSchema,
  type InvestigationsResponse,
} from "../validators/investigations.schema";
import raw from "./investigations.mock.json";

/**
 * Typed view over the JSON fixture.
 *
 * The contract is applied at load time, so a fixture that drifts from the
 * schema fails the test suite instead of the interface.
 */
export const MOCK_INVESTIGATIONS: InvestigationsResponse = InvestigationsResponseSchema.parse(raw);