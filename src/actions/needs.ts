"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/services/activity-log";
import { activeCampaignSlug } from "@/config/site";

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

const createNeedSchema = z.object({
  category_id: z.string().uuid(),
  wilaya: z.string().trim().min(1).max(100),
  commune: z.string().trim().min(1).max(100),
  title: z.string().trim().max(200).optional().or(z.literal("")),
  quantity_needed: z.number().positive().max(100000),
  quantity_available: z.number().min(0).max(100000),
  unit: z.enum(["piece", "box", "portion", "carton", "liter", "kg", "ton", "bundle", "person"]),
  priority: z.enum(["critical", "high", "medium", "low"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CreateNeedInput = z.infer<typeof createNeedSchema>;

export async function createNeed(input: CreateNeedInput) {
  const parsed = createNeedSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "بيانات غير صحيحة." };
  const data = parsed.data;

  const supabase = await createClient();
  const gate = await requireManager(supabase);
  if (!gate.ok) return { success: false, error: "غير مخوّل — هذه العملية للطاقم فقط." };
  const { user } = gate;

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", activeCampaignSlug)
    .maybeSingle();
  if (!campaign) return { success: false, error: "تعذر تحديد الحملة النشطة." };

  const { error } = await supabase.from("needs").insert({
    campaign_id: campaign.id,
    category_id: data.category_id,
    wilaya: data.wilaya,
    commune: data.commune,
    title: data.title || null,
    quantity_needed: data.quantity_needed,
    quantity_available: data.quantity_available,
    unit: data.unit,
    priority: data.priority,
    notes: data.notes || null,
    source_type: "field_team",
    created_by: user?.id,
  });

  if (error) return { success: false, error: "حدث خطأ أثناء إضافة الاحتياج." };

  await logActivity(supabase, {
    actorId: user?.id,
    action: `أضاف احتياجًا جديدًا (${data.commune})`,
    entityType: "need",
  });

  revalidatePath("/admin/needs");
  revalidatePath("/needs");
  revalidatePath("/");
  updateTag("public-reads");
  updateTag("admin-stats");
  return { success: true };
}

export async function updateNeedStatus(id: string, status: "active" | "resolved" | "expired") {
  const supabase = await createClient();
  const gate = await requireManager(supabase);
  if (!gate.ok) return { success: false, error: "غير مخوّل — هذه العملية للطاقم فقط." };
  const { user } = gate;

  const { error } = await supabase.from("needs").update({ status }).eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(supabase, {
    actorId: user?.id,
    action: `غيّر حالة احتياج إلى ${status}`,
    entityType: "need",
    entityId: id,
  });

  revalidatePath("/admin/needs");
  revalidatePath("/needs");
  revalidatePath("/");
  updateTag("public-reads");
  updateTag("admin-stats");
  return { success: true };
}

export async function updateNeedPriority(
  id: string,
  priority: "critical" | "high" | "medium" | "low",
) {
  const supabase = await createClient();
  const gate = await requireManager(supabase);
  if (!gate.ok) return { success: false, error: "غير مخوّل — هذه العملية للطاقم فقط." };
  const { user } = gate;

  const { error } = await supabase.from("needs").update({ priority }).eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(supabase, {
    actorId: user?.id,
    action: `غيّر أولوية احتياج إلى ${priority}`,
    entityType: "need",
    entityId: id,
  });

  revalidatePath("/admin/needs");
  revalidatePath("/needs");
  revalidatePath("/");
  updateTag("public-reads");
  updateTag("admin-stats");
  return { success: true };
}
