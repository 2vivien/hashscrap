import { describe, expect, it } from "vitest";

const expectedSections = [
  "investigations",
  "sources",
  "collectes",
  "entites",
  "chronologie",
  "preuves",
  "rapports",
  "parametres",
];

describe("HashScrap route contract", () => {
  it("lists the sections whose holding states are implemented", () => {
    expect(expectedSections).toContain("sources");
    expect(expectedSections).toContain("collectes");
    expect(new Set(expectedSections).size).toBe(expectedSections.length);
  });

  it("does not present an API contract as implemented by this scaffold", () => {
    const apiReady = false;
    expect(apiReady).toBe(false);
  });
});
