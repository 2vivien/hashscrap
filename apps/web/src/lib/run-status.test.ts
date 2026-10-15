import { describe, expect, it } from "vitest";
import { RUN_STATUSES } from "./api";
import { describeRunStatus } from "./run-status";

describe("run status metadata", () => {
  it("maps the five statuses the backend accepts", () => {
    expect(RUN_STATUSES).toEqual(["queued", "running", "succeeded", "failed", "cancelled"]);
    expect(describeRunStatus("running").label).toBe("En cours");
    expect(describeRunStatus("succeeded").label).toBe("Terminée");
    expect(describeRunStatus("failed").label).toBe("Échouée");
    expect(describeRunStatus("cancelled").label).toBe("Annulée");
    expect(describeRunStatus("queued").label).toBe("En attente");
  });

  it("never invents a partial status absent from the run model", () => {
    // `partial` is a report status, not a crawl run status; it must not be mapped.
    const meta = describeRunStatus("partial");
    expect(meta.known).toBe(false);
    expect(meta.variant).toBe("unknown");
    expect(meta.label).toBe("partial");
  });

  it("surfaces an unknown value verbatim instead of guessing", () => {
    const meta = describeRunStatus("weird");
    expect(meta.known).toBe(false);
    expect(meta.label).toBe("weird");
  });

  it("always carries a textual label, never colour alone", () => {
    for (const status of RUN_STATUSES) {
      expect(describeRunStatus(status).label.length).toBeGreaterThan(0);
    }
  });
});
