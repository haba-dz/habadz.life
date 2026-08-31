import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { getLocale } from "@/i18n/server";
import { localeMeta } from "@/i18n/locales";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | تنسيق المساعدات والإغاثة`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} | تنسيق المساعدات والإغاثة`,
    description: siteConfig.description,
    locale: "ar_DZ",
    type: "website",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | تنسيق المساعدات والإغاثة`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#00843d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { htmlLang, dir } = localeMeta[await getLocale()];

  return (
    <html lang={htmlLang} dir={dir} className={`${vazirmatn.variable} h-full antialiased overflow-x-hidden`}>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden w-full max-w-full">
        <TooltipProvider>
          <Analytics />
          {children}
          <Toaster position="top-center" richColors dir={dir} />
        </TooltipProvider>
      </body>
    </html>
  );
}
