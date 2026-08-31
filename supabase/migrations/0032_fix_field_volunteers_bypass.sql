-- إصلاح أمني: سياسة field_volunteers_public_insert كانت with check (true)
-- دون أي قيد — نفس الثغرة التي أصلحت لـ medical/artisan في 0029 لكنها
-- عادت في جدول field_volunteers (0030). أي anon بمفتاح anon العام يستطيع
-- إدخال صف verified/deployed مباشرة متجاوزاً التحقق.
-- الإصلاح: مطابقة 0029 — فقط pending + verified_by/at null.

drop policy if exists field_volunteers_public_insert on public.field_volunteers;
create policy field_volunteers_public_insert on public.field_volunteers
  for insert to anon, authenticated
  with check (status = 'pending' and verified_by is null and verified_at is null);
