import {
  SourceNewDefaultsSchema,
  type SourceNewDefaults,
} from "../validators/source-new.schema";
import raw from "./source-new.mock.json";

/** Typed view over the JSON fixture, validated against the contract. */
export const MOCK_SOURCE_NEW_DEFAULTS: SourceNewDefaults = SourceNewDefaultsSchema.parse(raw);
