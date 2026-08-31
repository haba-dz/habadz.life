"use server";

import { createClient } from "@/lib/supabase/server";
import { artisanVolunteerSchema, type ArtisanVolunteerInput } from "@/schemas/artisan-volunteer";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/services/activity-log";
import type { ArtisanVerificationStatus } from "@/lib/constants";

export type ArtisanActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitArtisanVolunteer(data: ArtisanVolunteerInput): Promise<ArtisanActionState> {
  const result = artisanVolunteerSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("artisan_volunteers").insert({
    full_name: result.data.full_name,
    phone: result.data.phone,
    specialty: result.data.specialty,
    wilaya_code: result.data.wilaya_code,
    commune_id: result.data.commune_id,
    can_travel: result.data.can_travel,
    has_own_tools: result.data.has_own_tools,
    show_phone_publicly: result.data.show_phone_publicly,
    notes: result.data.notes || null,
    status: "pending",
  });

  if (error) {
    console.error("Artisan volunteer insert error:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء حفظ البيانات، يرجى المحاولة لاحقاً.",
    };
  }

  revalidatePath("/admin/artisans");
  return {
    success: true,
    message: "تم تسجيل انضمامكم إلى شبكة الحرفيين المتطوعين بنجاح. شكراً لتطوعكم!",
  };
}

export async function updateArtisanVolunteerStatus(id: string, status: ArtisanVerificationStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "يجب تسجيل الدخول." };

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!me || (me.role !== "admin" && me.role !== "coordinator")) {
    return { success: false, error: "ليست لديك صلاحية تغيير حالة التحقق (الأدمن فقط)." };
  }

  const { error } =
    status === "pending"
      ? await supabase
          .from("artisan_volunteers")
          .update({ status, verified_by: null, verified_at: null })
          .eq("id", id)
      : await supabase
          .from("artisan_volunteers")
          .update({ status, verified_by: user.id, verified_at: new Date().toISOString() })
          .eq("id", id);
  if (error) return { success: false, error: "ليست لديك صلاحية تغيير حالة التحقق (الأدمن فقط)." };

  await logActivity(supabase, {
    actorId: user.id,
    action: `غيّر حالة تحقق حرفي متطوع إلى ${status}`,
    entityType: "artisan_volunteer",
    entityId: id,
  });

  revalidatePath("/admin/artisans");
  revalidatePath("/admin/damage-assessments");
  return { success: true };
}
