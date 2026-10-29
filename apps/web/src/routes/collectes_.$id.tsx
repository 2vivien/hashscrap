import { createFileRoute } from "@tanstack/react-router";
import { CollecteDetailPage } from "../features/collecte-detail";

export const Route = createFileRoute("/collectes_/$id")({
  component: CollecteDetailRoute,
});

function CollecteDetailRoute() {
  const { id } = Route.useParams();
  return <CollecteDetailPage id={id} />;
}
