"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

/**
 * تعمل هذه الصفحة عبر رابط بريد "إعادة تعيين كلمة المرور" من Supabase — يُنشئ
 * الرابط جلسة استرجاع مؤقتة يعالجها عميل Supabase تلقائيًا من عنوان الصفحة
 * (سواء بصيغة PKCE ?code= أو الصيغة القديمة #access_token=)، ثم يُطلق حدث
 * PASSWORD_RECOVERY. لا نعرض نموذج كلمة المرور الجديدة إلا بعد تأكّد الجلسة.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const readyRef = useRef(false);
  const navTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (navTimeoutRef.current !== null) clearTimeout(navTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();

    function markReady() {
      readyRef.current = true;
      setReady(true);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") markReady();
    });

    // إذا كانت الجلسة قد عُولجت بالفعل قبل تركيب هذا المكوّن (سباق نادر)، نتحقق مباشرة.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });

    const timeout = setTimeout(() => {
      if (!readyRef.current) setInvalid(true);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("تعذر تحديث كلمة المرور. جرّب طلب رابط جديد.");
      return;
    }
    setDone(true);
    if (navTimeoutRef.current !== null) clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = window.setTimeout(() => router.replace("/admin"), 1500);
  }

  if (invalid && !ready) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-priority-critical/10 text-priority-critical">
            <TriangleAlert className="size-5" />
          </span>
          <p className="font-bold">الرابط غير صالح أو منتهي الصلاحية</p>
          <p className="text-sm text-muted-foreground">
            روابط إعادة التعيين صالحة لفترة محدودة. اطلب رابطًا جديدًا من صفحة نسيت كلمة المرور.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          <p className="font-bold text-algeria-green">تم تحديث كلمة المرور بنجاح</p>
          <p className="text-sm text-muted-foreground">جارٍ تحويلك إلى لوحة الإدارة...</p>
        </CardContent>
      </Card>
    );
  }

  if (!ready) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 px-6 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> جارٍ التحقق من الرابط...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="px-6 py-2">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5">كلمة المرور الجديدة</Label>
            <Input
              type="password"
              dir="ltr"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5">تأكيد كلمة المرور</Label>
            <Input
              type="password"
              dir="ltr"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            تحديث كلمة المرور
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
