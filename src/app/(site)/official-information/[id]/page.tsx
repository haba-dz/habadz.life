import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  Calendar,
  Flame,
  Truck,
  Trees,
  ShieldAlert,
  Building2,
  ExternalLink,
  Phone,
} from "lucide-react";
import { getOfficialUpdateById } from "@/lib/data/public";
import { formatRelativeTime } from "@/lib/constants";
import { getLocale } from "@/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const update = await getOfficialUpdateById(id);

  if (!update) return { title: "البيان غير موجود" };

  return {
    title: `${update.title} | مركز البيانات الرسمية`,
    description: update.body?.slice(0, 160) || undefined,
  };
}

function inferAuthority(sourceName: string, titleText = "", isFr = false) {
  const s = `${sourceName} ${titleText}`.toLowerCase();
  if (s.includes("0018") || (s.includes("حماية") && s.includes("جيجل"))) {
    return { name: isFr ? "Protection Civile - Jijel" : "الحماية المدنية - جيجل", icon: Flame, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20" };
  }
  if (s.includes("حماية")) {
    return { name: isFr ? "Protection Civile (Nationale)" : "الحماية المدنية (الوطنية)", icon: Flame, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20" };
  }
  if (s.includes("درك") || s.includes("طريقي")) {
    return { name: isFr ? "Gendarmerie / Tariki" : "الدرك الوطني / طريقي", icon: Truck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
  }
  if (s.includes("غابات")) {
    return { name: isFr ? "Conservation des Forêts" : "محافظة الغابات", icon: Trees, color: "text-green-700 dark:text-green-400", bg: "bg-green-600/10 border-green-600/20" };
  }
  if (s.includes("أمن")) {
    return { name: isFr ? "Sûreté Nationale" : "الأمن الوطني", icon: ShieldAlert, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-600/10 border-blue-600/20" };
  }
  return { name: isFr ? "Cellule de Crise de la Wilaya" : "خلية الأزمة الولائية", icon: Building2, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
}

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
  const AuthIcon = auth.icon;
  const isUrgent = (update.is_urgent ?? false) || update.title.includes("عاجل") || update.title.includes("إنذار") || update.update_type === "fire_alert";

  const exactDate = new Intl.DateTimeFormat(isFr ? "fr-DZ" : "ar-DZ", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(update.published_at));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Back Link */}
      <Link
        href="/official-information"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowRight className="size-4" />
        <span>{isFr ? "Retour au centre des communiqués officiels" : "العودة إلى مركز البيانات الرسمية"}</span>
      </Link>

      <article className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm">
        {/* Meta Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-border/60">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${auth.bg}`}>
              <AuthIcon className="size-4" />
              <span>{auth.name}</span>
              <ShieldCheck className="size-3.5 text-algeria-green" />
            </span>

            {isUrgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-priority-critical px-3 py-1 text-xs font-bold text-white shadow-xs animate-pulse">
                {isFr ? "URGENT" : "بلاغ عاجل"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>{formatRelativeTime(update.published_at, locale)}</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-foreground">
          {update.title}
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          {isFr ? "Publié le :" : "نُشر في:"} <time dateTime={update.published_at}>{exactDate}</time>
        </p>

        {/* Body Text */}
        <div className="mt-8 space-y-4 text-base sm:text-lg leading-relaxed text-foreground/90 whitespace-pre-line border-y border-border/40 py-8">
          {update.body ? (
            update.body.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="leading-loose">
                {para}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">
              {isFr ? "Aucun détail supplémentaire dans ce communiqué." : "لا يوجد تفاصيل إضافية في هذا البيان."}
            </p>
          )}
        </div>

        {/* Provenance & Verification Box */}
        <div className="mt-8 rounded-2xl border border-algeria-green/30 bg-algeria-green/5 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-6 text-algeria-green shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  {isFr ? "Fiche d'authentification de la source officielle" : "بطاقة توثيق المصدر الرسمي"}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {isFr
                    ? <>Organisme émetteur : <strong>{update.source}</strong> — L&apos;authenticité de ce bulletin a été vérifiée selon les canaux officiels.</>
                    : <>الجهة المصدرة: <strong>{update.source}</strong> — تم التحقق من سلامة البلاغ ومطابقته للنشرات الميدانية المعتمدة.</>}
                </p>
              </div>
            </div>

            {update.url && (
              <a
                href={update.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-algeria-green px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-algeria-green/90 transition-colors shrink-0"
              >
                <span>{isFr ? "Lien source officiel" : "المنشور الأصلي على فيسبوك"}</span>
                <ExternalLink className="size-4" />
              </a>
            )}
          </div>
        </div>

        {/* Emergency Assistance Callout */}
        <div className="mt-8 rounded-2xl border border-border/80 bg-secondary/30 p-5">
          <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
            <Phone className="size-4 text-priority-critical" />
            <span>{isFr ? "En cas de danger imminent ou demande de secours :" : "في حال مواجهة خطر داهم أو طلب النجدة:"}</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center font-bold">
            <a href="tel:14" className="rounded-xl border border-priority-critical/30 bg-card p-2.5 text-priority-critical hover:bg-priority-critical/10">
              {isFr ? "14 Protection Civile" : "14 الحماية المدنية"}
            </a>
            <a href="tel:1021" className="rounded-xl border border-green-600/30 bg-card p-2.5 text-green-700 dark:text-green-300 hover:bg-green-600/10">
              {isFr ? "1021 Forêts" : "1021 الغابات"}
            </a>
            <a href="tel:1055" className="rounded-xl border border-emerald-600/30 bg-card p-2.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600/10">
              {isFr ? "1055 Gendarmerie" : "1055 الدرك الوطني"}
            </a>
            <a href="tel:1548" className="rounded-xl border border-blue-600/30 bg-card p-2.5 text-blue-700 dark:text-blue-300 hover:bg-blue-600/10">
              {isFr ? "1548 Police" : "1548 الشرطة"}
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}