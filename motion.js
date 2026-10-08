// Locomotive Scroll 5.0.1 (MIT) is vendored from locomotivemtl/locomotive-scroll.
// Follow the upstream landing demo's declarative data-scroll/data-scroll-speed pattern.
document.addEventListener("animationend", (event) => {
  if (event.target.matches(".entry-curtain") && event.animationName === "curtain-lift") event.target.remove();
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktop = window.matchMedia("(min-width: 801px)");
const root = document.documentElement;
function motionEnabled() {
  return !motionPreference.matches || root.classList.contains("motion-preview");
}
let scroll;

if ("scrollRestoration" in history && !location.hash) {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
}

function syncScroll() {
  const enabled = desktop.matches && motionEnabled();
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

desktop.addEventListener("change", syncScroll);
motionPreference.addEventListener("change", syncScroll);
syncScroll();
