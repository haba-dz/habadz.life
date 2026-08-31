import { z } from "zod";

export const needCategoryOptions = [
  { value: "water", label: "ماء" },
  { value: "food", label: "غذاء" },
  { value: "clothing", label: "ملابس" },
  { value: "blankets", label: "بطانيات" },
  { value: "baby_supplies", label: "مستلزمات أطفال" },
  { value: "medical", label: "أدوية / مستلزمات طبية" },
  { value: "veterinary", label: "أدوية ومستلزمات بيطرية" },
  { value: "hygiene", label: "مواد تنظيف" },
  { value: "kitchenware", label: "أدوات طبخ" },
  { value: "shelter", label: "مأوى" },
  { value: "construction_materials", label: "مواد بناء" },
  { value: "other", label: "أخرى" },
] as const;

const needCategoryValues = needCategoryOptions.map((o) => o.value) as [string, ...string[]];

export const beneficiaryRequestSchema = z
  .object({
    full_name: z.string().trim().min(2, "الاسم مطلوب").max(100, "الاسم طويل جداً"),
    phone: z
      .string()
      .trim()
      .regex(/^0[5-7][0-9]{8}$/, "رقم هاتف جزائري غير صحيح (مثال: 0555xxxxxx)"),
    wilaya: z.string().trim().min(2, "الولاية مطلوبة").max(100, "الولاية طويلة جداً"),
    commune: z.string().trim().min(2, "البلدية مطلوبة").max(100, "البلدية طويلة جداً"),
    address_note: z.string().trim().max(500).optional().or(z.literal("")),
    family_members_count: z.number().int().min(1).max(50),
    children_count: z.number().int().min(0).max(50),
    housing_status: z.string().trim().max(200).optional().or(z.literal("")),
    is_housing_habitable: z.enum(["yes", "no", "unknown"]),
    has_injuries: z.boolean(),
    injuries_note: z.string().trim().max(500).optional().or(z.literal("")),
    needs_medical: z.boolean(),
    medical_note: z.string().trim().max(500).optional().or(z.literal("")),
    lost_livestock: z.boolean(),
    lost_income: z.boolean(),
    needed_categories: z
      .array(z.enum(needCategoryValues))
      .min(1, "اختر احتياجًا واحدًا على الأقل"),
    other_needs_note: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .refine((d) => d.children_count <= d.family_members_count, {
    message: "عدد الأطفال لا يمكن أن يتجاوز عدد أفراد الأسرة",
    path: ["children_count"],
  });

export type BeneficiaryRequestInput = z.infer<typeof beneficiaryRequestSchema>;
