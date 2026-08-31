"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  HeartHandshake,
  LifeBuoy,
  Gift,
  MapPin,
  TriangleAlert,
  Stethoscope,
  Hammer,
  Truck,
  Newspaper,
  ShieldCheck,
  PhoneCall,
  Info,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Users,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { siteConfig } from "@/config/site";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  locale: AvailableLocale;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function MobileNav({ locale, isOpen, onOpenChange, trigger }: MobileNavProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const pathname = usePathname();
  const isFr = locale === "fr";
  const isRtl = locale === "ar";
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const mainLinks = [
    { href: "/", label: isFr ? "Accueil" : "الرئيسية", icon: HeartHandshake },
    { href: "/map", label: isFr ? "Carte des secours" : "خريطة المراكز والإغاثة", icon: MapPin },
    { href: "/help", label: isFr ? "Demander de l'aide" : "طلب إغاثة للمتضررين", icon: LifeBuoy, highlight: true },
    { href: "/donate", label: isFr ? "Enregistrer un don" : "تقديم مساعدات عينية", icon: Gift, highlight: true },
  ];

  const secondaryLinks = [
    { href: "/volunteers", label: isFr ? "Volontaires de terrain" : "التطوع وسواعد الإغاثة", icon: Users },
    { href: "/affected-areas", label: isFr ? "Zones sinistrées" : "المناطق المتضررة", icon: TriangleAlert },
    { href: "/medical", label: isFr ? "Volontaires médicaux" : "الطواقم الطبية والبيطرية", icon: Stethoscope },
    { href: "/artisans", label: isFr ? "Artisans & Travaux" : "الحرفيون والترميم", icon: Hammer },
    { href: "/help/damage-assessment", label: isFr ? "Évaluation des dégâts" : "تقييم الأضرار الميدانية", icon: Info },
    { href: "/transport", label: isFr ? "Offres de transport" : "عروض النقل والشحن", icon: Truck },
    { href: "/news", label: isFr ? "Actualités & Rapports" : "الأخبار والمستجدات", icon: Newspaper },
    { href: "/transparency", label: isFr ? "Transparence & Distribution" : "الشفافية وسجل التوزيع", icon: ShieldCheck },
    { href: "/official-information", label: isFr ? "Informations officielles" : "البيانات الرسمية", icon: Info },
  ];

  const emergencyHotlines = [
    { name: isFr ? "Protection Civile" : "الحماية المدنية", number: "14", color: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/40" },
    { name: isFr ? "Police Nationale" : "الأمن الوطني", number: "1548", color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/40" },
    { name: isFr ? "Gendarmerie" : "الدرك الوطني", number: "1055", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/40" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger !== null &&
        (trigger ? (
          <SheetTrigger render={trigger as React.ReactElement} nativeButton={true} />
        ) : (
          <SheetTrigger
            nativeButton={true}
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-xl md:hidden text-foreground hover:bg-muted"
                aria-label={isFr ? "Menu de navigation" : "قائمة التنقل"}
              >
                <Menu className="size-5" />
              </Button>
            }
          />
        ))}

      <SheetContent
        side={isRtl ? "right" : "left"}
        className="w-[85vw] max-w-sm p-0 flex flex-col justify-between bg-background border-border z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 bg-muted/30">
          <div className="flex items-center gap-2.5 font-bold">
            <span className="flex size-8 items-center justify-center rounded-full bg-algeria-green text-white shadow-xs">
              <HeartHandshake className="size-4" />
            </span>
            <span className="text-base tracking-tight">{siteConfig.shortName}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher current={locale} label={isFr ? "Langue" : "اللغة"} />
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground hover:text-foreground"
                />
              }
            >
              <X className="size-4" />
            </SheetClose>
          </div>
        </div>

        {/* Scrollable Links Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main Action Links */}
          <div className="space-y-1.5">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {isFr ? "Actions Principales" : "الخدمات الأساسية"}
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {mainLinks.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors",
                      active
                        ? "bg-algeria-green text-white shadow-xs"
                        : link.highlight
                        ? "bg-algeria-green/10 text-algeria-green hover:bg-algeria-green/20"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-4 shrink-0" />
                      <span>{link.label}</span>
                    </div>
                    <Chevron className="size-4 opacity-50" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Secondary Links */}
          <div className="space-y-1.5">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {isFr ? "Médiathèque & Terrain" : "الميدان والمتابعة"}
            </p>
            <div className="grid grid-cols-1 gap-1">
              {secondaryLinks.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                      active
                        ? "bg-algeria-green/15 text-algeria-green font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0" />
                      <span>{link.label}</span>
                    </div>
                    <Chevron className="size-3.5 opacity-40" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Emergency Hotlines Box */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-priority-critical">
              <PhoneCall className="size-3.5" />
              <span>{isFr ? "Numéros d'urgence gratuits" : "أرقام الطوارئ المجانية"}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {emergencyHotlines.map((hl) => (
                <a
                  key={hl.number}
                  href={`tel:${hl.number}`}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-transform active:scale-95",
                    hl.color
                  )}
                >
                  <span className="text-base font-black tabular-nums">{hl.number}</span>
                  <span className="text-[10px] font-bold truncate max-w-full">{hl.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info & Admin link */}
        <div className="border-t border-border px-5 py-3.5 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>{isFr ? "Plateforme d'entraide solidaire" : "منصة نجدة وإغاثة تضامنية"}</span>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="font-bold text-algeria-green hover:underline flex items-center gap-1"
          >
            <span>{isFr ? "Espace Admin" : "لوحة الإدارة"}</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
