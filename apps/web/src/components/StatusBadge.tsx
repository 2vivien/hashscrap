import { describeRunStatus } from "../lib/run-status";

/**
 * Status pill. Colour is always paired with a text label and a shape (dot) so
 * the meaning is never carried by colour alone (design system §2 and §6).
 */
export function StatusBadge({ status }: { status: string }) {
  const meta = describeRunStatus(status);
  return (
    <span
      className={`status-badge status-badge--${meta.variant}`}
      title={meta.description}
      data-status={status}
    >
      <span className="status-badge__dot" aria-hidden="true" />
      <span className="status-badge__label">{meta.label}</span>
      {meta.known ? null : <span className="sr-only"> (statut non répertorié)</span>}
    </span>
  );
}
