"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HeartHandshake,
  Phone,
  MapPin,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type IconName } from "@/components/icons";
import { Action, ChoiceCard, FormStep, WarningBlock } from "@/components/site";
import {
  fieldVolunteerSchema,
  type FieldVolunteerInput,
  fieldVolunteerSkills,
  fieldVolunteerMobilityOptions,
  fieldVolunteerAvailabilityOptions,
  fieldVolunteerEquipmentOptions,
} from "@/schemas/field-volunteer";
import { submitFieldVolunteer } from "@/actions/volunteers";
import {
  fieldVolunteerSkillLabels,
  fieldVolunteerMobilityLabels,
  fieldVolunteerAvailabilityLabels,
  fieldVolunteerEquipmentLabels,
} from "@/lib/constants";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import { priorityWilayas } from "@/lib/algeria-cities";
import { LinkButton } from "@/components/shared/link-button";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

interface FieldVolunteerFormProps {
  locale?: AvailableLocale;
  activePoints?: Array<{
    id: string;
    name: string;
    commune: string;
    wilaya: string;
    phone?: string | null;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
  }>;
}

/** design.md §5.8 */
const skillIcons: Record<string, IconName> = {
  sorting_packaging: "package-process",
  loading_unloading: "truck",
  distribution: "shipping-truck-01",
  debris_clearing: "delete-02",
  cooking_prep: "kitchen-utensils",
  local_scouting: "compass",
  first_aid: "pulse-02",
  general: "user-multiple",
};

const mobilityIcons: Record<string, IconName> = {
  has_4x4: "car-04",
  has_car: "car-03",
  has_motorcycle: "motorbike-02",
  needs_transport: "walking",
  none: "walking",
};

