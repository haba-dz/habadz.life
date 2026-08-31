import { z } from "zod";

export const medicalVolunteerSchema = z.object({
  full_name: z
    .string({ error: "الاسم الكامل مطلوب" })
    .min(3, "الاسم يجب أن يحتوي على 3 أحرف على الأقل"),
  phone: z
    .string({ error: "رقم الهاتف مطلوب" })
    .regex(/^(0)(5|6|7)[0-9]{8}$/, "رقم الهاتف غير صحيح (مثال: 0612345678)"),
  email: z
    .string()
    .email("البريد الإلكتروني غير صالح")
    .optional()
    .or(z.literal("")),
  specialty: z
    .string({ error: "يرجى تحديد التخصص الطبي" })
    .min(2, "التخصص الطبي مطلوب"),
  license_number: z.string().optional().or(z.literal("")),
  wilaya_code: z.string({ error: "يرجى اختيار الولاية" }).min(1),
  commune_id: z.string().optional().or(z.literal("")),
  current_workplace: z.string().optional().or(z.literal("")),
  can_teleconsult: z.boolean(),
  can_field_intervene: z.boolean(),
  has_emergency_kit: z.boolean(),
  show_phone_publicly: z.boolean(),
  notes: z.string().max(500, "الملاحظات لا يجب أن تتجاوز 500 حرف").optional().or(z.literal("")),
});

export type MedicalVolunteerInput = z.infer<typeof medicalVolunteerSchema>;