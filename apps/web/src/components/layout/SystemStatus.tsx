import { Activity } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "../../lib/api-client";

const HealthSchema = z.object({
  status: z.string(), version: z.string(), database: z.string(), details: z.record(z.string(), z.unknown()),
}).strict();

export function SystemStatus() {
  const [open, setOpen] = useState(false);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => apiRequest("/health", HealthSchema, { signal }),
    refetchInterval: 30_000,
    retry: 1,
  });
  const healthy = data?.status === "ok" && data.database === "connected";
  const label = isPending ? "Vérification du moteur…" : isError ? "API inaccessible" : healthy ? "Moteur opérationnel" : "Moteur dégradé";
  return <div className="rounded-[10px] border border-line bg-card p-3">
    <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-2 text-left text-xs font-medium text-ink">
      <Activity className={`size-3.5 ${healthy ? "text-green" : isError || data ? "text-red" : "text-ink-muted"}`} />
      <span className="min-w-0 flex-1">{label}</span>
      <span className={`size-1.5 rounded-full ${healthy ? "bg-green" : isError || data ? "bg-red" : "bg-ink-muted"}`} />
    </button>
    {open ? <div className="mt-3 space-y-1 border-t border-line pt-3 text-[11px] text-ink-secondary">
      {data ? <><p>Statut API : {data.status}</p><p>Base de données : {data.database}</p><p>Version : {data.version}</p></> : <p>Les informations de santé ne sont pas disponibles.</p>}
      {isError ? <button type="button" className="mt-1 text-lime hover:underline" onClick={() => void refetch()}>Réessayer</button> : null}
    </div> : null}
  </div>;
}
