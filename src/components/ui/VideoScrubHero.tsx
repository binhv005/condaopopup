import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { prefersReducedMotion, scrollState } from "../../motion/scroll";

interface VideoScrubHeroProps {
  id?: string;
  /** Encode with dense keyframes (see scripts/hero-video-assets.py) or scrubbing backwards stutters */
  videoSrc: string;
  poster?: string;
  /** Still image phones get instead of the video (e.g. a portrait crop); falls back to `poster` */
  mobilePoster?: string;
  /** Last frame of the video with the sky cut away; laid over the mark so it sits behind the horizon */
  cutoutSrc?: string;
  /** Height of the horizon in the last frame, as a fraction of the video height (0 = top) */
  horizon?: number;
  title: string;
  /** Large word that rises from behind the horizon once the video has reached its end */
  mark: string;
  scrollHint: string;
  /** Bottom corner content, e.g. a short line and a button */
  aside?: ReactNode;
  /** Wheel/touch distance (px) that scrubs the whole sequence */
  scrubDistance?: number;
}

// Share of the scrub spent on the video; the rest composes the mark and the cutout over its last frame
const VIDEO_END = 0.78;
// The cutout matches the last frame exactly, so it can switch on as the video arrives there, before the mark rises
const CUTOUT = [0.77, 0.79] as const;
const MARK = [0.8, 0.95] as const;
// Once the mark is in, the hero rests briefly (a little extra input, HOLD, and at least DWELL ms), then hands the
// scroll straight back to the page – no new gesture needed, so the hand-off stays smooth instead of stopping dead
const HOLD = 0.06;
const DWELL = 350;
const END = 1 + HOLD;
const KEY_STEP: Record<string, number> = { ArrowDown: 120, ArrowUp: -120, PageDown: 600, PageUp: -600, " ": 600 };
// Touch: a finger travels far less than a wheel, so it scrubs harder, and a flick keeps gliding after the finger lifts
const TOUCH_GAIN = 3.5;
const FLING_DECAY = 0.95;                                  // velocity kept per 60fps frame
const FLING_MIN = 0.02;                                    // px/ms below which the glide stops

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const span = (p: number, [a, b]: readonly [number, number]) => clamp((p - a) / (b - a));
// Phones and touch tablets seek video frames too slowly to scrub smoothly, so they get a still image and a normal scroll
const PHONE_QUERY = "(max-width: 720px), (hover: none) and (pointer: coarse) and (orientation: portrait)";

/**
 * Full-screen hero whose video is scrubbed by the wheel, touch or keyboard while the page sits at the top.
 * The page stays put (Lenis is stopped) until the sequence has played through and held for a moment, then scrolls on;
 * scrolling back up at the top of the page scrubs it in reverse. With reduced motion it is a still hero.
 */
