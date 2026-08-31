"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/services/activity-log";
import { activeCampaignSlug } from "@/config/site";
import { isSafeHttpUrl } from "@/lib/safe-url";

const createOfficialUpdateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().max(5000).optional(),
  source: z.string().trim().min(1).max(200),
  url: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .refine((v) => !v || isSafeHttpUrl(v), "URL must be http/https"),
  update_type: z.enum(["fire_alert", "road_status", "weather_warning", "safety_guidelines", "statement", "news"]),
});

export type CreateOfficialUpdateInput = z.infer<typeof createOfficialUpdateSchema>;

export async function createOfficialUpdate(input: CreateOfficialUpdateInput) {
  const parsed = createOfficialUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", activeCampaignSlug)
    .maybeSingle();

  if (!campaign) return { success: false, error: "الحملة غير موجودة" };

  const { data, error } = await supabase
    .from("official_updates")
    .insert({
      campaign_id: campaign.id,
      title: parsed.data.title,
      body: parsed.data.body || null,
      source: parsed.data.source,
      url: parsed.data.url || null,
      update_type: parsed.data.update_type,
      published_at: new Date().toISOString(),
      created_by: user?.id || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[action] createOfficialUpdate:", error);
    return { success: false, error: "تعذر نشر البيان" };
  }

  await logActivity(supabase, {
    actorId: user?.id,
    action: `نشر بيانًا رسميًا موثقًا: ${parsed.data.title}`,
    entityType: "official_update",
    entityId: data.id,
  });

  revalidatePath("/admin/news");
  revalidatePath("/official-information");
  revalidatePath("/");
  return { success: true };
}

export async function deleteOfficialUpdate(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("official_updates").delete().eq("id", id);
  if (error) {
    console.error("[action] deleteOfficialUpdate:", error);
    return { success: false, error: "تعذر الحذف" };
  }

  await logActivity(supabase, {
    actorId: user?.id,
    action: `حذف بيانًا رسميًا`,
    entityType: "official_update",
    entityId: id,
  });

  revalidatePath("/admin/news");
  revalidatePath("/official-information");
  revalidatePath("/");
  return { success: true };
}
