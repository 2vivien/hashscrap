import { createFileRoute } from "@tanstack/react-router";
import { SourcesPage } from "../features/sources";

export const Route = createFileRoute("/sources")({
  component: SourcesPage,
});
