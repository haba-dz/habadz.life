"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/services/activity-log";

const stripControl = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
const schema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(120).transform(stripControl),
  description: z.string().trim().max(500).transform(stripControl).optional(),
  is_active: z.boolean(),
});

export async function updateCampaign(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: "بيانات غير صحيحة." };
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if ((profile as { role?: string } | null)?.role !== "admin") return { success: false, error: "غير مصرح" };

  const { data: before } = await supabase.from("campaigns").select("name, is_active").eq("id", data.id).maybeSingle();

  const { error } = await supabase
    .from("campaigns")
    .update({ name: data.name, description: data.description || null, is_active: data.is_active })
    .eq("id", data.id);

  if (error) return { success: false, error: "حدث خطأ" };

  await logActivity(supabase, {
    actorId: user.id,
    action: `حدّث حملة إلى ${data.name}`,
    entityType: "campaign",
    entityId: data.id,
    before: before as unknown as Record<string, unknown> as never,
    after: { name: data.name, is_active: data.is_active } as unknown as Record<string, unknown> as never,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}
