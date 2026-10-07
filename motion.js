// Locomotive Scroll 5.0.1 (MIT) is vendored from locomotivemtl/locomotive-scroll.
// Follow the upstream landing demo's declarative data-scroll/data-scroll-speed pattern.
const curtainTemplate = document.querySelector(".entry-curtain")?.cloneNode(true);
document.addEventListener("animationend", (event) => {
  if (event.target.matches(".entry-curtain") && event.animationName === "curtain-lift") event.target.remove();
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktop = window.matchMedia("(min-width: 801px)");
const root = document.documentElement;
const toggle = document.querySelector(".motion-toggle");
function motionEnabled() {
  return !root.classList.contains("motion-off") && (!motionPreference.matches || root.classList.contains("motion-preview"));
}
let scroll;

if ("scrollRestoration" in history && !location.hash) {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
}

function syncScroll() {
  const enabled = desktop.matches && motionEnabled();
  toggle.textContent = motionEnabled() ? "Disable animations" : "Enable animations";
  toggle.hidden = false;
  if (enabled && !scroll && typeof window.LocomotiveScroll === "function") {
    scroll = new window.LocomotiveScroll();
    document.documentElement.classList.add("motion-active");
  } else if (!enabled && scroll) {
    scroll.destroy();
    scroll = undefined;
    document.documentElement.classList.remove("motion-active");
    for (const element of document.querySelectorAll("[data-scroll]")) {
      element.style.removeProperty("transform");
      element.classList.remove("is-inview");
    }
  }
}

toggle.addEventListener("click", () => {
  const enabled = !motionEnabled();
  root.classList.toggle("motion-preview", enabled);
  root.classList.toggle("motion-off", !enabled);
  try { localStorage.setItem("lazydeals-motion", enabled ? "on" : "off"); } catch {}
  document.querySelector(".entry-curtain")?.remove();
  if (enabled && curtainTemplate) document.body.prepend(curtainTemplate.cloneNode(true));
  syncScroll();
});
desktop.addEventListener("change", syncScroll);
motionPreference.addEventListener("change", syncScroll);
syncScroll();
