"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { UserPlus, Loader2, Copy, Check, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { roleLabels } from "@/lib/constants";
import { createStaffUser } from "@/actions/staff";

const staffRoleOptions = [
  { value: "admin", label: roleLabels.admin, hint: "صلاحية كاملة، ويستطيع إضافة أعضاء آخرين" },
  { value: "coordinator", label: roleLabels.coordinator, hint: "يدير الاحتياجات والنقاط والتوزيع" },
  { value: "volunteer", label: roleLabels.volunteer, hint: "قراءة وتسجيل ميداني فقط" },
] as const;

export function AddStaffDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<(typeof staffRoleOptions)[number]["value"]>("coordinator");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  function reset() {
    setEmail(""); setFullName(""); setPhone(""); setRole("coordinator");
    setCreated(null); setCopied(false);
  }

  async function submit() {
    setSubmitting(true);
    const res = await createStaffUser({ email, full_name: fullName, phone, role });
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("تم إنشاء الحساب");
    setCreated({ email: res.email, password: res.password });
  }

  async function copyCredentials() {
    if (!created) return;
    await navigator.clipboard.writeText(
      `البريد: ${created.email}\nكلمة المرور المؤقتة: ${created.password}`,
    );
    setCopied(true);
    if (copiedTimeoutRef.current !== null) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm">
            <UserPlus className="size-4" /> إضافة عضو
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>تم إنشاء الحساب ✅</DialogTitle>
              <DialogDescription>
                سلّم هذه البيانات للعضو الجديد الآن — لن تظهر كلمة المرور مرة أخرى.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 rounded-xl border border-border bg-muted/50 p-4">
              <div>
                <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-mono text-sm" dir="ltr">{created.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">كلمة المرور المؤقتة</p>
                <p className="font-mono text-sm select-all" dir="ltr">{created.password}</p>
              </div>
            </div>

            <Alert>
              <TriangleAlert className="size-4" />
              <AlertTitle>أرسلها عبر قناة خاصة</AlertTitle>
              <AlertDescription>
                لا تنشرها في مجموعة عامة. اطلب من العضو تغييرها بعد أول دخول.
              </AlertDescription>
            </Alert>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => void copyCredentials()} className="flex-1">
                {copied ? <Check className="size-4 text-algeria-green" /> : <Copy className="size-4" />}
                نسخ البيانات
              </Button>
              <Button onClick={() => { setOpen(false); reset(); }} className="flex-1">
                تم
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>إضافة عضو إلى الطاقم</DialogTitle>
              <DialogDescription>
                يُنشأ الحساب مباشرة بكلمة مرور مؤقتة تظهر لك مرة واحدة.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="mb-1.5">الاسم الكامل</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">البريد الإلكتروني</Label>
                <Input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5">رقم الهاتف (اختياري)</Label>
                <Input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">الدور</Label>
                <Select
                  value={role}
                  onValueChange={(v: string | null) =>
                    v && setRole(v as (typeof staffRoleOptions)[number]["value"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(v: string) => staffRoleOptions.find((o) => o.value === v)?.label ?? v}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {staffRoleOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {staffRoleOptions.find((o) => o.value === role)?.hint}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => void submit()} disabled={submitting} className="w-full">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                إنشاء الحساب
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
