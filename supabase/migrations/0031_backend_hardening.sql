-- Backend hardening for Bloc 1 + public inserts + inventory + storage
-- Re-applies the closed PR #48 / #50 fixes cleanly on current main.
-- All statements are idempotent (IF EXISTS / IF NOT EXISTS) so re-running is safe.

-- ------------------------------------------------------------------
-- medical / artisan volunteers: anon must not self-verify
drop policy if exists medical_volunteers_public_insert on public.medical_volunteers;
create policy medical_volunteers_public_insert on public.medical_volunteers
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and verified_by is null
    and verified_at is null
  );

drop policy if exists artisan_volunteers_public_insert on public.artisan_volunteers;
create policy artisan_volunteers_public_insert on public.artisan_volunteers
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and verified_by is null
    and verified_at is null
  );

alter table public.medical_volunteers enable row level security;
alter table public.artisan_volunteers enable row level security;

-- ------------------------------------------------------------------
-- beneficiary_requests: anon may insert only unverified pending rows
drop policy if exists beneficiary_requests_public_insert on public.beneficiary_requests;
create policy beneficiary_requests_public_insert on public.beneficiary_requests
  for insert to anon
  with check (
    status = 'pending'
    and verification_level = 'unverified'
    and verified_by is null
    and verified_at is null
    and internal_notes is null
    and created_by is null
  );

-- ------------------------------------------------------------------
-- donations / transport: bind to real account only via server, not anon
drop policy if exists donations_public_insert on public.donations;
create policy donations_public_insert on public.donations
  for insert to anon
  with check (status = 'registered' and donor_id is null);

drop policy if exists transport_offers_public_insert on public.transport_offers;
create policy transport_offers_public_insert on public.transport_offers
  for insert to anon
  with check (status = 'requested' and driver_id is null);

-- ------------------------------------------------------------------
-- damage_assessments: pending/estimated only, no server-side assignment
drop policy if exists damage_assessments_public_insert on public.damage_assessments;
create policy damage_assessments_public_insert on public.damage_assessments
  for insert to anon, authenticated
  with check (
    status in ('pending', 'estimated')
    and verified_by is null
    and verified_at is null
    and assigned_artisan_id is null
    and beneficiary_request_id is null
  );

-- ------------------------------------------------------------------
-- guard last admin profile delete (0023 guards UPDATE, not DELETE)
create or replace function public.guard_profile_admin_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_admins int;
begin
  if old.role = 'admin' then
    select count(*) into remaining_admins
    from public.profiles
    where role = 'admin' and id <> old.id;
    if remaining_admins = 0 then
      raise exception 'cannot delete last admin';
    end if;
  end if;
  return old;
end;
$$;

revoke all on function public.guard_profile_admin_delete() from public, anon, authenticated;

drop trigger if exists trg_guard_profile_admin_delete on public.profiles;
create trigger trg_guard_profile_admin_delete
  before delete on public.profiles
  for each row execute function public.guard_profile_admin_delete();

-- ------------------------------------------------------------------
-- inventory: quantity is derived from transactions, only min_threshold is editable
revoke update on public.inventory_items from authenticated;
grant update (min_threshold) on public.inventory_items to authenticated;

-- ------------------------------------------------------------------
-- storage buckets: limit size + mime for anon-writable buckets
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id in ('damage-photos', 'distribution-proofs');

-- ------------------------------------------------------------------
-- official_updates: add columns used by news-ingestion classifier
alter table public.official_updates
  add column if not exists wilaya text,
  add column if not exists authority text,
  add column if not exists is_urgent boolean not null default false,
  add column if not exists external_id text;

create unique index if not exists idx_official_updates_external_id
  on public.official_updates(external_id) where external_id is not null;
create unique index if not exists idx_official_updates_title_url
  on public.official_updates(title, url);
