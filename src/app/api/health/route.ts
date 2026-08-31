export const dynamic = "force-dynamic";

/** فحص صحة خفيف لـ HEALTHCHECK في Docker وفحوصات ما بعد النشر. */
export function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}
