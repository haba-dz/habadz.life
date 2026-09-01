"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/services/activity-log";
import { activeCampaignSlug } from "@/config/site";
import { findWilaya } from "@/lib/algeria-cities";

const stripControl = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

export const pointSchema = z
  .object({
    name: z.string().trim().min(2, "الاسم مطلوب").max(120, "الاسم طويل جداً").transform(stripControl),
    wilaya: z
      .string()
      .trim()
      .min(1, "الولاية مطلوبة")
      .refine((v) => !!findWilaya(v), "الولاية غير صحيحة"),
    commune: z.string().trim().min(1, "البلدية مطلوبة").max(60, "البلدية طويلة").transform(stripControl),
    address: z.string().trim().max(300).transform(stripControl).optional().or(z.literal("")),
    lat: z.number().finite().min(-90).max(90).optional(),
    lng: z.number().finite().min(-180).max(180).optional(),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine((v) => !v || /^0[5-7][0-9]{8}$/.test(v) || /^\+213[5-7][0-9]{8}$/.test(v), "رقم هاتف غير صحيح")
      .optional()
      .or(z.literal("")),
    show_phone_publicly: z.boolean(),
    contact_name: z.string().trim().max(100).transform(stripControl).optional().or(z.literal("")),
    opening_hours: z.string().trim().max(200).transform(stripControl).optional().or(z.literal("")),
    notes: z.string().trim().max(500).transform(stripControl).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const hasLat = data.lat != null;
    const hasLng = data.lng != null;
    if (hasLat !== hasLng) {
      ctx.addIssue({ code: "custom", message: "يجب تحديد الإحداثيات كاملة أو تركها فارغة", path: ["lat"] });
    }
  });

export const collectionPointSchema = pointSchema.extend({
  accepted_categories: z.array(z.string().trim().min(1).max(50).transform(stripControl)).max(20),
});

export type CollectionPointInput = z.infer<typeof collectionPointSchema>;

export async function createCollectionPoint(input: CollectionPointInput) {
  const parsed = collectionPointSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "بيانات غير صحيحة." };
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { success: false, error: "غير مصرح" };

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", activeCampaignSlug)
    .maybeSingle();
  if (!campaign) return { success: false, error: "تعذر تحديد الحملة النشطة." };

  const { data: inserted, error } = await supabase
    .from("collection_points")
    .insert({
      campaign_id: campaign.id,
      name: data.name,
      wilaya: data.wilaya,
      commune: data.commune,
      address: data.address || null,
      lat: data.lat,
      lng: data.lng,
      phone: data.phone || null,
      show_phone_publicly: data.show_phone_publicly,
      contact_name: data.contact_name || null,
      accepted_categories: data.accepted_categories,
      opening_hours: data.opening_hours || null,
      notes: data.notes || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: "حدث خطأ أثناء إضافة نقطة التجميع." };

  await logActivity(supabase, {
    actorId: user.id,
    action: `أضاف نقطة تجميع جديدة: ${data.name}`,
    entityType: "collection_point",
    entityId: inserted?.id,
    after: { name: data.name, wilaya: data.wilaya } as unknown as Record<string, unknown> as never,
  });

  revalidatePath("/admin/collection-points");
  revalidatePath("/map");
  return { success: true };
}

