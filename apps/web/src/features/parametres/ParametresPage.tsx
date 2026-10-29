import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { useToast } from "../../components/ui/toast";
import { CollecteurForm } from "./components/CollecteurForm";
import { ConservationForm } from "./components/ConservationForm";
import { ReseauForm } from "./components/ReseauForm";
import { SecuriteForm } from "./components/SecuriteForm";
import { AuditForm } from "./components/AuditForm";
import { updateParametres, parametresKeys } from "./api/parametres.queries";
import { useParametres } from "./hooks/useParametres";
import type { ParametresUpdatePayload } from "./validators/parametres.schema";

export function ParametresPage() {
  const { data, isPending, isError, refetch } = useParametres();
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState("collecteur");

  async function saveSection(payload: ParametresUpdatePayload) {
    try {
      const updated = await updateParametres(payload);
      queryClient.setQueryData(parametresKeys.detail(), updated);
      push({ title: "Paramètres enregistrés", description: "Le moteur a confirmé la sauvegarde.", variant: "success" });
    } catch (error) {
      push({ title: "Échec de sauvegarde", description: error instanceof Error ? error.message : "Erreur API inconnue", variant: "warning" });
    }
  }

  if (isPending) return <LoadingSkeleton label="Chargement des paramètres…" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!data) return null;

  return (
    <>
      <PageHeader title="Paramètres" description="Configuration persistée du moteur de collecte. Chaque section est enregistrée via PUT /api/v1/parametres." />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="collecteur">Collecteur</TabsTrigger>
          <TabsTrigger value="reseau">Réseau</TabsTrigger>
          <TabsTrigger value="conservation">Conservation</TabsTrigger>
          <TabsTrigger value="securite">Sécurité</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>
        <TabsContent value="collecteur"><CollecteurForm initialData={data.collecteur} onSave={(collecteur) => saveSection({ collecteur })} /></TabsContent>
        <TabsContent value="reseau"><ReseauForm initialData={data.reseau} onSave={(reseau) => saveSection({ reseau })} /></TabsContent>
        <TabsContent value="conservation"><ConservationForm initialData={data.conservation} onSave={(conservation) => saveSection({ conservation })} /></TabsContent>
        <TabsContent value="securite"><SecuriteForm initialData={data.securite} onSave={(securite) => saveSection({ securite })} /></TabsContent>
        <TabsContent value="audit"><AuditForm initialData={data.audit} /></TabsContent>
      </Tabs>
    </>
  );
}
