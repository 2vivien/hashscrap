import { createFileRoute } from "@tanstack/react-router";
import { EntityDetailPage } from "../features/entity-detail/EntityDetailPage";

export const Route = createFileRoute("/entities_/$id")({
  component: EntityDetailRoute,
});

function EntityDetailRoute() {
  const { id } = Route.useParams();
  return <EntityDetailPage id={id} />;
}
