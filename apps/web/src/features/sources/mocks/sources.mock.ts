import { SourcesResponseSchema, type SourcesResponse } from "../validators/sources.schema";
import raw from "./sources.mock.json";

/** Typed view over the JSON fixture, validated against the contract. */
export const MOCK_SOURCES: SourcesResponse = SourcesResponseSchema.parse(raw);
