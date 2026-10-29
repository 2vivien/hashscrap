import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useToast } from "../../components/ui/toast";
import { Button } from "../../components/ui/button";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { ActivityFeed } from "./components/ActivityFeed";
import { AttentionPoints } from "./components/AttentionPoints";
import { RecentCollectesTable } from "./components/RecentCollectesTable";
import { StatCards } from "./components/StatCards";
import { useDashboard } from "./hooks/useDashboard";
import type { Collecte } from "../collectes/types/collectes.types";

export function DashboardPage() {
  const { push } = useToast();
  const { data, isPending, isError, refetch } = useDashboard();

  if (isPending) {
    return <LoadingSkeleton label="Chargement du tableau de bord…" />;
  }
  if (isError || !data) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  const collectes = data.collectes as Collecte[];

  return (
    <>
      <PageHeader
        title="Bonjour, Julien"
        description={`Voici l'état de vos collectes actives • ${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}`}
        status={
          <span className="mono rounded-full bg-lime-dim px-2 py-1 text-[11px] text-lime">
            Vue d'ensemble • chargé
          </span>
        }
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/collectes">Voir collectes</Link>
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                push({
                  title: "Lancement de collecte",
                  description: "Cette action sera disponible quand le moteur sera connecté.",
                  variant: "info",
                })
              }
            >
              <Plus /> Nouvelle collecte
            </Button>
          </>
        }
      />

      <StatCards stats={data.stats} />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <RecentCollectesTable collectes={collectes} />
        <div className="flex flex-col gap-4">
          <ActivityFeed items={data.activite} />
          <AttentionPoints points={data.points_attention} />
        </div>
      </div>
    </>
  );
}
