import { createFileRoute } from "@tanstack/react-router";
import { RapportsPage } from "../features/rapports";

export const Route = createFileRoute("/rapports")({
  component: RapportsPage,
});
