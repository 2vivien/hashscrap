import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { InlineAlert } from "./InlineAlert";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";

describe("InlineAlert", () => {
  it("announces the message as a status", () => {
    render(
      <InlineAlert tone="warning" title="Fonction non connectée">
        Aucune API exposée.
      </InlineAlert>,
    );
    const alert = screen.getByRole("status");
    expect(alert).toHaveTextContent("Fonction non connecté");
    expect(alert).toHaveTextContent("Aucune API exposée.");
  });

  it("keeps the tone in the class name so colour is never the only signal", () => {
    const { container } = render(
      <InlineAlert tone="error" title="Échec de collecte">
        Motif : source invalide.
      </InlineAlert>,
    );
    expect(container.querySelector(".notice--error")).not.toBeNull();
    expect(screen.getByText("Échec de collecte")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders the title, description and actions", () => {
    render(
      <EmptyState
        eyebrow="PRÊT POUR L’INTÉGRATION"
        title="Les données apparaîtront ici"
        description="Aucun exemple n’est affiché."
        actions={<button type="button">Voir les sources</button>}
      />,
    );
    expect(screen.getByRole("heading", { name: "Les données apparaîtront ici" })).toBeInTheDocument();
    expect(screen.getByText("PRÊT POUR L’INTÉGRATION")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voir les sources" })).toBeInTheDocument();
  });

  it("hides the decorative symbol from assistive technology", () => {
    const { container } = render(<EmptyState title="Vide" description="Rien à afficher" />);
    const symbol = container.querySelector(".empty-symbol");
    expect(symbol).not.toBeNull();
    expect(symbol?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("ErrorState", () => {
  it("is distinguishable from an empty result", () => {
    render(
      <ErrorState
        title="Cette adresse ne correspond à aucune section"
        description="Utilisez la navigation principale."
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Cette adresse ne correspond à aucune section" }),
    ).toBeInTheDocument();
  });
});

describe("MetricCard", () => {
  it("renders a label, a value and an optional hint", () => {
    render(<MetricCard label="Documents collectés" value="12" hint="toutes sources" />);
    expect(screen.getByText("Documents collectés")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("toutes sources")).toBeInTheDocument();
  });

  it("applies the tone class so it can be checked visually", () => {
    const { container } = render(<MetricCard label="À vérifier" value="3" tone="warning" />);
    expect(container.querySelector(".metric-card--warning")).not.toBeNull();
  });
});

describe("StatusBadge", () => {
  it("always carries a textual label next to the colour", () => {
    const { container } = render(<StatusBadge label="Terminée" tone="success" />);
    expect(screen.getByText("Terminée")).toBeInTheDocument();
    expect(container.querySelector(".status-badge--success")).not.toBeNull();
    expect(container.querySelector(".status-badge-dot")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("LoadingSkeleton", () => {
  it("announces the pending state and hides decorative rows", () => {
    const { container } = render(<LoadingSkeleton label="Chargement des collectes" rows={2} />);
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Chargement des collectes");
    expect(container.querySelectorAll(".skeleton-row")).toHaveLength(2);
  });
});