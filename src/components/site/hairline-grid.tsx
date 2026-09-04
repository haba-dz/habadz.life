import { cn } from "@/lib/utils";

/**
 * The core layout pattern (design.md §3.1): a bordered container whose cells
 * draw the dividers. Children must be opaque — use HairlineCell, which sets a
 * background for you.
 *
 * Dividers are borders on the cells, not a background showing through a 1px
 * gap. The gap trick leaks the divider colour as a solid slab across any track
 * the items do not fill. The container draws the top and start edges; every
 * cell draws its own bottom and end edge. That closes the box with no doubled
 * lines.
 *
 * `min` wraps like `repeat(auto-fit, minmax(min(Npx,100%), 1fr))` but is built
 * with flex, not grid, and that is deliberate. Under auto-fit, a child count
 * that is not a multiple of the resolved column count leaves a hole in the last
 * row — and because the empty tracks draw no border, the block reads as torn
 * rather than as merely short. It is not a rare case: these counts come from
 * data (four wilayas, six emergency numbers, N updates), so the resolved column
 * count is whatever the viewport happens to give. Measured on the built site,
 * the homepage alone had five holed grids at 900px, plus /affected-areas and
 * /official-information at both 900px and 1440px.
 *
 * No CSS grid fix exists for it: the span needed by the last item depends on
 * the resolved column count, which is a layout result, not something a
 * stylesheet or the server can know. Flex solves it structurally — the last
 * line's items grow into the remaining space, for any count, at any width.
 *
 * The basis is a CSS variable so a caller can override it per breakpoint, e.g.
 * `max-desktop:[--hairline-basis:50%]` to force a 2-up mobile row.
 *
 * `cols` still uses grid: an explicit column count is the caller's decision and
 * cannot surprise anyone.
 */
export function HairlineGrid({
  min,
  cols,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { min?: number; cols?: number }) {
  const edges = cn(
    "border-t border-s border-haba-border",
    "[&>*]:border-b [&>*]:border-e [&>*]:border-haba-border",
  );

  if (min !== undefined) {
    return (
      <div
        className={cn(
          "flex flex-wrap",
          "[&>*]:min-w-0 [&>*]:grow [&>*]:basis-[var(--hairline-basis)]",
          edges,
          className,
        )}
        style={{ "--hairline-basis": `min(${min}px, 100%)`, ...style } as React.CSSProperties}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn("grid", edges, className)}
      style={{
        gridTemplateColumns: cols ? `repeat(${cols}, minmax(0, 1fr))` : undefined,
        ...style,
      }}
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
