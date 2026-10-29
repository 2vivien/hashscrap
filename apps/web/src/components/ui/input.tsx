import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export function Input({ className, type = "text", icon, ...props }: InputProps) {
  const field = (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-[10px] border border-line bg-card-2 px-3 text-[13px] text-ink transition-colors",
        "placeholder:text-ink-muted focus:border-lime/50 focus:outline-none disabled:opacity-50",
        icon && "pl-9",
        className,
      )}
      {...props}
    />
  );

  if (!icon) {
    return field;
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted">
        {icon}
      </span>
      {field}
    </div>
  );
}
