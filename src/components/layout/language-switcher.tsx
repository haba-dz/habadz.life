"use client";

import { useTransition } from "react";
import { Languages, Loader2 } from "lucide-react";
import { setLocale } from "@/actions/locale";
import { type AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  current: AvailableLocale;
  label?: string;
  className?: string;
  /** `band` is the plain `عربي | FR` toggle used in the dark platform band. design.md §3.3 */
  variant?: "default" | "band";
}

export function LanguageSwitcher({ current, label, className, variant = "default" }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const isFr = current === "fr";
  const targetLocale: AvailableLocale = isFr ? "ar" : "fr";

  const handleToggle = () => {
    startTransition(() => {
      void setLocale(targetLocale);
    });
  };

  if (variant === "band") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={label || (isFr ? "Passer à l'arabe" : "التبديل إلى الفرنسية")}
        className={cn(
          "inline-flex items-center gap-2 disabled:opacity-60",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
          className,
        )}
      >
        <span className={cn(!isFr ? "font-bold text-white" : "text-haba-green-50/80")}>عربي</span>
        <span aria-hidden className="opacity-40">|</span>
        <span className={cn(isFr ? "font-bold text-white" : "text-haba-green-50/80")}>FR</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={label || (isFr ? "Passer à l'arabe" : "التبديل إلى الفرنسية")}
      title={isFr ? "Passer en Arabe (العربية)" : "Passer en Français (Fr)"}
      className={cn(
        "group relative inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-2.5 py-1 text-xs font-bold shadow-2xs backdrop-blur-xs",
        "transition-all duration-200 hover:border-algeria-green/40 hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-60 cursor-pointer",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin text-algeria-green" />
      ) : (
        <Languages className="size-3.5 text-muted-foreground transition-colors group-hover:text-algeria-green" />
      )}

      {/* Segmented mini pill */}
      <div className="flex items-center gap-1 font-bold">
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[11px] transition-all duration-200",
            !isFr
              ? "bg-algeria-green text-white shadow-2xs font-extrabold"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          عربي
        </span>
        <span className="text-muted-foreground/40 text-[10px]">/</span>
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[11px] transition-all duration-200 font-sans",
            isFr
              ? "bg-algeria-green text-white shadow-2xs font-extrabold"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          FR
        </span>
      </div>
    </button>
  );
}
