"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/services/activity-log";
import type { AppRole } from "@/lib/constants";

const roleSchema = z.enum(["admin", "coordinator", "volunteer", "verified_organization", "donor", "driver", "beneficiary"]);

export async function updateUserRole(id: string, role: AppRole) {
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { success: false, error: "دور غير صالح" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "يجب تسجيل الدخول." };

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") {
    return { success: false, error: "ليست لديك صلاحية تغيير الأدوار (الأدمن فقط)." };
  }

  const { data: before } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();

  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) return { success: false, error: "حدث خطأ" };

  await logActivity(supabase, {
    actorId: user.id,
    action: `غيّر دور مستخدم إلى ${role}`,
    entityType: "profile",
    entityId: id,
    before: before as unknown as Record<string, unknown> as never,
    after: { role } as unknown as Record<string, unknown> as never,
  });

  revalidatePath("/admin/users");
  return { success: true };
}
