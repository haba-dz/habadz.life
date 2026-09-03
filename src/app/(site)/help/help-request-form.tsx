"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Icon, type IconName } from "@/components/icons";
import {
  Action,
  ChoiceCard,
  Field,
  FieldInput,
  FieldLabel,
  FieldPhoneInput,
  FormStep,
} from "@/components/site";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import {
  beneficiaryRequestSchema,
  needCategoryOptions,
  type BeneficiaryRequestInput,
} from "@/schemas/beneficiary-request";
import { submitBeneficiaryRequest } from "@/actions/beneficiary-requests";
import { SuccessPanel } from "@/components/shared/success-panel";
import type { AvailableLocale } from "@/i18n/locales";

/** design.md §5.6 */
const categoryIcons: Record<string, IconName> = {
  water: "water-energy",
  food: "noodles",
  clothing: "t-shirt",
  blankets: "bed",
  baby_supplies: "baby-bottle",
  medical: "medicine-02",
  veterinary: "horse",
  hygiene: "cleaning-bucket",
  kitchenware: "kitchen-utensils",
  shelter: "tent",
  construction_materials: "building-06",
  other: "more-horizontal",
};

export function HelpRequestForm({
  locale = "ar",
}: {
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BeneficiaryRequestInput>({
    resolver: zodResolver(beneficiaryRequestSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      wilaya: "جيجل",
      commune: "",
      address_note: "",
      family_members_count: 4,
      children_count: 1,
      housing_status: "",
      is_housing_habitable: "unknown",
      has_injuries: false,
      injuries_note: "",
      needs_medical: false,
      medical_note: "",
      lost_livestock: false,
      lost_income: false,
      needed_categories: ["food", "water"],
      other_needs_note: "",
    },
  });

  const selectedWilaya = watch("wilaya");
  const selectedCategories = watch("needed_categories") || [];
  const hasInjuries = watch("has_injuries");
  const needsMedical = watch("needs_medical");
  const housingHabitable = watch("is_housing_habitable");

  function toggleCategory(cat: string) {
    const current = selectedCategories;
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setValue("needed_categories", next, { shouldValidate: true });
  }

  async function onSubmit(values: BeneficiaryRequestInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitBeneficiaryRequest(values);
      if (!res.success) {
        setSubmitError(
          res.error ??
            (isFr
              ? "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer."
              : "حدث خطأ أثناء إرسال طلبكم. يُرجى المحاولة مرة أخرى.")
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur inattendue est survenue. Veuillez vérifier votre connexion."
          : "حدث خطأ غير متوقع. يُرجى التحقق من اتصال الإنترنت والمحاولة ثانية."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="animate-rise space-y-6">
        <SuccessPanel
          title={isFr ? "Demande enregistrée avec succès" : "تم تسجيل طلبكم بنجاح"}
          description={
            isFr
              ? "Votre demande a été transmise aux cellules de coordination et équipes de secours de votre secteur. Vous serez contacté dans les plus brefs délais."
              : "تم إرسال طلبكم إلى خلية التنسيق الميدانية ولجان الإغاثة في منطقتكم. سيتم التواصل معكم فور معالجة الطلب لتوفير الاحتياجات."
          }
          primaryHref="/"
          primaryLabel={isFr ? "Retour à l'accueil" : "العودة للرئيسية"}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormStep
        step={1}
        title={isFr ? "Identité et localisation du foyer" : "بيانات الاتصال ومكان التواجد"}
      >
        <div className="grid gap-3.5 desktop:grid-cols-2">
          <Field
            label={isFr ? "Nom et prénom du responsable" : "الاسم واللقب (رب الأسرة أو المتصل)"}
            required
            htmlFor="help-name"
            error={errors.full_name?.message}
          >
            <FieldInput
              id="help-name"
              placeholder={isFr ? "Ex : Karim Benali" : "مثال: عبد القادر بوعلام"}
              {...register("full_name")}
            />
          </Field>

          <Field
            label={isFr ? "Numéro de téléphone joignable" : "رقم الهاتف للتواصل المباشر"}
            required
            htmlFor="help-phone"
            error={errors.phone?.message}
          >
            <FieldPhoneInput id="help-phone" placeholder="0555xxxxxx" {...register("phone")} />
          </Field>

          <Field
            label={isFr ? "Wilaya" : "الولاية"}
            required
            htmlFor="help-wilaya"
            error={errors.wilaya?.message}
          >
            <WilayaSelect
              id="help-wilaya"
              locale={locale}
              value={selectedWilaya}
              onChange={(e) => {
                setValue("wilaya", e.target.value, { shouldValidate: true });
                setValue("commune", "");
              }}
            />
          </Field>

          <Field
            label={isFr ? "Commune / Village" : "البلدية / القرية أو الحي"}
            required
            htmlFor="help-commune"
            error={errors.commune?.message}
          >
            <CommuneSelect
              id="help-commune"
              wilaya={selectedWilaya}
              locale={locale}
              value={watch("commune")}
              onChange={(e) => setValue("commune", e.target.value, { shouldValidate: true })}
            />
          </Field>
        </div>

        <Field
          className="mt-3.5"
          label={
            isFr ? "Précision sur le lieu (facultatif)" : "تحديد العنوان أو معالم الوصول (اختياري)"
          }
          htmlFor="help-address"
        >
          <FieldInput
            id="help-address"
            placeholder={
              isFr
                ? "Ex: Village Tala, près de l'école..."
                : "مثال: قرية تالامان، بجوار المدرسة الابتدائية…"
            }
            {...register("address_note")}
          />
        </Field>
      </FormStep>

      <FormStep
        step={2}
        title={isFr ? "Situation familiale et état du logement" : "حجم الأسرة ووضعية السكن"}
      >
        <div className="grid gap-3.5 desktop:grid-cols-2">
          <Field
            label={isFr ? "Nombre de membres de la famille" : "عدد أفراد العائلة الإجمالي"}
            htmlFor="help-family"
            error={errors.family_members_count?.message}
          >
            <FieldInput
              id="help-family"
              type="number"
              min="1"
              max="50"
              {...register("family_members_count", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label={isFr ? "Dont nombre d'enfants / bébés" : "منهم عدد الأطفال والرُّضع"}
            htmlFor="help-children"
            error={errors.children_count?.message}
          >
            <FieldInput
              id="help-children"
              type="number"
              min="0"
              max="50"
              {...register("children_count", { valueAsNumber: true })}
            />
          </Field>
        </div>

        <fieldset className="mt-4">
          <legend className="mb-1.5 block text-[13px] font-semibold text-haba-ink-2">
            {isFr
              ? "Le logement est-il habitable actuellement ?"
              : "هل السكن صالح للإقامة حالياً أم تضرّر؟"}
          </legend>
          <div className="grid gap-3 desktop:grid-cols-[repeat(auto-fit,minmax(min(215px,100%),1fr))]">
            {(
              [
                { val: "yes", icon: "house-04", tone: "green", label: isFr ? "Oui, habitable" : "نعم، صالح للإقامة" },
                { val: "unknown", icon: "house-01", tone: "danger", label: isFr ? "Partiellement" : "أضرار جزئية" },
                { val: "no", icon: "house-01", tone: "danger", label: isFr ? "Non, sinistré / évacué" : "لا، متضرر أو تم إخلاؤه" },
              ] as const
            ).map((opt) => (
              <ChoiceCard
                key={opt.val}
                name="is_housing_habitable"
                value={opt.val}
                tone={opt.tone}
                icon={opt.icon}
                title={opt.label}
                checked={housingHabitable === opt.val}
                onChange={() =>
                  setValue("is_housing_habitable", opt.val, { shouldValidate: true })
                }
              />
            ))}
          </div>
        </fieldset>
      </FormStep>

      <FormStep
        step={3}
        title={isFr ? "Besoins prioritaires demandés" : "نوع المساعدات المطلوبة بإلحاح"}
        caption={
          isFr
            ? "Sélectionnez toutes les catégories nécessaires pour votre famille"
            : "حدد المواد الأساسية التي تحتاجها أسرتكم في الوقت الراهن"
        }
      >
        <fieldset>
          <legend className="sr-only">
            {isFr ? "Catégories de besoins" : "أنواع المساعدات المطلوبة"}
          </legend>
          <div className="grid gap-3 grid-cols-2 desktop:grid-cols-[repeat(auto-fit,minmax(min(215px,100%),1fr))]">
            {needCategoryOptions.map((cat) => (
              <ChoiceCard
                key={cat.value}
                type="checkbox"
                compact
                tone="danger"
                name={`need-${cat.value}`}
                icon={categoryIcons[cat.value] ?? "more-horizontal"}
                title={cat.label}
                checked={selectedCategories.includes(cat.value)}
                onChange={() => toggleCategory(cat.value)}
              />
            ))}
          </div>
        </fieldset>
        {errors.needed_categories && (
          <p className="mt-2 text-xs font-semibold text-haba-red" role="alert">
            {errors.needed_categories.message}
          </p>
        )}

        <div className="mt-4 grid gap-3 desktop:grid-cols-2">
          <ChoiceCard
            type="checkbox"
            showControl
            name="needs_medical"
            title={
              isFr
                ? "Présence de malades chroniques ou besoin d'ordonnances"
                : "يوجد أصحاب أمراض مزمنة أو حاجة لأدوية محددة"
            }
            checked={needsMedical}
            onChange={(e) => setValue("needs_medical", e.target.checked)}
          />
          <ChoiceCard
            type="checkbox"
            showControl
            name="has_injuries"
            title={
              isFr
                ? "Présence de blessés ou de cas nécessitant des soins"
                : "يوجد مصابون أو حالات تحتاج لعلاج ومتابعة طبية"
            }
            checked={hasInjuries}
            onChange={(e) => setValue("has_injuries", e.target.checked)}
          />
        </div>

        <div className="mt-4">
          <FieldLabel htmlFor="help-notes">
            {isFr ? "Détails ou besoins particuliers (facultatif)" : "ملاحظات وتفاصيل إضافية (اختياري)"}
          </FieldLabel>
          <textarea
            id="help-notes"
            rows={3}
            placeholder={
              isFr
                ? "Précisez des besoins spécifiques (ex: lait pour bébé 1er âge, couches taille 4, insuline…)"
                : "اكتب أي احتياجات خاصة (مثال: حليب أطفال نوع معين، حفاظات مقاس 4، أدوية سكري…)"
            }
            className="w-full border border-haba-border bg-haba-surface px-3.5 py-[11px] text-[14.5px] text-haba-ink outline-none placeholder:text-haba-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haba-green"
            {...register("other_needs_note")}
          />
        </div>
      </FormStep>

      <div className="flex items-start gap-2.5 border border-haba-border bg-haba-surface p-4 text-[13.5px] leading-relaxed text-haba-ink-2 desktop:px-[18px]">
        <Icon name="shield-01" size={18} className="mt-0.5 text-haba-green" />
        <p>
          {isFr
            ? "Vos informations personnelles sont strictement confidentielles. Elles ne sont utilisées que pour coordonner l'acheminement de l'aide par les équipes agréées."
            : "بياناتكم تُعامل بأقصى درجات السرية والاحترام، ولا تُستخدم إلا لتنسيق إيصال المساعدات مباشرة لعائلتكم عبر الجمعيات والفرق الميدانية المعتمدة."}
        </p>
      </div>

      {submitError && (
        <p
          role="alert"
          className="border border-haba-red bg-haba-red-50 p-4 text-sm font-semibold text-haba-red"
        >
          {submitError}
        </p>
      )}

      <Action
        type="submit"
        variant="danger"
        size="submit"
        icon={submitting ? undefined : "sent"}
        disabled={submitting}
      >
        {submitting
          ? isFr
            ? "Envoi en cours…"
            : "جارٍ الإرسال…"
          : isFr
            ? "Envoyer la demande d'aide d'urgence"
            : "إرسال طلب الإغاثة والمساعدة"}
      </Action>
    </form>
  );
}
