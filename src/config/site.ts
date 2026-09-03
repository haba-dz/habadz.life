// إعدادات عامة للمنصة — يمكن تغيير الاسم والشعار من هنا بسهولة دون المساس بالكود
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "هبة الجزائر",
  shortName: "هبة الجزائر",
  tagline: "ننسّق التضامن، ونوصل المساعدة لمن يحتاجها.",
  description:
    "منصة جزائرية لتنسيق المساعدات وتوجيهها إلى المناطق والأسر الأكثر احتياجًا في ولايات جيجل وبجاية وميلة وسكيكدة.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  legalNotice: "مبادرة رقمية مستقلة لتنسيق التضامن — غير حكومية وغير تابعة لأي جهة رسمية.",
  /** المستودع العلني. الرابط القديم في platform-notice.tsx يعيد التوجيه إلى هنا. */
  repoUrl: "https://github.com/haba-dz/habadz.life",
  /**
   * وضع الصيانة للموقع: تفعيل الشاشة للمستخدمين أثناء الإصلاح والترقية.
   * معطّل افتراضيًا — يُفعَّل فقط بضبط NEXT_PUBLIC_MAINTENANCE_MODE="true" عند البناء.
   */
  maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true",
} as const;

// الحملة النشطة حاليًا (slug من جدول campaigns في قاعدة البيانات)
// تصميم قاعدة البيانات يدعم حملات متعددة مستقبلًا (فيضانات، زلازل، ولايات أخرى)
export const activeCampaignSlug = "northeast-fires-2026";

/** الولايات التي تغطيها الحملة النشطة — تُستخدم في النماذج والعناوين. */
export const campaignWilayas = ["جيجل", "بجاية", "ميلة", "سكيكدة"] as const;

/** صيغة نصية للعرض: "جيجل وبجاية وميلة وسكيكدة" */
export const campaignWilayasLabel = campaignWilayas.join(" و");
