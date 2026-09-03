"use server";

import { createClient } from "@/lib/supabase/server";
import { medicalVolunteerSchema, MedicalVolunteerInput } from "@/schemas/medical-volunteer";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/services/activity-log";
import type { MedicalVerificationStatus } from "@/lib/constants";

export type MedicalActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitMedicalVolunteer(
  data: MedicalVolunteerInput
): Promise<MedicalActionState> {
  const result = medicalVolunteerSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("medical_volunteers").insert({
    full_name: result.data.full_name,
    phone: result.data.phone,
    email: result.data.email || null,
    specialty: result.data.specialty,
    license_number: result.data.license_number || null,
    wilaya_code: result.data.wilaya_code,
    commune_id: result.data.commune_id?.trim() || "",
    current_workplace: result.data.current_workplace || null,
    can_teleconsult: result.data.can_teleconsult,
    can_field_intervene: result.data.can_field_intervene,
    has_emergency_kit: result.data.has_emergency_kit,
    show_phone_publicly: result.data.show_phone_publicly,
    notes: result.data.notes || null,
    status: "pending",
  });

  if (error) {
    console.error("Medical volunteer insert error:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء حفظ البيانات، يرجى المحاولة لاحقاً.",
    };
  }

  revalidatePath("/admin/medical");
  return {
    success: true,
    message: "تم تسجيل انضمامكم إلى الفريق الطبي بنجاح. شكراً لتطوعكم!",
  };
}

export async function updateMedicalVolunteerStatus(id: string, status: MedicalVerificationStatus) {
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
          .from("medical_volunteers")
          .update({ status, verified_by: null, verified_at: null })
          .eq("id", id)
      : await supabase
          .from("medical_volunteers")
          .update({ status, verified_by: user.id, verified_at: new Date().toISOString() })
          .eq("id", id);
  if (error) return { success: false, error: "ليست لديك صلاحية تغيير حالة التحقق (الأدمن فقط)." };

  await logActivity(supabase, {
    actorId: user.id,
    action: `غيّر حالة تحقق متطوع طبي إلى ${status}`,
    entityType: "medical_volunteer",
    entityId: id,
  });

  revalidatePath("/admin/medical");
  revalidatePath("/");
  return { success: true };
}