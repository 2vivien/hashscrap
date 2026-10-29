import { useQuery } from '@tanstack/react-query';
import { fetchSources } from '../api/sources.queries';

const SOURCES_QUERY_KEY = ['sources'];

export function useSources() {
  return useQuery({
    queryKey: SOURCES_QUERY_KEY,
    queryFn: fetchSources,
  });
}
