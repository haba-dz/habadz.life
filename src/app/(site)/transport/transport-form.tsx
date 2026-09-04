"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  transportOfferSchema,
  vehicleOptions,
  type TransportOfferInput,
} from "@/schemas/transport-offer";
import { Icon, type IconName } from "@/components/icons";
import {
  Action,
  Chip,
  ChoiceCard,
  FieldInput,
  FieldLabel,
  FieldPhoneInput,
  FieldTextarea,
  FOCUS_RING,
  FormStep,
  WilayaSelect,
} from "@/components/site";
import { priorityWilayas } from "@/lib/algeria-cities";
import { formatQuantity, getVehicleLabel } from "@/lib/constants";
import { SuccessPanel } from "@/components/shared/success-panel";
import { submitTransportOffer, type SubmitTransportResult } from "@/actions/transport";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

const vehicleIcons: Record<string, IconName> = {
  car: "car-03",
  van: "delivery-truck-02",
  small_truck: "truck",
  large_truck: "shipping-truck-01",
};

export function TransportForm({
  locale = "ar",
}: {
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";
  const [result, setResult] = useState<SubmitTransportResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransportOfferInput>({
    resolver: zodResolver(transportOfferSchema),
    defaultValues: {
      driver_name: "",
      phone: "",
      origin_wilaya: "الجزائر",
      origin_note: "",
      destination_wilaya: "جيجل",
      destination_note: "",
      vehicle_type: "van",
      available_space_note: "",
      time_window: "",
      has_empty_space: true,
      notes: "",
    },
  });

  const selectedOrigin = watch("origin_wilaya");
  const selectedDest = watch("destination_wilaya");
  const selectedVehicle = watch("vehicle_type");
  const hasEmptySpace = watch("has_empty_space");

  async function onSubmit(values: TransportOfferInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitTransportOffer(values);
      if (!res.success) {
        setSubmitError(
          res.error ??
            (isFr
              ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
              : "حدث خطأ أثناء التسجيل. حاول مرة أخرى.")
        );
        return;
      }
      setResult(res);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
          : "حدث خطأ أثناء التسجيل. حاول مرة أخرى."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.success) {
    return (
      <div className="animate-rise space-y-6">
        <SuccessPanel
          title={isFr ? "Offre de transport enregistrée avec succès" : "تم تسجيل عرض النقل والشحن بنجاح"}
          description={
            isFr
              ? "L'équipe de coordination logistique vous contactera pour planifier l'acheminement. Ci-dessous les dons prêts à être transportés sur votre trajet."
              : "بورك في مسعاكم. سيتواصل فريق التنسيق اللوجستي معكم لتحديد نقاط الاستلام والتفريغ. في الأسفل المساعدات المسجلة على نفس مساركم."
          }
          primaryHref="/map"
          primaryLabel={isFr ? "Voir les points de collecte" : "عرض خريطة نقاط الشحن"}
        />

        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-[17px] font-bold text-haba-forest">
            <Icon name="package" size={20} className="text-haba-green" />
            <span>{isFr ? "Dons pouvant être acheminés sur votre trajet" : "مساعدات بانتظار وسيلة شحن على مسارك"}</span>
          </h2>

          {!result.candidates || result.candidates.length === 0 ? (
            <EmptyState
              title={
                isFr
                  ? "Aucun don ne nécessite de transport immédiat sur votre trajet"
                  : "لا توجد حاليًا شحنات معلقة على هذا المسار بالتحديد"
              }
              description={
                isFr
                  ? "Votre offre est enregistrée et sera activée dès qu'un besoin se présente."
                  : "تم حفظ بيانات مركبتك في بنك النقل، وسيتواصل معك منسقو الإغاثة فور توفر شحنة في منطقتك."
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {result.candidates.map((c) => (
                <div
                  key={c.donationId}
                  className="flex items-center justify-between gap-3 border border-haba-border bg-haba-surface p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-haba-ink">
                      {c.itemsSummary || (isFr ? "Dons divers" : "مساعدات إغاثية")}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-haba-muted">
                      <Icon name="location-01" size={13} className="shrink-0" />
                      <span>{isFr ? "De : " : "نقطة الانطلاق: "}{c.donorWilaya}</span>
                    </p>
                  </div>
                  {c.distanceKm !== null && (
                    <Chip tone="green" fill="tint" size="xs" className="shrink-0">
                      ~{formatQuantity(c.distanceKm, locale)} km
                    </Chip>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Driver Identity */}
      <FormStep step={1} title={isFr ? "Informations du chauffeur" : "بيانات السائق أو الناقل"}>
        <div className="grid grid-cols-1 gap-3.5 desktop:grid-cols-2">
          <div>
            <FieldLabel htmlFor="tr-driver">
              {isFr ? "Nom et prénom *" : "الاسم الكامل *"}
            </FieldLabel>
            <FieldInput
              id="tr-driver"
              placeholder={isFr ? "Ex : Samir Amari" : "مثال: سمير عماري"}
              {...register("driver_name")}
            />
            {errors.driver_name && (
              <p className="mt-1 text-xs text-haba-red">{errors.driver_name.message}</p>
            )}
          </div>

          <div>
            <FieldLabel htmlFor="tr-phone">
              {isFr ? "Numéro de téléphone *" : "رقم الهاتف للتواصل *"}
            </FieldLabel>
            <FieldPhoneInput id="tr-phone" placeholder="0555xxxxxx" {...register("phone")} />
            {errors.phone && <p className="mt-1 text-xs text-haba-red">{errors.phone.message}</p>}
          </div>
        </div>
      </FormStep>

      {/* 2. Route & Destination */}
      <FormStep step={2} title={isFr ? "Itinéraire du trajet" : "مسار الرحلة ونقاط العبور"}>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Origin Wilaya */}
            <div>
              <FieldLabel htmlFor="tr-origin">
                {isFr ? "Point de départ (Wilaya) *" : "ولاية الانطلاق *"}
              </FieldLabel>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {priorityWilayas.map((pw) => {
                  const isSelected =
                    selectedOrigin === pw.name_ar || selectedOrigin === pw.codeStr || selectedOrigin === String(pw.code);
                  return (
                    <button
                      key={pw.code}
                      type="button"
                      onClick={() => setValue("origin_wilaya", pw.name_ar, { shouldValidate: true })}
                      className={cn(
                        "inline-flex items-center gap-1 border px-2.5 py-1 text-xs font-bold transition-colors",
                        isSelected
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
              <WilayaSelect
                id="tr-origin"
                locale={locale}
                value={selectedOrigin}
                onChange={(e) => setValue("origin_wilaya", e.target.value, { shouldValidate: true })}
              />
              {errors.origin_wilaya && (
                <p className="mt-1 text-xs text-haba-red">{errors.origin_wilaya.message}</p>
              )}
            </div>

            {/* Destination Wilaya with Priority Chips */}
            <div>
              <FieldLabel htmlFor="tr-dest">
                {isFr ? "Destination (Wilaya) *" : "ولاية الوصول / الوجهة *"}
              </FieldLabel>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {priorityWilayas.map((pw) => {
                  const isSelected =
                    selectedDest === pw.name_ar || selectedDest === pw.codeStr || selectedDest === String(pw.code);
                  return (
                    <button
                      key={pw.code}
                      type="button"
                      onClick={() => setValue("destination_wilaya", pw.name_ar, { shouldValidate: true })}
                      className={cn(
                        "inline-flex items-center gap-1 border px-2.5 py-1 text-xs font-bold transition-colors",
                        isSelected
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
              <WilayaSelect
                id="tr-dest"
                locale={locale}
                value={selectedDest}
                onChange={(e) => setValue("destination_wilaya", e.target.value, { shouldValidate: true })}
              />
              {errors.destination_wilaya && (
                <p className="mt-1 text-xs text-haba-red">{errors.destination_wilaya.message}</p>
              )}
            </div>
          </div>
      </FormStep>

      {/* 3. Vehicle & Capacity */}
      <FormStep
        step={3}
        title={isFr ? "Type de véhicule & Disponibilité" : "نوع المركبة والقدرة الاستيعابية"}
      >
        <div className="flex flex-col gap-4">
          {/* Real radios, not buttons — design.md §8.5 */}
          <fieldset>
            <legend className="mb-1.5 block text-[13px] font-semibold text-haba-ink-2">
              {isFr ? "Sélectionnez votre type de véhicule :" : "اختر نوع المركبة المتوفرة لديك :"}
            </legend>
            <div className="grid grid-cols-2 gap-2 desktop:grid-cols-4">
              {vehicleOptions.map((v) => (
                <ChoiceCard
                  key={v.value}
                  name="vehicle_type"
                  compact
                  icon={vehicleIcons[v.value] ?? "truck"}
                  title={getVehicleLabel(v.value, locale)}
                  checked={selectedVehicle === v.value}
                  onChange={() =>
                    setValue("vehicle_type", v.value as TransportOfferInput["vehicle_type"])
                  }
                />
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-3 desktop:grid-cols-3">
            <div>
              <FieldLabel htmlFor="tr-capacity">
                {isFr ? "Capacité estimée (kg)" : "الحمولة التقريبية (كغ)"}
              </FieldLabel>
              <FieldInput
                id="tr-capacity"
                type="number"
                min={0}
                placeholder="500"
                {...register("max_capacity_kg", {
                  setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? undefined : Number(v)),
                })}
              />
            </div>

            <div>
              <FieldLabel htmlFor="tr-date">
                {isFr ? "Date du trajet" : "تاريخ الانطلاق"}
              </FieldLabel>
              <FieldInput id="tr-date" type="date" {...register("travel_date")} />
            </div>

            <div>
              <FieldLabel htmlFor="tr-window">
                {isFr ? "Créneau horaire" : "التوقيت المفضل"}
              </FieldLabel>
              <FieldInput
                id="tr-window"
                placeholder={isFr ? "Ex : Matin 08h" : "مثال: الصباح الباكر"}
                {...register("time_window")}
              />
            </div>
          </div>

          <ChoiceCard
            type="checkbox"
            compact
            showControl
            title={
              isFr
                ? "J'ai un espace libre disponible prêt à charger des colis d'urgence"
                : "أملك مساحة فارغة في المركبة وجاهز لتحميل طرود ومساعدات إغاثية"
            }
            checked={hasEmptySpace}
            onChange={(e) => setValue("has_empty_space", e.target.checked)}
          />

          <div>
            <FieldLabel htmlFor="tr-notes">
              {isFr ? "Remarques (facultatif)" : "ملاحظات إضافية عن الرحلة (اختياري)"}
            </FieldLabel>
            <FieldTextarea
              id="tr-notes"
              placeholder={
                isFr
                  ? "Villes de passage, contraintes de volume..."
                  : "المدن التي ستمر عليها، نوع الصناديق التي تفضل حملها..."
              }
              {...register("notes")}
            />
          </div>
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

      <Action type="submit" variant="primary" size="submit" disabled={submitting}>
        {submitting ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Icon name="truck-delivery" size={20} />
        )}
        <span>{isFr ? "Enregistrer mon offre de transport" : "تأكيد تسجيل عرض النقل والشحن"}</span>
      </Action>
    </form>
  );
}
