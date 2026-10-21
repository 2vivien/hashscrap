import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Input({ className, type = "text", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-[10px] border border-line bg-card-2 px-3 text-[13px] text-ink transition-colors",
        "placeholder:text-ink-muted focus:border-lime/50 focus:outline-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
