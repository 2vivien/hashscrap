import { describe, expect, it } from "vitest";

import { API_BASE_URL } from "./api.server";

describe("API base URL", () => {
  it("defaults to host loopback so the API is never reached on the LAN", () => {
    expect(API_BASE_URL).toBe("http://127.0.0.1:8000");
    expect(API_BASE_URL).not.toContain("0.0.0.0");
  });
});