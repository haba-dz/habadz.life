import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { LOCALE_COOKIE, isAvailableLocale } from "@/i18n/locales";

/** سنة كاملة — اختيار اللغة تفضيل شخصي، لا داعي لتكراره كل زيارة. */
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function proxy(request: NextRequest) {
  // `?lang=fr` يجعل الرابط قابلًا للمشاركة بلغة محددة: نثبّت الاختيار في كوكي
  // ثم نعيد التوجيه إلى الرابط نفسه بلا المعامل، حتى يبقى العنوان نظيفًا.
  const requested = request.nextUrl.searchParams.get("lang");
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
