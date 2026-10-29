import { createFileRoute } from "@tanstack/react-router";
import { ParametresPage } from "../features/parametres";

export const Route = createFileRoute("/parametres")({
  component: ParametresPage,
});
