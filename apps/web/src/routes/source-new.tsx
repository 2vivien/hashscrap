import { createFileRoute } from "@tanstack/react-router";
import { SourceNewPage } from "../features/source-new";

export const Route = createFileRoute("/source-new")({
  component: SourceNewPage,
});
