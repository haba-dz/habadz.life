import "server-only";
import { timingSafeEqual } from "node:crypto";

export function isApiRequestAuthorized(request: Request): boolean {
  const secret = process.env.WEBHOOK_SECRET || process.env.CRON_SECRET;

  if (!secret) {
    console.error("[api-auth] WEBHOOK_SECRET/CRON_SECRET not set: route closed.");
    return false;
  }

  const header = request.headers.get("authorization");
  if (!header) return false;

  const token = header.replace(/^Bearer\s+/i, "");
  const provided = Buffer.from(token);
  const expected = Buffer.from(secret);

  if (provided.length !== expected.length) return false;

  return timingSafeEqual(provided, expected);
}
