import { z } from "zod";

export const fieldVolunteerSkills = [
  "sorting_packaging",
  "loading_unloading",
  "distribution",
  "debris_clearing",
  "cooking_prep",
  "local_scouting",
  "first_aid",
  "general",
] as const;

export const fieldVolunteerMobilityOptions = [
  "has_4x4",
  "has_car",
  "has_motorcycle",
  "needs_transport",
  "none",
] as const;

export const fieldVolunteerAvailabilityOptions = [
  "immediate",
  "weekend",
  "specific_days",
  "on_call",
] as const;

export const fieldVolunteerEquipmentOptions = [
  "safety_boots",
  "gloves",
  "tools_shovels",
  "first_aid_kit",
] as const;

export const fieldVolunteerSchema = z.object({
  full_name: z
    .string({ error: "الاسم واللقب مطلوب" })
    .trim()
    .min(3, "الاسم يجب أن يحتوي على 3 أحرف على الأقل")
    .max(120, "الاسم طويل جداً"),
  phone: z
    .string({ error: "رقم الهاتف مطلوب" })
    .trim()
    .regex(/^(0)(5|6|7)[0-9]{8}$/, "رقم الهاتف غير صحيح (مثال: 0612345678)"),
  wilaya_code: z
    .string({ error: "يرجى اختيار الولاية" })
    .trim()
    .min(1, "الولاية مطلوبة")
    .max(10, "رمز الولاية غير صالح"),
  commune_id: z
    .string({ error: "يرجى اختيار البلدية أو مكان التواجد" })
    .trim()
    .min(1, "البلدية مطلوبة")
    .max(120, "اسم البلدية طويل جداً"),
  skills: z
    .array(z.enum(fieldVolunteerSkills, { error: "مهارة غير صالحة" }))
    .min(1, "يرجى اختيار مهارة أو مجال مساعدة واحد على الأقل")
    .max(8, "عدد المهارات كبير جداً"),
  mobility: z.enum(fieldVolunteerMobilityOptions, { error: "خيار التنقل غير صالح" }),
  availability: z.enum(fieldVolunteerAvailabilityOptions, { error: "خيار التوفر غير صالح" }),
  equipment: z.array(z.enum(fieldVolunteerEquipmentOptions, { error: "عتاد غير صالح" })).max(8),
  emergency_contact: z
    .string()
    .trim()
    .max(50, "رقم أو اسم جهة الطوارئ لا يتجاوز 50 حرفًا")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "الملاحظات لا يجب أن تتجاوز 500 حرف")
    .optional()
    .or(z.literal("")),
  show_phone_publicly: z.boolean(),
});

export type FieldVolunteerInput = z.infer<typeof fieldVolunteerSchema>;
