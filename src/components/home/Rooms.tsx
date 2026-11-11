import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import { ROOMS, ROOM_FILTERS, sized, type RoomFilter } from "../../data/rooms";
import { LINKS } from "../../data/contact";
import { ROOMS_BG } from "../../data/home";
import { roomUrl, useI18n } from "../../i18n/I18nProvider";
import { Lines } from "../ui/Lines";
import { Pill } from "../ui/Pill";
import { Price } from "../ui/Price";
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from "../ui/Icons";
import { prefersReducedMotion } from "../../motion/scroll";

const AUTOPLAY = 5000;
const NARROW = "(max-width: 720px)";

/** One room as a cover: name, description, facts and price on one line, photo, then button and rating */
function Cover({ room }: { room: (typeof ROOMS)[number] }) {
  const { t, lang } = useI18n();
  const url = roomUrl(room.id, lang);
  const name = t(`rooms.${room.id}.name`);
  return (
    <article className="mag-cover">
      <header className="mag-mast">
        <h3><a href={url}>{name}</a></h3>
      </header>
      <p className="mag-desc">{t(`rooms.${room.id}.desc`)}</p>
      <div className="mag-facts">
        <ul>
          <li>{t("rooms.guests", { n: room.guests })}</li>
          <li>{t("rooms.area", { n: room.area })}</li>
          <li>{t(`bed.${room.bed}`)}</li>
        </ul>
        <Price value={room.price} />
      </div>
      <a className="mag-photo" href={url} tabIndex={-1} draggable={false}>
        <img src={sized(room.gallery[0], 1200)} alt={name} loading="lazy" draggable={false} />
      </a>
      <footer className="mag-foot">
        <Pill small href={url}>{t("btn.details")}</Pill>
        <span className="mag-rating">
          <b><Star />{room.rating.toFixed(1)}</b>
          <small>{room.best ? t("rooms.badge") : t("scenario.reviews", { n: room.reviews })}</small>
        </span>
      </footer>
    </article>
  );
}

/** Rooms as magazine covers on a full-bleed interior photo: two covers per view sliding right to left */
export function Rooms() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<RoomFilter>("all");
  const [pick, setPick] = useState(0);
  const [perView, setPerView] = useState(2);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const press = useRef<{ x: number; y: number; t: number; lastX: number; lastT: number; v: number; moved: boolean } | null>(null);
  const dragged = useRef(false);
  const track = useRef<HTMLDivElement>(null);
  const list = ROOMS.filter((r) => filter === "all" || r.type === filter);
  const stops = Math.max(1, list.length - perView + 1);   // positions of the left-hand cover
  const at = Math.min(pick, stops - 1);
  const go = (i: number) => setPick((i + stops) % stops);
  const choose = (k: RoomFilter) => { setFilter(k); setPick(0); };

  useEffect(() => {
    const mq = matchMedia(NARROW);
    const update = () => setPerView(mq.matches ? 1 : 2);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Slides on by itself, one cover at a time; stops while hovered or focused, and with reduced motion
  useEffect(() => {
    if (paused || dragX || stops < 2 || prefersReducedMotion()) return;
    const timer = setTimeout(() => go(at + 1), AUTOPLAY);
    return () => clearTimeout(timer);
  });

  // Drag: the track follows the pointer (with resistance past either end), then snaps to the nearest cover;
  // a quick flick moves on by one even when it was short
  const slideWidth = () => {
    const el = track.current;
    return el ? (el.offsetWidth + 28) / perView : 600;
  };
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const now = performance.now();
    press.current = { x: e.clientX, y: e.clientY, t: now, lastX: e.clientX, lastT: now, v: 0, moved: false };
  };
  const onMove = (e: PointerEvent) => {
    const p = press.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    if (!p.moved) {
      if (Math.abs(dx) < 6) return;
      if (Math.abs(e.clientY - p.y) > Math.abs(dx)) { press.current = null; return; }   // vertical: let the page scroll
      p.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    const now = performance.now();
    p.v = (e.clientX - p.lastX) / Math.max(1, now - p.lastT);
    p.lastX = e.clientX;
    p.lastT = now;
    const past = (at === 0 && dx > 0) || (at === stops - 1 && dx < 0);
    setDragX(past ? dx * 0.3 : dx);
  };
  const onUp = () => {
    const p = press.current;
    press.current = null;
    if (!p?.moved) return;
    dragged.current = true;
    let steps = Math.round(-dragX / slideWidth());
    if (!steps && Math.abs(p.v) > 0.4) steps = p.v < 0 ? 1 : -1;
    setPick(Math.max(0, Math.min(stops - 1, at + steps)));
    setDragX(0);
  };
  // A drag must not also open the room it started on
  const onClick = (e: MouseEvent) => {
    if (dragged.current) { dragged.current = false; e.preventDefault(); e.stopPropagation(); }
  };

  return (
    <section className="mag" id="rooms">
      <div className="mag-bg" aria-hidden="true"><img src={ROOMS_BG} alt="" loading="lazy" /></div>
      <div className="container mag-inner">
        <div className="mag-head">
          <Lines className="display h-lg" text={t("rooms.title")} />
        </div>
        <div
          className="mag-view"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onClickCapture={onClick}
        >
          <div className={"mag-track" + (dragX ? " is-dragging" : "")} ref={track} key={filter} style={{ "--at": at, "--per": perView, "--drag": dragX + "px" } as CSSProperties}>
            {list.map((r, i) => (
              <div className="mag-slide" key={r.id} aria-hidden={i < at || i >= at + perView || undefined}><Cover room={r} /></div>
            ))}
          </div>
        </div>
        <div className="mag-bar">
          <div className="filter">
            {ROOM_FILTERS.map((k) => (
              <button key={k} type="button" className={"chip" + (k === filter ? " active" : "")} aria-pressed={k === filter} onClick={() => choose(k)}>{t("rooms.filter." + k)}</button>
            ))}
          </div>
          <div className="mag-pager">
            <button type="button" className="round-btn" onClick={() => go(at - 1)} aria-label={t("home.prev")} disabled={stops < 2}><ChevronLeft /></button>
            <span className="mag-dots" aria-hidden="true">
              {Array.from({ length: stops }, (_, i) => <i key={i} className={i === at ? "on" : undefined} />)}
            </span>
            <button type="button" className="round-btn" onClick={() => go(at + 1)} aria-label={t("home.next")} disabled={stops < 2}><ChevronRight /></button>
          </div>
          <a href={LINKS.allRooms} className="link-arrow" target="_blank" rel="noopener"><span>{t("btn.viewAll")}</span><ArrowUpRight /></a>
        </div>
      </div>
    </section>
  );
}
