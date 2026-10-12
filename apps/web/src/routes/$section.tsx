import { createFileRoute } from "@tanstack/react-router";

const pages: Record<string, { title: string; eyebrow: string; description: string; detail: string }> = {
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
    detail: "Aucune collecte n’est chargée : l’API des tâches et des journaux n’est pas encore exposée.",
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

export const Route = createFileRoute("/$section")({
  component: SectionPage,
});

function SectionPage() {
  const { section } = Route.useParams();
  const page = pages[section] ?? {
    title: "Vue indisponible",
    eyebrow: "ESPACE DE TRAVAIL",
    description: "Cette vue n’existe pas encore.",
    detail: "Utilisez la navigation principale pour accéder aux sections disponibles.",
  };
  const isSource = section === "sources";
  const isCollection = section === "collectes";
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="page-description">{page.description}</p>
        </div>
        {isSource && <button className="button button--primary" disabled title="Aucune API de création disponible">＋ Ajouter une source</button>}
        {isCollection && <button className="button button--primary" disabled title="Aucune API de lancement disponible">＋ Lancer une collecte</button>}
      </div>
      <section className="notice notice--warning" role="status">
        <span className="notice-icon" aria-hidden="true">!</span>
        <div><strong>Fonction non connectée</strong><p>{page.detail}</p></div>
      </section>
      <section className="empty-panel empty-panel--compact">
        <div className="empty-symbol" aria-hidden="true">{isSource ? "⌁" : isCollection ? "↻" : "◇"}</div>
        <h2>Aucune donnée chargée</h2>
        <p>Cette interface ne présente pas de données d’exemple comme si elles provenaient du serveur. Connectez un contrat API validé pour activer cette vue.</p>
      </section>
    </>
  );
}
