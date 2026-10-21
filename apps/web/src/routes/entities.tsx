import { createFileRoute } from "@tanstack/react-router";
import { EntitiesPage } from "../features/entities/EntitiesPage";

export const Route = createFileRoute("/entities")({
  component: EntitiesPage,
});