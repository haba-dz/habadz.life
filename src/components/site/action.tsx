import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { Icon, type IconName } from "@/components/icons";
import { FOCUS_RING } from "./focus";

/**
 * Buttons and button-shaped links. design.md §3.7
 *
 * Deliberately not built on components/ui/button.tsx: that one is height-based,
 * rounded, and shared with /admin, which this redesign must not touch. These are
 * padding-based, square, and mostly render as links.
 */
const actionVariants = cva(
  cn(
    "inline-flex shrink-0 items-center justify-center gap-2 border font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50",
    FOCUS_RING,
  ),
  {
    variants: {
      variant: {
        primary:
          "border-haba-green bg-haba-green text-white hover:border-haba-green-dark hover:bg-haba-green-dark",
        danger:
          "border-haba-red bg-haba-red text-white hover:border-haba-red-dark hover:bg-haba-red-dark",
        outline:
          "border-haba-green bg-haba-surface text-haba-green hover:bg-haba-green-tint",
        neutral:
          "border-haba-border bg-haba-surface text-haba-ink hover:bg-haba-surface-2",
        /** On a deep-green panel. */
        onDark: "border-white bg-white text-haba-forest hover:bg-haba-green-50",
        onDarkOutline:
          "border-haba-green-400 bg-transparent text-white hover:bg-white/10",
      },
      size: {
        sm: "px-4 py-[9px] text-[12.5px] font-bold desktop:px-[18px] desktop:py-2.5 desktop:text-sm desktop:font-semibold",
        md: "px-5 py-3 text-[14.5px]",
        lg: "px-6 py-3.5 text-[15px]",
        /** Form submits are full width. design.md §3.7 */
        submit: "w-full px-6 py-[15px] text-[15.5px] font-bold",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  },
);

type ActionProps = VariantProps<typeof actionVariants> & {
  icon?: IconName;
  className?: string;
  children: React.ReactNode;
} & (
    | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">)
    | ({ href?: undefined } & Omit<React.ComponentProps<"button">, "className">)
  );

export function Action({
  variant,
  size,
  icon,
  className,
  children,
  ...props
}: ActionProps) {
  const classes = cn(actionVariants({ variant, size }), className);
  const content = (
    <>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </>
  );

  const { href, ...rest } = props;

  if (href !== undefined) {
    return (
      <Link href={href} className={classes} {...(rest as object)}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ComponentProps<"button">)}>
      {content}
    </button>
  );
}

export { actionVariants };
