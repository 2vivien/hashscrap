import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-card-2", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
