import { cn } from "@/lib/utils";

import { Icon } from "@/components/icons";

/**
 * Red-framed notice. design.md §3.15
 *
 * Carries the platform's three legally load-bearing statements: it collects no
 * money, it is not a fundraising platform, and it stores nothing beyond a name
 * and a phone number. Statements stack behind hairlines on mobile.
 */
export function NoticeBlock({
  title,
  statements,
  footer,
  className,
}: {
  title: React.ReactNode;
  statements: { lead: React.ReactNode; body: React.ReactNode }[];
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-haba-red bg-haba-surface", className)}>
      <div className="flex items-center gap-2.5 bg-haba-red px-4 py-3 text-sm font-bold text-white desktop:px-6 desktop:text-[15px]">
        <Icon name="alert-diamond" size={18} />
        {title}
      </div>

      <div className="grid gap-px bg-haba-border-subtle desktop:grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] desktop:gap-6 desktop:bg-transparent desktop:p-6">
        {statements.map((s, i) => (
          <p
            key={i}
            className="bg-haba-surface px-4 py-3.5 text-[13.5px] leading-relaxed text-haba-ink desktop:p-0 desktop:text-[14.5px]"
          >
            <strong className="font-bold">{s.lead}</strong> {s.body}
          </p>
        ))}
      </div>

      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-haba-border px-4 py-3.5 text-[13.5px] text-haba-ink-2 desktop:px-6">
          {footer}
        </div>
      )}
    </section>
  );
}
