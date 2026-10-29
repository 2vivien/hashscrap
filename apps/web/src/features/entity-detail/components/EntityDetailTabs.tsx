import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { ObservationsTable } from "./ObservationsTable";
import { CONFIANCE_LEVEL_LABEL } from "../types/entity-detail.types";
import type { EntityDetailResponse } from "../validators/entity-detail.schema";

interface EntityDetailTabsProps { entity: EntityDetailResponse; }
export function EntityDetailTabs({ entity }: EntityDetailTabsProps) {
  return <Tabs defaultValue="overview">
    <TabsList><TabsTrigger value="overview">Aperçu</TabsTrigger><TabsTrigger value="observations">Observations ({entity.observations_liste.length})</TabsTrigger><TabsTrigger value="sources">Sources ({entity.sources.length})</TabsTrigger><TabsTrigger value="relations">Relations ({entity.relations.length})</TabsTrigger></TabsList>
    <TabsContent value="overview"><div className="space-y-4"><h3 className="text-[15px] font-medium text-ink">Aperçu</h3>
      <p className="text-[13px] text-ink-secondary">Cette entité possède {entity.observations} observation(s) et une confiance {CONFIANCE_LEVEL_LABEL[entity.confiance].toLowerCase()}.</p>
      <div className="flex items-center justify-between border-b border-line py-2"><span className="text-xs text-ink-secondary">Dernière détection</span><span className="text-xs text-ink">{new Date(entity.derniere_detection).toLocaleString()}</span></div>
    </div></TabsContent>
    <TabsContent value="observations"><ObservationsTable observations={entity.observations_liste} /></TabsContent>
    <TabsContent value="sources"><div className="space-y-4"><h3 className="text-[15px] font-medium text-ink">Sources liées</h3>{entity.sources.length ? <div className="flex flex-wrap gap-2">{entity.sources.map((source) => <Badge key={source} variant="neutral">{source}</Badge>)}</div> : <p className="text-[13px] text-ink-muted">L’API ne renvoie actuellement aucune source liée à cette entité.</p>}</div></TabsContent>
    <TabsContent value="relations"><div className="space-y-4"><h3 className="text-[15px] font-medium text-ink">Relations</h3>{entity.relations.length ? <ul className="space-y-2">{entity.relations.map((relation) => <li key={relation.id} className="text-[13px] text-ink">{relation.libelle}</li>)}</ul> : <p className="text-[13px] text-ink-muted">Aucune relation renvoyée par l’API.</p>}</div></TabsContent>
  </Tabs>;
}
