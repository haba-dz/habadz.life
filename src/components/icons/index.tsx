import { cn } from "@/lib/utils";

import { iconData, type IconName } from "./icon-data";

export type { IconName };

type IconProps = {
  name: IconName;
  /** Rendered size in px. design.md §4: 16 inline · 18–20 buttons · 22 brand · 26 headings. */
  size?: number;
  className?: string;
  /**
   * Accessible name. Omit for decorative icons sitting next to their own label
   * — the default is aria-hidden, which is what nearly every icon here wants.
   */
  label?: string;
};

/**
 * Hugeicons rendered from build-time-generated static markup.
 *
 * No icon library ships to the client and no CDN is contacted: the SVG bodies
 * come from a pinned devDependency via scripts/generate-icons.mjs. The markup
 * is generated, never user input, so dangerouslySetInnerHTML is safe here.
 * design.md §4
 */
export function Icon({ name, size = 16, className, label }: IconProps) {
  const icon = iconData[name];

  return (
    <svg
      viewBox={icon.vb}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
