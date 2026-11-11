import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { EXP_BG, SCENARIOS } from "../../data/home";
import { roomById, sized } from "../../data/rooms";
import { roomUrl, useI18n } from "../../i18n/I18nProvider";
import { Lines } from "../ui/Lines";
import { Pill } from "../ui/Pill";
import { Price } from "../ui/Price";
import { Star } from "../ui/Icons";

// The journeys are laid out twice round an endless ring, so two cards show on each side and the card that
// wraps from one end to the other always does so out of sight
const LOOP = [...SCENARIOS, ...SCENARIOS];
const N = LOOP.length;
const half = N / 2;
const GAP = 1.06;                                           // distance between card centres, in card widths

/** Signed distance of card i from the active card, wrapped round the ring (-4..3 for eight cards) */
const slot = (i: number, active: number) => ((i - active + N + half) % N) - half;

/** Card transform for a (fractional) slot: side cards swing out along an arc, tilt and drop back */
function place(p: number): CSSProperties {
  const d = Math.min(Math.abs(p), 3);
  return {
    transform: `translate3d(${p * GAP * 100}%, ${d * d * 5}%, 0) rotate(${p * 9}deg) scale(${1 - d * 0.08})`,
    opacity: d > 2.4 ? 0 : 1,
    zIndex: 10 - Math.round(d * 3),
  };
}

/** Journeys as a draggable coverflow over a photo; clicking a side card or ←/→ does the same without dragging */
export function Experiences() {
  const { t, lang } = useI18n();
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const press = useRef<{ x: number; moved: boolean } | null>(null);
  const dragged = useRef(false);
  // Slots of the previous render: a card wrapping round to the other side jumps instead of sweeping across
  const prev = useRef(LOOP.map((_, i) => slot(i, 0)));
  useEffect(() => { prev.current = LOOP.map((_, i) => slot(i, active)); }, [active]);

  const go = (i: number) => setActive(((i % N) + N) % N);
  const unit = () => (stage.current?.querySelector<HTMLElement>(".exp-card")?.offsetWidth ?? 440) * GAP;

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    press.current = { x: e.clientX, moved: false };
  };
  const onMove = (e: PointerEvent) => {
    const box = stage.current?.getBoundingClientRect();
    if (box && cursor.current) cursor.current.style.transform = `translate(${e.clientX - box.left}px, ${e.clientY - box.top}px)`;
    const p = press.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    if (!p.moved && Math.abs(dx) > 6) {
      p.moved = true;
      stage.current?.setPointerCapture(e.pointerId);
    }
    if (p.moved) setDrag(dx);
  };
  const onUp = () => {
    const p = press.current;
    press.current = null;
    if (!p?.moved) return;
    dragged.current = true;
    const steps = Math.round(-drag / unit());
    go(active + (steps || (Math.abs(drag) > 60 ? -Math.sign(drag) : 0)));
    setDrag(0);
  };
  // A drag must not also follow the link it started on; a click on a side card brings it to the front
  const onClick = (e: MouseEvent) => {
    const card = (e.target as Element).closest<HTMLElement>(".exp-card");
    if (dragged.current) { dragged.current = false; e.preventDefault(); return; }
    const i = Number(card?.dataset.index);
    if (card && i !== active) { e.preventDefault(); go(i); }
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
  };

  const offset = drag / unit();
  return (
    <section className="exp" id="experiences" onKeyDown={onKey}>
      <div className="exp-bg" aria-hidden="true"><img src={EXP_BG} alt="" loading="lazy" /></div>
      <div className="container exp-head">
        <Lines className="display h-lg" text={t("scenario.title")} />
      </div>
      <div
        className={"exp-stage" + (drag ? " is-dragging" : "")}
        ref={stage}
        aria-roledescription="carousel"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={onClick}
      >
        {LOOP.map((s, i) => {
          const room = roomById(s.room);
          if (!room) return null;
          const at = slot(i, active);
          const url = roomUrl(room.id, lang);
          const name = t(`rooms.${room.id}.name`);
          const front = at === 0;
          return (
            <article
              className={"exp-card exp-" + s.key + (front ? " is-front" : "") + (Math.abs(at - prev.current[i]) > 1.5 ? " is-wrap" : "")}
              data-index={i}
              key={s.key + i}
              style={place(at + offset)}
              aria-hidden={!front || undefined}
            >
              <p className="exp-badge">{t(`scenario.tabs.${s.key}`)}</p>
              <h3 className="display">{name}</h3>
              <p className="exp-desc">{t(`rooms.${room.id}.desc`)}</p>
              <p className="exp-rating"><Star /><b>{room.rating.toFixed(1)}</b> · {t("scenario.reviews", { n: room.reviews })} · <Price value={room.price} /></p>
              <a className="exp-shot" href={url} tabIndex={front ? 0 : -1} draggable={false}>
                <img src={sized(room.gallery[0], 1200)} alt={name} loading="lazy" draggable={false} />
              </a>
              <Pill variant="light" className="exp-cta" href={url} tabIndex={front ? 0 : -1} draggable={false}>{t("btn.details")}</Pill>
            </article>
          );
        })}
        <div className="exp-cursor" ref={cursor} aria-hidden="true"><span>{t("home.drag")}</span></div>
      </div>
    </section>
  );
}
