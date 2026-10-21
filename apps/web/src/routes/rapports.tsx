import { createFileRoute } from "@tanstack/react-router";
import { RapportsPage } from "../features/rapports/RapportsPage";

export const Route = createFileRoute("/rapports")({
  component: RapportsPage,
});