import { SourcesResponseSchema } from '../validators/sources.schema';
import { MOCK_SOURCES } from '../mocks/sources.mock';
import { apiRequest } from '../../../lib/api-client';
import { isMockSource } from '../../../lib/data-source';

export async function fetchSources(signal?: AbortSignal) {
  if (isMockSource()) return MOCK_SOURCES;
  return apiRequest('/sources', SourcesResponseSchema, { signal });
}
