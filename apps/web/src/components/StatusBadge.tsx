export type StatusBadgeProps = {
  label: string;
  tone: "success" | "warning" | "error" | "neutral";
};

/**
 * Status badge. The label is mandatory: status is never conveyed by colour alone
 * (DESIGN-SYSTEM §2).
 */
export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      <span className="status-badge-dot" aria-hidden="true" />
      {label}
    </span>
  );
}