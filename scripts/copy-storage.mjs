#!/usr/bin/env node
// One-time copy of storage objects from the hosted Supabase project to the
// self-hosted stack. Copies via the storage API so storage.objects rows are
// recreated correctly on the target (dumping storage internals across server
// versions is fragile).
//
//   CLOUD_URL=https://xxxx.supabase.co CLOUD_SERVICE_KEY=... \
//   TARGET_URL=https://supabase.example.dz TARGET_SERVICE_KEY=... \
//   bun scripts/copy-storage.mjs
import { createClient } from "@supabase/supabase-js";

const env = (k) => {
  const v = process.env[k];
  if (!v) {
    console.error(`Missing ${k}`);
    process.exit(1);
  }
  return v;
};

const BUCKETS = ["distribution-proofs", "damage-photos"];
const cloud = createClient(env("CLOUD_URL"), env("CLOUD_SERVICE_KEY"));
const target = createClient(env("TARGET_URL"), env("TARGET_SERVICE_KEY"));

async function listAll(client, bucket, prefix = "") {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.storage
      .from(bucket)
      .list(prefix, { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`list ${bucket}/${prefix}: ${error.message}`);
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      // Folders come back without an id — recurse into them.
      if (item.id === null) out.push(...(await listAll(client, bucket, path)));
      else out.push({ path, mimetype: item.metadata?.mimetype });
    }
    if (data.length < 1000) break;
  }
  return out;
}

let copied = 0;
let failed = 0;
for (const bucket of BUCKETS) {
  const objects = await listAll(cloud, bucket);
  console.log(`${bucket}: ${objects.length} objects`);
  for (const obj of objects) {
    const { data, error } = await cloud.storage.from(bucket).download(obj.path);
    if (error) {
      console.error(`  FAIL download ${bucket}/${obj.path}: ${error.message}`);
      failed++;
      continue;
    }
    const { error: upErr } = await target.storage
      .from(bucket)
      .upload(obj.path, data, { contentType: obj.mimetype, upsert: true });
    if (upErr) {
      console.error(`  FAIL upload ${bucket}/${obj.path}: ${upErr.message}`);
      failed++;
      continue;
    }
    copied++;
    if (copied % 25 === 0) console.log(`  ...${copied} copied`);
  }
}
console.log(`done: ${copied} copied, ${failed} failed`);
process.exit(failed ? 1 : 0);
