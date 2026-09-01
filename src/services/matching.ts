import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { PointStatus } from "@/lib/constants";
import { findWilayaByName, haversineDistanceKm } from "@/lib/wilayas";

type Need = Database["public"]["Tables"]["needs"]["Row"];
type PublicPoint = {
  id: string;
  name: string;
  wilaya: string;
  commune: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  opening_hours: string | null;
  status: PointStatus;
  verification_level: string;
  accepted_categories?: string[];
};

const priorityRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export interface DonationItemInput {
  category_id: string;
  category_slug: string;
  quantity: number;
  unit: string;
}

export interface NeedMatch {
  need: Need;
  deficit: number;
}

/**
 * findMatchingNeedsForDonation
 * يبحث عن أفضل احتياج نشط مطابق لكل مادة من مواد المساعدة المسجَّلة،
 * مرتبة حسب الأولوية ثم حجم النقص — منطق مطابقة صريح بدون أي ذكاء اصطناعي.
 */
export async function findMatchingNeedsForDonation(
  supabase: SupabaseClient<Database>,
  items: DonationItemInput[],
  campaignId?: string,
): Promise<NeedMatch[]> {
  const categoryIds = [...new Set(items.map((i) => i.category_id))];
  if (categoryIds.length === 0) return [];

  let query = supabase.from("needs").select("*").in("category_id", categoryIds).eq("status", "active");

  if (campaignId) query = query.eq("campaign_id", campaignId);

  const { data } = await query.limit(50);
  const rows = data ?? [];

  return rows
    .map((need) => ({
      need,
      deficit: Number(need.quantity_needed) - Number(need.quantity_available),
    }))
    .filter((m) => m.deficit > 0)
    .sort((a, b) => {
      const byPriority = (priorityRank[a.need.priority] ?? 99) - (priorityRank[b.need.priority] ?? 99);
      if (byPriority !== 0) return byPriority;
      return b.deficit - a.deficit;
    });
}

export interface DeliveryPointSuggestion {
  id: string;
  kind: "collection_point" | "relief_hub";
  name: string;
  wilaya: string;
  commune: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  openingHours: string | null;
  status: PointStatus;
  verificationLevel: string;
  distanceKm: number | null;
  sameWilaya: boolean;
}

/**
 * suggestDeliveryPoint
 * يقترح أفضل نقطة تسليم (نقطة تجميع أو مركز استقبال) لمتبرع بناءً على:
 * موقعه، نوع المادة، وحالة النقطة (مفتوحة/ممتلئة...).
 */
export async function suggestDeliveryPoint(
  supabase: SupabaseClient<Database>,
  params: { originWilaya: string; categorySlugs: string[] },
): Promise<DeliveryPointSuggestion[]> {
  const [{ data: points }, { data: hubs }] = await Promise.all([
    supabase.rpc("get_public_collection_points"),
    supabase.rpc("get_public_relief_hubs"),
  ]);

  const origin = findWilayaByName(params.originWilaya);

  const candidates: DeliveryPointSuggestion[] = [];

  for (const p of (points ?? []) as PublicPoint[]) {
    if (p.status !== "open") continue;
    const accepts =
      !params.categorySlugs.length ||
      (p.accepted_categories ?? []).length === 0 ||
      params.categorySlugs.some((slug) => p.accepted_categories?.includes(slug));
    if (!accepts) continue;

    const target = findWilayaByName(p.wilaya);
    const distanceKm = origin && target ? haversineDistanceKm(origin, target) : null;

    candidates.push({
      id: p.id,
      kind: "collection_point",
      name: p.name,
      wilaya: p.wilaya,
      commune: p.commune,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      openingHours: p.opening_hours,
      status: p.status,
      verificationLevel: p.verification_level,
      distanceKm,
      sameWilaya: p.wilaya === params.originWilaya,
    });
  }

  for (const h of (hubs ?? []) as PublicPoint[]) {
    if (h.status !== "open") continue;
    const target = findWilayaByName(h.wilaya);
    const distanceKm = origin && target ? haversineDistanceKm(origin, target) : null;

    candidates.push({
      id: h.id,
      kind: "relief_hub",
      name: h.name,
      wilaya: h.wilaya,
      commune: h.commune,
      address: h.address,
      lat: h.lat,
      lng: h.lng,
      openingHours: h.opening_hours,
      status: h.status,
      verificationLevel: h.verification_level,
      distanceKm,
      sameWilaya: h.wilaya === params.originWilaya,
    });
  }

  const verificationRank: Record<string, number> = {
    field_verified: 0,
    verified: 1,
    pending: 2,
    unverified: 3,
  };

  return candidates.sort((a, b) => {
    if (a.sameWilaya !== b.sameWilaya) return a.sameWilaya ? -1 : 1;
    if (a.distanceKm !== null && b.distanceKm !== null && a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }
    return (verificationRank[a.verificationLevel] ?? 99) - (verificationRank[b.verificationLevel] ?? 99);
  });
}

export interface TransportMatch {
  donationId: string;
  donorWilaya: string;
  itemsSummary: string;
  distanceKm: number | null;
}

/**
 * getPublicTransportCandidates
 * نسخة آمنة للعرض العام (بدون تسجيل دخول): تعرض ملخص المساعدات التي تحتاج نقلًا
 * دون أي بيانات شخصية عن المتبرع، عبر دالة RPC مخصصة لهذا الغرض.
 */
export async function getPublicTransportCandidates(
  supabase: SupabaseClient<Database>,
  originWilaya?: string,
): Promise<TransportMatch[]> {
  const { data } = await supabase.rpc("get_public_transport_candidates");
  const origin = originWilaya ? findWilayaByName(originWilaya) : undefined;

  return (data ?? [])
    .map((row) => {
      const target = findWilayaByName(row.current_wilaya);
      const distanceKm = origin && target ? haversineDistanceKm(origin, target) : null;
      return {
        donationId: row.donation_id,
        donorWilaya: row.current_wilaya,
        itemsSummary: row.items_summary ?? "",
        distanceKm,
      };
    })
    .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
}

/**
 * findMatchingDonationsForTransport
 * (لوحة التحكم فقط — تتطلب صلاحية طاقم) تعرض المساعدات المسجَّلة القريبة من مسار سائق
 * مع تفاصيل التواصل الكاملة، لأن هذا السياق داخلي وليس عامًا.
 */
export async function findMatchingDonationsForTransport(
  supabase: SupabaseClient<Database>,
  params: { originWilaya: string; destinationWilaya: string },
): Promise<TransportMatch[]> {
  const { data } = await supabase
    .from("donations")
    .select("id, current_wilaya, donation_items(quantity, unit, categories(name_ar))")
    .eq("needs_transport", true)
    .in("status", ["registered", "matched"])
    .limit(100);

  const origin = findWilayaByName(params.originWilaya);
  const rows = data ?? [];

  return rows
    .map((d) => {
      const target = findWilayaByName(d.current_wilaya);
      const distanceKm = origin && target ? haversineDistanceKm(origin, target) : null;
      const itemsSummary = (d.donation_items ?? [])
        .map((it) => `${it.quantity} ${it.unit} — ${it.categories?.name_ar ?? ""}`)
        .join("، ");
      return { donationId: d.id, donorWilaya: d.current_wilaya, itemsSummary, distanceKm };
    })
    .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
}
