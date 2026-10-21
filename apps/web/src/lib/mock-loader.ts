import type { ZodType } from "zod";

/**
 * Load a JSON fixture and validate it against the feature contract.
 *
 * The fixtures are part of the build, so an invalid fixture fails the test
 * suite and the type-check instead of silently feeding the interface.
 */
export async function loadMock<T>(url: string, schema: ZodType<T>): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Mock fixture not found: ${url}`);
  }
  const payload: unknown = await response.json();
  return schema.parse(payload);
}
