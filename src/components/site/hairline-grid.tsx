import { cn } from "@/lib/utils";

/**
 * The core layout pattern (design.md §3.1): a bordered container whose 1px gaps
 * show the border colour through as dividers. Children must be opaque —
 * use HairlineCell, which sets a background for you.
 *
 * Pass `min` for the usual auto-fit behaviour, or `cols` for a fixed count
 * (the mobile 2-up action grid). Row templates are set by the caller.
 */
export function HairlineGrid({
  min,
  cols,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { min?: number; cols?: number }) {
  const template = cols
    ? `repeat(${cols}, minmax(0, 1fr))`
    : min
      ? `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`
      : undefined;

  return (
    <div
      className={cn(
        // Dividers are drawn by the cells, not by a background showing through a
        // 1px gap. The gap trick leaks the divider colour as a solid slab across
        // any track the items do not fill — visible whenever the item count is
        // not a multiple of the resolved column count.
        //
        // The container draws the top and start edges; every cell draws its own
        // bottom and end edge. That closes the box with no doubled lines, and an
        // unfilled track simply stays empty.
        "grid border-t border-s border-haba-border",
        "[&>*]:border-b [&>*]:border-e [&>*]:border-haba-border",
        className,
      )}
      style={{ gridTemplateColumns: template, ...style }}
      {...props}
    />
  );
}

/**
 * Horizontally scrolling variant — the mobile wilaya rail. design.md §5.2
 * Scrollbar is hidden to match the artboards; scrolling stays keyboard- and
 * touch-reachable.
 */
export function HairlineRail({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // Dividers are borders on the cells, not a background showing through a
        // 1px gap. The grid trick leaks the divider colour into the empty track
        // when the cells do not fill the rail; a border cannot.
        "[&>*:not(:last-child)]:border-e [&>*:not(:last-child)]:border-haba-border",
        className,
      )}
      {...props}
    />
  );
}

const cellTone = {
  surface: "bg-haba-surface",
  muted: "bg-haba-surface-2",
  greenTint: "bg-haba-green-tint",
  redTint: "bg-haba-red-50",
  forest: "bg-haba-forest text-haba-green-100",
} as const;

export function HairlineCell({
  tone = "surface",
  className,
  ...props
}: React.ComponentProps<"div"> & { tone?: keyof typeof cellTone }) {
  return <div className={cn(cellTone[tone], className)} {...props} />;
}
