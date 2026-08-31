import "server-only";
import { createClient } from "@/lib/supabase/server";
import { activeCampaignSlug } from "@/config/site";
import type { Database } from "@/types/database";

type CollectionPointRow = Database["public"]["Tables"]["collection_points"]["Row"];
type ReliefHubRow = Database["public"]["Tables"]["relief_hubs"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export async function getAdminDashboardStats() {
  try {
    const supabase = await createClient();

    const [
      { count: totalFamilies },
      { count: familiesAwaiting },
      { count: donationsCount },
      { count: activeShipments },
      { count: openCollectionPoints },
      { count: openReliefHubs },
      { count: criticalNeeds },
    ] = await Promise.all([
      supabase.from("beneficiary_requests").select("*", { count: "exact", head: true }),
      supabase
        .from("beneficiary_requests")
        .select("*", { count: "exact", head: true })
        .not("status", "in", "(helped,closed,rejected)"),
      supabase.from("donations").select("*", { count: "exact", head: true }),
      supabase
        .from("transport_offers")
        .select("*", { count: "exact", head: true })
        .in("status", ["requested", "matched", "confirmed", "in_transit"]),
      supabase.from("collection_points").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("relief_hubs").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase
        .from("needs")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .eq("priority", "critical"),
    ]);

    return {
      totalFamilies: totalFamilies ?? 142,
      familiesAwaiting: familiesAwaiting ?? 38,
      donationsCount: donationsCount ?? 412,
      activeShipments: activeShipments ?? 16,
      activePoints: (openCollectionPoints ?? 5) + (openReliefHubs ?? 3),
      criticalNeeds: criticalNeeds ?? 5,
    };
  } catch {
    return {
      totalFamilies: 142,
      familiesAwaiting: 38,
      donationsCount: 412,
      activeShipments: 16,
      activePoints: 8,
      criticalNeeds: 5,
    };
  }
}

export async function getActiveCampaignId() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("campaigns")
      .select("id")
      .eq("slug", activeCampaignSlug)
      .maybeSingle();
    return data?.id ?? "demo-campaign-id";
  } catch {
    return "demo-campaign-id";
  }
}

export async function getRecentActivity(limit = 10) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("activity_logs")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (data && data.length > 0) return data;
  } catch {
    // Fallback demo activities
  }

  return [
    {
      id: "act-1",
      action: "تم توثيق طلب عائلة من بلدية زيامة المنصورية",
      created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      profiles: { full_name: "محمد الأمين (مشرف)" },
    },
    {
      id: "act-2",
      action: "شحنة 150 طردًا غذائيًا وصلت إلى مركز الاستقبال بالطاهير",
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      profiles: { full_name: "ياسين بن علي (منسق)" },
    },
    {
      id: "act-3",
      action: "تسجيل نقطة تجميع جديدة في ولاية سطيف",
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      profiles: { full_name: "كريم منصوري (مشرف)" },
    },
    {
      id: "act-4",
      action: "تحديث مخزون المياه المعدنية بمركز الميلية (+500 حزمة)",
      created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      profiles: { full_name: "أحمد بن سالم (لوجستيات)" },
    },
  ];
}

export async function getAllCategories(): Promise<CategoryRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    if (data && data.length > 0) return data as CategoryRow[];
  } catch {
    // Fallback demo categories
  }

  return [
    { id: "cat-1", slug: "food_baskets", name_ar: "طرود غذائية", default_unit: "carton", sort_order: 1, created_at: new Date().toISOString() },
    { id: "cat-2", slug: "water", name_ar: "مياه شرب", default_unit: "box", sort_order: 2, created_at: new Date().toISOString() },
    { id: "cat-3", slug: "blankets_mattresses", name_ar: "أفرشة وأغطية", default_unit: "piece", sort_order: 3, created_at: new Date().toISOString() },
    { id: "cat-4", slug: "baby_supplies", name_ar: "مستلزمات أطفال", default_unit: "bundle", sort_order: 4, created_at: new Date().toISOString() },
    { id: "cat-5", slug: "medicines_first_aid", name_ar: "أدوية ومستلزمات طبية", default_unit: "piece", sort_order: 5, created_at: new Date().toISOString() },
    { id: "cat-6", slug: "cooking_supplies", name_ar: "معدات طبخ", default_unit: "piece", sort_order: 6, created_at: new Date().toISOString() },
  ];
}

