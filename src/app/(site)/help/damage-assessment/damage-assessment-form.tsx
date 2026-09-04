"use client";

import { useActionState, useState } from "react";
import {
  Loader2,
  } from "lucide-react";
import { SuccessPanel } from "@/components/shared/success-panel";
import {
  submitDamageAssessment,
  type DamageAssessmentActionState,
} from "@/actions/damage-assessments";
import { priorityWilayas } from "@/lib/algeria-cities";
import { Icon, type IconName } from "@/components/icons";
import {
  Action,
  ChoiceCard,
  CommuneSelect,
  FieldInput,
  FieldLabel,
  FieldPhoneInput,
  FieldTextarea,
  FOCUS_RING,
  FormStep,
  WilayaSelect,
} from "@/components/site";
import { cn } from "@/lib/utils";
import type { AvailableLocale } from "@/i18n/locales";

const initialState: DamageAssessmentActionState = { success: false };

const damageCategories: { name: string; ar: string; fr: string; icon: IconName }[] = [
  { name: "needs_roofing", ar: "أضرار بالغة في السقف والقرميد", fr: "Dégâts à la toiture / plafond", icon: "house-04" },
  { name: "needs_paint", ar: "احتراق أو تصدع الجدران والدهان", fr: "Murs noircis / Peinture brûlée", icon: "cleaning-bucket" },
  { name: "needs_flooring", ar: "تلف الأرضية والبلاط", fr: "Dégâts aux sols / carrelage", icon: "layers-01" },
  { name: "needs_plumbing", ar: "تلف شبكة المياه والصرف الصحي", fr: "Réseau d'eau / sanitaires détruit", icon: "water-energy" },
  { name: "needs_electrical", ar: "احتراق الأسلاك والتمديدات الكهربائية", fr: "Installation électrique détruite", icon: "flash" },
];

