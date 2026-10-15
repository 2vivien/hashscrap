export type SectionConfig = {
  title: string;
  eyebrow: string;
  description: string;
  detail: string;
};

const sections: Record<string, SectionConfig> = {
  investigations: {
    title: "Investigations",
    eyebrow: "ESPACE DE TRAVAIL / DOSSIERS",
    description: "Organisez vos objectifs de recherche et leurs sources.",
    detail: "La persistance et les endpoints d’investigation ne sont pas encore disponibles.",
  },
  sources: {
    title: "Sources",
    eyebrow: "CONFIGURATION / SOURCES",
    description: "Gérez les points de départ autorisés et consultez les refus de validation réseau.",
    detail: "Aucune source n’est chargée : l’API de registre et de validation n’est pas encore exposée.",
  },
  collectes: {
    title: "Collectes",
    eyebrow: "EXÉCUTION / TÂCHES",
    description: "Suivez l’état des tâches, les compteurs et les erreurs de collecte.",
    detail: "Les collectes sont lues via GET /api/v1/runs ; le lancement, l’arrêt et les journaux détaillés ne sont pas encore exposés par l’API.",
  },
  entites: {
    title: "Entités & relations",
    eyebrow: "ANALYSE / CORRÉLATION",
    description: "Explorez les identifiants rapprochés et les relations justifiées par des preuves.",
    detail: "Cette vue sera activée lorsque les endpoints de corrélation seront disponibles.",
  },
  chronologie: {
    title: "Chronologie",
    eyebrow: "ANALYSE / ÉVÉNEMENTS",
    description: "Reconstituez la séquence des observations et des collectes.",
    detail: "Cette vue nécessite des événements persistés et un endpoint de chronologie.",
  },
  preuves: {
    title: "Preuves",
    eyebrow: "ANALYSE / PROVENANCE",
    description: "Vérifiez l’origine, la date, l’empreinte et l’historique des observations.",
    detail: "Aucune preuve n’est chargée : l’API des documents et observations reste à connecter.",
  },
  rapports: {
    title: "Rapports",
    eyebrow: "LIVRABLES / EXPORTS",
    description: "Produisez des rapports reproductibles, sourcés et transparents sur les limites.",
    detail: "Les générateurs existent côté moteur en préparation ; aucun endpoint de génération n’est encore exposé.",
  },
  parametres: {
    title: "Paramètres",
    eyebrow: "ADMINISTRATION / CONFIGURATION",
    description: "Consultez les règles d’exploitation et les paramètres de sécurité.",
    detail: "Les paramètres ne sont pas modifiables depuis l’interface tant qu’une API validée et auditée n’existe pas.",
  },
};

export function getSectionConfig(section: string): SectionConfig {
  return sections[section] ?? {
    title: "Vue indisponible",
    eyebrow: "ESPACE DE TRAVAIL",
    description: "Cette vue n’existe pas encore.",
    detail: "Utilisez la navigation principale pour accéder aux sections disponibles.",
  };
}

export function isSourceOrCollection(section: string): boolean {
  return section === "sources" || section === "collectes";
}
