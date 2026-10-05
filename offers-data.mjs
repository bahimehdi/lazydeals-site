export const STORES = Object.freeze(["epic-pc", "steam", "gog"]);
const STORE_LABELS = { "epic-pc": "Epic Games Store", steam: "Steam", gog: "GOG" };
const EXCLUDED = /\b(dlc|add[ -]?on|bundle|free[ -]?weekend|weekend|demo|beta|key|points|mobile|android|ios|prime|subscription)\b/i;
export const SNAPSHOT_MAX_AGE_MS = 6 * 60 * 60 * 1000;

function httpsUrl(value, hostname = null) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (!hostname || url.hostname === hostname) ? url.href : null;
  } catch { return null; }
}

function paidPrice(value) {
  if (typeof value !== "string" || value.length > 48) return false;
  const amounts = value.match(/\d+(?:[.,]\d{1,2})?/g);
  return amounts?.length === 1 && Number(amounts[0].replace(",", ".")) > 0;
}

export function normalizeOffer(row, store, now = Date.now()) {
  if (!row || !STORES.includes(store) ||
      !(row.store === store || (store === "epic-pc" && row.store === "epic_pc"))) return null;
  const id = typeof row.id === "string" ? row.id.trim() : "";
  const title = typeof row.title === "string" ? row.title.trim() : "";
  const tags = Array.isArray(row.tags) ? row.tags : [];
  const startsAt = row.startsAt == null ? null : Date.parse(row.startsAt);
  const endsAt = Date.parse(row.endsAt);
  const offerUrl = httpsUrl(row.url, "freetokeep.gg");
  if (!id || id.length > 120 || !title || title.length > 200 || !offerUrl ||
      !Number.isFinite(endsAt) || endsAt <= now ||
      (startsAt !== null && (!Number.isFinite(startsAt) || startsAt > now)) ||
      !paidPrice(row.originalPrice) ||
      !tags.some(tag => typeof tag === "string" && tag.toLowerCase() === "game") ||
      tags.some(tag => typeof tag !== "string" || EXCLUDED.test(tag)) ||
      EXCLUDED.test(title)) return null;
  return {
    key: `${store}:${id}`, id, store, storeLabel: STORE_LABELS[store], title,
    offerUrl, imageUrl: httpsUrl(row.imageUrl),
    originalPrice: row.originalPrice.trim(), endsAt
  };
}

export function normalizeStoreFeeds(feeds, now = Date.now()) {
  const seen = new Set();
  const offers = [];
  for (const store of STORES) {
    const rows = feeds?.[store];
    if (!Array.isArray(rows)) throw new TypeError(`Missing ${store} offers.`);
    for (const row of rows) {
      const offer = normalizeOffer(row, store, now);
      if (offer && !seen.has(offer.key)) {
        seen.add(offer.key);
        offers.push(offer);
      }
    }
  }
  return offers.sort((a, b) => a.endsAt - b.endsAt || a.title.localeCompare(b.title));
}

export function readSnapshot(payload, now = Date.now()) {
  const generatedAt = Date.parse(payload?.generatedAt);
  if (!Number.isFinite(generatedAt) || generatedAt > now + 5 * 60_000 ||
      generatedAt < now - SNAPSHOT_MAX_AGE_MS ||
      !Array.isArray(payload?.offers) || payload.offers.length > 600) {
    throw new TypeError("The offer snapshot is unavailable or outdated.");
  }
  const seen = new Set();
  return payload.offers.flatMap(offer => {
    if (!offer || typeof offer.key !== "string" || offer.key.length > 250 ||
        seen.has(offer.key) || !STORES.includes(offer.store) ||
        typeof offer.id !== "string" || offer.id.length > 120 ||
        offer.key !== `${offer.store}:${offer.id}` ||
        typeof offer.title !== "string" || !offer.title.trim() || offer.title.length > 200 ||
        !Number.isFinite(offer.endsAt) || offer.endsAt <= now ||
        !paidPrice(offer.originalPrice) ||
        !httpsUrl(offer.offerUrl, "freetokeep.gg")) return [];
    seen.add(offer.key);
    return [{ ...offer, offerUrl: httpsUrl(offer.offerUrl, "freetokeep.gg"),
      imageUrl: httpsUrl(offer.imageUrl), storeLabel: STORE_LABELS[offer.store] }];
  }).sort((a, b) => a.endsAt - b.endsAt || a.title.localeCompare(b.title));
}
