import { describe, expect, it } from "vitest";
import {
  formatBytes,
  formatDateTimeUtc,
  formatDuration,
  formatProcessing,
  shortId,
} from "./run-format";

describe("run formatting", () => {
  it("renders timestamps in UTC with an explicit suffix", () => {
    expect(formatDateTimeUtc("2026-10-12T09:42:18.000Z")).toContain("UTC");
    expect(formatDateTimeUtc("2026-10-12T09:42:18.000Z")).toContain("2026");
  });

  it("never invents a value for a missing timestamp", () => {
    expect(formatDateTimeUtc(null)).toBe("—");
    expect(formatDateTimeUtc(undefined)).toBe("—");
    expect(formatDateTimeUtc("not-a-date")).toBe("—");
  });

  it("shortens UUIDs without losing the prefix", () => {
    expect(shortId("550e8400-e29b-41d4-a716-446655440000")).toBe("550e8400");
    expect(shortId("abc")).toBe("abc");
  });

  it("formats byte sizes on a 1024 base", () => {
    expect(formatBytes(0)).toBe("0 o");
    expect(formatBytes(512)).toBe("512 o");
    expect(formatBytes(2048)).toBe("2.0 Ko");
    expect(formatBytes(1048576)).toBe("1.0 Mo");
    expect(formatBytes(-1)).toBe("—");
  });

  it("reports counts and failures instead of a fabricated progress bar", () => {
    expect(formatProcessing(1, 0)).toBe("1 page · 0 échecs");
    expect(formatProcessing(42, 3)).toBe("42 pages · 3 échecs");
  });

  it("says a run without finish time is still running", () => {
    expect(formatDuration("2026-10-12T09:40:00Z", null)).toBe("En cours");
    expect(formatDuration("2026-10-12T09:40:00Z", "2026-10-12T09:40:45Z")).toBe("45 s");
    expect(formatDuration("2026-10-12T09:40:00Z", "2026-10-12T09:42:14Z")).toBe("2 min 14 s");
    expect(formatDuration("2026-10-12T09:00:00Z", "2026-10-12T10:30:00Z")).toBe("1 h 30 min");
  });
});
