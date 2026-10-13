import { describe, expect, it } from "vitest";

import {
  HOME_LABEL,
  getBreadcrumbLabel,
  getSectionConfig,
  isKnownSection,
  isSourceOrCollection,
  navGroups,
  sectionFromPathname,
  settingsNavItem,
} from "../lib/sections";

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
    expect(isKnownSection("unknown")).toBe(false);
  });
});

describe("navigation registry", () => {
  it("only references sections that have a configuration", () => {
    const items = [...navGroups.flatMap((group) => group.items), settingsNavItem];
    for (const item of items) {
      if (item.section === "") continue;
      expect(isKnownSection(item.section)).toBe(true);
      expect(getSectionConfig(item.section).title).not.toBe("Vue indisponible");
      expect(item.href).toBe(`/${item.section}`);
    }
  });

  it("gives every navigation item a label and a decorative icon", () => {
    const items = [...navGroups.flatMap((group) => group.items), settingsNavItem];
    for (const item of items) {
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it("maps pathnames to sections", () => {
    expect(sectionFromPathname("/")).toBe("");
    expect(sectionFromPathname("/sources")).toBe("sources");
    expect(sectionFromPathname("/sources/")).toBe("sources");
    expect(sectionFromPathname("/rapports/xyz")).toBeUndefined();
  });
});

describe("breadcrumb labels", () => {
  it("uses declared labels instead of raw URL slugs", () => {
    expect(getBreadcrumbLabel("/")).toBe(HOME_LABEL);
    expect(getBreadcrumbLabel("/entites")).toBe("Entités & relations");
    expect(getBreadcrumbLabel("/preuves")).toBe("Preuves");
  });

  it("never leaks an unaccented slug", () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.section === "") continue;
        expect(getBreadcrumbLabel(item.href)).not.toBe(item.section);
      }
    }
  });

  it("reports unknown routes explicitly", () => {
    expect(getBreadcrumbLabel("/inconnu")).toBe("Vue indisponible");
    expect(getBreadcrumbLabel("/rapports/42")).toBe("Page inconnue");
  });
});