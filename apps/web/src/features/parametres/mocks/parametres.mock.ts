import {
  ParametresSchema,
  type ParametresPayload,
} from "../validators/parametres.schema";
import raw from "./parametres.mock.json";

/**
 * Typed view over the JSON fixture.
 *
 * The contract is applied at load time, so a fixture that drifts from the
 * schema fails the test suite instead of the interface.
 */
export const MOCK_PARAMETRES: ParametresPayload = ParametresSchema.parse(raw);