export async function updateCollectionPointStatus(
  id: string,
  status: "open" | "full" | "paused" | "closed",
) {
  const parsed = z.enum(["open", "full", "paused", "closed"]).safeParse(status);
  if (!parsed.success) return { success: false, error: "حالة غير صالحة" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { success: false, error: "غير مصرح" };
  const { data: before } = await supabase.from("collection_points").select("status").eq("id", id).maybeSingle();
  const { error } = await supabase.from("collection_points").update({ status }).eq("id", id);
  if (error) return { success: false, error: "حدث خطأ" };

  await logActivity(supabase, {
    actorId: user.id,
    action: `غيّر حالة نقطة تجميع إلى ${status}`,
    entityType: "collection_point",
    entityId: id,
    before: before as unknown as Record<string, unknown> as never,
    after: { status } as unknown as Record<string, unknown> as never,
  });

  revalidatePath("/admin/collection-points");
  revalidatePath("/map");
  return { success: true };
}

export async function updateCollectionPointVerification(
  id: string,
  level: "unverified" | "pending" | "verified" | "field_verified",
) {
  const parsed = z.enum(["unverified", "pending", "verified", "field_verified"]).safeParse(level);
  if (!parsed.success) return { success: false, error: "مستوى تحقق غير صالح" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { success: false, error: "غير مصرح" };

  const { data: before } = await supabase.from("collection_points").select("verification_level").eq("id", id).maybeSingle();
  const { error } = await supabase
    .from("collection_points")
    .update({ verification_level: level, verified_by: user.id, verified_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: "حدث خطأ" };

  await supabase.from("verification_records").insert({
    entity_type: "collection_point",
    entity_id: id,
    level,
    verified_by: user.id,
  });
  await logActivity(supabase, {
    actorId: user.id,
    action: `غيّر تحقق نقطة تجميع إلى ${level}`,
    entityType: "collection_point",
    entityId: id,
    before: before as unknown as Record<string, unknown> as never,
    after: { verification_level: level } as unknown as Record<string, unknown> as never,
  });

  revalidatePath("/admin/collection-points");
  revalidatePath("/map");
  return { success: true };
}

export const reliefHubSchema = pointSchema.extend({
  is_shelter: z.boolean(),
});
export type ReliefHubInput = z.infer<typeof reliefHubSchema>;

export async function createReliefHub(input: ReliefHubInput) {
  const parsed = reliefHubSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "بيانات غير صحيحة." };
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { success: false, error: "غير مصرح" };

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", activeCampaignSlug)
    .maybeSingle();
  if (!campaign) return { success: false, error: "تعذر تحديد الحملة النشطة." };

  const { data: inserted, error } = await supabase
    .from("relief_hubs")
    .insert({
      campaign_id: campaign.id,
      name: data.name,
      wilaya: data.wilaya,
      commune: data.commune,
      address: data.address || null,
      lat: data.lat,
      lng: data.lng,
      phone: data.phone || null,
      show_phone_publicly: data.show_phone_publicly,
      contact_name: data.contact_name || null,
      opening_hours: data.opening_hours || null,
      is_shelter: data.is_shelter,
      notes: data.notes || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: "حدث خطأ أثناء إضافة مركز الاستقبال." };

  await logActivity(supabase, {
    actorId: user.id,
    action: `أضاف مركز استقبال جديدًا: ${data.name}`,
    entityType: "relief_hub",
    entityId: inserted?.id,
    after: { name: data.name, wilaya: data.wilaya } as unknown as Record<string, unknown> as never,
  });

  revalidatePath("/admin/relief-hubs");
  revalidatePath("/admin/inventory");
  revalidatePath("/map");
  return { success: true };
}

export async function updateReliefHubStatus(
  id: string,
  status: "open" | "full" | "paused" | "closed",
) {
  const parsed = z.enum(["open", "full", "paused", "closed"]).safeParse(status);
  if (!parsed.success) return { success: false, error: "حالة غير صالحة" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { success: false, error: "غير مصرح" };
  const { data: before } = await supabase.from("relief_hubs").select("status").eq("id", id).maybeSingle();
  const { error } = await supabase.from("relief_hubs").update({ status }).eq("id", id);
  if (error) return { success: false, error: "حدث خطأ" };

  await logActivity(supabase, {
    actorId: user.id,
    action: `غيّر حالة مركز استقبال إلى ${status}`,
    entityType: "relief_hub",
    entityId: id,
    before: before as unknown as Record<string, unknown> as never,
    after: { status } as unknown as Record<string, unknown> as never,
  });

  revalidatePath("/admin/relief-hubs");
  revalidatePath("/map");
  return { success: true };
}

export async function updateReliefHubVerification(
  id: string,
  level: "unverified" | "pending" | "verified" | "field_verified",
) {
  const parsed = z.enum(["unverified", "pending", "verified", "field_verified"]).safeParse(level);
  if (!parsed.success) return { success: false, error: "مستوى تحقق غير صالح" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { success: false, error: "غير مصرح" };

  const { data: before } = await supabase.from("relief_hubs").select("verification_level").eq("id", id).maybeSingle();
  const { error } = await supabase
    .from("relief_hubs")
    .update({ verification_level: level, verified_by: user.id, verified_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: "حدث خطأ" };

  await supabase.from("verification_records").insert({
    entity_type: "relief_hub",
    entity_id: id,
    level,
    verified_by: user.id,
  });
  await logActivity(supabase, {
    actorId: user.id,
    action: `غيّر تحقق مركز استقبال إلى ${level}`,
    entityType: "relief_hub",
    entityId: id,
    before: before as unknown as Record<string, unknown> as never,
    after: { verification_level: level } as unknown as Record<string, unknown> as never,
  });

  revalidatePath("/admin/relief-hubs");
  revalidatePath("/map");
  return { success: true };
}
