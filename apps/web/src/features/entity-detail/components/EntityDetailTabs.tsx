import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { ObservationsTable } from "./ObservationsTable";
import { CONFIANCE_LEVEL_LABEL } from "../types/entity-detail.types";
import type { EntityDetailResponse } from "../validators/entity-detail.schema";

interface EntityDetailTabsProps {
  entity: EntityDetailResponse;
}

export function EntityDetailTabs({ entity }: EntityDetailTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="observations">Observations</TabsTrigger>
        <TabsTrigger value="sources">Sources</TabsTrigger>
        <TabsTrigger value="relations">Relations</TabsTrigger>
        <TabsTrigger value="historique">Historique</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="space-y-4">
          <h3 className="text-[15px] font-medium text-ink">Aperçu</h3>
          <p className="text-[13px] text-ink-secondary">
            Cette entité a été détectée {entity.observations} fois avec une confiance {CONFIANCE_LEVEL_LABEL[entity.confiance].toLowerCase()}.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="observations">
        <ObservationsTable observations={entity.observations_liste} />
      </TabsContent>

      <TabsContent value="sources">
        <div className="space-y-4">
          <h3 className="text-[15px] font-medium text-ink">Sources</h3>
          <div className="flex flex-wrap gap-2">
            {entity.sources.map((source) => (
              <Badge key={source} variant="neutral">{source}</Badge>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="relations">
        <div className="space-y-4">
          <h3 className="text-[15px] font-medium text-ink">Relations</h3>
          {entity.relations.length > 0 ? (
            <ul className="space-y-2">
              {entity.relations.map((relation) => (
                <li key={relation.id} className="text-[13px] text-ink">
                  {relation.libelle}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-ink-muted">Aucune relation détectée</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="historique">
        <div className="space-y-4">
          <h3 className="text-[15px] font-medium text-ink">Historique</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[12px] text-ink-secondary">Créé le</span>
              <span className="text-[12px] text-ink">{new Date(entity.derniere_detection).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] text-ink-secondary">Dernière mise à jour</span>
              <span className="text-[12px] text-ink">{new Date(entity.derniere_detection).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}