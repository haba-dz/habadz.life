"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Truck,
  Car,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  HeartHandshake,
  Package,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import {
  transportOfferSchema,
  vehicleOptions,
  type TransportOfferInput,
} from "@/schemas/transport-offer";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { priorityWilayas } from "@/lib/algeria-cities";
import { formatQuantity, getVehicleLabel } from "@/lib/constants";
import { SuccessPanel } from "@/components/shared/success-panel";
import { submitTransportOffer, type SubmitTransportResult } from "@/actions/transport";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

const vehicleIcons: Record<string, typeof Car> = {
  car: Car,
  van: Truck,
  small_truck: Truck,
  large_truck: Truck,
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
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Package className="size-5 text-blue-600 dark:text-blue-400" />
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
                <Card key={c.donationId} className="border-border shadow-xs">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-foreground">
                        {c.itemsSummary || (isFr ? "Dons divers" : "مساعدات إغاثية")}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3.5 shrink-0" />
                        <span>{isFr ? "De : " : "نقطة الانطلاق: "}{c.donorWilaya}</span>
                      </p>
                    </div>
                    {c.distanceKm !== null && (
                      <span className="shrink-0 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-black text-blue-700 dark:text-blue-300">
                        ~{formatQuantity(c.distanceKm, locale)} km
                      </span>
                    )}
                  </CardContent>
                </Card>
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
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-extrabold">
              1
            </span>
            <h2>{isFr ? "Informations du chauffeur" : "بيانات السائق أو الناقل"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5">{isFr ? "Nom et prénom *" : "الاسم الكامل *"}</Label>
              <Input
                placeholder={isFr ? "Ex : Samir Amari" : "مثال: سمير عماري"}
                {...register("driver_name")}
              />
              {errors.driver_name && (
                <p className="mt-1 text-xs text-destructive">{errors.driver_name.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-1.5">{isFr ? "Numéro de téléphone *" : "رقم الهاتف للتواصل *"}</Label>
              <Input dir="ltr" placeholder="0555xxxxxx" {...register("phone")} />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Route & Destination */}
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-extrabold">
              2
            </span>
            <h2>{isFr ? "Itinéraire du trajet" : "مسار الرحلة ونقاط العبور"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Origin Wilaya */}
            <div>
              <Label className="mb-1.5">{isFr ? "Point de départ (Wilaya) *" : "ولاية الانطلاق *"}</Label>
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
                        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all active:scale-95",
                        isSelected
                          ? "bg-priority-critical text-white shadow-xs"
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
                locale={locale}
                value={selectedOrigin}
                onChange={(e) => setValue("origin_wilaya", e.target.value, { shouldValidate: true })}
              />
              {errors.origin_wilaya && (
                <p className="mt-1 text-xs text-destructive">{errors.origin_wilaya.message}</p>
              )}
            </div>

            {/* Destination Wilaya with Priority Chips */}
            <div>
              <Label className="mb-1.5">{isFr ? "Destination (Wilaya) *" : "ولاية الوصول / الوجهة *"}</Label>
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
                        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all active:scale-95",
                        isSelected
                          ? "bg-priority-critical text-white shadow-xs"
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
                locale={locale}
                value={selectedDest}
                onChange={(e) => setValue("destination_wilaya", e.target.value, { shouldValidate: true })}
              />
              {errors.destination_wilaya && (
                <p className="mt-1 text-xs text-destructive">{errors.destination_wilaya.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Vehicle & Capacity */}
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-extrabold">
              3
            </span>
            <h2>{isFr ? "Type de véhicule & Disponibilité" : "نوع المركبة والقدرة الاستيعابية"}</h2>
          </div>

          {/* Vehicle Type Visual Cards */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              {isFr ? "Sélectionnez votre type de véhicule :" : "اختر نوع المركبة المتوفرة لديك :"}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {vehicleOptions.map((v) => {
                const isSelected = selectedVehicle === v.value;
                const Icon = vehicleIcons[v.value] || Truck;
                return (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => setValue("vehicle_type", v.value as TransportOfferInput["vehicle_type"])}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer",
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 text-foreground font-bold shadow-xs"
                        : "border-border bg-card/60 text-muted-foreground hover:bg-secondary/40"
                    )}
                  >
                    <Icon className="size-5 mb-1.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs leading-tight">{getVehicleLabel(v.value, locale)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="mb-1.5">{isFr ? "Capacité estimée (kg)" : "الحمولة التقريبية (كغ)"}</Label>
              <Input
                type="number"
                min={0}
                placeholder="500"
                {...register("max_capacity_kg", {
                  setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? undefined : Number(v)),
                })}
              />
            </div>

            <div>
              <Label className="mb-1.5">{isFr ? "Date du trajet" : "تاريخ الانطلاق"}</Label>
              <Input type="date" {...register("travel_date")} />
            </div>

            <div>
              <Label className="mb-1.5">{isFr ? "Créneau horaire" : "التوقيت المفضل"}</Label>
              <Input
                placeholder={isFr ? "Ex : Matin 08h" : "مثال: الصباح الباكر"}
                {...register("time_window")}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer pt-1">
            <Checkbox
              checked={hasEmptySpace}
              onCheckedChange={(v) => setValue("has_empty_space", Boolean(v))}
            />
            <span>
              {isFr
                ? "J'ai un espace libre disponible prêt à charger des colis d'urgence"
                : "أملك مساحة فارغة في المركبة وجاهز لتحميل طرود ومساعدات إغاثية"}
            </span>
          </label>

          <div>
            <Label className="mb-1.5">{isFr ? "Remarques (facultatif)" : "ملاحظات إضافية عن الرحلة (اختياري)"}</Label>
            <Textarea
              placeholder={
                isFr
                  ? "Villes de passage, contraintes de volume..."
                  : "المدن التي ستمر عليها، نوع الصناديق التي تفضل حملها..."
              }
              {...register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-md h-12 rounded-2xl"
        disabled={submitting}
      >
        {submitting ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Truck className="size-5 ms-1" />
        )}
        <span>{isFr ? "Enregistrer mon offre de transport" : "تأكيد تسجيل عرض النقل والشحن"}</span>
      </Button>
    </form>
  );
}