export function VideoScrubHero({ id, videoSrc, poster, mobilePoster = poster, cutoutSrc, horizon = 0.5, title, mark, scrollHint, aside, scrubDistance = 3200 }: VideoScrubHeroProps) {
  const [still] = useState(() => !!mobilePoster && window.matchMedia(PHONE_QUERY).matches);
  const video = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const cutoutRef = useRef<HTMLImageElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (still) return;
    const v = video.current;
    if (!v) return;
    const onData = () => { setReady(true); };
    v.addEventListener("loadeddata", onData);
    if (v.readyState >= 2) onData();
    if (prefersReducedMotion()) return () => v.removeEventListener("loadeddata", onData);

    let raf = 0;
    let target = 0;
    let current = 0;
    let seeking = false;
    let pending: number | null = null;
    let touchY = 0;
    let touchT = 0;
    let touchV = 0;                                       // finger velocity, px/ms (positive = scrolling down)
    let fling = 0;
    let ownStop = false;
    let doneAt = 0;                                       // when the sequence reached its end (0 = not there)
    // Lock only while the hero is at the top; arriving further down (reload, deep link) shows the end state
    let locked = window.scrollY < 4;
    const skipToEnd = () => { target = current = END; doneAt = 1; };
    if (!locked) skipToEnd();

    /** Keep Lenis stopped while locked; only restart it if this hero was the one that stopped it */
    const sync = () => {
      const lenis = scrollState.lenis;
      if (!lenis) return;
      if (locked && !lenis.isStopped) { lenis.stop(); ownStop = true; }
      if (!locked && ownStop && !scrollState.modal) { lenis.start(); ownStop = false; }   // a popup keeps it stopped
    };

    /** Feed scroll input; returns true when it was used for scrubbing and must not scroll the page */
    const drive = (dy: number) => {
      if (scrollState.modal) return true;                // a popup is open: nothing scrolls until it is closed
      if (locked && window.scrollY > 4) { skipToEnd(); locked = false; sync(); }   // the page moved on without us
      if (!locked) {
        if (dy >= 0 || window.scrollY > 2) return false;
        locked = true;                                   // back at the top and still going up: scrub in reverse
        target = current = 1;                            // …starting right away, without crossing the hold again
      }
      const held = doneAt > 0 && performance.now() - doneAt > DWELL;
      if (dy > 0 && target >= END && held) {             // played through and rested: hand the scroll back to the page
        locked = false;
        sync();
        scrollState.lenis?.scrollTo(window.scrollY + dy, { lerp: 0.09 });   // carry this tick on so the page moves at once
        return true;
      }
      target = clamp(target + dy / scrubDistance, 0, END);
      sync();
      return true;
    };

    const seek = (t: number) => {
      if (Math.abs(v.currentTime - t) < 1 / 60) return;
      if (seeking) { pending = t; return; }
      seeking = true;
      v.currentTime = t;
    };
    const onSeeked = () => {
      seeking = false;
      if (pending !== null) { const t = pending; pending = null; seek(t); }
    };

    const onWheel = (e: WheelEvent) => {
      if (drive(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY)) e.preventDefault();
    };
    const stopFling = () => { cancelAnimationFrame(fling); fling = 0; };
    const onTouchStart = (e: TouchEvent) => {
      stopFling();
      touchY = e.touches[0]?.clientY ?? 0;
      touchT = performance.now();
      touchV = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY;
      const now = performance.now();
      const dt = Math.max(1, now - touchT);
      touchV = touchV * 0.3 + ((touchY - y) / dt) * 0.7;   // smoothed so one jittery sample doesn't decide the flick
      const used = drive((touchY - y) * TOUCH_GAIN);
      touchY = y;
      touchT = now;
      if (used) e.preventDefault();
    };
    // Keep scrubbing with the release velocity, easing out like native momentum scrolling
    const onTouchEnd = () => {
      if (!locked || performance.now() - touchT > 80 || Math.abs(touchV) < FLING_MIN) return;   // finger rested before lifting
      let vel = touchV;
      let last = performance.now();
      const step = (now: number) => {
        const dt = Math.min(48, now - last);
        last = now;
        if (!drive(vel * dt * TOUCH_GAIN) || !locked) { fling = 0; return; }
        vel *= Math.pow(FLING_DECAY, dt / 16.7);
        fling = Math.abs(vel) < FLING_MIN ? 0 : requestAnimationFrame(step);
      };
      fling = requestAnimationFrame(step);
    };
    const onKey = (e: KeyboardEvent) => {
      const step = KEY_STEP[e.key];
      const el = e.target as HTMLElement | null;
      if (!step || e.altKey || e.ctrlKey || e.metaKey || el?.closest("input, textarea, select, [contenteditable]")) return;
      if (drive(e.shiftKey && e.key === " " ? -step : step)) e.preventDefault();
    };
    // An in-page link (header nav, buttons) skips the sequence so the page can scroll to its target
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = a?.getAttribute("href");
      if (!locked || !hash || hash === "#" || hash === "#" + id) return;
      skipToEnd();
      locked = false;
      sync();
    };

    const frame = () => {
      // Scroll restored or a deep link landed below the hero after it mounted: show the end state and let go
      if (locked && window.scrollY > 4) { skipToEnd(); locked = false; }
      sync();
      current += (target - current) * 0.18;
      if (Math.abs(target - current) < 0.0005) current = target;
      const p = Math.min(current, 1);                      // the hold beyond 1 changes nothing on screen
      if (p < 0.999) doneAt = 0;
      else if (!doneAt) doneAt = performance.now();
      if (v.duration) seek(clamp(p / VIDEO_END) * v.duration);
      const out = clamp(p / 0.3);
      if (titleRef.current) {
        titleRef.current.style.opacity = String(1 - out);
        titleRef.current.style.transform = `translateY(${out * -24}px) scale(${1 - out * 0.04})`;
        titleRef.current.style.filter = `blur(${out * 10}px)`;
      }
      if (hintRef.current) hintRef.current.style.opacity = p > 0.002 ? "0" : "";
      const m = span(p, MARK);
      // Rises out of the sea: starts sunk below the horizon (hidden by the cutout) and comes up to rest on it
      const rise = 1 - Math.pow(1 - m, 3);
      if (markRef.current) {
        markRef.current.style.opacity = String(clamp(m * 3));
        markRef.current.style.transform = `translateY(${(1 - rise) * 75}%)`;
      }
      // Once landed, the parts below the horizon (the tail of a "y") show in front of the water
      if (frontRef.current) frontRef.current.style.opacity = String(clamp((rise - 0.94) / 0.06) * 0.9);
      if (cutoutRef.current) cutoutRef.current.style.opacity = String(span(p, CUTOUT));
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      raf = requestAnimationFrame(frame);
    };

    v.addEventListener("seeked", onSeeked);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick, true);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      stopFling();
      v.removeEventListener("loadeddata", onData);
      v.removeEventListener("seeked", onSeeked);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick, true);
      locked = false;
      sync();
    };
  }, [id, scrubDistance, still]);

  return (
    <section className={"vhero" + (still ? " is-still" : "")} id={id} style={{ "--horizon": horizon } as CSSProperties}>
      {still ? (
        <img className="vhero-video is-ready" src={mobilePoster} alt="" aria-hidden="true" fetchPriority="high" />
      ) : (
        <>
          <video className={"vhero-video" + (ready ? " is-ready" : "")} ref={video} src={videoSrc} poster={poster} muted playsInline preload="auto" aria-hidden="true" />
          <div className="vhero-mark" ref={markRef} aria-hidden="true"><span>{mark}</span></div>
          {cutoutSrc && <img className="vhero-cutout" ref={cutoutRef} src={cutoutSrc} alt="" aria-hidden="true" />}
          {cutoutSrc && <div className="vhero-mark vhero-mark-front" ref={frontRef} aria-hidden="true"><span>{mark}</span></div>}
        </>
      )}
      <div className="vhero-shade" aria-hidden="true"></div>
      <div className="vhero-title" ref={titleRef}><h1 className="display">{title}</h1></div>
      {!still && (
        <div className="vhero-hint" ref={hintRef} aria-hidden="true">
          <span>{scrollHint}</span>
          <svg width="14" height="18" viewBox="0 0 14 18"><path d="M7 1v16M2 12l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      )}
      {aside && <div className="vhero-aside">{aside}</div>}
      {!still && <div className="vhero-progress" aria-hidden="true"><i ref={barRef}></i></div>}
    </section>
  );
}
