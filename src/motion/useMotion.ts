/*
 * Motion layer after godaylight.com: Lenis smooth scroll + GSAP ScrollTrigger, mostly scrubbed to the scroll.
 * If the visitor prefers reduced motion nothing here runs and every section stays a plain static block.
 *
 * <html> classes:  fx  – motion layer active
 *                  pin – desktop mode: tall sections pin and scrub (CSS keys off this)
 * Markup hooks:
 *   data-lines     heading lines slide up from a mask, one line after another (see ui/Lines)
 *   data-cell      grid cell photo opens inside its cell while scrolling past
 *   data-reveal-y  photo opens vertically from the middle (testimonial style)
 *   data-clip      block opens from an inset once it enters the viewport
 *   data-speed     element drifts by that many % of its height across the viewport
 *   data-count     number counts up
 *   data-fill      words go from faint to full ink while the block scrolls through; inside [data-hold] the block
 *                  is pinned mid-screen meanwhile and its [data-hold-end] children rise in at the end
 *   .slides        review panels: pinned and scrubbed sideways on desktop, swipeable elsewhere
 */
import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { prefersReducedMotion, scrollState } from "./scroll";

gsap.registerPlugin(ScrollTrigger);

const EASE = "expo.out";
const DESKTOP = "(min-width: 1101px) and (min-height: 700px)";
// The review slides pin on any screen wider than a phone, short or zoomed-in ones included (their height follows the viewport)
const WIDE = "(min-width: 721px)";
const FULL = "inset(0% 0% 0% 0% round 0px)";

function all<T extends Element = HTMLElement>(sel: string, ctx: ParentNode): T[] {
  return Array.from(ctx.querySelectorAll<T>(sel));
}

/** Group a heading's masked words by rendered line and raise one line after another */
function lineReveal(el: Element, vars?: gsap.TimelineVars): gsap.core.Timeline {
  const tl = gsap.timeline(vars);
  const lines: Element[][] = [];
  let top: number | null = null;
  all<HTMLElement>(".w", el).forEach((w) => {
    if (top === null || Math.abs(w.offsetTop - top) > 4) { lines.push([]); top = w.offsetTop; }
    if (w.firstElementChild) lines[lines.length - 1].push(w.firstElementChild);
  });
  lines.forEach((words, i) => tl.from(words, { yPercent: 115, duration: 1.3, ease: EASE }, i * 0.12));
  return tl;
}

const radiusOf = (el: Element) => getComputedStyle(el).borderTopLeftRadius;

