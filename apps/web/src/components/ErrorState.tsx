import type { ReactNode } from "react";

export type ErrorStateProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

/**
 * Error and unavailable-route state. Distinct from an empty result: an empty result
 * means "no data returned", an error means "the answer could not be obtained"
 * (DESIGN-SYSTEM §6).
 */
export function ErrorState({ title, description, actions }: ErrorStateProps) {
  return (
    <section className="error-panel" role="alert">
      <span className="empty-symbol" aria-hidden="true">
        !
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {actions ? <div className="empty-actions">{actions}</div> : null}
    </section>
  );
}