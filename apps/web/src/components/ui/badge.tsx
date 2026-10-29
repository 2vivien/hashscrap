import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "border-line bg-card-2 text-ink-secondary",
        lime: "border-lime/30 bg-lime-dim text-lime",
        blue: "border-blue/30 bg-blue-dim text-blue",
        green: "border-green/30 bg-green-dim text-green",
        orange: "border-orange/30 bg-orange-dim text-orange",
        amber: "border-orange/30 bg-orange-dim text-orange",
        red: "border-red/30 bg-red-dim text-red",
        yellow: "border-yellow/30 bg-yellow/15 text-yellow",
        cyan: "border-cyan/30 bg-cyan/15 text-cyan",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** `string & {}` garde l'autocompletion des variantes connues. */
  variant?: BadgeVariant | (string & {});
}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant: variant as BadgeVariant }), className)} {...props} />
  );
}

export { badgeVariants };
