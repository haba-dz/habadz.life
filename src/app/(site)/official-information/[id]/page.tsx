import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmergencySection } from "@/components/shared/emergency-section";
import { Icon, type IconName } from "@/components/icons";
import { Chip, FOCUS_RING, SECTION } from "@/components/site";
import { formatRelativeTime } from "@/lib/constants";
import { getOfficialUpdateById } from "@/lib/data/public";
import { getLocale } from "@/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const isFr = locale === "fr";
  const update = await getOfficialUpdateById(id);

  // Was hardcoded Arabic regardless of locale.
  if (!update) return { title: isFr ? "Communiqué introuvable" : "البيان غير موجود" };

  return {
    title: `${update.title} | ${isFr ? "Communiqués officiels" : "مركز البيانات الرسمية"}`,
    description: update.body?.slice(0, 160) || undefined,
  };
}

/**
 * Authority inferred from free text, because official_updates.source is not a
 * controlled vocabulary. components/site/update-card.tsx has a parallel map
 * keyed on exact `source` values — see design.md §7.2 on collapsing the two.
 */
function inferAuthority(
  sourceName: string,
  titleText = "",
  isFr = false,
): { name: string; icon: IconName; tone: "red" | "green" | "ink" | "amber" } {
  const s = `${sourceName} ${titleText}`.toLowerCase();
  if (s.includes("0018") || (s.includes("حماية") && s.includes("جيجل"))) {
    return {
      name: isFr ? "Protection Civile - Jijel" : "الحماية المدنية - جيجل",
      icon: "fire",
      tone: "red",
    };
  }
  if (s.includes("حماية")) {
    return {
      name: isFr ? "Protection Civile (Nationale)" : "الحماية المدنية (الوطنية)",
      icon: "fire",
      tone: "red",
    };
  }
  if (s.includes("درك") || s.includes("طريقي")) {
    return {
      name: isFr ? "Gendarmerie / Tariki" : "الدرك الوطني / طريقي",
      icon: "road-01",
      tone: "ink",
    };
  }
  if (s.includes("غابات")) {
    return {
      name: isFr ? "Conservation des Forêts" : "محافظة الغابات",
      icon: "tree-06",
      tone: "green",
    };
  }
  if (s.includes("أمن")) {
    return {
      name: isFr ? "Sûreté Nationale" : "الأمن الوطني",
      icon: "police-badge",
      tone: "ink",
    };
  }
  return {
    name: isFr ? "Cellule de Crise de la Wilaya" : "خلية الأزمة الولائية",
    icon: "shield-01",
    tone: "amber",
  };
}

/** design.md §5.3 detail view. No artboard — §7.3, restyle-and-keep. */
export default async function OfficialUpdateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const isFr = locale === "fr";
  const update = await getOfficialUpdateById(id);

  if (!update) {
    notFound();
  }

  const auth = inferAuthority(update.source, update.title, isFr);
  const isUrgent =
    (update.is_urgent ?? false) ||
    update.title.includes("عاجل") ||
    update.title.includes("إنذار") ||
    update.update_type === "fire_alert";

  const exactDate = new Intl.DateTimeFormat(isFr ? "fr-DZ" : "ar-DZ", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(update.published_at));

  return (
    <>
      <div className={`mx-auto w-full max-w-[900px] px-4 desktop:px-6 ${SECTION}`}>
        <Link
          href="/official-information"
          className={`inline-flex items-center gap-2 text-[13px] font-semibold text-haba-green ${FOCUS_RING}`}
        >
          <Icon name="news" size={15} />
          <span>
            {isFr ? "Retour aux communiqués officiels" : "العودة إلى مركز البيانات الرسمية"}
          </span>
        </Link>

        <article className="mt-4 border border-haba-border bg-haba-surface p-5 desktop:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-haba-border pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone={auth.tone} fill="tint" size="sm">
                <Icon name={auth.icon} size={15} />
                {auth.name}
                <Icon
                  name="shield-01"
                  size={13}
                  className="text-haba-green"
                  label={isFr ? "Source vérifiée" : "مصدر موثّق"}
                />
              </Chip>

              {isUrgent && (
                <Chip tone="red" fill="solid" size="sm">
                  {isFr ? "URGENT" : "بلاغ عاجل"}
                </Chip>
              )}
            </div>

            <span className="flex items-center gap-1.5 text-[12.5px] text-haba-muted">
              <Icon name="clock-01" size={14} />
              {formatRelativeTime(update.published_at, locale)}
            </span>
          </div>

          <h1 className="mt-5 font-haba-display text-[26px] font-bold leading-tight text-haba-forest desktop:text-[clamp(26px,4vw,40px)]">
            {update.title}
          </h1>

          <p className="mt-2 text-[12.5px] text-haba-muted">
            {isFr ? "Publié le :" : "نُشر في:"}{" "}
            <time dateTime={update.published_at}>{exactDate}</time>
          </p>

          <div className="mt-6 flex flex-col gap-4 border-y border-haba-border py-6 text-[15px] leading-relaxed whitespace-pre-line text-haba-ink-2 desktop:text-[16.5px]">
            {update.body ? (
              update.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)
            ) : (
              <p className="text-haba-muted">
                {isFr
                  ? "Aucun détail supplémentaire dans ce communiqué."
                  : "لا يوجد تفاصيل إضافية في هذا البيان."}
              </p>
            )}
          </div>

          <div className="mt-6 border border-haba-green bg-haba-green-tint p-4 desktop:p-5">
            <div className="flex flex-col justify-between gap-4 desktop:flex-row desktop:items-center">
              <div className="flex items-start gap-3">
                <Icon name="shield-01" size={22} className="mt-0.5 shrink-0 text-haba-green" />
                <div>
                  <h2 className="text-[15px] font-bold text-haba-forest">
                    {isFr
                      ? "Fiche d'authentification de la source officielle"
                      : "بطاقة توثيق المصدر الرسمي"}
                  </h2>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-haba-ink-2">
                    {isFr ? (
                      <>
                        Organisme émetteur : <strong>{update.source}</strong> — l&apos;authenticité
                        de ce bulletin a été vérifiée selon les canaux officiels.
                      </>
                    ) : (
                      <>
                        الجهة المصدرة: <strong>{update.source}</strong> — تم التحقق من سلامة البلاغ
                        ومطابقته للنشرات الميدانية المعتمدة.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {update.url && (
                <a
                  href={update.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex shrink-0 items-center justify-center gap-2 border border-haba-green bg-haba-green px-4 py-2.5 text-[13px] font-bold text-white hover:bg-haba-green-dark ${FOCUS_RING}`}
                >
                  <span>{isFr ? "Lien source officiel" : "المنشور الأصلي على فيسبوك"}</span>
                  <Icon name="link-square-02" size={15} />
                </a>
              )}
            </div>
          </div>
        </article>
      </div>

      {/*
        This page used to hardcode four emergency numbers of its own. They are
        the same numbers EmergencySection renders from the verified contact
        list, so the copy is gone rather than kept in sync by hand.
      */}
      <EmergencySection />
    </>
  );
}
