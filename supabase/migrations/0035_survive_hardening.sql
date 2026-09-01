-- Survive hardening: clean dirty data before constraints, ensure single active campaign
update public.collection_points set lat=null, lng=null where lat is not null and (lat not between -90 and 90 or lng not between -180 and 180 or (lat is null) != (lng is null));
update public.relief_hubs set lat=null, lng=null where lat is not null and (lat not between -90 and 90 or lng not between -180 and 180 or (lat is null) != (lng is null));
update public.inventory_transactions set quantity=100000 where quantity > 100000;
update public.distributions set quantity=100000 where quantity > 100000;
update public.campaigns set is_active=false where ctid not in (select ctid from public.campaigns where is_active=true order by updated_at desc limit 1) and is_active=true;

do $$ begin
  alter table public.collection_points add constraint chk_collection_points_lat_survive check (lat is null or (lat between -90 and 90));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.collection_points add constraint chk_collection_points_lng_survive check (lng is null or (lng between -180 and 180));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.collection_points add constraint chk_collection_points_pair_survive check ((lat is null) = (lng is null));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.relief_hubs add constraint chk_relief_hubs_lat_survive check (lat is null or (lat between -90 and 90));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.relief_hubs add constraint chk_relief_hubs_lng_survive check (lng is null or (lng between -180 and 180));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.relief_hubs add constraint chk_relief_hubs_pair_survive check ((lat is null) = (lng is null));
exception when duplicate_object then null; end $$;
