"use client";

import { useActionState, useState } from "react";
import {
  Loader2,
  Upload,
  Home,
  Hammer,
  Paintbrush,
  Zap,
  Wrench,
  ShieldAlert,
  Send,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SuccessPanel } from "@/components/shared/success-panel";
import {
  submitDamageAssessment,
  type DamageAssessmentActionState,
} from "@/actions/damage-assessments";
import { priorityWilayas } from "@/lib/algeria-cities";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import { cn } from "@/lib/utils";
import type { AvailableLocale } from "@/i18n/locales";

const initialState: DamageAssessmentActionState = { success: false };

const damageCategories = [
  { name: "needs_roofing", ar: "أضرار بالغة في السقف والقرميد", fr: "Dégâts à la toiture / plafond", icon: Home },
  { name: "needs_paint", ar: "احتراق أو تصدع الجدران والدهان", fr: "Murs noircis / Peinture brûlée", icon: Paintbrush },
  { name: "needs_flooring", ar: "تلف الأرضية والبلاط", fr: "Dégâts aux sols / carrelage", icon: Hammer },
  { name: "needs_plumbing", ar: "تلف شبكة المياه والصرف الصحي", fr: "Réseau d'eau / sanitaires détruit", icon: Wrench },
  { name: "needs_electrical", ar: "احتراق الأسلاك والتمديدات الكهربائية", fr: "Installation électrique détruite", icon: Zap },
];

export function DamageAssessmentForm({ locale = "ar" }: { locale?: AvailableLocale }) {
  const isFr = locale === "fr";
  const [state, formAction, pending] = useActionState(submitDamageAssessment, initialState);
  const [selectedWilaya, setSelectedWilaya] = useState("جيجل");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [needsPaint, setNeedsPaint] = useState(false);
  const [selectedDamages, setSelectedDamages] = useState<string[]>(["needs_roofing"]);

  function toggleDamage(name: string) {
    if (name === "needs_paint") {
      setNeedsPaint(!needsPaint);
    }
    if (selectedDamages.includes(name)) {
      setSelectedDamages(selectedDamages.filter((d) => d !== name));
    } else {
      setSelectedDamages([...selectedDamages, name]);
    }
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
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-extrabold">
              1
            </span>
            <h2>{isFr ? "Coordonnées & Localisation du logement" : "بيانات صاحب السكن والموقع"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5">{isFr ? "Nom et prénom *" : "الاسم واللقب *"}</Label>
              <Input name="full_name" placeholder={isFr ? "Ex : Amar Meziane" : "مثال: عمار مزيان"} required />
            </div>

            <div>
              <Label className="mb-1.5">{isFr ? "Numéro de téléphone *" : "رقم الهاتف للتواصل *"}</Label>
              <Input dir="ltr" name="phone" placeholder="0555xxxxxx" required />
            </div>
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Wilaya *" : "الولاية *"}</Label>
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
                      "rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                      active
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

            <input type="hidden" name="wilaya" value={selectedWilaya} />
            <WilayaSelect
              locale={locale}
              value={selectedWilaya}
              onChange={(e) => {
                setSelectedWilaya(e.target.value);
                setSelectedCommune("");
              }}
            />
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Commune *" : "البلدية *"}</Label>
            <input type="hidden" name="commune" value={selectedCommune} />
            <CommuneSelect
              wilaya={selectedWilaya}
              locale={locale}
              value={selectedCommune}
              onChange={(e) => setSelectedCommune(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Village / Quartier / Repère (facultatif)" : "القرية / الحي / أقرب معلم (اختياري)"}</Label>
            <Input
              name="address_note"
              placeholder={isFr ? "Ex : Près de l'école primaire..." : "مثال: بجوار المدرسة الابتدائية..."}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Damage Assessment */}
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-extrabold">
              2
            </span>
            <h2>{isFr ? "Nature des dégradations" : "طبيعة ونوع الأضرار بالسكن"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {damageCategories.map((cat) => {
              const isSelected = selectedDamages.includes(cat.name);
              const Icon = cat.icon;
              return (
                <label
                  key={cat.name}
                  onClick={() => toggleDamage(cat.name)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border text-start transition-all cursor-pointer",
                    isSelected
                      ? "border-orange-500 bg-orange-500/10 text-foreground font-bold shadow-xs"
                      : "border-border bg-card/60 text-muted-foreground hover:bg-secondary/40"
                  )}
                >
                  <input
                    type="checkbox"
                    name={cat.name}
                    checked={isSelected}
                    onChange={() => {}}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl",
                      isSelected
                        ? "bg-orange-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-xs sm:text-sm leading-snug">{isFr ? cat.fr : cat.ar}</span>
                </label>
              );
            })}
          </div>

          {needsPaint && (
            <div className="pt-2">
              <Label className="mb-1.5">{isFr ? "Surface approximative à repeindre (m²)" : "المساحة التقريبية للجدران والأسقف (م²)"}</Label>
              <Input
                type="number"
                min={1}
                step={1}
                name="paint_area_sqm"
                placeholder={isFr ? "Ex : 80" : "مثال: 80"}
                className="h-10 rounded-xl"
              />
            </div>
          )}

          <div>
            <Label className="mb-1.5">{isFr ? "Précisions sur les travaux requis (facultatif)" : "ملاحظات وتفاصيل إضافية عن الإصلاحات المطلوبة (اختياري)"}</Label>
            <Textarea
              name="finishing_notes"
              placeholder={
                isFr
                  ? "Nombre de pièces touchées, types de portes ou fenêtres détruites..."
                  : "عدد الغرف المتضررة، قياسات النوافذ أو الأبواب المحترقة..."
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Photo Upload */}
      <Card>
        <CardContent className="space-y-3 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-extrabold">
              3
            </span>
            <h2>{isFr ? "Photos des dégâts (recommandé)" : "صور الأضرار (مستحسن)"}</h2>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            {isFr
              ? "Ajouter des photos permet aux architectes et artisans d'évaluer directement les matériaux requis."
              : "إرفاق صور واضحة يساعد المهندسين والحرفيين على تقدير كمية الإسمنت، الآجر، الدهان والأنابيب بدقة وسرعة."}
          </p>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/80 rounded-2xl p-6 bg-card/40 text-center hover:border-orange-500/50 transition-colors cursor-pointer relative">
            <Camera className="size-8 text-orange-600 dark:text-orange-400 mb-2" />
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {isFr ? "Cliquez ici pour sélectionner les photos" : "اضغط هنا لاختيار صور من هاتفك أو جهازك"}
            </span>
            <span className="text-[11px] text-muted-foreground mt-1">PNG, JPG, WEBP</span>
            <input
              type="file"
              name="photos"
              multiple
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </CardContent>
      </Card>

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-base shadow-md h-12 rounded-2xl"
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Send className="size-5 ms-1" />
        )}
        <span>{isFr ? "Transmettre le dossier d'évaluation" : "إرسال تقرير تقييم الأضرار"}</span>
      </Button>
    </form>
  );
}
