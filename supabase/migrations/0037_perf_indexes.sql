create index if not exists idx_beneficiary_requests_created on public.beneficiary_requests(created_at desc);
create index if not exists idx_beneficiary_requests_phone on public.beneficiary_requests(phone);
create index if not exists idx_beneficiary_requests_verification on public.beneficiary_requests(verification_level);
create index if not exists idx_needs_created on public.needs(created_at desc);
create index if not exists idx_needs_campaign_status_priority on public.needs(campaign_id, status, priority);
create index if not exists idx_donations_created on public.donations(created_at desc);
create index if not exists idx_posts_slug on public.posts(slug);
create index if not exists idx_official_updates_title on public.official_updates(title);

create or replace function public.count_needs_by_priority()
returns table (priority text, count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select n.priority::text, count(*)::bigint
  from public.needs n
  where n.status = 'active'
  group by n.priority;
$$;

grant execute on function public.count_needs_by_priority() to authenticated;
