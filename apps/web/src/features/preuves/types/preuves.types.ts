export type PreuveStatus = "validee" | "en_attente" | "erreur";

export interface Preuve {
  id: string;
  url: string;
  source: string;
  collectee_le: string;
  sha256: string;
  statut: PreuveStatus;
  taille: number;
  apercu_url: string;
}

export interface PreuvesFilters {
  search: string;
  statut: PreuveStatus | "all";
}

export const PREUVE_STATUS_LABEL: Record<PreuveStatus, string> = {
  validee: "Validée",
  en_attente: "En attente",
  erreur: "Erreur",
};
