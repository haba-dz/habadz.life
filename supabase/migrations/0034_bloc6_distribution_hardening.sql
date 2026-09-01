-- Bloc6 distribution hardening
do $$ begin
  alter table public.distributions add constraint chk_distributions_quantity_max check (quantity <= 100000);
exception when duplicate_object then null; end $$;

do $$ begin
  create unique index uq_campaigns_one_active on public.campaigns ((is_active)) where is_active = true;
exception when duplicate_object then null; end $$;
