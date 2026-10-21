import { createFileRoute } from "@tanstack/react-router";
import { ChronologiePage } from "../features/chronologie/ChronologiePage";

export const Route = createFileRoute("/chronologie")({
  component: ChronologiePage,
});