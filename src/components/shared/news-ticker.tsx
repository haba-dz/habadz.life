import { Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/i18n/server";

/**
 * شريط الأخبار والتنبيهات العاجلة — يظهر في أعلى الموقع.
 * نمط ذكي: يظهر في جميع الصفحات فور تفعيل أي خبر عاجل من لوحة الإدارة.
 * إذا لم توجد رسائل عاجلة:
 * - يختفي تماماً (return null) للحفاظ على مساحة القراءة ونظافة الاستمارات.
 */
export async function NewsTicker({ showFallback = false }: { showFallback?: boolean } = {}) {
  const locale = await getLocale();
  const isFr = locale === "fr";
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("announcements")
      .select("id, message")
      .eq("is_active", true)
      .order("sort_order")
      .order("created_at", { ascending: false });

    const messages = data ?? [];

    if (messages.length === 0) {
      if (!showFallback) return null;

    return (
      <div className="bg-priority-critical text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-xs sm:text-sm font-medium">
          <Megaphone className="size-4 shrink-0" />
          <p>
            {isFr ? (
              <>
                <strong>Alerte importante :</strong> Veuillez coordonner avec les points de collecte et les centres d&apos;hébergement avant d&apos;acheminer les convois d&apos;aide.
              </>
            ) : (
              <>
                <strong>تنبيه هام:</strong> يُرجى التنسيق المسبق مع نقاط التجميع ومراكز الإيواء قبل توجيه القوافل لضمان وصول المساعدات مباشرة للمتضررين.
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  const totalChars = messages.reduce((n, m) => n + m.message.length, 0);
  const duration = Math.max(25, Math.min(120, Math.round(totalChars / 4)));

  return (
    <div className="bg-priority-critical text-white border-b border-priority-critical/30">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-2">
        <span className="flex shrink-0 items-center gap-1.5 text-xs sm:text-sm font-bold">
          <Megaphone className="size-4 animate-pulse" />
          <span className="hidden sm:inline">{isFr ? "Urgent" : "عاجل"}</span>
        </span>

        <div className="ticker-viewport relative flex-1 overflow-hidden">
          <div
            className="animate-ticker whitespace-nowrap text-xs sm:text-sm text-center"
            style={{ "--ticker-duration": `${duration}s` } as React.CSSProperties}
          >
            {messages.map((m, i) => (
              <span key={m.id}>
                {i > 0 && <span className="mx-4 opacity-60">•</span>}
                {m.message}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="sr-only">
        {messages.map((m) => (
          <p key={m.id}>{m.message}</p>
        ))}
      </div>
    </div>
  );
  } catch {
    return null;
  }
}