export async function getAllReliefHubs(): Promise<ReliefHubRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("relief_hubs").select("*").order("name");
    if (data && data.length > 0) return data as ReliefHubRow[];
  } catch {
    // Fallback demo hubs
  }

  return [
    {
      id: "hub-1",
      campaign_id: "demo-campaign",
      name: "مركز الاستقبال والإيواء الرئيسي - بلدية جيجل",
      wilaya: "جيجل",
      commune: "جيجل",
      address: "وسط المدينة، بجانب القاعة المتعددة الرياضات",
      lat: 36.82,
      lng: 5.76,
      phone: "034567890",
      show_phone_publicly: true,
      contact_name: "إدارة المركز",
      opening_hours: "24/24 ساعة",
      capacity_note: "يتسع لـ 50 عائلة",
      is_shelter: true,
      status: "open",
      verification_level: "verified",
      verified_by: null,
      verified_at: new Date().toISOString(),
      notes: "مركز مجهز لاستقبال العائلات وتوزيع الحصص",
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "hub-2",
      campaign_id: "demo-campaign",
      name: "مستودع الإغاثة الميداني - بلدية الطاهير",
      wilaya: "جيجل",
      commune: "الطاهير",
      address: "المنطقة الصناعية الطاهير",
      lat: 36.77,
      lng: 5.89,
      phone: "034567891",
      show_phone_publicly: true,
      contact_name: "مسؤول المستودع",
      opening_hours: "08:00 - 20:00",
      capacity_note: "مستودع تخزين كبير",
      is_shelter: false,
      status: "open",
      verification_level: "verified",
      verified_by: null,
      verified_at: new Date().toISOString(),
      notes: "نقطة شحن وتفريغ رئيسية للشاحنات الكبيرة",
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "hub-3",
      campaign_id: "demo-campaign",
      name: "مركز التوزيع السريع - بلدية الميلية",
      wilaya: "جيجل",
      commune: "الميلية",
      address: "الشارع الرئيسي الميلية",
      lat: 36.75,
      lng: 6.26,
      phone: "034567892",
      show_phone_publicly: true,
      contact_name: "خلية الأزمة",
      opening_hours: "08:00 - 22:00",
      capacity_note: null,
      is_shelter: false,
      status: "open",
      verification_level: "verified",
      verified_by: null,
      verified_at: new Date().toISOString(),
      notes: "تغطية القرى الشرقية",
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export async function getAllCollectionPoints(): Promise<CollectionPointRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("collection_points").select("*").order("name");
    if (data && data.length > 0) return data as CollectionPointRow[];
  } catch {
    // Fallback demo points
  }

  return [
    {
      id: "point-1",
      campaign_id: "demo-campaign",
      name: "نقطة تجميع ساحة أول ماي - الجزائر العاصمة",
      wilaya: "الجزائر",
      commune: "سيدي امحمد",
      address: "ساحة أول ماي، بجانب محطة المترو",
      lat: 36.75,
      lng: 3.05,
      phone: "0550123456",
      show_phone_publicly: true,
      contact_name: "تنسيقية العاصمة",
      opening_hours: "08:00 - 20:00",
      capacity_note: null,
      accepted_categories: ["food_baskets", "water", "blankets_mattresses"],
      status: "open",
      verification_level: "verified",
      verified_by: null,
      verified_at: new Date().toISOString(),
      notes: "استقبال التبرعات العينية يوميًا",
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "point-2",
      campaign_id: "demo-campaign",
      name: "نقطة تجميع قسنطينة المركزية",
      wilaya: "قسنطينة",
      commune: "قسنطينة",
      address: "وسط المدينة قسنطينة",
      lat: 36.36,
      lng: 6.61,
      phone: "0661234567",
      show_phone_publicly: true,
      contact_name: "فريق الإغاثة",
      opening_hours: "09:00 - 18:00",
      capacity_note: null,
      accepted_categories: ["food_baskets", "medicines_first_aid"],
      status: "open",
      verification_level: "verified",
      verified_by: null,
      verified_at: new Date().toISOString(),
      notes: null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "point-3",
      campaign_id: "demo-campaign",
      name: "نقطة تجميع سطيف - حي 1014 مسكن",
      wilaya: "سطيف",
      commune: "سطيف",
      address: "حي 1014 مسكن سطيف",
      lat: 36.19,
      lng: 5.41,
      phone: "0770345678",
      show_phone_publicly: true,
      contact_name: "جمعية الأمل",
      opening_hours: "08:30 - 19:30",
      capacity_note: null,
      accepted_categories: ["blankets_mattresses", "baby_supplies"],
      status: "open",
      verification_level: "verified",
      verified_by: null,
      verified_at: new Date().toISOString(),
      notes: null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export async function getTopCriticalNeeds(limit = 6): Promise<unknown[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("needs")
      .select("*, categories(slug, name_ar)")
      .eq("status", "active")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (data && data.length > 0) return data;
  } catch {
    // Fallback demo critical needs
  }

  return [
    {
      id: "need-1",
      campaign_id: "demo-campaign",
      title: "أفرشة وأغطية شتوية عاجلة للأسر المنكوبة",
      wilaya: "جيجل",
      commune: "زيامة المنصورية",
      quantity_needed: 120,
      quantity_available: 35,
      unit: "piece" as const,
      priority: "critical" as const,
      status: "active" as const,
      is_auto_generated: false,
      notes: "منازل متضررة بالكامل نتيجة الانزلاقات وحاجة فورية للأفرشة",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      categories: { slug: "blankets_mattresses", name_ar: "أفرشة وأغطية" },
    },
    {
      id: "need-2",
      campaign_id: "demo-campaign",
      title: "حليب أطفال وحفاظات مقاس 2 و 3",
      wilaya: "جيجل",
      commune: "الشقفة",
      quantity_needed: 80,
      quantity_available: 20,
      unit: "pack" as const,
      priority: "critical" as const,
      status: "active" as const,
      is_auto_generated: true,
      notes: "نقص حاد في مستلزمات الرضع في مراكز الإيواء المؤقتة",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      categories: { slug: "baby_supplies", name_ar: "مستلزمات أطفال" },
    },
    {
      id: "need-3",
      campaign_id: "demo-campaign",
      title: "طرود غذائية أساسية (سميد، زيت، سكر، حليب)",
      wilaya: "جيجل",
      commune: "العنصر",
      quantity_needed: 200,
      quantity_available: 80,
      unit: "basket" as const,
      priority: "critical" as const,
      status: "active" as const,
      is_auto_generated: false,
      notes: "أسر معزولة في المداشر الجبلية",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      categories: { slug: "food_baskets", name_ar: "طرود غذائية" },
    },
    {
      id: "need-4",
      campaign_id: "demo-campaign",
      title: "مياه شرب معدنية صالحة للاستخدام",
      wilaya: "جيجل",
      commune: "سلمى بن زيادة",
      quantity_needed: 300,
      quantity_available: 150,
      unit: "box" as const,
      priority: "high" as const,
      status: "active" as const,
      is_auto_generated: false,
      notes: "انقطاع شبكة مياه الشرب",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      categories: { slug: "water", name_ar: "مياه شرب" },
    },
  ];
}

export async function getPendingVerificationCounts() {
  try {
    const supabase = await createClient();
    const pendingLevels = ["unverified", "pending"] as const;
    const [
      { count: points },
      { count: hubs },
      { count: requests },
    ] = await Promise.all([
      supabase.from("collection_points").select("*", { count: "exact", head: true }).in("verification_level", pendingLevels),
      supabase.from("relief_hubs").select("*", { count: "exact", head: true }).in("verification_level", pendingLevels),
      supabase.from("beneficiary_requests").select("*", { count: "exact", head: true }).in("verification_level", pendingLevels),
    ]);
    return {
      points: points ?? 2,
      hubs: hubs ?? 1,
      requests: requests ?? 5,
      total: (points ?? 2) + (hubs ?? 1) + (requests ?? 5),
    };
  } catch {
    return {
      points: 2,
      hubs: 1,
      requests: 5,
      total: 8,
    };
  }
}

/**
 * عدد الاحتياجات النشطة موزّعة حسب الأولوية — لرسم بياني بالألوان الدلالية
 * الموحّدة نفسها المستخدمة في PriorityBadge عبر المنصة (لا ألوان جديدة).
 */
export async function getNeedsByPriority() {
  const supabase = await createClient();
  const { data } = await supabase.from("needs").select("priority").eq("status", "active");

  const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const row of data ?? []) {
    counts[row.priority] = (counts[row.priority] ?? 0) + 1;
  }
  return counts;
}

/**
 * سجل يومي (آخر N يومًا) لعدد الاحتياجات المسجَّلة مقابل المساعدات المسجَّلة —
 * تجميع في الذاكرة (لا RPC) لأن حجم البيانات الحالي صغير، بنفس منطق باقي
 * صفحات الإدارة التي تجلب كل السجلات دون Pagination.
 */
export async function getActivityTrend(days = 14) {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const [{ data: needs }, { data: donations }] = await Promise.all([
    supabase.from("needs").select("created_at").gte("created_at", since.toISOString()),
    supabase.from("donations").select("created_at").gte("created_at", since.toISOString()),
  ]);

  const buckets = new Map<string, { needs: number; donations: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), { needs: 0, donations: 0 });
  }

  for (const row of needs ?? []) {
    const key = row.created_at.slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) bucket.needs += 1;
  }
  for (const row of donations ?? []) {
    const key = row.created_at.slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) bucket.donations += 1;
  }

  return [...buckets.entries()].map(([date, v]) => ({ date, ...v }));
}

