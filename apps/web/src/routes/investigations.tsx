import { createFileRoute } from "@tanstack/react-router";
import { InvestigationsPage } from "../features/investigations";

export const Route = createFileRoute("/investigations")({
  component: InvestigationsPage,
});
