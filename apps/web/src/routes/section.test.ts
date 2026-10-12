import { describe, expect, it } from "vitest";
import { getSectionConfig, isSourceOrCollection } from "../lib/sections";

describe("section metadata", () => {
  it("explains that source and collection APIs are not connected", () => {
    expect(getSectionConfig("sources").detail).toContain("API");
    expect(getSectionConfig("collectes").detail).toContain("API");
    expect(isSourceOrCollection("sources")).toBe(true);
    expect(isSourceOrCollection("collectes")).toBe(true);
  });

  it("provides an explicit fallback for unimplemented routes", () => {
    expect(getSectionConfig("unknown").title).toBe("Vue indisponible");
    expect(isSourceOrCollection("unknown")).toBe(false);
  });
});
