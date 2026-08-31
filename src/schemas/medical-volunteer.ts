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
    .trim()
    .min(2, "التخصص الطبي مطلوب")
    .max(120, "التخصص طويل جداً"),
  license_number: z.string().trim().max(50, "رقم الترخيص طويل جداً").optional().or(z.literal("")),
  wilaya_code: z.string({ error: "يرجى اختيار الولاية" }).trim().min(1).max(10),
  commune_id: z.string({ error: "يرجى اختيار البلدية" }).trim().min(1).max(120),
  current_workplace: z.string().trim().max(120, "مكان العمل طويل جداً").optional().or(z.literal("")),
  can_teleconsult: z.boolean(),
  can_field_intervene: z.boolean(),
  has_emergency_kit: z.boolean(),
  show_phone_publicly: z.boolean(),
  notes: z.string().trim().max(500, "الملاحظات لا يجب أن تتجاوز 500 حرف").optional().or(z.literal("")),
});

export type MedicalVolunteerInput = z.infer<typeof medicalVolunteerSchema>;