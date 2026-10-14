export type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent" | "warning";
};

export function MetricCard({ label, value, hint, tone = "default" }: MetricCardProps) {
  return (
    <article className={tone === "default" ? "metric-card" : `metric-card metric-card--${tone}`}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      {hint ? <p className="metric-hint">{hint}</p> : null}
    </article>
  );
}