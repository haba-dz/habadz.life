"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Shared open state for the mobile menu. Both the header burger and the bottom
 * tab bar's "القائمة" item toggle the same inline panel (design.md §3.4, §3.6),
 * so the state has to live above both.
 */
const MobileMenuContext = createContext<{
  open: boolean;
  toggle: () => void;
  close: () => void;
} | null>(null);

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Navigating away must not leave the panel hanging open behind the new page.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  return (
    <MobileMenuContext.Provider
      value={{
        open,
        toggle: () => setOpen((v) => !v),
        close: () => setOpen(false),
      }}
    >
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  const ctx = useContext(MobileMenuContext);
  if (!ctx) {
    throw new Error("useMobileMenu must be used inside <MobileMenuProvider>");
  }
  return ctx;
}
