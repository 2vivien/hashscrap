import type { ReactNode } from "react";

export type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  symbol?: string;
  actions?: ReactNode;
  compact?: boolean;
};

/**
 * First-use and no-data state. Never implies a backend answer: the copy must state
 * that no data is loaded (DESIGN-SYSTEM §6).
 */
export function EmptyState({
  eyebrow,
  title,
  description,
  symbol = "◇",
  actions,
  compact = false,
}: EmptyStateProps) {
  return (
    <section className={compact ? "empty-panel empty-panel--compact" : "empty-panel"}>
      <span className="empty-symbol" aria-hidden="true">
        {symbol}
      </span>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      <p>{description}</p>
      {actions ? <div className="empty-actions">{actions}</div> : null}
    </section>
  );
}