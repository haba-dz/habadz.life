"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { damageAssessmentSchema } from "@/schemas/damage-assessment";
import { estimateDamageMaterials } from "@/services/damage-estimation";
import { logActivity } from "@/services/activity-log";
import { activeCampaignSlug } from "@/config/site";
import type { DamageAssessmentStatus } from "@/lib/constants";

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

async function requireManager(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, user: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { ok: false as const, user };
  return { ok: true as const, user };
}

function sanitizeExt(filename: string): string | null {
  const raw = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.has(raw)) return null;
  if (raw === "jpeg") return "jpg";
  return raw;
}

export type DamageAssessmentActionState = { success: boolean; error?: string };

export async function submitDamageAssessment(
  _prevState: DamageAssessmentActionState,
  formData: FormData,
): Promise<DamageAssessmentActionState> {
  const parsed = damageAssessmentSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    wilaya: formData.get("wilaya"),
    commune: formData.get("commune"),
    address_note: formData.get("address_note") || undefined,
    needs_paint: formData.get("needs_paint") === "on",
    paint_area_sqm: formData.get("paint_area_sqm") || undefined,
    needs_flooring: formData.get("needs_flooring") === "on",
    needs_roofing: formData.get("needs_roofing") === "on",
    needs_plumbing: formData.get("needs_plumbing") === "on",
    needs_electrical: formData.get("needs_electrical") === "on",
    finishing_notes: formData.get("finishing_notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة." };
  }
  const data = parsed.data;

  const supabase = await createClient();

  // P1-05 dedup: phone already submitted within 10 min
  try {
    const adminForDedup = createAdminClient();
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recent } = await adminForDedup
      .from("damage_assessments")
      .select("id")
      .eq("phone", data.phone)
      .gte("created_at", tenMinAgo)
      .limit(1);
    if (recent && recent.length > 0) {
      return { success: false, error: "تم تسجيل طلبك مؤخراً، يرجى الانتظار 10 دقائق قبل إعادة المحاولة." };
    }
  } catch {
    // fail open for dedup check — do not block legitimate request if admin key missing locally
  }

  // P1-01 + P0-02 hardening: limit count/size/type and use random path (no wilaya in path)
  const photoPaths: string[] = [];
  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (photos.length > MAX_PHOTOS) {
    return { success: false, error: `عدد الصور كبير جداً (الحد ${MAX_PHOTOS} صور).` };
  }
  const uploadResults = await Promise.allSettled(
    photos.map(async (file) => {
      if (file.size > MAX_PHOTO_SIZE) {
        throw new Error("photo_too_large");
      }
      if (file.type && !ALLOWED_MIME.has(file.type)) {
        throw new Error("unsupported_type");
      }
      const ext = sanitizeExt(file.name);
      if (!ext) {
        throw new Error("unsupported_ext");
      }
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("damage-photos")
        .upload(path, file, { contentType: file.type || `image/${ext}`, upsert: false });
      if (uploadError) throw uploadError;
      return path;
    }),
  );

  const succeededPaths: string[] = [];
  for (const result of uploadResults) {
    if (result.status === "fulfilled") {
      succeededPaths.push(result.value);
    } else {
      if (succeededPaths.length > 0) {
        await supabase.storage.from("damage-photos").remove(succeededPaths);
      }
      const msg = result.reason?.message ?? "";
      if (msg === "photo_too_large") {
        return { success: false, error: "إحدى الصور كبيرة جداً (الحد 5MB للصورة)." };
      }
      if (msg === "unsupported_type") {
        return { success: false, error: "نوع الصورة غير مدعوم (المسموح: JPG PNG WEBP HEIC)." };
      }
      if (msg === "unsupported_ext") {
        return { success: false, error: "امتداد الصورة غير مدعوم." };
      }
      console.error("Damage photo upload error:", result.reason);
      return { success: false, error: "فشل رفع الصور، حاول مرة أخرى بصور أصغر." };
  const fulfilledPaths = uploadResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map((r) => r.value);

  const rejected = uploadResults.find(
    (r): r is PromiseRejectedResult => r.status === "rejected",
  );

  if (rejected) {
    if (fulfilledPaths.length > 0) {
      await supabase.storage.from("damage-photos").remove(fulfilledPaths);
    }
    const msg = rejected.reason?.message ?? "";
    if (msg === "photo_too_large") {
      return { success: false, error: "إحدى الصور كبيرة جداً (الحد 5MB للصورة)." };
    }
    if (msg === "unsupported_type") {
      return { success: false, error: "نوع الصورة غير مدعوم (المسموح: JPG PNG WEBP HEIC)." };
    }
    if (msg === "unsupported_ext") {
      return { success: false, error: "امتداد الصورة غير مدعوم." };
    }
    console.error("Damage photo upload error:", rejected.reason);
    return { success: false, error: "فشل رفع الصور، حاول مرة أخرى بصور أصغر." };
  }
  photoPaths.push(...succeededPaths);

  photoPaths.push(...fulfilledPaths);

  const estimate = estimateDamageMaterials({
    needsPaint: data.needs_paint,
    paintAreaSqm: data.paint_area_sqm ?? null,
    needsFlooring: data.needs_flooring,
    needsRoofing: data.needs_roofing,
    needsPlumbing: data.needs_plumbing,
    needsElectrical: data.needs_electrical,
  });

  const hasAnyMaterialNeed =
    data.needs_paint || data.needs_flooring || data.needs_roofing || data.needs_plumbing || data.needs_electrical;

  // ننشئ احتياجًا قياسيًا (مواد بناء) يدخل تلقائيًا في دورة المطابقة الحالية
  // (donations -> matching.ts -> transport) دون أي كود مطابقة إضافي.
  // P0-03+P1-02: use service-role for needs insert (anon RLS would block is_manager)
  let linkedNeedId: string | null = null;
  if (hasAnyMaterialNeed) {
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("slug", activeCampaignSlug)
      .maybeSingle();

    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "construction_materials")
      .maybeSingle();

    if (campaign && category) {
      // P2-01: derive priority from severity instead of hardcoded medium
      const derivedPriority =
        data.needs_roofing || data.needs_electrical
          ? "critical"
          : data.needs_plumbing || estimate.paintCans > 10
            ? "high"
            : "medium";
      try {
        const adminSupabase = createAdminClient();
        const { data: need, error: needError } = await adminSupabase
          .from("needs")
          .insert({
            campaign_id: campaign.id,
            category_id: category.id,
            wilaya: data.wilaya,
            commune: data.commune,
            title: `مواد ترميم — ${data.full_name}`,
            quantity_needed: estimate.paintCans > 0 ? estimate.paintCans : 1,
            quantity_available: 0,
            unit: "piece",
            priority: derivedPriority,
            notes: data.finishing_notes || null,
            source_type: "public_report",
          })
          .select("id")
          .maybeSingle();
        if (!needError) linkedNeedId = need?.id ?? null;
        else console.error("Linked need insert error:", needError);
      } catch (e) {
        console.error("Admin client missing for linked need:", e);
      }
    }
  }

  const { error } = await supabase.from("damage_assessments").insert({
    full_name: data.full_name,
    phone: data.phone,
    wilaya: data.wilaya,
    commune: data.commune,
    address_note: data.address_note || null,
    needs_paint: data.needs_paint,
    paint_area_sqm: data.paint_area_sqm ?? null,
    needs_flooring: data.needs_flooring,
    needs_roofing: data.needs_roofing,
    needs_plumbing: data.needs_plumbing,
    needs_electrical: data.needs_electrical,
    finishing_notes: data.finishing_notes || null,
    photo_paths: photoPaths,
    status: "estimated",
    estimated_paint_liters: estimate.paintLiters || null,
    estimated_paint_cans: estimate.paintCans || null,
    required_specialties: estimate.requiredSpecialties,
    linked_need_id: linkedNeedId,
  });

  if (error) {
    console.error("Damage assessment insert error:", error);
    // P1-06 compensating delete: remove orphan photos if DB insert failed
    if (photoPaths.length > 0) {
      await supabase.storage.from("damage-photos").remove(photoPaths);
    }
    return { success: false, error: "حدث خطأ أثناء تسجيل التقييم. حاول مرة أخرى." };
  }

  // P1-04: log via service-role so anon RLS (is_staff) does not silently drop it
  try {
    const adminForLog = createAdminClient();
    await adminForLog.from("activity_logs").insert({
      actor_id: null,
      action: `طلب تقييم أضرار جديد من ${data.full_name} (${data.commune})`,
      entity_type: "damage_assessment",
    });
  } catch {
    await logActivity(supabase, {
      action: `طلب تقييم أضرار جديد من ${data.full_name} (${data.commune})`,
      entityType: "damage_assessment",
    });
  }

  revalidatePath("/admin/damage-assessments");
  revalidatePath("/admin/needs");
  revalidatePath("/needs");
  return { success: true };
}

