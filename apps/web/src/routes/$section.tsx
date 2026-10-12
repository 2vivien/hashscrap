import { createFileRoute } from "@tanstack/react-router";
import { getSectionConfig } from "../lib/sections";

export const Route = createFileRoute("/$section")({
  component: SectionPage,
});

function SectionPage() {
  const { section } = Route.useParams();
  const page = getSectionConfig(section);
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
