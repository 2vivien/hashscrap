import type { ReactNode } from "react";

export type InlineAlertProps = {
  tone: "info" | "warning" | "error" | "success";
  title: string;
  children: ReactNode;
};

const TONE_SYMBOL: Record<InlineAlertProps["tone"], string> = {
  info: "i",
  warning: "!",
  error: "×",
  success: "✓",
};

/**
 * Inline status message. The tone is always carried by a symbol and a text label,
 * never by colour alone (DESIGN-SYSTEM §2).
 */
export function InlineAlert({ tone, title, children }: InlineAlertProps) {
  return (
    <section className={`notice notice--${tone}`} role="status">
      <span className="notice-icon" aria-hidden="true">
        {TONE_SYMBOL[tone]}
      </span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </section>
  );
}