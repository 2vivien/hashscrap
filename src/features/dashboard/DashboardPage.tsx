import { useDashboard } from './hooks/useDashboard';
import { StatsCard } from './components/StatsCard';
import { RecentCollectesTable } from './components/RecentCollectesTable';
import { ActiviteCard } from './components/ActiviteCard';
import { PointsAttentionCard } from './components/PointsAttentionCard';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Link } from '@tanstack/react-router';

const DashboardPage = () => {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bonjour, Julien 👋"
        description="Voici l'état de vos collectes actives • mercredi 21 octobre"
        actions={[
          <Badge key="status" variant="lime" className="text-sm">
            Vue d'ensemble • chargé
          </Badge>,
          <Button key="view-collectes" variant="primary" size="sm">
            Voir collectes
          </Button>,
          <Button key="new-collecte" variant="primary" size="sm">
            Nouvelle collecte
          </Button>,
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Sources"
          value={data.stats.sources.value}
          delta={data.stats.sources.delta}
        />
        <StatsCard
          title="Collectes"
          value={data.stats.collectes.value}
          delta={data.stats.collectes.delta}
        />
        <StatsCard
          title="Observations"
          value={data.stats.observations.value}
          delta={data.stats.observations.delta}
        />
        <StatsCard
          title="Entités"
          value={data.stats.entites.value}
          delta={data.stats.entites.delta}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Collectes récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentCollectesTable data={data.collectes} />
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  Voir tout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ActiviteCard activites={data.activite} />
          <PointsAttentionCard points={data.points_attention} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
