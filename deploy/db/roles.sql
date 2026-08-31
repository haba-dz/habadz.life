-- Adapted from supabase/docker volumes/db/roles.sql.
-- supabase_functions_admin is intentionally absent: the trimmed stack runs no
-- functions service and supabase/postgres:17.6.x does not pre-create that role
-- (referencing it aborts the image's whole init under set -eu).
\set pgpass `echo "$POSTGRES_PASSWORD"`

ALTER USER authenticator WITH PASSWORD :'pgpass';
ALTER USER pgbouncer WITH PASSWORD :'pgpass';
ALTER USER supabase_auth_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_storage_admin WITH PASSWORD :'pgpass';
