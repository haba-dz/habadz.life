#!/bin/sh
# Idempotent migration runner. Applies /migrations/*.sql in filename order,
# recording each in _migrations.applied (own schema — `public` is exposed by
# PostgREST, a tracking table there would leak).
# Runs as supabase_admin: 0006/0027 insert into storage.buckets and create
# policies on storage.objects, which the plain postgres role may not own.
#
# Usage:
#   docker compose --profile tools run --rm migrate            # apply migrations
#   docker compose --profile tools run --rm migrate seed       # + demo seed data
set -eu

psql -v ON_ERROR_STOP=1 -q -c "
  create schema if not exists _migrations;
  create table if not exists _migrations.applied (
    filename   text primary key,
    applied_at timestamptz not null default now()
  );"

for f in $(ls /migrations/*.sql | sort); do
  name=$(basename "$f")
  done=$(psql -tAc "select 1 from _migrations.applied where filename = '$name'")
  if [ "$done" = "1" ]; then
    echo "skip  $name"
    continue
  fi
  echo "apply $name"
  psql -v ON_ERROR_STOP=1 --single-transaction -q -f "$f"
  psql -v ON_ERROR_STOP=1 -q -c "insert into _migrations.applied (filename) values ('$name')"
done
echo "migrations complete"

if [ "${1:-}" = "seed" ]; then
  echo "applying demo seed data"
  psql -v ON_ERROR_STOP=1 -f /seeds/seed_demo_data.sql
fi
