import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveCampaign } from "@/lib/data/public";
import {
  OFFICIAL_ALGERIAN_SOURCES,
  classifyNewsItem,
  type IngestedNewsItem,
} from "@/config/news-sources";

export { OFFICIAL_ALGERIAN_SOURCES, classifyNewsItem };
export type { IngestedNewsItem };

/**
 * Returns a Supabase client capable of writing official news updates.
 * Prefers the Admin Client (service role) for automated crons/webhooks to bypass RLS,
 * falling back to the standard server client.
 */
async function getNewsDbClient() {
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return createAdminClient();
    }
  } catch {
    // Fallback to standard server client
  }
  return await createClient();
}

/**
 * Fetches and synchronizes official bulletins from registered Algerian emergency sources.
 */
export async function syncOfficialNews(): Promise<{
  success: boolean;
  syncedCount: number;
  items: IngestedNewsItem[];
  error?: string;
}> {
  try {
    const campaign = await getActiveCampaign();
    if (!campaign?.id) {
      return {
        success: false,
        syncedCount: 0,
        items: [],
        error: "Active campaign not found in database",
      };
    }

    const fetchedItems: IngestedNewsItem[] = [];

    // In production, no fake bulletins — they pollute official Updates and
    // make sync look successful when DB is down. Keep demo data only for dev.
    const sampleOfficialBulletins: IngestedNewsItem[] =
      process.env.NODE_ENV === "production"
        ? []
        : [
            {
              title: "الحماية المدنية: السيطرة التامة على بؤرة غابة العوانة وإخماد ألسنة اللهب بنسبة 95%",
              body: "تعلن مصالح الحماية المدنية لولاية جيجل بالتعاون مع محافظة الغابات عن نجاح عمليات التدخل الجوي والأرتال المتنقلة في إخماد حريق غابة العوانة مع استمرار الحراسة الوقائية لمنع تجدد البؤر.",
              source: "مديرية الحماية المدنية لولاية جيجل",
              authority: "protection_civile",
              url: "https://www.facebook.com/DGPC0018",
              update_type: "fire_alert",
              wilaya: "جيجل",
              is_urgent: true,
              published_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            },
            {
              title: "الدرك الوطني (طريقي): إعادة فتح الطريق الوطني رقم 43 الرابط بين جيجل وبجاية أمام حركة القوافل والشاحنات",
              body: "تُعلم مصالح الدرك الوطني مستعملي الطريق بفتح المقطع بين زيامة منصورية والخيارة بعد الانتهاء من تأمين حواف الطريق وإزالة مخلفات الأشجار. يُرجى الالتزام بالسرعة القانونية وتسهيل مرور مركبات الإسعاف.",
              source: "طريقي - مركز الإعلام وتنسيق المرور للدرك الوطني",
              authority: "gendarmerie",
              url: "https://www.facebook.com/tariki.gendarmerie.algerie",
              update_type: "road_status",
              wilaya: "جيجل",
              is_urgent: false,
              published_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            },
            {
              title: "الديوان الوطني للأرصاد الجوية: نشرية خاصة تحذر من رياح قوية وانخفاض تدريجي في درجات الحرارة بالسواحل الشرقية",
              body: "نشرية جوية خاصة برياح شرقية إلى شمالية شرقية تتراوح سرعتها بين 40 و60 كم/سا على ولايات جيجل، بجاية، وسكيكدة مما يساعد في تبريد المناطق الجبلية ويسهل عمل فرق الإطفاء الأرضية.",
              source: "الديوان الوطني للأرصاد الجوية (Météo Algérie)",
              authority: "meteo",
              url: "https://www.facebook.com/MeteoAlgerieOfficiel/",
              update_type: "weather_warning",
              wilaya: "جيجل",
              is_urgent: false,
              published_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            },
            {
              title: "محافظة الغابات: تشديد دوريات المراقبة وتوجيه شاحنات الصهاريج نحو النقاط الحساسة في غابة بوعفرون بالميلية",
              body: "انتشار فرق الغابات بالتنسيق مع المتطوعين المعتمدين لتزويد نقاط التزويد بالماء وفتح المسالك الترابية أمام سيارات التدخل السريع التابعة لمراكز الإيواء.",
              source: "المديرية العامة للغابات",
              authority: "forets",
              url: "https://www.facebook.com/forets.algerie",
              update_type: "safety_guidelines",
              wilaya: "جيجل",
              is_urgent: false,
              published_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
            },
            {
              title: "خلية الأزمة الولائية: توجيه كافة التبرعات العينية الجديدة مباشرة إلى المركز الجهوي للتجميع بحي لعقابي",
              body: "تهيب خلية الأزمة بالجمعيات والمتبرعين القادمين من مختلف الولايات التوجه إلى المستودع المركزي بجيجل لتنظيم التوزيع بالتساوي وتجنب التكدس في مراكز الإيواء المكتملة.",
              source: "خلية الأزمة ومتابعة الطوارئ - ولاية جيجل",
              authority: "wilaya",
              url: "https://www.facebook.com/WilayadeJijel",
              update_type: "statement",
              wilaya: "جيجل",
              is_urgent: true,
              published_at: new Date(Date.now() - 1000 * 60 * 520).toISOString(),
            },
          ];

    const sources = OFFICIAL_ALGERIAN_SOURCES.filter((s) => s.enabled && s.feedUrl);
    const feedResults = await Promise.allSettled(
      sources.map((source) =>
        fetch(source.feedUrl!, { next: { revalidate: 300 } })
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => ({ source, items: json?.items ?? [] }))
          .catch(() => ({ source, items: [] })),
      ),
    );

    for (const result of feedResults) {
      if (result.status !== "fulfilled") continue;
      const { source, items } = result.value;
      for (const item of items.slice(0, 5)) {
        const fullText = `${item.title || ""} ${item.description || ""}`;
        const { update_type, wilaya, is_urgent } = classifyNewsItem(fullText);

        if (
          fullText.includes("حريق") ||
          fullText.includes("حماية") ||
          fullText.includes("غابات") ||
          fullText.includes("طريق") ||
          fullText.includes("جيجل") ||
          fullText.includes("بجاية") ||
          fullText.includes("سطيف") ||
          fullText.includes("ميلة") ||
          fullText.includes("سكيكدة")
        ) {
          fetchedItems.push({
            title: item.title,
            body: item.description?.replace(/<[^>]*>?/gm, "").slice(0, 300),
            source: source.name,
            authority: source.authority,
            url: item.link || source.sourceUrl,
            update_type,
            wilaya,
            is_urgent,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            external_id: item.guid || item.link,
          });
        }
      }
    }

    const allToSync = [...sampleOfficialBulletins, ...fetchedItems];
    let insertedCount = 0;

    try {
      const supabase = await getNewsDbClient();

      const { data: existing } = await supabase
        .from("official_updates")
        .select("title, url, external_id");

      const existingTitles = new Set((existing ?? []).map((e) => e.title));
      const existingUrls = new Set((existing ?? []).map((e) => e.url).filter(Boolean));
      const existingExtIds = new Set((existing ?? []).map((e) => (e as { external_id?: string | null }).external_id).filter(Boolean) as string[]);

      const newItemsToInsert = allToSync.filter(
        (item) =>
          !existingTitles.has(item.title) &&
          (!item.url || !existingUrls.has(item.url)) &&
          (!item.external_id || !existingExtIds.has(item.external_id)),
      );

      if (newItemsToInsert.length > 0) {
        const rows = newItemsToInsert.map((item) => ({
          campaign_id: campaign.id,
          title: item.title,
          body: item.body || null,
          source: item.source,
          url: item.url || null,
          update_type: item.update_type || "news",
          wilaya: item.wilaya ?? null,
          authority: item.authority ?? null,
          is_urgent: item.is_urgent ?? false,
          external_id: item.external_id ?? null,
          published_at: item.published_at,
        }));

        const { data: inserted, error: insertErr } = await supabase
          .from("official_updates")
          .insert(rows)
          .select("id");

        if (insertErr) {
          console.error("[news-ingestion] insert:", insertErr);
        } else if (inserted) {
          insertedCount = inserted.length;
        }
      }

      if (insertedCount > 0) {
        try {
          revalidatePath("/official-information");
          revalidatePath("/admin/news");
          revalidatePath("/");
        } catch {
          // Ignore
        }
      }
    } catch (dbErr) {
      console.warn("DB sync warning:", dbErr);
    }

    return {
      success: true,
      syncedCount: insertedCount,
      items: allToSync,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    return {
      success: false,
      syncedCount: 0,
      items: [],
      error: message,
    };
  }
}