export async function updateDamageAssessmentStatus(id: string, status: DamageAssessmentStatus) {
  const supabase = await createClient();
  const gate = await requireManager(supabase);
  if (!gate.ok) return { success: false, error: "غير مخوّل — هذه العملية للطاقم فقط." };
  const { user } = gate;

  const { error } = await supabase.from("damage_assessments").update({ status }).eq("id", id);
  if (error) return { success: false, error: "ليست لديك صلاحية تغيير الحالة (الأدمن فقط)." };

  await logActivity(supabase, {
    actorId: user?.id,
    action: `غيّر حالة تقييم أضرار إلى ${status}`,
    entityType: "damage_assessment",
    entityId: id,
  });

  revalidatePath("/admin/damage-assessments");
  return { success: true };
}

export async function assignArtisanToAssessment(assessmentId: string, artisanId: string | null) {
  const supabase = await createClient();
  const gate = await requireManager(supabase);
  if (!gate.ok) return { success: false, error: "غير مخوّل — هذه العملية للطاقم فقط." };
  const { user } = gate;

  const { error } = await supabase
    .from("damage_assessments")
    .update({ assigned_artisan_id: artisanId })
    .eq("id", assessmentId);
  if (error) return { success: false, error: "ليست لديك صلاحية إسناد حرفي (الأدمن فقط)." };

  await logActivity(supabase, {
    actorId: user?.id,
    action: artisanId ? "أسند حرفيًا لتقييم أضرار" : "ألغى إسناد الحرفي عن تقييم أضرار",
    entityType: "damage_assessment",
    entityId: assessmentId,
  });

  revalidatePath("/admin/damage-assessments");
  return { success: true };
}

export async function getSignedDamagePhotoUrl(path: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("damage-photos").createSignedUrl(path, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function getBatchSignedDamagePhotoUrls(
  paths: string[],
): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("damage-photos")
    .createSignedUrls(paths, 60 * 10);
  if (error || !data) return new Map();
  const map = new Map<string, string>();
  for (const entry of data) {
    if (!entry.path || entry.error || !entry.signedUrl) continue;
    map.set(entry.path, entry.signedUrl);
  }
  return map;
}
