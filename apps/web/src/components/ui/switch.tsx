import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-line transition-colors",
        "data-[state=checked]:border-lime/50 data-[state=checked]:bg-lime-dim disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className="pointer-events-none block size-3.5 rounded-full bg-ink-muted transition-transform data-[state=checked]:translate-x-4 data-[state=checked]:bg-lime"
      />
    </SwitchPrimitive.Root>
  );
}
