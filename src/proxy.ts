import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { LOCALE_COOKIE, isAvailableLocale } from "@/i18n/locales";

/** سنة كاملة — اختيار اللغة تفضيل شخصي، لا داعي لتكراره كل زيارة. */
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=life.habadz.app";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";
  const isAndroid = /android/i.test(userAgent);
  const isBypassed = searchParams.has("web") || request.cookies.has("prefer_web");

  // إذا أراد مستخدم الأندرويد تصفح الموقع صراحة (?web=1) نثبّت تفضيله ونزيل المعامل
  if (isAndroid && searchParams.has("web")) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("web");
    const response = NextResponse.redirect(url);
    response.cookies.set("prefer_web", "1", {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  // توجيه تلقائي لمستخدمي أندرويد إلى التطبيق على Google Play، مع استثناء لوحة الإدارة والـ APIs
  if (isAndroid && !isBypassed && !pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    return NextResponse.redirect(PLAY_STORE_URL, 307);
  }

  // `?lang=fr` يجعل الرابط قابلًا للمشاركة بلغة محددة: نثبّت الاختيار في كوكي
  // ثم نعيد التوجيه إلى الرابط نفسه بلا المعامل، حتى يبقى العنوان نظيفًا.
  const requested = searchParams.get("lang");
  if (isAvailableLocale(requested)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, requested, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
