export type SectionConfig = {
  title: string;
  eyebrow: string;
  description: string;
  detail: string;
};

const sections: Record<string, SectionConfig> = {};

export function getSectionConfig(section: string): SectionConfig {
  return (
    sections[section] ?? {
      title: "Vue indisponible",
      eyebrow: "ESPACE DE TRAVAIL",
      description: "Cette vue n'existe pas encore.",
      detail: "Utilisez la navigation principale pour accéder aux sections disponibles.",
    }
  );
}

export function isSourceOrCollection(section: string): boolean {
  return section === "sources" || section === "collectes";
}
