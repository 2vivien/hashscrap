export type LoadingSkeletonProps = {
  label: string;
  rows?: number;
};

/** Loading placeholder with an announced label, used while a loader resolves. */
export function LoadingSkeleton({ label, rows = 3 }: LoadingSkeletonProps) {
  return (
    <div className="skeleton" role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <span className="skeleton-row" key={index} aria-hidden="true" />
      ))}
    </div>
  );
}