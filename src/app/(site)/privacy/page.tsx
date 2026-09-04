import type { Metadata } from "next";

import { EmergencySection } from "@/components/shared/emergency-section";
import { Icon } from "@/components/icons";
import { actionVariants, FOCUS_RING, PageHero, SECTION } from "@/components/site";
import { siteConfig } from "@/config/site";
import { getLocale } from "@/i18n/server";
import { cn } from "@/lib/utils";
import { privacyContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const c = privacyContent[locale];
  return {
    title: c.title,
    description: c.lede,
    // App-store reviewers and search engines both need this one indexable and
    // reachable without a session. Nothing on the page is personalised.
    alternates: { canonical: "/privacy" },
  };
}

/**
 * Privacy policy. design.md §5.10
 *
 * A reading column, not a dashboard: 820px, one hairline block per section, and
 * a table of contents that is a real anchor list so a store reviewer can jump
 * to "what data is collected" without scrolling.
 */
export default async function PrivacyPage() {
  const locale = await getLocale();
  const c = privacyContent[locale];
  const isFr = locale === "fr";

  return (
    <>
      <PageHero eyebrow={c.eyebrow} eyebrowIcon="shield-01" title={c.title} lede={c.lede} />

      <div className={`mx-auto w-full max-w-[820px] px-4 desktop:px-6 ${SECTION}`}>
        <p className="flex items-center gap-2 text-[13px] text-haba-muted">
          <Icon name="clock-01" size={15} />
          {c.updated}
        </p>

        <nav
          aria-label={c.tocTitle}
          className="mt-4 border border-haba-border bg-haba-surface p-4 desktop:p-5"
        >
          <h2 className="mb-2.5 text-[13px] font-bold text-haba-ink-2">{c.tocTitle}</h2>
          <ol className="grid gap-x-6 gap-y-1.5 desktop:grid-cols-2">
            {c.sections.map((s, i) => (
              <li key={s.id} className="flex items-baseline gap-2 text-[13.5px]">
                <span className="tabular-nums text-haba-numeral">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <a
                  href={`#${s.id}`}
                  className={cn("text-haba-green hover:underline", FOCUS_RING)}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-5 flex flex-col gap-4">
          {c.sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-title`}
              className="scroll-mt-[130px] border border-haba-border bg-haba-surface p-4 desktop:p-5"
            >
              <h2
                id={`${s.id}-title`}
                className="flex items-center gap-2.5 text-[17px] font-bold leading-snug text-haba-forest"
              >
                <Icon name={s.icon} size={20} className="text-haba-green" />
                {s.title}
              </h2>

              {s.paragraphs?.map((p) => (
                <p key={p} className="mt-2.5 text-[14px] leading-relaxed text-haba-ink-2">
                  {p}
                </p>
              ))}

              {s.items && (
                <dl className="mt-3.5 border-t border-haba-border">
                  {s.items.map((item) => (
                    <div
                      key={item.term}
                      className="border-b border-haba-border py-3 desktop:grid desktop:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] desktop:gap-5"
                    >
                      <dt className="text-[13.5px] font-bold text-haba-ink">{item.term}</dt>
                      <dd className="mt-1 text-[13.5px] leading-relaxed text-haba-ink-2 desktop:mt-0">
                        {item.detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {s.callout && (
                <p className="mt-3.5 flex items-start gap-2.5 border border-haba-border bg-haba-surface-2 p-3.5 text-[13.5px] leading-relaxed text-haba-ink-2">
                  <Icon name="alert-circle" size={16} className="mt-0.5 shrink-0 text-haba-amber" />
                  {s.callout}
                </p>
              )}

              {/* The contact channel lives on the rights section, from config so
                  it is one edit to swap for an address later. */}
              {s.id === "rights" && (
                <a
                  href={siteConfig.privacyContactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(actionVariants({ variant: "outline", size: "md" }), "mt-4")}
                >
                  <Icon name="github" size={18} />
                  {isFr ? "Ouvrir une demande" : "فتح طلب بخصوص بياناتي"}
                </a>
              )}
            </section>
          ))}
        </div>
      </div>

      <EmergencySection />
    </>
  );
}
