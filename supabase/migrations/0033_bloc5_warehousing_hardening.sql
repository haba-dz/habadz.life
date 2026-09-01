-- Bloc5 warehousing hardening: GIS bounds, closed exclusion, quantity caps
do $$ begin
  alter table public.collection_points add constraint chk_collection_points_lat check (lat is null or (lat between -90 and 90));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.collection_points add constraint chk_collection_points_lng check (lng is null or (lng between -180 and 180));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.collection_points add constraint chk_collection_points_coords_pair check ((lat is null) = (lng is null));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.relief_hubs add constraint chk_relief_hubs_lat check (lat is null or (lat between -90 and 90));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.relief_hubs add constraint chk_relief_hubs_lng check (lng is null or (lng between -180 and 180));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.relief_hubs add constraint chk_relief_hubs_coords_pair check ((lat is null) = (lng is null));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.inventory_transactions add constraint chk_inventory_txn_quantity_max check (quantity <= 100000);
exception when duplicate_object then null; end $$;

create or replace function public.get_public_collection_points()
returns table (
  id uuid, campaign_id uuid, name text, wilaya text, commune text, address text,
  lat double precision, lng double precision, phone text, contact_name text,
  accepted_categories text[], capacity_note text, opening_hours text,
  status public.point_status, verification_level public.verification_level,
  notes text, created_at timestamptz, updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    id, campaign_id, name, wilaya, commune, address, lat, lng,
    case when show_phone_publicly then phone else null end,
    contact_name, accepted_categories, capacity_note, opening_hours,
    status, verification_level, notes, created_at, updated_at
  from public.collection_points
  where status in ('open','full','paused');
$$;
grant execute on function public.get_public_collection_points() to anon, authenticated;

create or replace function public.get_public_relief_hubs()
returns table (
  id uuid, campaign_id uuid, name text, wilaya text, commune text, address text,
  lat double precision, lng double precision, phone text, contact_name text,
  capacity_note text, opening_hours text, is_shelter boolean,
  status public.point_status, verification_level public.verification_level,
  notes text, created_at timestamptz, updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    id, campaign_id, name, wilaya, commune, address, lat, lng,
    case when show_phone_publicly then phone else null end,
    contact_name, capacity_note, opening_hours, is_shelter,
    status, verification_level, notes, created_at, updated_at
  from public.relief_hubs
  where status in ('open','full','paused');
$$;
grant execute on function public.get_public_relief_hubs() to anon, authenticated;
