import * as SeparatorPrimitive from "@radix-ui/react-separator";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export function Separator({ className, ...props }: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      className={cn("bg-line data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full", className)}
      {...props}
    />
  );
}
