"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  HeartHandshake,
  Gift,
  MapPin,
  TriangleAlert,
  Stethoscope,
  Hammer,
  Truck,
  Newspaper,
  ShieldCheck,
  PhoneCall,
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

  // 1. Bénévolat & Dons (Solidarité)
  const volunteerLinks = [
    {
      href: "/donate",
      label: isFr ? "Enregistrer un don de matériel" : "تقديم مساعدات وتبرعات عينية",
      desc: isFr ? "Vivres, eau, couvertures, couches" : "أغذية، أفرشة، أدوية، مياه",
      icon: Gift,
      color: "text-algeria-green",
      badge: isFr ? "Prioritaire" : "أولوية",
    },
    {
      href: "/volunteers",
      label: isFr ? "Volontariat de terrain" : "المتطوعون الميدانيون",
      desc: isFr ? "Tri des colis, déblaiement, aide" : "فرز الطرود، توجيه القوافل، الدعم",
      icon: Users,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      href: "/transport",
      label: isFr ? "Offres de transport & logistique" : "النقل والشحن اللوجستي",
      desc: isFr ? "Acheminement des colis et convois" : "نقل الطرود والشحنات بين الولايات",
      icon: Truck,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      href: "/medical",
      label: isFr ? "Médecins & Vétérinaires" : "الطواقم الطبية والبيطرية",
      desc: isFr ? "Urgences, soins, santé du bétail" : "طوارئ، تمريض، ورعاية الماشية",
      icon: Stethoscope,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      href: "/artisans",
      label: isFr ? "Artisans & Travaux de réparation" : "الحرفيون وترميم السكنات",
      desc: isFr ? "Électricité, plomberie, maçonnerie" : "بناء، سباكة، كهرباء، دهان وأسقف",
      icon: Hammer,
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  // 2. Suivi & Transparence (Tracking & Info)
  const infoLinks = [
    {
      href: "/map",
      label: isFr ? "Carte des secours & points actifs" : "خريطة المراكز ونقاط الإغاثة",
      icon: MapPin,
    },
    {
      href: "/affected-areas",
      label: isFr ? "Zones et communes sinistrées" : "المناطق والبلديات المتضررة",
      icon: TriangleAlert,
    },
    {
      href: "/official-information",
      label: isFr ? "Communiqués & alertes officielles" : "البيانات الرسمية والمستجدات",
      icon: Newspaper,
    },
    {
      href: "/transparency",
      label: isFr ? "Transparence & Journal des aides" : "سجل الشفافية وتوزيع المساعدات",
      icon: ShieldCheck,
    },
  ];

  const emergencyHotlines = [
    { name: isFr ? "Protection Civile" : "الحماية المدنية", number: "14", color: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/40" },
    { name: isFr ? "Numéro Vert Forêts" : "الغابات", number: "1021", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/40" },
    { name: isFr ? "Gendarmerie" : "الدرك الوطني", number: "1055", color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/40" },
    { name: isFr ? "Police" : "الأمن الوطني", number: "1548", color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/40" },
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
                className="size-10 rounded-xl lg:hidden text-foreground hover:bg-muted"
                aria-label={isFr ? "Menu de navigation" : "قائمة التنقل"}
              >
                <Menu className="size-5" />
              </Button>
            }
          />
        ))}

      <SheetContent
        side={isRtl ? "right" : "left"}
        className="w-[88vw] max-w-sm p-0 flex flex-col justify-between bg-background border-border z-50 overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3.5 bg-card/60">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 font-black">
            <span className="flex size-8 items-center justify-center rounded-xl bg-algeria-green text-white shadow-xs">
              <HeartHandshake className="size-4" />
            </span>
            <span className="text-sm font-black tracking-normal whitespace-nowrap">{siteConfig.shortName}</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher current={locale} label={isFr ? "Langue" : "اللغة"} />
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-lg text-muted-foreground hover:text-foreground"
                />
              }
            >
              <X className="size-4" />
            </SheetClose>
          </div>
        </div>

        {/* Categorized Content */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {/* Section 1: Solidarité & Bénévolat */}
          <div className="rounded-2xl border border-algeria-green/25 bg-algeria-green/[0.03] p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 px-1 text-xs font-black text-algeria-green">
              <HeartHandshake className="size-4" />
              <span>{isFr ? "Solidarité & Bénévolat" : "سبل المساعدة والمشاركة"}</span>
            </div>
            <div className="space-y-1.5">
              {volunteerLinks.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl p-2.5 text-xs transition-all active:scale-[0.98]",
                      active
                        ? "bg-algeria-green text-white shadow-xs font-bold"
                        : "bg-background/80 hover:bg-background text-foreground border border-border/50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        active ? "bg-white/20 text-white" : "bg-algeria-green/10 text-algeria-green"
                      )}>
                        <Icon className={cn("size-4 shrink-0", active ? "text-white" : link.color)} />
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold leading-tight">{link.label}</p>
                          {link.badge && !active && (
                            <span className="rounded-full bg-algeria-green/10 px-1.5 py-0.2 text-[9px] font-extrabold text-algeria-green">
                              {link.badge}
                            </span>
                          )}
                        </div>
                        <p className={cn("text-[10px] line-clamp-1", active ? "text-white/80" : "text-muted-foreground")}>
                          {link.desc}
                        </p>
                      </div>
                    </div>
                    <Chevron className="size-3.5 opacity-40 shrink-0 ms-1" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section 2: Suivi & Transparence */}
          <div className="space-y-1.5 px-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {isFr ? "Suivi & Transparence" : "المتابعة والمستجدات"}
            </p>
            <div className="grid grid-cols-1 gap-1">
              {infoLinks.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors",
                      active
                        ? "bg-muted text-foreground font-bold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0" />
                      <span>{link.label}</span>
                    </div>
                    <Chevron className="size-3 opacity-30" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Emergency Hotlines Bar */}
          <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-priority-critical">
              <PhoneCall className="size-3.5" />
              <span>{isFr ? "Numéros d'urgence gratuits 24h/7j" : "أرقام الطوارئ الوطنية المجانية"}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {emergencyHotlines.map((hl) => (
                <a
                  key={hl.number}
                  href={`tel:${hl.number}`}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border py-1.5 px-1 text-center transition-transform active:scale-95",
                    hl.color
                  )}
                >
                  <span className="text-sm font-black tabular-nums">{hl.number}</span>
                  <span className="text-[9px] font-bold truncate max-w-full">{hl.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-border px-4 py-3 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>{siteConfig.legalNotice.split("—")[0]}</span>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="font-bold text-algeria-green hover:underline flex items-center gap-1"
          >
            <span>{isFr ? "Admin" : "لوحة الإدارة"}</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
