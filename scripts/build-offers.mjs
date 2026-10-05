import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeStoreFeeds, STORES } from "../offers-data.mjs";

const FEED_BASE = "https://freetokeep.gg/api/v1/offers";

export async function buildSnapshot(fetcher = fetch, now = Date.now()) {
  const feeds = {};
  for (const store of STORES) {
    const response = await fetcher(`${FEED_BASE}?store=${store}&limit=200`, {
      cache: "no-store", signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error(`${store} offer feed returned HTTP ${response.status}.`);
    const payload = await response.json();
    const generatedAt = Date.parse(payload?.generatedAt);
    if (!Number.isFinite(generatedAt) || generatedAt < now - 60 * 60_000 ||
        generatedAt > now + 5 * 60_000 || !Array.isArray(payload?.items) ||
        payload.items.length > 200 || !Number.isInteger(payload?.count) ||
        payload.count < payload.items.length || payload.count >= 200) {
      throw new TypeError(`${store} offer feed was invalid, stale, or reached its page limit.`);
    }
    feeds[store] = payload.items;
  }
  return { generatedAt: new Date(now).toISOString(), offers: normalizeStoreFeeds(feeds, now) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const destination = process.argv[2];
  if (!destination) throw new Error("Pass the deployment artifact path for offers.json.");
  const snapshot = await buildSnapshot();
  await writeFile(destination, `${JSON.stringify(snapshot)}\n`, { flag: "w" });
  process.stdout.write(`Prepared ${snapshot.offers.length} active reported offers.\n`);
}
