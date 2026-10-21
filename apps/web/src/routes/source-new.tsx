import { createFileRoute } from "@tanstack/react-router";
import { SourceNewPage } from "../features/source-new/SourceNewPage";

export const Route = createFileRoute("/source-new")({
  component: SourceNewPage,
});