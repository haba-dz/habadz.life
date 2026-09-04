import type { Metadata } from "next";
import Link from "next/link";

import { EmergencySection } from "@/components/shared/emergency-section";
import { EmptyState } from "@/components/shared/empty-state";
import { Icon } from "@/components/icons";
import { FOCUS_RING, PageHero, SECTION, SHELL } from "@/components/site";
import { formatRelativeTime } from "@/lib/constants";
import { getPublishedPosts } from "@/lib/data/public";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.nav.news,
    description: t.news.pageSubtitle,
  };
}

/**
 * No artboard — design.md §7.3, restyle-and-keep. This is the platform's own
 * write-ups; /official-information carries third-party statements. The two
 * overlap in the IA and consolidating them is an open decision (§7.3).
 */
export default async function NewsPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHero
        eyebrow={isFr ? "Publications de la plateforme" : "منشورات المنصة"}
        eyebrowIcon="news"
        title={t.news.pageTitle}
        lede={t.news.pageSubtitle}
      />

      <div className={`mx-auto w-full max-w-[900px] px-4 desktop:px-6 ${SECTION}`}>
        {posts.length === 0 ? (
          <EmptyState
            title={isFr ? "Aucun article publié pour le moment" : "لا توجد أخبار منشورة بعد"}
            description={
              isFr
                ? "Les points de situation et rapports seront publiés ici."
                : "سيتم نشر مستجدات التنسيق والتقارير الميدانية هنا."
            }
          />
        ) : (
          <div className="border border-haba-border bg-haba-surface">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/news/${p.slug}`}
                className={`group block border-t border-haba-border p-4 first:border-t-0 hover:bg-haba-surface-2 desktop:p-5 ${FOCUS_RING}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-[17px] font-bold leading-snug text-haba-forest group-hover:text-haba-green">
                    {p.title}
                  </h2>
                  <time className="shrink-0 pt-0.5 text-[12.5px] text-haba-muted">
                    {formatRelativeTime(p.published_at, locale)}
                  </time>
                </div>

                {p.excerpt && (
                  <p className="mt-1.5 text-sm leading-relaxed text-haba-ink-2">{p.excerpt}</p>
                )}

                <span className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-haba-green">
                  {isFr ? "Lire la suite" : "اقرأ المزيد"}
                  <Icon name="link-square-02" size={15} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <EmergencySection />
    </>
  );
}
