import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
}

export function PageHeader({ title, description, actions, status }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink lg:text-[28px]">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-[13px] text-ink-secondary">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {status}
        {actions}
      </div>
    </header>
  );
}
