import { createFileRoute } from "@tanstack/react-router";
import { InvestigationsPage } from "../features/investigations/InvestigationsPage";

export const Route = createFileRoute("/investigations")({
  component: InvestigationsPage,
});