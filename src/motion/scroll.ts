import type Lenis from "lenis";

// Shared handle to the smooth-scroll instance (set by useSmoothScroll when motion is active);
// `modal` is true while a popup or lightbox holds the page still
export const scrollState: { lenis: Lenis | null; modal: boolean } = { lenis: null, modal: false };

/** Wheel / touch scrolling is swallowed while a modal is open, except inside the modal's own scrollable content */
function block(e: Event): void {
  if ((e.target as Element | null)?.closest?.("[data-lenis-prevent]") && !(e.target as Element).matches("[data-lenis-prevent]")) return;
  e.preventDefault();
}

/** Popup / lightbox scroll lock; also pauses Lenis smooth scroll and the hero scrub while it is on */
export function lockScroll(on: boolean): void {
  scrollState.modal = on;
  document.body.style.overflow = on ? "hidden" : "";
  const opts: AddEventListenerOptions = { passive: false, capture: true };
  if (on) {
    window.addEventListener("wheel", block, opts);
    window.addEventListener("touchmove", block, opts);
  } else {
    window.removeEventListener("wheel", block, opts);
    window.removeEventListener("touchmove", block, opts);
  }
  const lenis = scrollState.lenis;
  if (lenis) {
    if (on) lenis.stop();
    else lenis.start();
  }
}

export function prefersReducedMotion(): boolean {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}
