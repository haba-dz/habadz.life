"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon, type IconName } from "@/components/icons";
import { actionVariants, BrandMark, FOCUS_RING } from "@/components/site";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { AvailableLocale } from "@/i18n/locales";

const STORAGE_KEY = "haba_welcome_seen_v1";

type Role = {
  href: string;
  icon: IconName;
  /** Chip tone for the icon tile. */
  tone: "red" | "green" | "amber" | "ink";
  title: string;
  desc: string;
};

const rolesAr: Role[] = [
  {
    href: "/help",
    icon: "alert-02",
    tone: "red",
    title: "أحتاج مساعدة (عائلة متضررة)",
    desc: "تسجيل احتياجات أسرتكم لإيصال الإغاثة والمواد الأساسية",
  },
  {
    href: "/donate",
    icon: "gift",
    tone: "green",
    title: "لدي مساعدات عينية",
    desc: "أملك مواد وإعانات وأريد إيصالها للمتضررين",
  },
  {
    href: "/volunteers",
    icon: "user-group",
    tone: "amber",
    title: "أريد التطوع ميدانيًا أو طبياً",
    desc: "المشاركة في فرز الطرود، الإغاثة، أو الرعاية الصحية",
  },
  {
    href: "/map",
    icon: "maps-location-02",
    tone: "ink",
    title: "خريطة المراكز ونقاط الإغاثة",
    desc: "الاطلاع على نقاط التجميع ومراكز الاستقبال المفتوحة",
  },
];

const rolesFr: Role[] = [
  {
    href: "/help",
    icon: "alert-02",
    tone: "red",
    title: "J'ai besoin d'aide (famille sinistrée)",
    desc: "Enregistrer vos besoins urgents (vivres, hébergement, soins)",
  },
  {
    href: "/donate",
    icon: "gift",
    tone: "green",
    title: "J'ai des dons matériels",
    desc: "Fournir des vivres et produits de première nécessité",
  },
  {
    href: "/volunteers",
    icon: "user-group",
    tone: "amber",
    title: "Volontariat de terrain et médical",
    desc: "Aider au tri des colis, aux secours ou aux soins",
  },
  {
    href: "/map",
    icon: "maps-location-02",
    tone: "ink",
    title: "Carte des secours et des centres",
    desc: "Consulter les points de collecte et centres d'accueil",
  },
];

const toneTile: Record<Role["tone"], string> = {
  red: "border-haba-red-200 bg-haba-red-50 text-haba-red",
  green: "border-haba-green bg-haba-green-tint text-haba-green",
  amber: "border-haba-amber-200 bg-haba-amber-50 text-haba-amber",
  ink: "border-haba-border bg-haba-surface-2 text-haba-ink",
};

/**
 * First-visit role chooser. design.md §3.9
 *
 * Opened on a timer rather than on the next frame: the dialog marks everything
 * outside it aria-hidden, and doing that while React is still hydrating the
 * page is reported as a hydration attribute mismatch on every container in
 * <main>. A short delay also stops the modal from landing before the page has
 * painted, which read as a blocker rather than a welcome.
 */
export function WelcomeDialog({ locale = "ar" }: { locale?: AvailableLocale }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isFr = locale === "fr";
  const roles = isFr ? rolesFr : rolesAr;

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const id = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(id);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  function choose(href: string) {
    dismiss();
    router.push(href);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) dismiss();
      }}
    >
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-none border-haba-border sm:max-w-lg">
        <DialogHeader>
          <span className="flex size-11 items-center justify-center bg-haba-green text-white">
            <BrandMark size={24} />
          </span>
          <DialogTitle className="text-[21px] font-bold leading-tight text-haba-forest">
            {isFr ? `Bienvenue sur ${siteConfig.name}` : `مرحبًا بك في ${siteConfig.name}`}
          </DialogTitle>
          <DialogDescription className="text-[13.5px] leading-relaxed text-haba-ink-2">
            {isFr
              ? "Plateforme citoyenne de coordination des secours. Comment souhaitez-vous participer ?"
              : "منصة وطنية لتنسيق التضامن وتقديم المساعدات. كيف ترغب في المشاركة اليوم؟"}
          </DialogDescription>
        </DialogHeader>

        <div className="border-s border-t border-haba-border">
          {roles.map((r) => (
            <button
              key={r.href}
              type="button"
              onClick={() => choose(r.href)}
              className={cn(
                "flex w-full items-center gap-3.5 border-b border-e border-haba-border bg-haba-surface p-3.5 text-start hover:bg-haba-surface-2",
                FOCUS_RING,
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center border",
                  toneTile[r.tone],
                )}
              >
                <Icon name={r.icon} size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold leading-tight text-haba-ink">
                  {r.title}
                </span>
                <span className="mt-0.5 block truncate text-[12.5px] text-haba-muted">
                  {r.desc}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={dismiss}
            className={cn(actionVariants({ variant: "neutral", size: "sm" }))}
          >
            {isFr ? "Fermer et parcourir le site" : "إغلاق والتصفح مباشرة"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