export function DamageAssessmentForm({ locale = "ar" }: { locale?: AvailableLocale }) {
  const isFr = locale === "fr";
  const [state, formAction, pending] = useActionState(submitDamageAssessment, initialState);
  const [selectedWilaya, setSelectedWilaya] = useState("جيجل");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [needsPaint, setNeedsPaint] = useState(false);
  const [selectedDamages, setSelectedDamages] = useState<string[]>(["needs_roofing"]);

  function toggleDamage(name: string, checked: boolean) {
    if (name === "needs_paint") setNeedsPaint(checked);
    setSelectedDamages((prev) =>
      checked ? [...prev, name] : prev.filter((d) => d !== name),
    );
  }

  if (state.success) {
    return (
      <div className="animate-rise space-y-6">
        <SuccessPanel
          title={isFr ? "Déclaration enregistrée avec succès" : "تم تسجيل تقرير الأضرار بنجاح"}
          description={
            isFr
              ? "L'équipe examinera votre déclaration. L'estimation des matériaux est automatiquement convertie en besoin pour les donateurs. Nous vous contacterons dès qu'un artisan sera disponible."
              : "سيراجع مهندسو وفنيو التنسيق تقييم الأضرار، ويُحوَّل تقدير المواد اللازمة تلقائيًا إلى طلب تبرعات للمحسنين وربطكم بالحرفيين المتطوعين."
          }
          primaryHref="/needs"
          primaryLabel={isFr ? "Consulter les besoins prioritaires" : "تصفّح قائمة الاحتياجات"}
        />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* 1. Contact Info & Location */}
      <FormStep
        step={1}
        title={isFr ? "Coordonnées & Localisation du logement" : "بيانات صاحب السكن والموقع"}
      >
        <div className="flex flex-col gap-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <FieldLabel htmlFor="da-name">{isFr ? "Nom et prénom *" : "الاسم واللقب *"}</FieldLabel>
              <FieldInput
                id="da-name"
                name="full_name"
                placeholder={isFr ? "Ex : Amar Meziane" : "مثال: عمار مزيان"}
                required
              />
            </div>

            <div>
              <FieldLabel htmlFor="da-phone">
                {isFr ? "Numéro de téléphone *" : "رقم الهاتف للتواصل *"}
              </FieldLabel>
              <FieldPhoneInput id="da-phone" name="phone" placeholder="0555xxxxxx" required />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="da-wilaya">{isFr ? "Wilaya *" : "الولاية *"}</FieldLabel>
            {/* Quick Priority Wilaya Buttons */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {priorityWilayas.map((pw) => {
                const active =
                  selectedWilaya === pw.name_ar || selectedWilaya === pw.codeStr || selectedWilaya === String(pw.code);
                return (
                  <button
                    key={pw.code}
                    type="button"
                    onClick={() => {
                      setSelectedWilaya(pw.name_ar);
                      setSelectedCommune("");
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 border px-2.5 py-1 text-xs font-bold transition-colors",
                      active
                        ? "border-haba-red bg-haba-red text-white"
                        : "border-haba-red-200 bg-haba-red-50 text-haba-red hover:border-haba-red",
                      FOCUS_RING,
                    )}
                  >
                    <Icon name="fire" size={12} className="shrink-0" />
                    <span>{isFr ? `${pw.codeStr} - ${pw.name_fr}` : `${pw.codeStr} - ${pw.name_ar}`}</span>
                  </button>
                );
              })}
            </div>

            <input type="hidden" name="wilaya" value={selectedWilaya} />
            <WilayaSelect
              id="da-wilaya"
              locale={locale}
              value={selectedWilaya}
              onChange={(e) => {
                setSelectedWilaya(e.target.value);
                setSelectedCommune("");
              }}
            />
          </div>

          <div>
            <FieldLabel htmlFor="da-commune">{isFr ? "Commune *" : "البلدية *"}</FieldLabel>
            <input type="hidden" name="commune" value={selectedCommune} />
            <CommuneSelect
              id="da-commune"
              wilaya={selectedWilaya}
              locale={locale}
              value={selectedCommune}
              onChange={(e) => setSelectedCommune(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel htmlFor="da-address">
              {isFr ? "Village / Quartier / Repère (facultatif)" : "القرية / الحي / أقرب معلم (اختياري)"}
            </FieldLabel>
            <FieldInput
              id="da-address"
              name="address_note"
              placeholder={isFr ? "Ex : Près de l'école primaire..." : "مثال: بجوار المدرسة الابتدائية..."}
            />
          </div>
        </div>
      </FormStep>

      {/* 2. Damage Assessment */}
      <FormStep step={2} title={isFr ? "Nature des dégradations" : "طبيعة ونوع الأضرار بالسكن"}>
        <div className="flex flex-col gap-4">
          <fieldset>
            <legend className="mb-1.5 block text-[13px] font-semibold text-haba-ink-2">
              {isFr ? "Cochez tout ce qui s'applique" : "اختر كل ما ينطبق على سكنك"}
            </legend>
            <div className="grid grid-cols-1 gap-2.5 desktop:grid-cols-2">
              {damageCategories.map((cat) => (
                <ChoiceCard
                  key={cat.name}
                  type="checkbox"
                  name={cat.name}
                  icon={cat.icon}
                  title={isFr ? cat.fr : cat.ar}
                  checked={selectedDamages.includes(cat.name)}
                  onChange={(e) => toggleDamage(cat.name, e.target.checked)}
                />
              ))}
            </div>
          </fieldset>

          {needsPaint && (
            <div>
              <FieldLabel htmlFor="da-paint">
                {isFr
                  ? "Surface approximative à repeindre (m²)"
                  : "المساحة التقريبية للجدران والأسقف (م²)"}
              </FieldLabel>
              <FieldInput
                id="da-paint"
                type="number"
                min={1}
                step={1}
                name="paint_area_sqm"
                placeholder={isFr ? "Ex : 80" : "مثال: 80"}
              />
            </div>
          )}

          <div>
            <FieldLabel htmlFor="da-notes">
              {isFr
                ? "Précisions sur les travaux requis (facultatif)"
                : "ملاحظات وتفاصيل إضافية عن الإصلاحات المطلوبة (اختياري)"}
            </FieldLabel>
            <FieldTextarea
              id="da-notes"
              name="finishing_notes"
              placeholder={
                isFr
                  ? "Nombre de pièces touchées, types de portes ou fenêtres détruites..."
                  : "عدد الغرف المتضررة، قياسات النوافذ أو الأبواب المحترقة..."
              }
            />
          </div>
        </div>
      </FormStep>

      {/* 3. Photo Upload */}
      <FormStep step={3} title={isFr ? "Photos des dégâts (recommandé)" : "صور الأضرار (مستحسن)"}>
        <div className="flex flex-col gap-3">
          <p className="text-[13.5px] leading-relaxed text-haba-ink-2">
            {isFr
              ? "Ajouter des photos permet aux architectes et artisans d'évaluer directement les matériaux requis."
              : "إرفاق صور واضحة يساعد المهندسين والحرفيين على تقدير كمية الإسمنت، الآجر، الدهان والأنابيب بدقة وسرعة."}
          </p>

          <label
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-haba-border bg-haba-surface-2 p-6 text-center transition-colors hover:border-haba-green",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-haba-green",
            )}
          >
            <Icon name="package" size={30} className="mb-2 text-haba-green" />
            <span className="text-sm font-bold text-haba-ink">
              {isFr
                ? "Cliquez ici pour sélectionner les photos"
                : "اضغط هنا لاختيار صور من هاتفك أو جهازك"}
            </span>
            <span className="mt-1 text-[11.5px] text-haba-muted">PNG, JPG, WEBP</span>
            <input
              type="file"
              name="photos"
              multiple
              accept="image/*"
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </label>
        </div>
      </FormStep>

      {state.error && (
        <p
          role="alert"
          className="border border-haba-red bg-haba-red-50 p-4 text-sm font-semibold text-haba-red"
        >
          {state.error}
        </p>
      )}

      <Action type="submit" variant="primary" size="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Icon name="sent" size={20} />
        )}
        <span>{isFr ? "Transmettre le dossier d'évaluation" : "إرسال تقرير تقييم الأضرار"}</span>
      </Action>
    </form>
  );
}
