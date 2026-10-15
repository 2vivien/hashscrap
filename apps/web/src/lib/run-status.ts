/**
 * Presentation metadata for crawl run statuses.
 *
 * The set is limited to what the persistence layer actually stores
 * (`ck_crawl_runs_status` in `hashscrap/models.py`): running, succeeded, failed,
 * cancelled — plus `queued` which exists for jobs and may surface later.
 *
 * There is deliberately no "partielle" (partial) status: the run model cannot
 * store it, so rendering it would be inventing a state the backend never emits.
 * A partial collection is not distinguishable from a run row yet; that gap is
 * tracked as a limitation, not faked here.
 */

export type StatusVariant =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "unknown";

export type RunStatusMeta = {
  /** Human label. Never empty so colour is never the only carrier of meaning. */
  label: string;
  variant: StatusVariant;
  /** `false` when the value is not part of the documented contract. */
  known: boolean;
  /** Short explanation of what the status means. */
  description: string;
};

const STATUS_META: Record<string, RunStatusMeta> = {
  queued: {
    label: "En attente",
    variant: "queued",
    known: true,
    description: "La collecte est planifiée mais n’a pas encore démarré.",
  },
  running: {
    label: "En cours",
    variant: "running",
    known: true,
    description: "La collecte est en cours d’exécution.",
  },
  succeeded: {
    label: "Terminée",
    variant: "succeeded",
    known: true,
    description: "La collecte s’est terminée sans échec enregistré.",
  },
  failed: {
    label: "Échouée",
    variant: "failed",
    known: true,
    description: "La collecte s’est arrêtée sur une erreur.",
  },
  cancelled: {
    label: "Annulée",
    variant: "cancelled",
    known: true,
    description: "La collecte a été annulée.",
  },
};

/** Map a raw status to its label and variant, surfacing unknown values as-is. */
export function describeRunStatus(status: string): RunStatusMeta {
  const meta = STATUS_META[status];
  if (meta) {
    return meta;
  }
  return {
    label: status || "Statut inconnu",
    variant: "unknown",
    known: false,
    description: "Statut non répertorié par le contrat API. Affiché sans interprétation.",
  };
}
