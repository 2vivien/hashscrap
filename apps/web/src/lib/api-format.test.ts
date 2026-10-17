import { describe, expect, it } from "vitest";

import { formatBytes, formatDateTime, runLabel, runTone, shortHash } from "./api-format";

describe("run status presentation", () => {
  it("pairs every status with a French label", () => {
    expect(runLabel("succeeded")).toBe("Terminée");
    expect(runLabel("failed")).toBe("Échouée");
    expect(runLabel("running")).toBe("En cours");
    expect(runLabel("queued")).toBe("En attente");
    expect(runLabel("cancelled")).toBe("Annulée");
  });

  it("keeps an unknown status visible instead of hiding it", () => {
    expect(runLabel("weird_state")).toBe("weird_state");
    expect(runTone("weird_state")).toBe("neutral");
  });

  it("maps tones for known statuses", () => {
    expect(runTone("succeeded")).toBe("success");
    expect(runTone("failed")).toBe("error");
    expect(runTone("running")).toBe("warning");
    expect(runTone("queued")).toBe("warning");
  });
});

describe("formatters", () => {
  it("formats byte counts without inventing precision", () => {
    expect(formatBytes(0)).toBe("0 o");
    expect(formatBytes(577)).toBe("577 o");
    expect(formatBytes(2048)).toBe("2.0 Ko");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 Mo");
  });

  it("shows an explicit dash for missing values", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime("not-a-date")).toBe("—");
    expect(shortHash(null)).toBe("—");
  });

  it("shortens long fingerprints only", () => {
    expect(shortHash("abc")).toBe("abc");
    expect(shortHash("a".repeat(64))).toBe(`${"a".repeat(12)}…`);
  });

  it("formats timestamps in UTC", () => {
    const formatted = formatDateTime("2026-10-12T10:00:00Z");
    expect(formatted).not.toBe("—");
    expect(formatted).toMatch(/2026/);
  });
});