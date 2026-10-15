/**
 * Loading placeholder. A visually hidden status text announces the state to
 * assistive technology while the visible bars stay decorative.
 */
export function LoadingSkeleton({ label = "Chargement en cours", rows = 4 }: { label?: string; rows?: number }) {
  return (
    <div className="skeleton-block" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="skeleton-row skeleton-row--head" aria-hidden="true" />
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-row" key={index} aria-hidden="true">
          <span className="skeleton-bar skeleton-bar--wide" />
          <span className="skeleton-bar" />
          <span className="skeleton-bar skeleton-bar--narrow" />
        </div>
      ))}
    </div>
  );
}
