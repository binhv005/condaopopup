import { useEffect, useRef, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface RailProps {
  id?: string;
  head: ReactNode;
  footExtra?: ReactNode;
  /** Change this when the cards change so pinned scroll distances are measured again */
  refreshKey?: string;
  children: ReactNode;
}

/**
 * Horizontal card rail. fx (useMotion) pins it and maps vertical scroll to the cards on desktop;
 * elsewhere the track swipes natively and this component drives the progress bar.
 */
export function Rail({ id, head, footExtra, refreshKey, children }: RailProps) {
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (bar.current) bar.current.style.transform = "scaleX(" + (max > 0 ? Math.max(0.15, el.scrollLeft / max) : 1) + ")";
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { ScrollTrigger.refresh(); }, [refreshKey]);

  return (
    <section className="rail" id={id}>
      <div className="rail-pin">
        <div className="container rail-head">{head}</div>
        <div className="rail-track" ref={track}>{children}</div>
        <div className="container rail-foot">
          <div className="rail-progress"><i ref={bar}></i></div>
          {footExtra}
        </div>
      </div>
    </section>
  );
}
