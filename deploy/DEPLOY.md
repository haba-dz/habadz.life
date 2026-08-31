# VPS Deployment — najdat-jijel

One small VPS (~2GB RAM) runs everything: the Next.js app, a trimmed self-hosted
Supabase (Postgres, Kong, GoTrue, PostgREST, Storage, Studio) and Caddy for TLS.
CI builds the app image on every **GitHub Release** and deploys over SSH.

```
Internet ──▶ Caddy (auto-TLS)
              ├─ APP_HOST      ──▶ app:3000
              ├─ SUPABASE_HOST ──▶ kong:8000  (auth / rest / storage, key-auth)
              └─ STUDIO_HOST   ──▶ studio:3000 (basic auth)
```

## 1. One-time bootstrap

1. **DNS**: A records for `APP_HOST`, `SUPABASE_HOST`, `STUDIO_HOST` → VPS IP.
2. **Server**: install Docker Engine + compose plugin. Add a 2GB swapfile
   (**not optional** on 2GB RAM):
   ```sh
   fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```
   Firewall: allow 22/80/443 only.
3. **Clone**: `git clone https://github.com/haba-dz/habadz.life /opt/najdat-jijel`
4. **Configure**: `cd /opt/najdat-jijel/deploy && cp .env.example .env && ./gen-keys.sh`
   — paste the generated values into `.env`. For `STUDIO_PASSWORD_HASH`:
   ```sh
   docker run --rm caddy:2.10.2-alpine caddy hash-password --plaintext 'strong-password'
   ```
   Keep the `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` line for GitHub Secrets (step 7).
5. **Start + migrate**:
   ```sh
   docker compose up -d
   docker compose --profile tools run --rm migrate
   ```
6. **Admin account** (from any machine with bun/node, repo checked out):
   ```sh
   NEXT_PUBLIC_SUPABASE_URL=https://<SUPABASE_HOST> \
   SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY> \
   bun scripts/create-admin.mjs admin@example.com 'password' 'Name'
   ```
7. **GitHub repo settings**:
   - Variables: `NEXT_PUBLIC_SUPABASE_URL` (= `https://<SUPABASE_HOST>`),
     `NEXT_PUBLIC_SUPABASE_ANON_KEY` (= generated `ANON_KEY`),
     `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_URL` (= `https://<APP_HOST>`),
     `NEXT_PUBLIC_GA_ID`.
   - Secrets: `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `VPS_HOST`, `VPS_USER`,
     `VPS_SSH_KEY` (dedicated deploy keypair; add the public key to the VPS
     `~/.ssh/authorized_keys`), `VPS_KNOWN_HOSTS` (`ssh-keyscan -H <host>`).
8. **News sync cron** (replaces Vercel cron):
   ```
   0 */6 * * * curl -fsS -H "Authorization: Bearer <CRON_SECRET>" https://<APP_HOST>/api/news/sync
   ```

## 2. Releases

Publish a GitHub Release (tag e.g. `v1.2.0`) → CI builds
`ghcr.io/haba-dz/habadz.life:<tag>`, then SSHes in and runs
`deploy/deploy.sh <tag>`: checkout tag → pull image → `up -d` → migrations →
`docker image prune -af` + `docker builder prune -af` (frees old-deploy disk) →
health check.

**Rollback**: `./deploy.sh <previous-tag>`.

**Important**: `NEXT_PUBLIC_*` values are baked into the image at build time.
Changing `SUPABASE_HOST` or rotating the anon key requires a new release, not a
compose restart.

## 3. Data migration from Supabase cloud (one-time)

After bootstrap (steps 1–5), import the hosted project
(`xwhkzioijgjyejlvcxls.supabase.co`):

1. Database (needs the cloud connection string — dashboard → Database settings,
   port 5432, not the 6543 transaction pooler):
   ```sh
   CLOUD_DB_URL='postgresql://postgres:<db-password>@db.xwhkzioijgjyejlvcxls.supabase.co:5432/postgres' \
   ./migrate-from-cloud.sh
   ```
   This empties the local public tables + auth users first, then imports cloud
   auth users (passwords keep working — bcrypt hashes are portable) and all
   public data. Users must log in again (sessions don't transfer).
2. Storage files (from any machine, needs both service keys):
   ```sh
   CLOUD_URL=https://xwhkzioijgjyejlvcxls.supabase.co CLOUD_SERVICE_KEY=<cloud sb_secret/service key> \
   TARGET_URL=https://<SUPABASE_HOST> TARGET_SERVICE_KEY=<SERVICE_ROLE_KEY> \
   bun scripts/copy-storage.mjs
   ```
3. Verify: row counts printed by the script, log in with an existing account,
   open one damage-assessment photo (signed URL).

## 4. Smoke checks after a release

- `curl -fsS https://<APP_HOST>/api/health` (deploy.sh already does this)
- Homepage renders (RTL + fonts), `/admin/login` works
- `curl https://<SUPABASE_HOST>/rest/v1/ -H "apikey: <ANON_KEY>"` → 200;
  without the header → 401; `https://<SUPABASE_HOST>/pg/` → 404 (meta not exposed)
- `docker system df` — disk stays flat release over release

## 5. Operations

- Logs: `docker compose logs -f app` (or any service name)
- RAM relief when idle: `docker compose stop studio meta`
- Seeds (demo data — dev only): `docker compose --profile tools run --rm migrate seed`
- DB init scripts (`db/*.sql`) run only on the FIRST boot of an empty `db-data`
  volume. Changing `POSTGRES_PASSWORD` later means `ALTER ROLE` for
  `authenticator`, `supabase_auth_admin`, `supabase_storage_admin`,
  `supabase_functions_admin`, `pgbouncer`, `postgres` and `supabase_admin`.
- Backups: `docker compose --profile tools run --rm --entrypoint pg_dump migrate -Fc -f /tmp/backup.dump postgres`
  plus the `storage-data` volume.
