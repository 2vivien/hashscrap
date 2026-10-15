import type { ReactNode } from "react";

/**
 * Empty state = the API answered and there is genuinely no row.
 * It must never be used to mask an error: an error has its own state.
 */
export function EmptyState({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="state-panel" role="status">
      <div className="empty-symbol" aria-hidden="true">
        ↻
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      {actions ? <div className="empty-actions">{actions}</div> : null}
    </section>
  );
}
