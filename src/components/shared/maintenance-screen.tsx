"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Wrench,
  Hammer,
  RotateCw,
  Phone,
  ShieldCheck,
  HeartHandshake,
  Clock,
  Sparkles,
  Lock,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { siteConfig } from "@/config/site";
import { emergencyContacts } from "@/lib/emergency";
import type { AvailableLocale } from "@/i18n/locales";

interface MaintenanceScreenProps {
  locale?: AvailableLocale;
}

export function MaintenanceScreen({ locale = "ar" }: MaintenanceScreenProps) {
  const isFr = locale === "fr";
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, startTransition] = useTransition();

  const handleRefresh = () => {
    setIsRefreshing(true);
    startTransition(() => {
      window.location.reload();
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-secondary/50 via-background to-secondary/30 text-foreground selection:bg-algeria-green selection:text-white">
      {/* Background ambient glowing orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[500px] w-[800px] max-w-full rounded-full bg-[radial-gradient(circle,var(--algeria-green)/12,transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--priority-critical)/8,transparent_70%)] blur-3xl"
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2.5 font-bold text-base sm:text-lg">
            <span className="flex size-9 items-center justify-center rounded-xl bg-algeria-green text-algeria-green-foreground shadow-sm">
              <HeartHandshake className="size-5" />
            </span>
            <span className="truncate">{siteConfig.shortName}</span>
          </div>

          {/* Language Switcher & Admin Link */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher
              current={locale}
              label={isFr ? "Changer de langue" : "تغيير اللغة"}
            />
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/60 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
              title={isFr ? "Accès administration" : "دخول المشرفين"}
            >
              <Lock className="size-3.5" />
              <span className="hidden sm:inline">
                {isFr ? "Espace Admin" : "لوحة الإدارة"}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-3xl text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 shadow-xs mb-6 sm:mb-8 animate-rise">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
            </span>
            <Radio className="size-3.5 animate-pulse" />
            <span>
              {isFr
                ? "Maintenance technique et améliorations en cours"
                : "أعمال صيانة وتحديثات تقنية جارية"}
            </span>
          </div>

          {/* Animated Main Icon Illustration */}
          <div className="relative mx-auto mb-6 flex size-24 sm:size-28 items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-3xl bg-algeria-green/15 animate-ping opacity-30" />
            <div className="relative flex size-full items-center justify-center rounded-3xl border border-algeria-green/40 bg-card p-4 shadow-xl backdrop-blur-md">
              <div className="relative flex size-full items-center justify-center rounded-2xl bg-gradient-to-br from-algeria-green/20 via-algeria-green/10 to-amber-500/10 text-algeria-green">
                <Wrench className="size-10 sm:size-12 animate-pulse text-algeria-green" />
                <Hammer className="absolute size-5 sm:size-6 text-amber-600 dark:text-amber-400 bottom-1 end-1" />
              </div>
            </div>
          </div>

          {/* Primary Titles */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {isFr
              ? "Le site est temporairement indisponible"
              : "الموقع متوقف مؤقتًا لأعمال الصيانة والتحسين"}
          </h1>

          <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-lg leading-relaxed text-muted-foreground">
            {isFr
              ? "Nous apportons actuellement des améliorations importantes pour optimiser le service et garantir une meilleure coordination des secours. Nous serons de retour très prochainement !"
              : "نقوم حاليًا بإجراء بعض التحسينات والإصلاحات التقنية على المنصة لضمان تسريع الاستجابة وتنسيق المساعدات بأفضل جودة. سنعود للعمل في أقرب وقت."}
          </p>

          {/* Info Status Cards */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 text-start">
            <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-xs backdrop-blur-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    {isFr ? "Statut des travaux" : "حالة العمل"}
                  </p>
                  <p className="text-sm font-extrabold text-foreground">
                    {isFr ? "En cours de finalisation" : "في المراحل الأخيرة"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-xs backdrop-blur-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-algeria-green/10 text-algeria-green">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    {isFr ? "Données et requêtes" : "البيانات والطلبات"}
                  </p>
                  <p className="text-sm font-extrabold text-foreground">
                    {isFr ? "Totalement sécurisées" : "محفوظة وآمنة تمامًا"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-xs backdrop-blur-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    {isFr ? "Objectif" : "الهدف"}
                  </p>
                  <p className="text-sm font-extrabold text-foreground">
                    {isFr ? "Performance & Fiabilité" : "أداء أسرع وتجربة أفضل"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action: Reload Page */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-auto min-w-48 font-bold bg-algeria-green hover:bg-algeria-green/90 text-white shadow-md transition-all active:scale-95"
            >
              <RotateCw
                className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>
                {isRefreshing
                  ? isFr
                    ? "Actualisation..."
                    : "جاري التحديث..."
                  : isFr
                    ? "Actualiser la page"
                    : "إعادة تحميل الصفحة"}
              </span>
            </Button>
          </div>

          {/* Emergency Hotlines Strip (Critical for Relief Sites) */}
          <div className="mt-10 sm:mt-12 rounded-3xl border border-priority-critical/30 bg-priority-critical/[0.04] p-5 sm:p-6 text-start">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                  <Phone className="size-4 text-priority-critical animate-pulse" />
                  <span>
                    {isFr
                      ? "En cas d'urgence immédiate (Numéros d'urgence)"
                      : "أرقام الطوارئ والاتصال المباشر (في الحالات المستعجلة)"}
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isFr
                    ? "Les services de secours officiels restent joignables 24h/24 :"
                    : "خطوط النجدة والإسعاف الرسمية متاحة ومستمرة على مدار 24 ساعة:"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
              {emergencyContacts.map((c) => (
                <a
                  key={c.label}
                  href={`tel:${c.number}`}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-3 sm:p-4 text-center transition-all hover:border-priority-critical hover:bg-priority-critical/5 hover:shadow-sm active:scale-95"
                >
                  <span className="text-lg sm:text-2xl font-black tabular-nums text-priority-critical group-hover:scale-105 transition-transform">
                    {c.number}
                  </span>
                  <span className="mt-1 text-xs font-bold text-foreground">
                    {isFr && c.label_fr ? c.label_fr : c.label}
                  </span>
                  {(isFr ? c.hint_fr || c.hint : c.hint) && (
                    <span className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                      {isFr ? c.hint_fr || c.hint : c.hint}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-border/60 bg-background/60 py-4 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            {isFr
              ? "Initiative numérique indépendante de coordination de la solidarité — non gouvernementale, sans affiliation officielle."
              : siteConfig.legalNotice}
          </p>
          <p className="font-semibold">{siteConfig.shortName} © 2026</p>
        </div>
      </footer>
    </div>
  );
}
