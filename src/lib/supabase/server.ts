import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// عميل Supabase يعمل بصلاحيات المستخدم المسجّل دخوله (يحترم RLS بالكامل).
// يُستخدم في صفحات ومسارات لوحة التحكم بعد تسجيل الدخول.
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    const chain: Record<string, unknown> = {};
    const makeChain = (): Record<string, unknown> =>
      new Proxy(chain, {
        get(_, prop) {
          if (prop === "then") return undefined;
          return () => makeChain();
        },
      });
    const result = Promise.resolve({ data: [], error: null });
    Object.assign(chain, {
      then: (onFulfilled: (v: unknown) => unknown) => result.then(onFulfilled as never),
      catch: (onRejected: (e: unknown) => unknown) => result.catch(onRejected as never),
    });
    return {
      from: () => makeChain(),
      rpc: () => Promise.resolve({ data: [], error: null }),
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as unknown as ReturnType<typeof createServerClient<Database>>;
  }

  return createServerClient<Database>(url, key,
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
            // يمكن تجاهل الخطأ إذا استُدعيت من Server Component بدون إمكانية الكتابة؛
            // الـ middleware يتكفّل بتحديث الجلسة في هذه الحالة.
          }
        },
      },
    },
  );
}