export function FieldVolunteerForm({
  locale = "ar",
  activePoints = [],
}: FieldVolunteerFormProps) {
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
  } = useForm<FieldVolunteerInput>({
    resolver: zodResolver(fieldVolunteerSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      wilaya_code: "جيجل",
      commune_id: "",
      skills: ["sorting_packaging", "distribution"],
      mobility: "has_car",
      availability: "immediate",
      equipment: [],
      emergency_contact: "",
      notes: "",
      show_phone_publicly: false,
    },
  });

  const selectedWilaya = watch("wilaya_code") || "جيجل";
  const selectedCommune = watch("commune_id");
  const selectedSkills = watch("skills") || [];
  const selectedMobility = watch("mobility");
  const selectedAvailability = watch("availability");
  const selectedEquipment = watch("equipment") || [];
  const showPhone = watch("show_phone_publicly");

  function toggleSkill(skill: (typeof fieldVolunteerSkills)[number]) {
    if ((selectedSkills as string[]).includes(skill)) {
      setValue(
        "skills",
        (selectedSkills as string[]).filter((s) => s !== skill) as FieldVolunteerInput["skills"],
      );
    } else {
      setValue("skills", [...selectedSkills, skill]);
    }
  }

  function toggleEquipment(item: (typeof fieldVolunteerEquipmentOptions)[number]) {
    if ((selectedEquipment as string[]).includes(item)) {
      setValue(
        "equipment",
        (selectedEquipment as string[]).filter((e) => e !== item) as FieldVolunteerInput["equipment"],
      );
    } else {
      setValue("equipment", [...selectedEquipment, item]);
    }
  }

  async function onSubmit(values: FieldVolunteerInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitFieldVolunteer(values);
      if (!res.success) {
        setSubmitError(
          res.message ??
            (isFr
              ? "Une erreur est survenue lors de l'enregistrement."
              : "حدث خطأ أثناء حفظ البيانات.")
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur est survenue lors de l'enregistrement."
          : "حدث خطأ أثناء حفظ البيانات."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        {/* Success Banner */}
        <div className="flex flex-col items-center gap-3.5 border border-algeria-green/30 bg-algeria-green/10 p-6 sm:p-10 text-center">
          <span className="flex size-16 items-center justify-center bg-algeria-green text-white">
            <HeartHandshake className="size-9" />
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">
            {isFr
              ? "Merci pour votre engagement solidaire !"
              : "بارك الله في سواعدكم وجهودكم!"}
          </h2>
          <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {isFr
              ? "Votre inscription a bien été prise en compte. Voici les consignes de sécurité essentielles et les points de coordination actifs où vous pouvez vous rendre :"
              : "تم تسجيل استعدادكم بنجاح في قاعدة بيانات المتطوعين الميدانيين. إليكم إرشادات السلامة وأقرب مراكز التنسيق النشطة:"}
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-2.5">
            <LinkButton href="/map" className="font-bold gap-1.5">
              <MapPin className="size-4" />
              <span>{isFr ? "Ouvrir la carte des secours" : "فتح خريطة المراكز الميدانية"}</span>
            </LinkButton>
            <LinkButton href="/" variant="outline" className="font-bold">
              {isFr ? "Retour à l'accueil" : "الصفحة الرئيسية"}
            </LinkButton>
          </div>
        </div>

        {/* Safety First Notice Card */}
        <WarningBlock
          title={
            isFr
              ? "Consignes de sécurité prioritaires"
              : "تعليمات وإرشادات السلامة الميدانية الهامة"
          }
        >
          <ul className="list-inside list-disc space-y-2">
            <li>{isFr ? "Ne pénétrez jamais dans les zones de feu actif ou routes fermées sans autorisation expresse de la Protection Civile." : "لا تدخل إطلاقاً إلى مناطق الحرائق المشتعلة أو المسالك المغلقة إلا بمرافقة وتصريح مصالح الحماية المدنية."}</li>
            <li>{isFr ? "Munissez-vous toujours d'eau potable en quantité suffisante, de masques anti-poussière et de chaussures de marche adaptées." : "تزوّد دائماً بكميات كافية من مياه الشرب، كمامات واقية من الدخان والغبار، وأحذية أمان مناسبة للتضاريس الجبلية."}</li>
            <li>{isFr ? "Rapprochez-vous obligatoirement des responsables de centres pour coordonner les actions et éviter les doublons." : "تنسيق توزيع المساعدات يتم حصراً مع مسؤولي النقاط والمراكز المعتمدة لتفادي العشوائية وضمان وصول العون لمستحقيه."}</li>
          </ul>
        </WarningBlock>

        {/* Active Coordination Points */}
        {activePoints.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin className="size-5 text-algeria-green" />
              <span>{isFr ? "Points de coordination et d'accueil actifs" : "مراكز التجميع والاستقبال المفتوحة"}</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {activePoints.slice(0, 4).map((point) => (
                <div
                  key={point.id}
                  className="flex flex-col justify-between border border-border bg-card p-4 hover:border-algeria-green/40 transition-all"
                >
                  <div>
                    <p className="font-bold text-sm sm:text-base text-foreground">{point.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="size-3.5 shrink-0" />
                      <span>
                        {point.commune}، {point.wilaya}
                      </span>
                    </p>
                    {point.address && (
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                        {point.address}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    {point.phone && (
                      <a
                        href={`tel:${point.phone.replace(/\s/g, "")}`}
                        dir="ltr"
                        className="inline-flex items-center gap-1 bg-algeria-green/10 px-2.5 py-1 text-xs font-bold text-algeria-green hover:bg-algeria-green/20"
                      >
                        <Phone className="size-3" />
                        <span>{point.phone}</span>
                      </a>
                    )}
                    {point.lat && point.lng && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground ms-auto"
                      >
                        <span>{isFr ? "Itinéraire" : "المسار GPS"}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Identity and Location */}
      <FormStep
        step={1}
        title={isFr ? "Informations personnelles & localisation" : "بيانات المتطوع والموقع"}
      >
        <div className="space-y-4">

          <div>
            <Label htmlFor="vol-name" className="mb-1.5">{isFr ? "Nom et prénom *" : "الاسم واللقب *"}</Label>
            <Input
              id="vol-name"
              placeholder={isFr ? "Ex : Abdelkader Boualem" : "مثال: عبد القادر بوعلام"}
              {...register("full_name")}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="vol-phone" className="mb-1.5">{isFr ? "Numéro de téléphone *" : "رقم الهاتف للتواصل *"}</Label>
              <Input id="vol-phone" dir="ltr" placeholder="0555xxxxxx" {...register("phone")} />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="vol-emergency" className="mb-1.5">{isFr ? "Contact d'urgence (facultatif)" : "رقم هاتف شخص قريب للطوارئ"}</Label>
              <Input
                id="vol-emergency"
                placeholder={isFr ? "Ex : Frère 0612345678" : "مثال: أخي 0612345678"}
                {...register("emergency_contact")}
              />
            </div>
          </div>

          {/* Wilaya Selection */}
          <div>
            <Label htmlFor="vol-wilaya" className="mb-1.5">{isFr ? "Wilaya *" : "الولاية *"}</Label>
            {/* Quick Select for Priority Affected Wilayas */}
            <div className="mb-2 flex flex-wrap gap-1.5">
              {priorityWilayas.map((pw) => {
                const isSelected =
                  selectedWilaya === pw.name_ar || selectedWilaya === pw.codeStr || selectedWilaya === String(pw.code);
                return (
                  <button
                    key={pw.code}
                    type="button"
                    onClick={() => {
                      setValue("wilaya_code", pw.name_ar, { shouldValidate: true });
                      setValue("commune_id", "", { shouldValidate: true });
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold transition-all active:scale-95",
                      isSelected
                        ? "bg-priority-critical text-white"
                        : "bg-priority-critical/10 text-priority-critical hover:bg-priority-critical/20"
                    )}
                  >
                    <Zap className="size-3 text-amber-500 shrink-0 fill-amber-500" />
                    <span>{isFr ? `${pw.codeStr} - ${pw.name_fr}` : `${pw.codeStr} - ${pw.name_ar}`}</span>
                  </button>
                );
              })}
            </div>

            <WilayaSelect
              id="vol-wilaya"
              locale={locale}
              value={selectedWilaya}
              onChange={(e) => {
                setValue("wilaya_code", e.target.value, { shouldValidate: true });
                setValue("commune_id", "", { shouldValidate: true });
              }}
            />
            {errors.wilaya_code && (
              <p className="mt-1 text-xs text-destructive">{errors.wilaya_code.message}</p>
            )}
          </div>

          {/* Commune Selection powered by ihahachi/algeria-cities */}
          <div>
            <Label htmlFor="vol-commune" className="mb-1.5">{isFr ? "Commune de présence / intervention *" : "البلدية (مكان التواجد / التدخل) *"}</Label>
            <CommuneSelect
              id="vol-commune"
              wilaya={selectedWilaya}
              locale={locale}
              value={selectedCommune}
              onChange={(e) => setValue("commune_id", e.target.value, { shouldValidate: true })}
            />
            {errors.commune_id && (
              <p className="mt-1 text-xs text-destructive">{errors.commune_id.message}</p>
            )}
          </div>
        </div>
      </FormStep>

      {/* 2. Skills & Capabilities */}
      <FormStep
        step={2}
        title={isFr ? "Domaines d'aide sur le terrain" : "مجالات المساعدة الميدانية"}
        caption={
          isFr
            ? "Sélectionnez un ou plusieurs domaines où vous pouvez prêter main-forte"
            : "اختر مجالاً واحداً أو أكثر حسب قدرتك واستعدادك للمساعدة"
        }
      >
        <div className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fieldVolunteerSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              const label =
                fieldVolunteerSkillLabels[skill]?.[locale] ||
                fieldVolunteerSkillLabels[skill]?.ar ||
                skill;

              return (
                <ChoiceCard
                  key={skill}
                  type="checkbox"
                  name={`skill-${skill}`}
                  icon={skillIcons[skill] ?? "user-multiple"}
                  title={label}
                  checked={isSelected}
                  onChange={() => toggleSkill(skill)}
                />
              );
            })}
          </div>
          {errors.skills && (
            <p className="text-xs text-destructive">{errors.skills.message}</p>
          )}
        </div>
      </FormStep>

      {/* 3. Mobility and Availability */}
      <FormStep step={3} title={isFr ? "Mobilité & disponibilité" : "وسيلة التنقل والجاهزية"}>
        <div className="space-y-4">

          {/* Mobility Mode */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              {isFr ? "Mode de déplacement :" : "وضع ووسيلة التنقل :"}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fieldVolunteerMobilityOptions.map((mob) => {
                const isSelected = selectedMobility === mob;
                const label =
                  fieldVolunteerMobilityLabels[mob]?.[locale] ||
                  fieldVolunteerMobilityLabels[mob]?.ar ||
                  mob;

                return (
                  <ChoiceCard
                    key={mob}
                    name="mobility"
                    value={mob}
                    icon={mobilityIcons[mob] ?? "car-03"}
                    title={label}
                    checked={isSelected}
                    onChange={() => setValue("mobility", mob)}
                  />
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              {isFr ? "Période de disponibilité :" : "أوقات التوفر والجاهزية :"}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {fieldVolunteerAvailabilityOptions.map((avail) => {
                const isSelected = selectedAvailability === avail;
                const label =
                  fieldVolunteerAvailabilityLabels[avail]?.[locale] ||
                  fieldVolunteerAvailabilityLabels[avail]?.ar ||
                  avail;

                return (
                  <ChoiceCard
                    key={avail}
                    name="availability"
                    value={avail}
                    icon="clock-01"
                    title={label}
                    checked={isSelected}
                    onChange={() => setValue("availability", avail)}
                  />
                );
              })}
            </div>
          </div>

          {/* Equipment available */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              {isFr ? "Équipements de sécurité dont vous disposez :" : "معدات السلامة المتوفرة بحوزتك :"}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fieldVolunteerEquipmentOptions.map((eq) => {
                const isSelected = selectedEquipment.includes(eq);
                const label =
                  fieldVolunteerEquipmentLabels[eq]?.[locale] ||
                  fieldVolunteerEquipmentLabels[eq]?.ar ||
                  eq;

                return (
                  <ChoiceCard
                    key={eq}
                    type="checkbox"
                    compact
                    showControl
                    title={label}
                    checked={isSelected}
                    onChange={() => toggleEquipment(eq)}
                  />
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="pt-2">
            <Label htmlFor="vol-notes" className="mb-1.5">
              {isFr ? "Remarques complémentaires (facultatif)" : "ملاحظات أو مهارات إضافية (اختياري)"}
            </Label>
            <Textarea
              id="vol-notes"
              placeholder={
                isFr
                  ? "Expérience préalable, créneaux précis, connaissances particulières..."
                  : "أي تفاصيل أخرى تساعد فرق التنسيق (مثل: خبرة كشفية، معرفة بمسالك معينة...)"
              }
              {...register("notes")}
            />
          </div>

          {/* Phone Privacy Toggle */}
          <ChoiceCard
            type="checkbox"
            compact
            showControl
            className="mt-1"
            title={
              isFr
                ? "J'accepte que mon numéro soit transmis directement aux coordinateurs de terrain"
                : "أوافق على إتاحة رقم هاتفي لمنسقي الفرق الميدانية للتواصل المباشر والسريع"
            }
            checked={showPhone}
            onChange={(e) => setValue("show_phone_publicly", e.target.checked)}
          />
        </div>
      </FormStep>

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
        variant="primary"
        size="submit"
        icon={submitting ? undefined : "user-check-01"}
        disabled={submitting}
      >
        {submitting
          ? isFr
            ? "Envoi en cours…"
            : "جارٍ الإرسال…"
          : isFr
            ? "Confirmer mon inscription"
            : "تأكيد تسجيل التطوع الميداني"}
      </Action>
    </form>
  );
}
