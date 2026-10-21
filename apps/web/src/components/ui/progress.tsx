import * as ProgressPrimitive from "@radix-ui/react-progress";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export function Progress({
  className,
  value = 0,
  indicatorClassName,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {
  return (
    <ProgressPrimitive.Root
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-line", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full bg-lime transition-transform", indicatorClassName)}
        style={{ transform: `translateX(-${100 - Math.min(Math.max(value ?? 0, 0), 100)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