function setup(root: HTMLElement): gsap.MatchMedia {
  // ---------- Desktop: pinned, scrubbed sections ----------
  // Set up first so the taller pinned layout exists before the other triggers measure the page
  const mm = gsap.matchMedia();
  /** Vertical scroll drives the track sideways while the section is pinned */
  const sideways = (rail: HTMLElement, track: HTMLElement) => {
    const bar = rail.querySelector<HTMLElement>(".rail-progress i");
    const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
    gsap.to(track, {
      x: () => -distance(), ease: "none",
      scrollTrigger: {
        trigger: rail, start: "top top", end: () => "+=" + Math.max(distance(), 1),
        pin: true, scrub: 0.7, invalidateOnRefresh: true, refreshPriority: 1,
        onUpdate: (st) => { if (bar) bar.style.transform = "scaleX(" + Math.max(0.15, st.progress) + ")"; },
      },
    });
  };
  mm.add(DESKTOP, () => {
    document.documentElement.classList.add("pin");
    all(".rail", root).forEach((rail) => {
      const track = rail.querySelector<HTMLElement>(".rail-track");
      if (track) sideways(rail, track);
    });
    return () => document.documentElement.classList.remove("pin");
  });
  mm.add(WIDE, () => {
    const slides = all(".slides", root);
    slides.forEach((s) => {
      s.classList.add("is-pinned");
      const track = s.querySelector<HTMLElement>(".slides-track");
      if (track) sideways(s, track);
    });
    return () => slides.forEach((s) => s.classList.remove("is-pinned"));
  });

  // ---------- Headings ----------
  all("[data-lines]", root).forEach((el) => {
    lineReveal(el, { scrollTrigger: { trigger: el, start: "top 86%" } });
  });

  // ---------- Grid cells: photo opens inside the cell, tag follows ----------
  all("[data-cell]", root).forEach((cell) => {
    const clip = cell.querySelector(".usp-clip");
    if (!clip) return;
    gsap.fromTo(clip, { clipPath: "inset(16% 9% 14% 9% round 10px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 10px)", ease: "none",
      scrollTrigger: { trigger: cell, start: "top bottom", end: "center 55%", scrub: 0.6 },
    });
    gsap.from(clip.querySelector("img"), { scale: 1.3, ease: "none", scrollTrigger: { trigger: cell, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    const tag = cell.querySelector(".usp-tag");
    if (tag) gsap.from(tag, { y: 40, opacity: 0, duration: 1.1, ease: EASE, scrollTrigger: { trigger: cell, start: "top 70%" } });
  });

  // ---------- Vertical photo opening (amenities, FAQ) ----------
  all("[data-reveal-y]", root).forEach((el) => {
    const r = radiusOf(el);
    gsap.fromTo(el, { clipPath: `inset(50% 0% 50% 0% round ${r})` }, {
      clipPath: `inset(0% 0% 0% 0% round ${r})`, ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "center 60%", scrub: 0.6 },
    });
    gsap.fromTo(el.querySelector("img"), { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } });
  });
  // ---------- Quote words fill in as the block scrolls through ----------
  all("[data-fill]", root).forEach((el) => {
    // Review intro: held in the middle of the screen while the words ink in, then the stats come up
    const stage = el.closest<HTMLElement>("[data-hold]");
    if (stage) {
      const stats = stage.querySelectorAll("[data-hold-end] > *");
      gsap.timeline({
        scrollTrigger: { trigger: stage, start: "top top", end: "+=" + (110 + el.children.length * 3) + "%", pin: true, scrub: 0.6, refreshPriority: 2 },
      })
        .fromTo(el.children, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: "none", duration: 0.1 }, 0)
        .fromTo(stats, { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.15, ease: "power2.out", duration: el.children.length * 0.025 });
      return;
    }
    gsap.fromTo(el.children, { opacity: 0.16 }, {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
    });
  });

  // ---------- One-off clip opening when entering (room page thumbnails) ----------
  all("[data-clip]", root).forEach((el) => {
    const r = radiusOf(el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%" } });
    tl.fromTo(el, { clipPath: `inset(14% 10% 14% 10% round ${r})` }, { clipPath: `inset(0% 0% 0% 0% round ${r})`, duration: 1.6, ease: EASE, clearProps: "clipPath" });
    const img = el.querySelector("img");
    if (img) tl.from(img, { scale: 1.3, duration: 1.9, ease: EASE, clearProps: "transform" }, 0);
  });

  // ---------- Drift ----------
  all("[data-speed]", root).forEach((el) => {
    const s = parseFloat(el.dataset.speed ?? "0");
    gsap.fromTo(el, { yPercent: s }, { yPercent: -s, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 } });
  });

  // ---------- Count-up numbers when they enter ----------
  all("[data-count]", root).forEach((el) => {
    const raw = el.dataset.count ?? "0";
    const end = parseFloat(raw);
    const decimals = (raw.split(".")[1] ?? "").length;
    const state = { v: 0 };
    el.textContent = (0).toFixed(decimals);
    gsap.to(state, {
      v: end, duration: 2.2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 95%" },
      onUpdate: () => { el.textContent = state.v.toFixed(decimals); },
      onComplete: () => { el.textContent = raw; },
    });
  });

  // ---------- Room cover: side insets close up as it scrolls into place ----------
  all(".cover", root).forEach((el) => {
    gsap.fromTo(el, { clipPath: "inset(0% 8% 0% 8% round 28px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom 70%", scrub: 0.6 },
    });
    gsap.fromTo(el.querySelector("img"), { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } });
  });

  // ---------- Booking photo window ----------
  all(".start-window", root).forEach((el) => {
    gsap.fromTo(el, { clipPath: "inset(20% 18% 20% 18% round 20px)" }, {
      clipPath: FULL, ease: "none",
      scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "center 55%", scrub: 0.6 },
    });
  });

  return mm;
}

/**
 * Builds every scroll animation inside `root`. Re-runs (after a full revert) whenever `deps` change,
 * e.g. the language, because headings and cards are re-rendered with new text.
 */
export function useMotion(root: RefObject<HTMLElement | null>, deps: unknown[]): void {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    document.documentElement.classList.add("fx");
    let mm: gsap.MatchMedia | undefined;
    const ctx = gsap.context(() => { mm = setup(el); }, el);
    ScrollTrigger.refresh();
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    return () => {
      window.removeEventListener("load", refresh);
      mm?.revert();
      ctx.revert();
    };
  }, deps);
}

/** Lenis smooth scroll wired to ScrollTrigger; in-page anchors glide with an offset for the fixed header */
export function useSmoothScroll(): void {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    scrollState.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = a?.getAttribute("href");
      const target = id && id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.6 });
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      scrollState.lenis = null;
    };
  }, []);
}
