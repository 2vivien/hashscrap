import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { formatDateTime } from "../../lib/format";
import { COLLECTE_TYPE_LABEL } from "../collectes/types/collectes.types";
import { fetchCollecteDetail } from "./api/collecte-detail.queries";

interface CollecteDetailPageProps {
  id: string;
}

export function CollecteDetailPage({ id }: CollecteDetailPageProps) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["collecte-detail", id],
    queryFn: ({ signal }) => fetchCollecteDetail(id, signal),
  });

  if (isPending) return <LoadingSkeleton label="Chargement du détail de la collecte…" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{data?.id}</CardTitle>
              <p className="text-sm text-ink-secondary">
                Source {data?.source} • type {data?.type ? COLLECTE_TYPE_LABEL[data.type] : ""}
              </p>
            </div>
            <Button variant="primary" disabled title="Disponible quand l'API de relance sera exposée">
              Relancer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Progression</h3>
              <div className="flex items-center gap-2">
                <Progress value={data?.progress} className="flex-1" />
                <span className="mono text-[12px] text-ink-secondary">
                  {data?.progress}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Pages</h3>
              <p className="mono">{data?.pages}/3500</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Observations</h3>
              <p className="mono">
                {data?.observations.total} (validées {data?.observations.validated}, rejetées {data?.observations.rejected})
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Durée</h3>
              <p className="mono">{data?.duration}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="evenements">
        <TabsList>
          <TabsTrigger value="evenements">Événements</TabsTrigger>
          <TabsTrigger value="resultats">Résultats</TabsTrigger>
          <TabsTrigger value="erreurs">Erreurs</TabsTrigger>
        </TabsList>

        <TabsContent value="evenements">
          <Card>
            <CardHeader>
              <CardTitle>Timeline des événements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.evenements.map((event) => (
                  <div key={event.at} className="flex items-start gap-4">
                    <div className="min-w-[120px] text-sm text-ink-secondary">
                      {formatDateTime(event.at)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{event.label}</div>
                      {event.detail && (
                        <div className="text-sm text-ink-secondary">{event.detail}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resultats">
          <Card>
            <CardHeader>
              <CardTitle>Résultats de la collecte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-secondary">
                Les résultats détaillés de la collecte seront affichés ici.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="erreurs">
          <Card>
            <CardHeader>
              <CardTitle>Erreurs ({data?.erreurs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.erreurs.map((erreur) => (
                  <div key={erreur.code} className="flex items-start gap-4">
                    <Badge variant="red">{erreur.type}</Badge>
                    <div className="flex-1">
                      <div className="font-medium">{erreur.message}</div>
                      <div className="text-sm text-ink-secondary">
                        {erreur.count} occurrence(s)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}