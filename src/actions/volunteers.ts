"use server";

import { createClient } from "@/lib/supabase/server";
import {
  fieldVolunteerSchema,
  type FieldVolunteerInput,
} from "@/schemas/field-volunteer";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/services/activity-log";
import type { FieldVolunteerStatus } from "@/lib/constants";

export type VolunteerActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitFieldVolunteer(
  data: FieldVolunteerInput
): Promise<VolunteerActionState> {
  const result = fieldVolunteerSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("field_volunteers").insert({
    full_name: result.data.full_name,
    phone: result.data.phone,
    wilaya_code: result.data.wilaya_code,
    commune_id: result.data.commune_id,
    skills: result.data.skills,
    mobility: result.data.mobility,
    availability: result.data.availability,
    equipment: result.data.equipment,
    emergency_contact: result.data.emergency_contact || null,
    notes: result.data.notes || null,
    show_phone_publicly: result.data.show_phone_publicly,
    status: "pending",
  });

  if (error) {
    console.error("Field volunteer insert error:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء حفظ البيانات، يرجى المحاولة لاحقاً.",
    };
  }

  revalidatePath("/admin/volunteers");
  revalidatePath("/volunteers");
  return {
    success: true,
    message: "تم تسجيل تطوعكم الميداني بنجاح. بارك الله في جهودكم وسواعدكم!",
  };
}

export async function updateFieldVolunteerStatus(
  id: string,
  status: FieldVolunteerStatus
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "يجب تسجيل الدخول." };
  }

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!me || (me.role !== "admin" && me.role !== "coordinator")) {
    return {
      success: false,
      error: "ليست لديك صلاحية تغيير حالة المتطوع (الأدمن فقط).",
    };
  }

  const { error } =
    status === "pending"
      ? await supabase
          .from("field_volunteers")
          .update({ status, verified_by: null, verified_at: null })
          .eq("id", id)
      : await supabase
          .from("field_volunteers")
          .update({ status, verified_by: user.id, verified_at: new Date().toISOString() })
          .eq("id", id);

  if (error) {
    return {
      success: false,
      error: "ليست لديك صلاحية تغيير حالة المتطوع (الأدمن فقط).",
    };
  }

  await logActivity(supabase, {
    actorId: user.id,
    action: `غيّر حالة متطوع ميداني إلى ${status}`,
    entityType: "field_volunteer",
    entityId: id,
  });

  revalidatePath("/admin/volunteers");
  revalidatePath("/volunteers");
  return { success: true };
}
