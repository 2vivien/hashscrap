import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ESPACE DE TRAVAIL / APERÇU</p>
          <h1>Vue d’ensemble</h1>
          <p className="page-description">Suivez les collectes, vérifiez les preuves et identifiez la prochaine action utile.</p>
        </div>
        <button className="button button--primary" disabled title="Disponible lorsque l’API de création d’investigation sera implémentée">
          <span aria-hidden="true">＋</span> Nouvelle investigation
        </button>
      </div>
      <section className="notice notice--info" role="status">
        <span className="notice-icon" aria-hidden="true">i</span>
        <div><strong>Le moteur n’est pas encore connecté à cette interface.</strong><p>Aucune statistique fictive n’est affichée. Les vues seront alimentées lorsque les contrats API seront disponibles.</p></div>
      </section>
      <section className="empty-panel">
        <div className="empty-illustration" aria-hidden="true"><span>H</span><i>⌁</i><i>↻</i></div>
        <p className="eyebrow">PRÊT POUR L’INTÉGRATION</p>
        <h2>Les données apparaîtront ici</h2>
        <p>Commencez par connecter les endpoints de sources et de collectes. Les états vide, partiel, erreur et succès seront ensuite rendus à partir des réponses réelles.</p>
        <div className="empty-actions">
          <Link className="button button--secondary" to="/sources">Voir les sources</Link>
          <Link className="button button--secondary" to="/collectes">Voir les collectes</Link>
        </div>
      </section>
    </>
  );
}
