import type { ZodType } from "zod";

const isServer = typeof document === "undefined";

/**
 * The server renders with an absolute URL: a relative path cannot be resolved
 * outside the browser. The browser goes through the dev proxy.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? (isServer ? "http://127.0.0.1:8000/api/v1" : "/api/v1");

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

async function readErrorDetails(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => undefined);
  }
  return response.text().catch(() => undefined);
}

/**
 * Call the versioned engine API and validate the payload with the given Zod contract.
 * HTTP errors preserve FastAPI's JSON detail (including validation errors) for the UI.
 */
export async function apiRequest<T>(
  path: string,
  schema: ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  const hasBody = options.body !== undefined;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    signal: options.signal,
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
    },
    ...(hasBody ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    const details = await readErrorDetails(response);
    const detailMessage =
      details && typeof details === "object" && "detail" in details
        ? JSON.stringify((details as { detail: unknown }).detail)
        : typeof details === "string" && details
          ? details
          : response.statusText;
    throw new ApiError(`API error ${response.status} on ${path}: ${detailMessage}`, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload: unknown = await response.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(`Invalid API payload on ${path}`, response.status, parsed.error.issues);
  }
  return parsed.data;
}
