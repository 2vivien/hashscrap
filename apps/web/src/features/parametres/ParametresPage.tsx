import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { CollecteurForm } from "./components/CollecteurForm";
import { ConservationForm } from "./components/ConservationForm";
import { ReseauForm } from "./components/ReseauForm";
import { SecuriteForm } from "./components/SecuriteForm";
import { AuditForm } from "./components/AuditForm";
import { useParametres } from "./hooks/useParametres";

/**
 * Display the engine settings exposed by the engine.
 */
export function ParametresPage() {
  const { data, isPending, isError, refetch } = useParametres();
  const [activeTab, setActiveTab] = useState("collecteur");

  if (isPending) return <LoadingSkeleton label="Chargement des paramètres..." />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!data) return null;

  return (
    <>
      <PageHeader
        title="Paramètres"
        description="Configuration du moteur de collecte bornée"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="collecteur">Collecteur</TabsTrigger>
          <TabsTrigger value="reseau">Réseau</TabsTrigger>
          <TabsTrigger value="conservation">Conservation</TabsTrigger>
          <TabsTrigger value="securite">Sécurité</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="collecteur">
          <CollecteurForm initialData={data.collecteur} />
        </TabsContent>

        <TabsContent value="reseau">
          <ReseauForm initialData={data.reseau} />
        </TabsContent>

        <TabsContent value="conservation">
          <ConservationForm initialData={data.conservation} />
        </TabsContent>

        <TabsContent value="securite">
          <SecuriteForm initialData={data.securite} />
        </TabsContent>

        <TabsContent value="audit">
          <AuditForm initialData={data.audit} />
        </TabsContent>
      </Tabs>
    </>
  );
}
