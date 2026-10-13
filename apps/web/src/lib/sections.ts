export type SectionConfig = {
  title: string;
  /** Label shown in the breadcrumb and as the document title. */
  breadcrumb: string;
  eyebrow: string;
  description: string;
  detail: string;
};

export type NavItem = {
  /** URL segment, also the key of the section configuration. */
  section: string;
  label: string;
  href: string;
  icon: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

const sections: Record<string, SectionConfig> = {
  investigations: {
    title: "Investigations",
    breadcrumb: "Investigations",
    eyebrow: "ESPACE DE TRAVAIL / DOSSIERS",
    description: "Organisez vos objectifs de recherche et leurs sources.",
    detail: "La persistance et les endpoints d’investigation ne sont pas encore disponibles.",
  },
  sources: {
    title: "Sources",
    breadcrumb: "Sources",
    eyebrow: "CONFIGURATION / SOURCES",
    description: "Gérez les points de départ autorisés et consultez les refus de validation réseau.",
    detail: "Aucune source n’est chargée : l’API de registre et de validation n’est pas encore exposée.",
  },
  collectes: {
    title: "Collectes",
    breadcrumb: "Collectes",
    eyebrow: "EXÉCUTION / TÂCHES",
    description: "Suivez l’état des tâches, les compteurs et les erreurs de collecte.",
    detail: "Aucune collecte n’est chargée : l’API des tâches et des journaux n’est pas encore exposée.",
  },
  entites: {
    title: "Entités & relations",
    breadcrumb: "Entités & relations",
    eyebrow: "ANALYSE / CORRÉLATION",
    description: "Explorez les identifiants rapprochés et les relations justifiées par des preuves.",
    detail: "Cette vue sera activée lorsque les endpoints de corrélation seront disponibles.",
  },
  chronologie: {
    title: "Chronologie",
    breadcrumb: "Chronologie",
    eyebrow: "ANALYSE / ÉVÉNEMENTS",
    description: "Reconstituez la séquence des observations et des collectes.",
    detail: "Cette vue nécessite des événements persistés et un endpoint de chronologie.",
  },
  preuves: {
    title: "Preuves",
    breadcrumb: "Preuves",
    eyebrow: "ANALYSE / PROVENANCE",
    description: "Vérifiez l’origine, la date, l’empreinte et l’historique des observations.",
    detail: "Aucune preuve n’est chargée : l’API des documents et observations reste à connecter.",
  },
  rapports: {
    title: "Rapports",
    breadcrumb: "Rapports",
    eyebrow: "LIVRABLES / EXPORTS",
    description: "Produisez des rapports reproductibles, sourcés et transparents sur les limites.",
    detail: "Les générateurs existent côté moteur, mais aucun endpoint de génération n’est exposé.",
  },
  parametres: {
    title: "Paramètres",
    breadcrumb: "Paramètres",
    eyebrow: "ADMINISTRATION / CONFIGURATION",
    description: "Consultez les règles d’exploitation et les paramètres de sécurité.",
    detail: "Les paramètres ne sont pas modifiables depuis l’interface tant qu’une API validée et auditée n’existe pas.",
  },
};

/** Navigation definition from DESIGN-SYSTEM §3. Single source of truth for the shell. */
export const navGroups: NavGroup[] = [
  {
    label: "ESPACE DE TRAVAIL",
    items: [
      { section: "", label: "Vue d’ensemble", href: "/", icon: "◫" },
      { section: "investigations", label: "Investigations", href: "/investigations", icon: "◎" },
      { section: "sources", label: "Sources", href: "/sources", icon: "⌁" },
      { section: "collectes", label: "Collectes", href: "/collectes", icon: "↻" },
    ],
  },
  {
    label: "ANALYSE",
    items: [
      { section: "entites", label: "Entités & relations", href: "/entites", icon: "◇" },
      { section: "chronologie", label: "Chronologie", href: "/chronologie", icon: "≋" },
      { section: "preuves", label: "Preuves", href: "/preuves", icon: "▤" },
      { section: "rapports", label: "Rapports", href: "/rapports", icon: "▧" },
    ],
  },
];

export const settingsNavItem: NavItem = {
  section: "parametres",
  label: "Paramètres",
  href: "/parametres",
  icon: "⚙",
};

export const HOME_LABEL = "Vue d’ensemble";

/** Section key for a pathname, or undefined when the route is not a known section. */
export function sectionFromPathname(pathname: string): string | undefined {
  const segment = pathname.replace(/^\/+|\/+$/g, "");
  if (segment === "") return "";
  return segment.includes("/") ? undefined : segment;
}

export function isKnownSection(section: string): boolean {
  return Object.hasOwn(sections, section);
}

export function getSectionConfig(section: string): SectionConfig {
  return sections[section] ?? {
    title: "Vue indisponible",
    breadcrumb: "Vue indisponible",
    eyebrow: "ESPACE DE TRAVAIL",
    description: "Cette vue n’existe pas encore.",
    detail: "Utilisez la navigation principale pour accéder aux sections disponibles.",
  };
}

/** Breadcrumb label for a pathname. Never derived from the raw URL slug. */
export function getBreadcrumbLabel(pathname: string): string {
  const section = sectionFromPathname(pathname);
  if (section === undefined) return "Page inconnue";
  if (section === "") return HOME_LABEL;
  return getSectionConfig(section).breadcrumb;
}

export function isSourceOrCollection(section: string): boolean {
  return section === "sources" || section === "collectes";
}