import { createFileRoute } from "@tanstack/react-router";
import { CollectesView } from "../components/CollectesView";

export const Route = createFileRoute("/collectes")({
  component: CollectesView,
});
