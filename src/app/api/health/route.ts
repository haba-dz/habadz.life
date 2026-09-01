export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.from("campaigns").select("id").limit(1).maybeSingle();
    if (error) throw error;
    return Response.json({ ok: true, ts: Date.now() });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
