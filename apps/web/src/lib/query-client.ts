import { QueryClient } from "@tanstack/react-query";

/**
 * Create one query client per application instance.
 *
 * The root route calls this inside a state initializer so the browser keeps a
 * single cache while server rendering creates one client per request.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}
