import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { RapportsTable } from "./components/RapportsTable";
import { useRapports } from "./hooks/useRapports";
import type { Rapport } from "./types/rapports.types";

export function RapportsPage() {
  const { data, isPending, isError, refetch } = useRapports();
  const [extra, setExtra] = useState<Rapport[]>([]);

  const items = useMemo(() => [...extra, ...(data?.items ?? [])], [extra, data]);

  function createRapport() {
    const id = `r-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(extra.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const rapport: Rapport = {
      id,
      titre: "Nouveau rapport",
      investigation: "Opération TechLeak",
      statut: "en_attente",
      genere_le: now,
      format: "markdown",
      contenu: "# Nouveau rapport\n\nContenu à générer.",
    };
    setExtra((current) => [rapport, ...current]);
  }

  return (
    <>
      <PageHeader
        title="Rapports"
        description="Générez des livrables d'investigation"
        actions={
          <Button variant="primary" onClick={createRapport}>
            <Plus /> Nouveau rapport
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isPending ? <LoadingSkeleton label="Chargement des rapports…" /> : null}
          {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
          {!isPending && !isError ? <RapportsTable rapports={items} /> : null}
        </CardContent>
      </Card>
    </>
  );
}
