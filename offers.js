import { readSnapshot, SNAPSHOT_MAX_AGE_MS } from "./offers-data.mjs";

const status = document.getElementById("offer-status");
const track = document.getElementById("offer-track");
const previous = document.getElementById("offer-previous");
const next = document.getElementById("offer-next");
let expiryTimer;

function updateArrows() {
  track.classList.toggle("offer-two", track.children.length === 2 && track.clientWidth >= 2 * 496 + 12);
  const canScroll = track.scrollWidth > track.clientWidth + 2;
  track.tabIndex = canScroll ? 0 : -1;
  previous.hidden = !canScroll;
  next.hidden = !canScroll;
  if (canScroll) {
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }
}

function move(direction) {
  const card = track.querySelector(".offer-card");
  if (!card) return;
  const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
  track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap),
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

previous.addEventListener("click", () => move(-1));
next.addEventListener("click", () => move(1));
track.addEventListener("scroll", updateArrows, { passive: true });
window.addEventListener("resize", updateArrows);

function makeCard(offer) {
  const card = document.createElement("article");
  card.className = "offer-card";
  if (offer.imageUrl) {
    const image = document.createElement("img");
    image.src = offer.imageUrl;
    image.alt = "";
    image.width = 200;
    image.height = 250;
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => image.remove(), { once: true });
    card.append(image);
  }
  const body = document.createElement("div");
  body.className = "offer-card-copy";
  const store = document.createElement("span");
  store.className = "offer-store";
  store.textContent = offer.storeLabel;
  const title = document.createElement("h3");
  title.textContent = offer.title;
  const detail = document.createElement("p");
  detail.textContent = `Was ${offer.originalPrice} · Reported until ${new Date(offer.endsAt).toLocaleString()}`;
  const link = document.createElement("a");
  link.href = offer.offerUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View reported offer";
  link.setAttribute("aria-label", `View reported offer for ${offer.title}`);
  body.append(store, title, detail, link);
  card.append(body);
  return card;
}

function showOffers(snapshot) {
  clearTimeout(expiryTimer);
  let offers;
  try { offers = readSnapshot(snapshot); }
  catch {
    track.replaceChildren();
    status.textContent = "Current offer reports are unavailable. Check again later.";
    updateArrows();
    return;
  }
  track.replaceChildren(...offers.map(makeCard));
  status.textContent = offers.length
    ? `${offers.length} current reported ${offers.length === 1 ? "offer" : "offers"}. Updated ${new Date(snapshot.generatedAt).toLocaleString()}.`
    : "No current 100%-off PC game reports at the last update.";
  updateArrows();
  const staleAt = Date.parse(snapshot.generatedAt) + SNAPSHOT_MAX_AGE_MS;
  expiryTimer = setTimeout(() => showOffers(snapshot), Math.max(1,
    Math.min(offers[0]?.endsAt ?? staleAt, staleAt) - Date.now() + 1));
}

try {
  const response = await fetch("./offers.json", { cache: "no-store", credentials: "omit" });
  if (!response.ok) throw new Error(`Snapshot returned HTTP ${response.status}`);
  showOffers(await response.json());
} catch {
  track.replaceChildren();
  status.textContent = "Current offer reports are unavailable. Check again later.";
  updateArrows();
}
