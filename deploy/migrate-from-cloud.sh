#!/bin/sh
# ONE-TIME import of the hosted Supabase project into this self-hosted stack.
# Run on the VPS after: stack is up + run-migrations.sh applied (schema baseline
# comes from the repo's migrations — the cloud DB was built from the same files).
#
#   CLOUD_DB_URL='postgresql://postgres:...@db.xxxx.supabase.co:5432/postgres' ./migrate-from-cloud.sh
#
# CLOUD_DB_URL = dashboard -> Database settings -> Connection string (direct or
# session pooler, port 5432 — NOT the transaction pooler on 6543).
# Storage FILES are copied separately: bun scripts/copy-storage.mjs (see DEPLOY.md).
#
# Destructive on the TARGET only: empties public tables + auth users before the
# import, so run it before creating local accounts (or re-run create-admin after).
set -eu
: "${CLOUD_DB_URL:?set CLOUD_DB_URL to the hosted Supabase connection string}"

cd "$(dirname "$0")"
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

run_psql() { docker compose --profile tools run --rm -T --entrypoint psql migrate "$@"; }
run_dump() { docker compose --profile tools run --rm -T --entrypoint pg_dump migrate "$@"; }

echo "==> dumping cloud auth users/identities"
run_dump "$CLOUD_DB_URL" --data-only --table=auth.users --table=auth.identities > "$WORK/auth.sql"

echo "==> dumping cloud public schema data"
run_dump "$CLOUD_DB_URL" --data-only --schema=public --disable-triggers > "$WORK/public.sql"

echo "==> emptying target public tables + auth users"
run_psql -v ON_ERROR_STOP=1 -c "
  do \$\$
  declare stmt text;
  begin
    select 'truncate table ' || string_agg(format('%I.%I', schemaname, tablename), ', ') || ' restart identity cascade'
      into stmt from pg_tables where schemaname = 'public';
    if stmt is not null then execute stmt; end if;
  end \$\$;
  delete from auth.identities;
  delete from auth.users;"

echo "==> restoring auth data"
run_psql -v ON_ERROR_STOP=1 -q < "$WORK/auth.sql"

echo "==> restoring public data"
run_psql -v ON_ERROR_STOP=1 -q < "$WORK/public.sql"

echo "==> row counts"
run_psql -c "select 'auth.users' as t, count(*) from auth.users
  union all select relname, n_live_tup from pg_stat_user_tables where schemaname='public' order by 1;"

echo "done — now copy storage files: see DEPLOY.md §Data migration"
