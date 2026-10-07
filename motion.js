// Locomotive Scroll 5.0.1 (MIT) is vendored from locomotivemtl/locomotive-scroll.
// Follow the upstream landing demo's declarative data-scroll/data-scroll-speed pattern.
const curtain = document.querySelector(".entry-curtain");
curtain?.addEventListener("animationend", (event) => {
  if (event.target === curtain && event.animationName === "curtain-lift") curtain.remove();
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktop = window.matchMedia("(min-width: 801px)");
const preview = document.documentElement.classList.contains("motion-preview");
let scroll;

if ("scrollRestoration" in history && !location.hash) {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
}

function syncScroll() {
  const enabled = desktop.matches && (!motionPreference.matches || preview);
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
