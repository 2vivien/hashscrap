import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { formatDateTime } from "../../lib/format";
import { COLLECTE_TYPE_LABEL, COLLECTE_STATUS_LABEL } from "../collectes/types/collectes.types";
import { fetchCollecteDetail } from "./api/collecte-detail.queries";

interface CollecteDetailPageProps { id: string; }

export function CollecteDetailPage({ id }: CollecteDetailPageProps) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["collecte-detail", id],
    queryFn: ({ signal }) => fetchCollecteDetail(id, signal),
  });
  if (isPending) return <LoadingSkeleton label="Chargement du détail de la collecte…" />;
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3">
        <div><CardTitle className="text-2xl">{data.id}</CardTitle><p className="text-sm text-ink-secondary">Source : {data.source} · Type : {COLLECTE_TYPE_LABEL[data.type]}</p></div>
        <Badge variant={data.status === "terminee" ? "green" : data.status === "echouee" ? "red" : data.status === "en_cours" ? "blue" : "neutral"}>{COLLECTE_STATUS_LABEL[data.status]}</Badge>
      </div></CardHeader>
      <CardContent><div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="space-y-2"><h3 className="text-sm font-medium">Progression</h3><div className="flex items-center gap-2"><Progress value={data.progress} className="flex-1" /><span className="mono text-xs">{data.progress}%</span></div></div>
        <div className="space-y-2"><h3 className="text-sm font-medium">Pages récupérées</h3><p className="mono">{data.pages}</p></div>
        <div className="space-y-2"><h3 className="text-sm font-medium">Observations</h3><p className="mono">{data.observations.total} au total</p><p className="text-xs text-ink-secondary">Validées : {data.observations.validated} · Rejetées : {data.observations.rejected}</p></div>
        <div className="space-y-2"><h3 className="text-sm font-medium">Durée</h3><p className="mono">{data.duration}</p><p className="text-xs text-ink-secondary">Démarrée le {formatDateTime(data.started_at)}</p></div>
      </div></CardContent></Card>
      <Tabs defaultValue="evenements">
        <TabsList><TabsTrigger value="evenements">Événements ({data.evenements.length})</TabsTrigger><TabsTrigger value="erreurs">Erreurs ({data.erreurs.length})</TabsTrigger></TabsList>
        <TabsContent value="evenements"><Card><CardHeader><CardTitle>Événements renvoyés par le moteur</CardTitle></CardHeader><CardContent>
          {data.evenements.length === 0 ? <p className="text-sm text-ink-secondary">Aucun événement enregistré pour cette collecte.</p> : <div className="space-y-4">{data.evenements.map((event, index) => <div key={event.at + event.label + index} className="flex items-start gap-4"><div className="min-w-[150px] text-xs text-ink-secondary">{formatDateTime(event.at)}</div><div className="flex-1"><div className="font-medium">{event.label}</div>{event.detail ? <div className="text-sm text-ink-secondary">{event.detail}</div> : null}</div></div>)}</div>}
        </CardContent></Card></TabsContent>
        <TabsContent value="erreurs"><Card><CardHeader><CardTitle>Erreurs enregistrées</CardTitle></CardHeader><CardContent>
          {data.erreurs.length === 0 ? <p className="text-sm text-ink-secondary">Aucune erreur signalée par le moteur.</p> : <div className="space-y-4">{data.erreurs.map((error, index) => <div key={error.code + index} className="flex items-start gap-4"><Badge variant="red">{error.type}</Badge><div className="flex-1"><div className="font-medium">{error.message}</div><div className="text-sm text-ink-secondary">{error.count} occurrence(s) · code {error.code}</div></div></div>)}</div>}
        </CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
