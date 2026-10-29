import { SourcesResponseSchema } from '../validators/sources.schema';
import raw from './sources.mock.json';

export const MOCK_SOURCES = SourcesResponseSchema.parse(raw);
