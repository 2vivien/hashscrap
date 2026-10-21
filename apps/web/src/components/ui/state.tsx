import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingSkeleton({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-ink-muted">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-xl border border-line bg-card text-ink-muted">
        <Inbox className="size-5" />
      </span>
      <p className="text-[14px] font-medium text-ink">{title}</p>
      {description ? <p className="max-w-md text-[12px] text-ink-secondary">{description}</p> : null}
      {action}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Chargement impossible",
  description = "Le moteur n’a pas répondu. Vérifiez que l’API est démarrée puis réessayez.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-xl border border-red/30 bg-red-dim text-red">
        <AlertTriangle className="size-5" />
      </span>
      <p className="text-[14px] font-medium text-ink">{title}</p>
      <p className="max-w-md text-[12px] text-ink-secondary">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-[10px] border border-line bg-card px-3 py-1.5 text-[12px] text-ink hover:bg-card-hover"
        >
          Réessayer
        </button>
      ) : null}
    </div>
  );
}
