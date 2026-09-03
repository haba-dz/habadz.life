import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Every pill in the system — hero eyebrows, wilaya chips, severity badges,
 * centre-type badges, status pills, filter chips. design.md §3.8
 *
 * They differ only along tone × fill × size, so they are one component rather
 * than a dozen named variants.
 */
const chipVariants = cva(
  "inline-flex w-fit items-center gap-1.5 border whitespace-nowrap",
  {
    variants: {
      tone: {
        green: "",
        red: "",
        amber: "",
        ink: "",
        neutral: "",
      },
      fill: {
        solid: "text-white",
        tint: "",
        outline: "bg-transparent",
      },
      size: {
        xs: "px-2 py-[3px] text-[11px] font-bold",
        sm: "px-2.5 py-1 text-[12.5px] font-bold",
        md: "px-3 py-1.5 text-[13px] font-semibold",
        lg: "px-3 py-[7px] text-[13.5px] font-semibold",
      },
    },
    compoundVariants: [
      { tone: "green", fill: "solid", class: "border-haba-green bg-haba-green" },
      { tone: "red", fill: "solid", class: "border-haba-red bg-haba-red" },
      { tone: "amber", fill: "solid", class: "border-haba-amber bg-haba-amber" },
      { tone: "ink", fill: "solid", class: "border-haba-ink bg-haba-ink" },
      { tone: "neutral", fill: "solid", class: "border-haba-muted bg-haba-muted" },

      { tone: "green", fill: "tint", class: "border-haba-green bg-haba-green-tint text-haba-green" },
      { tone: "red", fill: "tint", class: "border-haba-red-200 bg-haba-red-50 text-haba-red" },
      { tone: "amber", fill: "tint", class: "border-haba-amber-200 bg-haba-amber-50 text-haba-amber" },
      { tone: "ink", fill: "tint", class: "border-haba-border bg-haba-surface-2 text-haba-ink" },
      { tone: "neutral", fill: "tint", class: "border-haba-border bg-haba-surface text-haba-ink" },

      { tone: "green", fill: "outline", class: "border-haba-green text-haba-green" },
      { tone: "red", fill: "outline", class: "border-haba-red text-haba-red" },
      { tone: "amber", fill: "outline", class: "border-haba-amber text-haba-amber" },
      { tone: "ink", fill: "outline", class: "border-haba-ink text-haba-ink" },
      { tone: "neutral", fill: "outline", class: "border-haba-border text-haba-ink" },
    ],
    defaultVariants: { tone: "neutral", fill: "outline", size: "md" },
  },
);

export type ChipProps = React.ComponentProps<"span"> &
  VariantProps<typeof chipVariants>;

export function Chip({ className, tone, fill, size, ...props }: ChipProps) {
  return (
    <span className={cn(chipVariants({ tone, fill, size }), className)} {...props} />
  );
}

/**
 * 8px status marker — a square, never a circle. design.md §3.8
 *
 * Decorative by design: it must always sit next to a text label, since colour
 * alone does not carry the status. design.md §8.5
 */
export function StatusDot({
  tone = "green",
  className,
}: {
  tone?: "green" | "red" | "amber" | "ink";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-[7px] desktop:size-2",
        {
          green: "bg-haba-green",
          red: "bg-haba-red",
          amber: "bg-haba-amber",
          ink: "bg-haba-ink",
        }[tone],
        className,
      )}
    />
  );
}

export { chipVariants };
