#!/bin/sh
# Generates every secret the stack needs. Run once at bootstrap, paste the
# output into deploy/.env (NEXT_SERVER_ACTIONS_ENCRYPTION_KEY goes into GitHub
# Secrets instead — it is build-time only and never lives on the VPS).
# Requires: openssl.
set -eu

JWT_SECRET=$(openssl rand -hex 32)

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

sign() { # $1 = role — HS256 JWT signed with JWT_SECRET, 10-year expiry
  header=$(printf '{"alg":"HS256","typ":"JWT"}' | b64url)
  now=$(date +%s)
  exp=$((now + 315360000))
  payload=$(printf '{"role":"%s","iss":"supabase","iat":%s,"exp":%s}' "$1" "$now" "$exp" | b64url)
  sig=$(printf '%s.%s' "$header" "$payload" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | b64url)
  printf '%s.%s.%s' "$header" "$payload" "$sig"
}

echo "# ---- paste into deploy/.env ----"
echo "JWT_SECRET=$JWT_SECRET"
echo "ANON_KEY=$(sign anon)"
echo "SERVICE_ROLE_KEY=$(sign service_role)"
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)"
echo "PG_META_CRYPTO_KEY=$(openssl rand -hex 16)"
echo "CRON_SECRET=$(openssl rand -hex 24)"
echo "WEBHOOK_SECRET=$(openssl rand -hex 24)"
echo ""
echo "# ---- GitHub Secrets (build-time, NOT on the VPS) ----"
echo "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$(openssl rand -base64 32)"
echo ""
echo "# For STUDIO_PASSWORD_HASH run:"
echo "#   docker run --rm caddy:2.10.2-alpine caddy hash-password --plaintext 'your-password'"
