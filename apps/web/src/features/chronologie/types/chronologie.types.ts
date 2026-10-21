export type ChronologieFilter = "01/04/2025-12/05/2025" | "tous_types" | "toutes_sources";

export type ChronologieGroupement = "jour" | "semaine" | "mois";

export interface EvenementTimeline {
  date: string;
  type: "collecte" | "observation" | "événement" | "preuve" | "relation";
  icone: string;
  titre: string;
  description: string;
}

export interface ChronologieFilterOptions {
  date_debut: string;
  date_fin: string;
  type: "tous_types" | "collecte" | "observation" | "événement" | "preuve" | "relation";
  source: "toutes_sources" | string;
}