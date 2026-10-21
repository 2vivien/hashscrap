export interface DemoBannerProps {
  message?: string;
}

/**
 * Marks data that is not connected to the collection engine.
 *
 * The product rules forbid presenting simulated values as if they came from
 * the server, so every demo screen states its nature explicitly.
 */
export function DemoBanner({ message }: DemoBannerProps) {
  return (
    <div className="demo-banner" role="status">
      <span className="demo-tag">DÉMO</span>
      <div>
        <strong>Données de démonstration, non connectées au moteur.</strong>
        <p>
          {message ??
            "Ces valeurs illustrent la mise en page. Aucune collecte n'est lue depuis le serveur."}
        </p>
      </div>
    </div>
  );
}
