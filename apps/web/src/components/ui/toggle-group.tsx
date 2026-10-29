import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export function ToggleGroup({ className, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      className={cn("inline-flex gap-1 rounded-[10px] border border-line bg-card-2 p-1", className)}
      {...props}
    />
  );
}

export function ToggleGroupItem({
  className,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        "rounded-md px-3 py-1.5 text-[12px] text-ink-secondary transition-colors",
        "hover:text-ink data-[state=on]:bg-lime data-[state=on]:text-[#0b1204]",
        className,
      )}
      {...props}
    />
  );
}
