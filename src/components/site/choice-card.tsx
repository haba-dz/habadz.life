import { cn } from "@/lib/utils";

import { Icon, type IconName } from "@/components/icons";

/**
 * Selectable card for radio / checkbox groups. design.md §3.13
 *
 * The artboards draw these as <div>s. They are built here as a real <label>
 * wrapping a real <input>, so they are keyboard-operable, announced correctly,
 * and submit with the form — see design.md §8.5. Selection state is driven by
 * :has(:checked), so no client-side state is required to render it.
 */
export function ChoiceCard({
  type = "radio",
  tone = "green",
  compact = false,
  showControl = false,
  icon,
  title,
  description,
  className,
  ...input
}: Omit<React.ComponentProps<"input">, "type" | "title"> & {
  type?: "radio" | "checkbox";
  /** `danger` is the selected-state colour for destructive answers. */
  tone?: "green" | "danger";
  /** Tighter padding, no description — the needs picker on /help. */
  compact?: boolean;
  /** Render a visible 16px native control (equipment list, consent row). */
  showControl?: boolean;
  icon?: IconName;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  const selected =
    tone === "danger"
      ? "has-[:checked]:border-haba-red has-[:checked]:bg-haba-red-50 has-[:checked]:text-haba-red"
      : "has-[:checked]:border-haba-green has-[:checked]:bg-haba-green-tint has-[:checked]:text-haba-green";

  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center gap-3 border border-haba-border bg-haba-surface text-haba-ink",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-haba-green",
        compact ? "px-3.5 py-3 text-sm" : "px-4 py-3.5 text-[14.5px]",
        "has-[:checked]:font-bold",
        selected,
        className,
      )}
    >
      <input
        type={type}
        className={cn(
          showControl ? "size-4 shrink-0 accent-haba-green" : "sr-only",
        )}
        {...input}
      />
      {icon && (
        <Icon
          name={icon}
          size={20}
          className={cn(
            "text-haba-muted",
            tone === "danger"
              ? "group-has-[:checked]:text-haba-red"
              : "group-has-[:checked]:text-haba-green",
          )}
        />
      )}
      <span className="min-w-0">
        <span className={cn("block", !compact && "font-semibold group-has-[:checked]:font-bold")}>
          {title}
        </span>
        {description && !compact && (
          <span className="mt-0.5 block text-[12.5px] font-normal text-haba-muted">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
