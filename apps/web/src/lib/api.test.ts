import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchRuns, isAbortError, runsEndpoint } from "./api";

const run = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  job_id: "550e8400-e29b-41d4-a716-446655440001",
  source_key: "example.org",
  status: "succeeded",
  started_at: "2026-10-12T09:00:00Z",
  finished_at: "2026-10-12T09:01:00Z",
  fetched_count: 3,
  failed_count: 0,
  bytes_received: 2048,
};

describe("api client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("builds a bounded runs URL on the same origin by default", () => {
    expect(runsEndpoint(20)).toBe("/api/v1/runs?limit=20");
  });

  it("returns the parsed runs from a 200 response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([run]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchRuns(20)).resolves.toEqual([run]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/runs?limit=20",
      expect.objectContaining({ headers: { accept: "application/json" } }),
    );
  });

  it("turns a network failure into an honest ApiError, never a fake payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("failed to fetch")));
    await expect(fetchRuns(20)).rejects.toBeInstanceOf(ApiError);
  });

  it("reports the HTTP status when the service errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 503, statusText: "Service Unavailable" })),
    );
    await expect(fetchRuns(20)).rejects.toThrow(/503/);
  });

  it("rejects a payload that does not match the contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 })),
    );
    await expect(fetchRuns(20)).rejects.toBeInstanceOf(ApiError);
  });

  it("recognises abort errors so unmounts are not shown as failures", () => {
    expect(isAbortError(new DOMException("aborted", "AbortError"))).toBe(true);
    expect(isAbortError(new Error("boom"))).toBe(false);
  });
});
