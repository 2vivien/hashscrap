import { useEffect } from "react";
import { useEntityDetail } from "./hooks/useEntityDetail";
import { EntityDetailHeader } from "./components/EntityDetailHeader";
import { EntityDetailTabs } from "./components/EntityDetailTabs";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";

interface EntityDetailPageProps {
  id: string;
}

export function EntityDetailPage({ id }: EntityDetailPageProps) {
  const { data, isPending, isError, refetch } = useEntityDetail(id);

  useEffect(() => {
    void refetch();
  }, [id, refetch]);

  if (isPending) return <LoadingSkeleton label="Chargement du détail de l'entité…" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <EntityDetailHeader entity={data} />
      <EntityDetailTabs entity={data} />
    </div>
  );
}