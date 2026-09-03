import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmergencySection } from "@/components/shared/emergency-section";
import { Icon } from "@/components/icons";
import { FOCUS_RING, SECTION } from "@/components/site";
import { getPostBySlug } from "@/lib/data/public";
import { getLocale } from "@/i18n/server";
import { decodeSlug } from "@/lib/url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getPostBySlug(decodeSlug(slug));
  if (!post) return { title: locale === "fr" ? "Article introuvable" : "الخبر غير موجود" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: { title: post.title, description: post.excerpt ?? undefined, type: "article" },
  };
}

/** No artboard — design.md §7.3, restyle-and-keep. */
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const isFr = locale === "fr";
  const post = await getPostBySlug(decodeSlug(slug));
  if (!post) notFound();

  // Was hardcoded to ar-DZ, so French readers got an Arabic date.
  const publishedDate = post.published_at
    ? new Intl.DateTimeFormat(isFr ? "fr-DZ" : "ar-DZ", { dateStyle: "long" }).format(
        new Date(post.published_at),
      )
    : null;

  return (
    <>
      <article className={`mx-auto w-full max-w-[760px] px-4 desktop:px-6 ${SECTION} pb-2`}>
        <Link
          href="/news"
          className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-haba-green ${FOCUS_RING}`}
        >
          <Icon name="news" size={15} />
          {isFr ? "Toutes les actualités" : "كل الأخبار"}
        </Link>

        <h1 className="mt-4 font-haba-display text-[26px] font-bold leading-tight text-haba-forest desktop:text-[clamp(26px,4vw,40px)]">
          {post.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-haba-muted">
          {publishedDate && (
            <span className="flex items-center gap-1.5">
              <Icon name="calendar-03" size={15} />
              {publishedDate}
            </span>
          )}
          {post.author_name && (
            <span className="flex items-center gap-1.5">
              <Icon name="user-check-01" size={15} />
              {post.author_name}
            </span>
          )}
        </div>

        {post.excerpt && (
          <p className="mt-5 border-s-2 border-haba-green bg-haba-green-tint p-4 text-[15px] leading-relaxed text-haba-ink desktop:text-[16.5px]">
            {post.excerpt}
          </p>
        )}

        {/* Rendered as plain paragraphs — never as HTML, so user copy cannot inject markup. */}
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-haba-ink-2 desktop:text-[16.5px]">
          {post.body.split(/\n{2,}/).map((para, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {para}
            </p>
          ))}
        </div>
      </article>

      <EmergencySection />
    </>
  );
}
