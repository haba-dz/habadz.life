/**
 * أداة تصدير CSV عامة لصفحات الإدارة متوافقة مع معيار RFC 4180 وبرنامج Microsoft Excel.
 * - تتضمن UTF-8 BOM (\uFEFF) لضمان قراءة النصوص العربية بشكل صحيح في Excel دون تشويه.
 * - تهريب آمن للخلايا التي تحتوي على فواصل، علامات تنصيص، أو أسطر جديدة.
 * - حماية من أخطاء صيغ Excel (Excel Formula Injection / #NAME?) لأرقام الهواتف والنصوص الخاصة.
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

/**
 * تهيئة وتهريب قيمة خلية CSV واحدة.
 */
export function toCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  if (typeof value === "boolean") {
    return value ? "نعم" : "لا";
  }

  let s = String(value);

  // توحيد فواصل الأسطر داخل النصوص
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // منع أخطاء الصيغ في Excel عند وجود أرقام هواتف تبدأ بـ + أو نصوص تبدأ برموز صيغ (=, +, -, @)
  if (/^[=+\-@]/.test(s)) {
    s = "\t" + s;
  } else if (/^0\d{8,}/.test(s)) {
    // الحفاظ على الصفر في بداية أرقام الهواتف (05, 06, 07...)
    s = "\t" + s;
  }

  // وضع علامات تنصيص إذا كانت القيمة تحتوي على فاصلة، فاصلة منقوطة، علامات تنصيص، سطر جديد، أو Tab
  if (/[",\n;\t]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }

  return s;
}

/**
 * بناء نص CSV سليم بالترميز المناسب.
 */
export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => toCsvCell(c.header)).join(",");
  const lines = rows.map((r) => columns.map((c) => toCsvCell(c.value(r))).join(","));
  return [header, ...lines].join("\r\n");
}

/**
 * تنزيل ملف CSV مع إضافة UTF-8 BOM لضمان عمل الحروف العربية في Excel على جميع الأنظمة.
 */
export function downloadCsv(csv: string, filenamePrefix: string) {
  // التأكد من عدم تكرار الـ BOM إذا كان موجودًا مسبقًا
  const cleanCsv = csv.startsWith("\uFEFF") ? csv.slice(1) : csv;
  const blob = new Blob(["\uFEFF", cleanCsv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
