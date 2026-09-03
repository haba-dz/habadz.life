import { cn } from "@/lib/utils";

/**
 * Green / white / red bar under the header and above the footer. design.md §3.2
 * The middle bar is the page background on mobile, not white.
 */
export function FlagStripe({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex h-[3px] desktop:h-1", className)}>
      <div className="flex-1 bg-haba-green" />
      <div className="flex-1 bg-haba-bg desktop:bg-haba-surface" />
      <div className="flex-1 bg-haba-red" />
    </div>
  );
}
