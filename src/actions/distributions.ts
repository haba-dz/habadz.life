"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/services/activity-log";
import { createDistribution } from "@/services/distributions";
import { activeCampaignSlug } from "@/config/site";

const stripControl = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

export const distributionSchema = z.object({
  hub_id: z.string().uuid("اختر المركز"),
  category_id: z.string().uuid("اختر المادة"),
  quantity: z.coerce.number().finite().positive("يجب أن تكون أكبر من صفر").max(100000, "الكمية كبيرة جداً"),
  unit: z.enum(["piece", "box", "portion", "carton", "liter", "kg", "ton", "bundle", "person"]),
  beneficiary_family_count: z.coerce.number().int().min(0).max(5000, "العدد كبير جداً"),
  distribution_date: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), "تاريخ غير صالح"),
  responsible_name: z.string().trim().min(2, "اسم المسؤول مطلوب").max(120, "الاسم طويل").transform(stripControl),
  notes: z.string().trim().max(500).transform(stripControl).optional(),
});

const schema = distributionSchema;

export async function createDistributionAction(formData: FormData) {
  const parsed = schema.safeParse({
    hub_id: formData.get("hub_id"),
    category_id: formData.get("category_id"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    beneficiary_family_count: formData.get("beneficiary_family_count"),
    distribution_date: formData.get("distribution_date") || undefined,
    responsible_name: formData.get("responsible_name"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة." };
  }
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

  const { data: hubExists } = await supabase.from("relief_hubs").select("id").eq("id", data.hub_id).maybeSingle();
  if (!hubExists) return { success: false, error: "المركز غير موجود." };

  const { data: beforeStock } = await supabase
    .from("inventory_items")
    .select("quantity")
    .eq("hub_id", data.hub_id)
    .eq("category_id", data.category_id)
    .maybeSingle();

  if (beforeStock && Number(beforeStock.quantity) < data.quantity) {
    return { success: false, error: "الكمية تتجاوز المخزون المتاح." };
  }

  let proofFilePath: string | undefined;
  const proofFile = formData.get("proof_file");
  if (proofFile instanceof File && proofFile.size > 0) {
    const allowedMime = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    const allowedExt = ["jpg", "jpeg", "png", "webp", "pdf"];
    if (proofFile.size > 5 * 1024 * 1024) return { success: false, error: "الملف كبير جداً (5MB max)." };
    if (!allowedMime.includes(proofFile.type)) return { success: false, error: "نوع الملف غير مسموح." };
    const rawExt = proofFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    if (!allowedExt.includes(rawExt)) return { success: false, error: "امتداد الملف غير مسموح." };
    const { randomUUID } = await import("crypto");
    const path = `${data.hub_id}/${randomUUID()}.${rawExt}`;
    const { error: uploadError } = await supabase.storage
      .from("distribution-proofs")
      .upload(path, proofFile, { contentType: proofFile.type, upsert: false });
    if (uploadError) return { success: false, error: "فشل رفع الإثبات." };
    proofFilePath = path;
  }

  const { error, data: inserted } = await createDistribution(supabase, {
    campaignId: campaign.id,
    hubId: data.hub_id,
    categoryId: data.category_id,
    quantity: data.quantity,
    unit: data.unit,
    beneficiaryFamilyCount: data.beneficiary_family_count,
    distributionDate: data.distribution_date,
    responsibleName: data.responsible_name,
    responsibleId: user.id,
    proofFilePath,
    notes: data.notes,
  });

  if (error) {
    if (proofFilePath) await supabase.storage.from("distribution-proofs").remove([proofFilePath]);
    return { success: false, error: "حدث خطأ أثناء تسجيل عملية التوزيع." };
  }

  await logActivity(supabase, {
    actorId: user.id,
    action: `سجّل عملية توزيع لـ ${data.beneficiary_family_count} أسرة`,
    entityType: "distribution",
    entityId: inserted?.id,
    before: beforeStock as unknown as Record<string, unknown> as never,
    after: { quantity: data.quantity, hub_id: data.hub_id } as unknown as Record<string, unknown> as never,
  });

  revalidatePath("/admin/distributions");
  revalidatePath("/admin/inventory");
  revalidatePath("/transparency");
  return { success: true };
}
