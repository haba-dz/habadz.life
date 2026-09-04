import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Database } from "@/types/database";

// User-scoped Supabase client (respects RLS fully).
// React.cache() shares the same instance within a request to avoid duplicates.
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignored when called from a Server Component without write access;
            // the middleware handles session refresh in that case.
          }
        },
      },
    },
  );
});

/**
 * عميل عام بلا كوكيز — للقراءات العمومية المخزَّنة مؤقتًا فقط.
 *
 * `createClient` أعلاه يستدعي `cookies()`، و Next.js 16 يمنع مصادر البيانات
 * الديناميكية داخل `unstable_cache()`. استدعاؤه هناك كان يُعطّل الصفحة الرئيسية
 * في وضع التطوير، ويُرجع أصفارًا صامتة في الإنتاج لأن الخطأ يُبتلع في try/catch.
 *
 * وهو الأصحّ أمنيًا كذلك: نتيجة RLS هنا مجهولة الهوية ومحدَّدة سلفًا، فيصحّ
 * تخزينها في ذاكرة مشتركة بين كل الزوار. راجع design.md §8.1b
 */
export function createPublicClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  );
}

// Fetches the current user, memoized within the request to avoid repeated
// lookups between the layout and child pages.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Fetches the current user's profile, memoized within the request.
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data;
});
