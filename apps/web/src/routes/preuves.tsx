import { createFileRoute } from "@tanstack/react-router";
import { PreuvesPage } from "../features/preuves";

export const Route = createFileRoute("/preuves")({
  component: PreuvesPage,
});
