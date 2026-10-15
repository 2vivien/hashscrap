/**
 * Error state for a failed read. It states what happened and never substitutes
 * fictional data. No secret or internal detail is surfaced beyond the HTTP code.
 */
export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <section className="state-panel state-panel--error" role="alert">
      <div className="state-symbol state-symbol--error" aria-hidden="true">
        !
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry ? (
        <div className="empty-actions">
          <button type="button" className="button button--secondary" onClick={onRetry}>
            Réessayer
          </button>
        </div>
      ) : null}
    </section>
  );
}
