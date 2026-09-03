"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Newspaper,
  ExternalLink,
  RotateCw,
  Radio,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { relativeTimeAr } from "@/lib/constants";
import { AdminListFilter, type AdminBulkAction } from "@/components/admin/list-filter";
import { ExportPostsCsvButton, ExportOfficialUpdatesCsvButton } from "./export-csv-button";
import { createPost, deletePost, togglePostPublished } from "@/actions/posts";
import { createOfficialUpdate, deleteOfficialUpdate } from "@/actions/official-updates";
import type { Database } from "@/types/database";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type OfficialUpdate = Database["public"]["Tables"]["official_updates"]["Row"];

const UPDATE_TYPE_LABELS: Record<string, string> = {
  fire_alert: "بلاغ حرائق وإخماد",
  road_status: "حالة الطرقات والمعابر",
  weather_warning: "إنذار جوي ونشرية",
  safety_guidelines: "توجيهات السلامة والإجلاء",
  statement: "بيان رسمي موثّق",
};

const POST_STATUS_OPTIONS = [
  { value: "published", label: "منشور" },
  { value: "draft", label: "مسودة" },
];

const UPDATE_TYPE_OPTIONS = Object.entries(UPDATE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const POST_BULK_ACTIONS: AdminBulkAction<Post>[] = [
  { label: "نشر", icon: CheckCircle2, run: (p) => togglePostPublished(p.id, true) },
  { label: "إلغاء النشر", icon: XCircle, variant: "outline", run: (p) => togglePostPublished(p.id, false) },
  {
    label: "حذف",
    icon: Trash2,
    variant: "destructive",
    confirmMessage: "حذف الأخبار المحدَّدة نهائيًا؟",
    run: (p) => deletePost(p.id),
  },
];

const OFFICIAL_UPDATE_BULK_ACTIONS: AdminBulkAction<OfficialUpdate>[] = [
  {
    label: "حذف",
    icon: Trash2,
    variant: "destructive",
    confirmMessage: "حذف البيانات الرسمية المحدَّدة نهائيًا؟",
    run: (u) => deleteOfficialUpdate(u.id),
  },
];

export function NewsManager({
  posts,
  officialUpdates,
}: {
  posts: Post[];
  officialUpdates: OfficialUpdate[];
}) {
  // Post modal state
  const [openPostModal, setOpenPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postExcerpt, setPostExcerpt] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postPublish, setPostPublish] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [pendingDeletePost, setPendingDeletePost] = useState<Post | null>(null);

  // Official update modal state
  const [openOfficialModal, setOpenOfficialModal] = useState(false);
  const [officialTitle, setOfficialTitle] = useState("");
  const [officialBody, setOfficialBody] = useState("");
  const [officialSource, setOfficialSource] = useState("مديرية الحماية المدنية لولاية جيجل");
  const [officialUrl, setOfficialUrl] = useState("");
  const [officialType, setOfficialType] = useState("fire_alert");
  const [submittingOfficial, setSubmittingOfficial] = useState(false);
  const [pendingDeleteOfficial, setPendingDeleteOfficial] = useState<OfficialUpdate | null>(null);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const syncAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => syncAbortRef.current?.abort();
  }, []);

  async function submitPost() {
    setSubmittingPost(true);
    const res = await createPost({
      title: postTitle,
      excerpt: postExcerpt,
      body: postBody,
      is_published: postPublish,
    });
    setSubmittingPost(false);
    if (!res.success) {
      toast.error(res.error ?? "حدث خطأ");
      return;
    }
    toast.success(postPublish ? "تم نشر الخبر" : "تم حفظ المسودة");
    setPostTitle("");
    setPostExcerpt("");
    setPostBody("");
    setPostPublish(true);
    setOpenPostModal(false);
  }

  async function submitOfficialUpdate() {
    if (!officialTitle.trim()) {
      toast.error("عنوان البيان مطلوب");
      return;
    }
    setSubmittingOfficial(true);
    const res = await createOfficialUpdate({
      title: officialTitle,
      body: officialBody,
      source: officialSource,
      url: officialUrl,
      update_type: officialType as "fire_alert" | "road_status" | "weather_warning" | "safety_guidelines" | "statement" | "news",
    });
    setSubmittingOfficial(false);
    if (!res.success) {
      toast.error(res.error ?? "حدث خطأ");
      return;
    }
    toast.success("تم نشر البيان الرسمي بنجاح");
    setOfficialTitle("");
    setOfficialBody("");
    setOfficialUrl("");
    setOpenOfficialModal(false);
  }

  async function triggerOfficialSync() {
    syncAbortRef.current?.abort();
    syncAbortRef.current = new AbortController();
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/news/sync", { method: "POST", signal: syncAbortRef.current.signal });
      const data = await res.json();
      if (data.success) {
        toast.success(`تمت مزامنة ${data.syncedCount} بيان وبلاغ رسمي بنجاح`);
        setSyncResult(
          `آخر مزامنة ناجحة: ${new Date().toLocaleTimeString("ar-DZ")} (${data.syncedCount} بلاغ تم التحقق منه)`
        );
      } else {
        toast.error(data.error ?? "فشلت المزامنة");
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      toast.error("تعذر الاتصال بخدمة المزامنة");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* 1. Official Live Ingestion & Manual Updates Header */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-algeria-green/30 bg-algeria-green/10 px-3 py-0.5 text-xs font-bold text-algeria-green mb-1.5">
              <Radio className="size-3.5 animate-pulse" />
              <span>البيانات والمستجدات الموثقة (Official Bulletins)</span>
            </div>
            <h2 className="text-xl font-bold">إدارة البيانات الرسمية</h2>
            <p className="text-xs text-muted-foreground">
              يمكنك سحب البيانات تلقائياً عبر المزامنة أو إضافة بيان رسمي يدوي لمصالح الحماية والغابات والدرك.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => void triggerOfficialSync()}
              disabled={syncing}
              variant="outline"
              className="font-bold border-algeria-green/40 text-algeria-green hover:bg-algeria-green/10"
            >
              <RotateCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "جارٍ المزامنة..." : "مزامنة المصادر الآن"}</span>
            </Button>

            <Dialog open={openOfficialModal} onOpenChange={setOpenOfficialModal}>
              <DialogTrigger render={<Button className="bg-algeria-green hover:bg-algeria-green/90 text-white font-bold"><Plus className="size-4" /> إضافة بيان رسمي</Button>} />
              <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>نشر بيان رسمي موثق</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-1.5">عنوان البيان / البلاغ</Label>
                    <Input
                      value={officialTitle}
                      onChange={(e) => setOfficialTitle(e.target.value)}
                      placeholder="مثال: الحماية المدنية: السيطرة على بؤرة غابة العوانة..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-1.5">الجهة المصدرة</Label>
                      <Select
                        value={officialSource}
                        onValueChange={(v: string | null) => v && setOfficialSource(v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر المصدر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="مديرية الحماية المدنية لولاية جيجل">الحماية المدنية - جيجل</SelectItem>
                          <SelectItem value="طريقي - الدرك الوطني">طريقي - الدرك الوطني</SelectItem>
                          <SelectItem value="المديرية العامة للغابات">المديرية العامة للغابات</SelectItem>
                          <SelectItem value="الديوان الوطني للأرصاد الجوية">الأرصاد الجوية</SelectItem>
                          <SelectItem value="خلية الأزمة الولائية">خلية الأزمة الولائية</SelectItem>
                          <SelectItem value="المديرية العامة للأمن الوطني">الأمن الوطني</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-1.5">نوع البلاغ</Label>
                      <Select
                        value={officialType}
                        onValueChange={(v: string | null) => v && setOfficialType(v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fire_alert">بلاغ حرائق وإخماد</SelectItem>
                          <SelectItem value="road_status">حالة الطرقات والمعابر</SelectItem>
                          <SelectItem value="weather_warning">إنذار جوي ونشرية</SelectItem>
                          <SelectItem value="safety_guidelines">توجيهات السلامة والإجلاء</SelectItem>
                          <SelectItem value="statement">بيان رسمي موثّق</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-1.5">رابط المنشور الأصلي (اختياري)</Label>
                    <Input
                      dir="ltr"
                      value={officialUrl}
                      onChange={(e) => setOfficialUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <Label className="mb-1.5">نص وتفاصيل البيان</Label>
                    <Textarea
                      value={officialBody}
                      onChange={(e) => setOfficialBody(e.target.value)}
                      rows={5}
                      placeholder="نص البلاغ الرسمي بالتفصيل..."
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={() => void submitOfficialUpdate()}
                      disabled={submittingOfficial}
                      className="w-full bg-algeria-green hover:bg-algeria-green/90 text-white font-bold"
                    >
                      {submittingOfficial && <Loader2 className="size-4 animate-spin" />}
                      نشر البيان الرسمي
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {syncResult && (
          <div className="flex items-center gap-2 rounded-lg bg-algeria-green/10 p-2.5 text-xs font-semibold text-algeria-green">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{syncResult}</span>
          </div>
        )}

        {/* Official Bulletins List */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-muted-foreground">
              البيانات المنشورة حالياً في قسم المعلومات الرسمية ({officialUpdates.length}):
            </h3>
            <ExportOfficialUpdatesCsvButton rows={officialUpdates} />
          </div>

          {officialUpdates.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="لا توجد بيانات رسمية مسجلة بعد"
              description="استخدم زر مزامنة المصادر أو أضف بياناً يدوياً لنشره للعامة."
            />
          ) : (
            <div className="max-h-[420px] overflow-y-auto pr-1">
              <AdminListFilter
                rows={officialUpdates}
                searchPlaceholder="ابحث في عنوان البيانات..."
                searchMatch={(u, q) => u.title.toLowerCase().includes(q) || u.source.toLowerCase().includes(q)}
                filters={[{ label: "النوع", options: UPDATE_TYPE_OPTIONS, match: (u, v) => u.update_type === v }]}
                getRowId={(u) => u.id}
                bulkActions={OFFICIAL_UPDATE_BULK_ACTIONS}
                emptyTitle="لا توجد بيانات رسمية مسجلة بعد"
                listClassName="space-y-2.5"
                renderRow={(u) => (
                  <Card key={u.id} className="py-3">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-full bg-algeria-green/10 px-2 py-0.5 text-[10px] font-bold text-algeria-green border border-algeria-green/20">
                            {u.source}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {relativeTimeAr(u.published_at)}
                          </span>
                        </div>
                        <p className="font-bold text-sm leading-snug line-clamp-1">{u.title}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {u.url && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            render={<a href={u.url} target="_blank" rel="noopener noreferrer" />}
                            title="عرض الرابط الأصلي"
                          >
                            <ExternalLink className="size-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="حذف"
                          onClick={() => setPendingDeleteOfficial(u)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Field Posts Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-xl font-bold">منشورات وتقارير الميدان</h2>
            <p className="text-xs text-muted-foreground">
              مقالات وتقارير تفصيلية ينشرها فريق التنسيق للمنصة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ExportPostsCsvButton rows={posts} />
            <Dialog open={openPostModal} onOpenChange={setOpenPostModal}>
              <DialogTrigger render={<Button size="sm"><Plus className="size-4" /> خبر جديد</Button>} />
              <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>نشر خبر جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-1.5">العنوان</Label>
                    <Input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} maxLength={200} />
                  </div>
                  <div>
                    <Label className="mb-1.5">مقدمة قصيرة (اختياري)</Label>
                    <Textarea
                      value={postExcerpt}
                      onChange={(e) => setPostExcerpt(e.target.value)}
                      maxLength={400}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5">نص الخبر</Label>
                    <Textarea
                      value={postBody}
                      onChange={(e) => setPostBody(e.target.value)}
                      rows={9}
                      placeholder="اترك سطرًا فارغًا بين كل فقرة وأخرى."
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={postPublish} onCheckedChange={(v) => setPostPublish(Boolean(v))} />
                    نشر مباشرة (أزل التحديد لحفظه كمسودة)
                  </label>
                  <DialogFooter>
                    <Button onClick={() => void submitPost()} disabled={submittingPost} className="w-full">
                      {submittingPost && <Loader2 className="size-4 animate-spin" />}
                      {postPublish ? "نشر" : "حفظ كمسودة"}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {posts.length === 0 ? (
          <EmptyState icon={Newspaper} title="لا توجد أخبار بعد" description="انشر أول خبر للمنصة." />
        ) : (
          <AdminListFilter
            rows={posts}
            searchPlaceholder="ابحث في عنوان الأخبار..."
            searchMatch={(p, q) => p.title.toLowerCase().includes(q)}
            filters={[
              {
                label: "الحالة",
                options: POST_STATUS_OPTIONS,
                match: (p, v) => (v === "published" ? p.is_published : !p.is_published),
              },
            ]}
            getRowId={(p) => p.id}
            bulkActions={POST_BULK_ACTIONS}
            emptyTitle="لا توجد أخبار بعد"
            listClassName="space-y-2.5"
            renderRow={(p) => (
              <Card key={p.id} className={p.is_published ? "" : "opacity-70"}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-tight">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.is_published ? "منشور" : "مسودة"}
                      {p.published_at ? ` · ${relativeTimeAr(p.published_at)}` : ""}
                      {p.author_name ? ` · ${p.author_name}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.is_published && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="عرض"
                        nativeButton={false}
                        render={<Link href={`/news/${p.slug}`} target="_blank" />}
                      >
                        <ExternalLink className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={p.is_published ? "إلغاء النشر" : "نشر"}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await togglePostPublished(p.id, !p.is_published);
                          if (!res.success) toast.error(res.error ?? "حدث خطأ");
                        })
                      }
                    >
                      {p.is_published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="حذف"
                      onClick={() => setPendingDeletePost(p)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          />
        )}
      </div>

      {/* Delete Post Dialog */}
      <AlertDialog open={!!pendingDeletePost} onOpenChange={(v) => !v && setPendingDeletePost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الخبر؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيُحذف &quot;{pendingDeletePost?.title}&quot; نهائيًا. لا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = pendingDeletePost;
                setPendingDeletePost(null);
                if (!target) return;
                startTransition(async () => {
                  const res = await deletePost(target.id);
                  if (!res.success) toast.error(res.error ?? "حدث خطأ");
                  else toast.success("تم الحذف");
                });
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Official Update Dialog */}
      <AlertDialog
        open={!!pendingDeleteOfficial}
        onOpenChange={(v) => !v && setPendingDeleteOfficial(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف البيان الرسمي؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيُحذف &quot;{pendingDeleteOfficial?.title}&quot; نهائيًا من قائمة المعلومات الرسمية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = pendingDeleteOfficial;
                setPendingDeleteOfficial(null);
                if (!target) return;
                startTransition(async () => {
                  const res = await deleteOfficialUpdate(target.id);
                  if (!res.success) toast.error(res.error ?? "حدث خطأ");
                  else toast.success("تم حذف البيان الرسمي");
                });
              }}
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