/** فرق نسبة مئوية بين قيمتين، مع التعامل مع حالة الصفر السابق دون قسمة على صفر. */
function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * وتيرة التسجيل الأسبوعية (هذا الأسبوع مقابل الأسبوع الماضي) للمساعدات
 * والاحتياجات — تُستخدم كسهم اتجاه (▲/▼) بجانب بطاقات KPI الرئيسية.
 */
export async function getWeekOverWeekDelta() {
  const supabase = await createClient();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const [
    { count: donationsThisWeek },
    { count: donationsLastWeek },
    { count: needsThisWeek },
    { count: needsLastWeek },
  ] = await Promise.all([
    supabase
      .from("donations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    supabase
      .from("donations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", twoWeeksAgo.toISOString())
      .lt("created_at", weekAgo.toISOString()),
    supabase
      .from("needs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    supabase
      .from("needs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", twoWeeksAgo.toISOString())
      .lt("created_at", weekAgo.toISOString()),
  ]);

  return {
    donationsDeltaPct: pctDelta(donationsThisWeek ?? 0, donationsLastWeek ?? 0),
    needsDeltaPct: pctDelta(needsThisWeek ?? 0, needsLastWeek ?? 0),
  };
}

/**
 * عدّادات "قيد الانتظار" لكل قسم — تُعرض كشارات حيّة في القائمة الجانبية.
 * استعلامات count فقط (head: true) لتبقى خفيفة.
 */
export async function getPendingCounts() {
  const supabase = await createClient();
  const [
    { count: pendingVerification },
    { count: pendingDamageAssessments },
    { count: pendingArtisans },
    { count: pendingMedical },
  ] = await Promise.all([
    supabase
      .from("beneficiary_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "under_review"]),
    supabase
      .from("damage_assessments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("artisan_volunteers")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("medical_volunteers")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    "/admin/verification": pendingVerification ?? 0,
    "/admin/damage-assessments": pendingDamageAssessments ?? 0,
    "/admin/artisans": pendingArtisans ?? 0,
    "/admin/medical": pendingMedical ?? 0,
  } as Record<string, number>;
}
