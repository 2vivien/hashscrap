import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CollectesView } from "./CollectesView";

const baseRun = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  job_id: "550e8400-e29b-41d4-a716-446655440001",
  source_key: "example.org",
  status: "running",
  started_at: "2026-10-12T09:42:18Z",
  finished_at: null,
  fetched_count: 12,
  failed_count: 1,
  bytes_received: 4096,
};

function stubJson(payload: unknown): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CollectesView", () => {
  it("announces a loading state before data arrives", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    render(<CollectesView />);
    expect(screen.getByText("Chargement des collectes")).toBeTruthy();
  });

  it("renders a real row from the API response", async () => {
    stubJson([baseRun]);
    render(<CollectesView />);
    expect(await screen.findByText("example.org")).toBeTruthy();
    const table = screen.getByRole("table");
    // "En cours" appears both as the status label and as the duration of a run
    // with no `finished_at`; target the status badge by its contract value.
    const statusBadge = table.querySelector('[data-status="running"]');
    expect(statusBadge?.textContent).toContain("En cours");
    expect(within(table).getByText("12 pages · 1 échec")).toBeTruthy();
    expect(within(table).getByText("4.0 Ko")).toBeTruthy();
  });

  it("shows an empty state when the service answers with no run", async () => {
    stubJson([]);
    render(<CollectesView />);
    expect(await screen.findByText("Aucune collecte enregistrée")).toBeTruthy();
  });

  it("shows an honest error and no fabricated row when the API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("failed to fetch")));
    render(<CollectesView />);
    expect(await screen.findByText("Collectes indisponibles")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("retries on demand and then renders the rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValueOnce(new TypeError("down"))
        .mockResolvedValueOnce(new Response(JSON.stringify([baseRun]), { status: 200 })),
    );
    render(<CollectesView />);
    fireEvent.click(await screen.findByRole("button", { name: "Réessayer" }));
    expect(await screen.findByText("example.org")).toBeTruthy();
  });

  it("filters the loaded runs by status without inventing rows", async () => {
    stubJson([
      { ...baseRun, id: "aaaaaaaa-e29b-41d4-a716-446655440000", status: "succeeded", source_key: "ok.example" },
      { ...baseRun, id: "bbbbbbbb-e29b-41d4-a716-446655440000", status: "failed", source_key: "ko.example" },
    ]);
    render(<CollectesView />);
    await screen.findByText("ok.example");
    fireEvent.change(screen.getByLabelText("Filtrer par état"), { target: { value: "failed" } });
    expect(screen.getByText("ko.example")).toBeTruthy();
    expect(screen.queryByText("ok.example")).toBeNull();
  });

  it("renders an unknown status verbatim instead of inventing a known one", async () => {
    stubJson([{ ...baseRun, status: "partial", source_key: "s.example" }]);
    render(<CollectesView />);
    await screen.findByText("s.example");
    const table = screen.getByRole("table");
    // The run row keeps the raw value; it is not relabelled as a known status.
    expect(within(table).getByText("partial")).toBeTruthy();
    expect(within(table).queryByText("Terminée")).toBeNull();
    expect(within(table).queryByText("Échouée")).toBeNull();
    expect(table.querySelector('[data-status="succeeded"]')).toBeNull();
  });
});
