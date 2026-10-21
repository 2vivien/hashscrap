import { createFileRoute } from "@tanstack/react-router";
import { CollectesPage } from "../features/collectes/CollectesPage";

export const Route = createFileRoute("/collectes")({
  component: CollectesPage,
});