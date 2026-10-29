import {
  ChronologieResponseSchema,
  type ChronologieResponse,
} from "../validators/chronologie.schema";
import raw from "./chronologie.mock.json";

/** Typed view over the JSON fixture. */
export const MOCK_CHRONOLOGIE: ChronologieResponse = ChronologieResponseSchema.parse(raw);