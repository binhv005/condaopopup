import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import {
  BOOKING_POPUPS, POPUP_IMAGES, STAY_DEAL, STAY_ROOMS, TRANSFERS, TRIP_TOURS, TRIP_VOUCHER,
  bookingPopupText, kilo, money, type BookingPopupText, type RoomId, type TourId, type TransferId,
} from "../../data/booking-popups";
import { LINKS } from "../../data/contact";
import type { LangCode } from "../../data/locales";
import { useI18n } from "../../i18n/I18nProvider";
import { lockScroll } from "../../motion/scroll";
import { ArrowLeft, ArrowUpRight, Check, Close } from "../ui/Icons";

/* ─── small helpers ───────────────────────────────────────────────────────────────────────── */

const ICONS = {
  heritage: "M3 21h18M5 21V10M19 21V10M9.5 21v-7M14.5 21v-7M2 10h20L12 3z",
  wave: "M2 8c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 13c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2",
  forest: "M12 2l5 7h-3l4 6h-4l3 5H7l3-5H6l4-6H7zM12 20v2",
  plane: "M10.5 3.5a1.5 1.5 0 0 1 3 0V9l8 5v2l-8-2.5V19l2 1.5V22l-3.5-1-3.5 1v-1.5l2-1.5v-5.5L2.5 16v-2l8-5z",
  boat: "M3 16l2 5h14l2-5zM6 16v-5h12v5M9 11V7h6v4M12 7V3",
  ticket: "M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM15 7v10",
  leaf: "M12 22V13M12 13C12 9 8 5 4 5c0 4 3 8 8 8zm0 0c0-4 4-8 8-8 0 4-3 8-8 8zm0 4c-2-2-5-3-8-3 0 3 3 5 8 3zm0 0c2-2 5-3 8-3 0 3-3 5-8 3z",
} as const;

function Icon({ name, size = 16 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

const Brand = ({ text }: { text: string }) => <span className="bp-brand"><Icon name="leaf" size={14} />{text}</span>;

/** Gold / coral pill with the round arrow on its right, as on the cards */
const Cta = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
  <button type="button" className="bp-cta" onClick={onClick}>
    <span>{children}</span><i aria-hidden="true">›</i>
  </button>
);

const isoDay = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
};
const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const x = new Date(Date.UTC(y, m - 1, d + n));
  return x.toISOString().slice(0, 10);
};
const showDate = (iso: string, lang: LangCode) => new Date(iso + "T00:00").toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB");
const MONTH = new Date().getMonth() + 1;

async function copyText(message: string) {
  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch {
    // Older browsers / blocked clipboard: fall back to a hidden textarea
    const area = Object.assign(document.createElement("textarea"), { value: message });
    area.style.cssText = "position:fixed;opacity:0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

/* ─── booking sheet: slides up inside the card ─────────────────────────────────────────────── */

type Lines = { label: string; value: string; strong?: boolean }[];

function Stepper({ value, onChange, max }: { value: number; onChange: (n: number) => void; max: number }) {
  return (
    <div className="bp-stepper">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="−">−</button>
      <output>{value}</output>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="+">+</button>
    </div>
  );
}

/**
 * Shared form shell. `fields` are the card-specific inputs; name / phone / note are added here.
 * On submit the booking is copied and Zalo opens (Zalo links can't carry a prefilled message).
 */
function BookingSheet({ text, title, subtitle, fields, sum, message, error, onBack }: {
  text: BookingPopupText; title: string; subtitle: string; fields: ReactNode; sum: Lines;
  /** booking lines (without contact) – return null to block submit (card shows its own error) */
  message: () => string[] | null; error?: string; onBack: () => void;
}) {
  const f = text.form;
  const [errs, setErrs] = useState<{ name?: boolean; phone?: boolean }>({});
  const [sent, setSent] = useState<{ message: string; copied: boolean } | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const get = (k: string) => String(d.get(k) ?? "").trim();
    const next = { name: get("name").length < 2, phone: get("phone").replace(/\D/g, "").length < 9 };
    setErrs(next);
    const lines = message();
    if (next.name || next.phone || !lines) return;
    const msg = [
      f.msgHead, ...lines.map((l) => "• " + l),
      `• ${f.msgName}: ${get("name")}`, `• ${f.msgPhone}: ${get("phone")}`,
      get("note") && `• ${f.msgNote}: ${get("note")}`,
    ].filter(Boolean).join("\n");
    const copying = copyText(msg);
    window.open(LINKS.zalo, "_blank", "noopener");
    copying.then((copied) => setSent({ message: msg, copied }));
  };

  return (
    <div className="bp-sheet" data-lenis-prevent>
      <header className="bp-sheet-head">
        <button type="button" className="bp-back" onClick={onBack}><ArrowLeft /><span>{text.back}</span></button>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </header>

      {sent ? (
        <div className="bp-sent" role="status">
          <span className="bp-sent-icon"><Check /></span>
          <h5>{sent.copied ? f.copied : f.copyFailed}</h5>
          {sent.copied && <p>{f.copiedHint}</p>}
          <pre>{sent.message}</pre>
          <div className="bp-sent-actions">
            <button type="button" className="bp-ghost" onClick={() => copyText(sent.message).then((copied) => setSent({ ...sent, copied }))}>{f.copyAgain}</button>
            <a className="bp-submit" href={LINKS.zalo} target="_blank" rel="noopener"><span>{f.openZalo}</span><ArrowUpRight /></a>
          </div>
          <button type="button" className="bp-link" onClick={onBack}>{f.again}</button>
        </div>
      ) : (
        <form className="bp-form" onSubmit={submit} noValidate>
          {fields}
          <div className="bp-grid">
            <label><span>{f.name}</span>
              <input name="name" autoComplete="name" aria-invalid={errs.name} onInput={() => setErrs((x) => ({ ...x, name: false }))} />
              {errs.name && <em>{f.nameError}</em>}
            </label>
            <label><span>{f.phone}</span>
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="09xx xxx xxx" aria-invalid={errs.phone} onInput={() => setErrs((x) => ({ ...x, phone: false }))} />
              {errs.phone && <em>{f.phoneError}</em>}
            </label>
            <label className="bp-wide"><span>{f.note}</span><input name="note" /></label>
          </div>
          {error && <p className="bp-error" role="alert">{error}</p>}
          <dl className="bp-sum">
            {sum.map((l) => <div key={l.label} className={l.strong ? "strong" : ""}><dt>{l.label}</dt><dd>{l.value}</dd></div>)}
          </dl>
          <button type="submit" className="bp-submit"><span>{f.submit}</span><ArrowUpRight /></button>
        </form>
      )}
    </div>
  );
}

/* ─── card 1: Hot trip (arch) ──────────────────────────────────────────────────────────────── */

function TripCard({ text, lang }: { text: BookingPopupText; lang: LangCode }) {
  const t = text.trip;
  const f = text.form;
  const [id, setId] = useState<TourId>("sea");
  const [booking, setBooking] = useState(false);
  const [date, setDate] = useState(isoDay(1));
  const [guests, setGuests] = useState(2);
  const tour = TRIP_TOURS.find((x) => x.id === id)!;
  const copy = t.tours[id];
  const pct = Math.round((1 - tour.price / tour.oldPrice) * 100);
  const total = Math.max(0, tour.price * guests - TRIP_VOUCHER.amount);

  const tabs = (
    <div className="bp-tabs" role="radiogroup" aria-label={t.formTitle}>
      {TRIP_TOURS.map((x) => (
        <button key={x.id} type="button" role="radio" aria-checked={id === x.id} className={id === x.id ? "on" : ""} onClick={() => setId(x.id)}>
          <Icon name={x.icon} size={20} /><span>{t.tours[x.id].tab}</span>
        </button>
      ))}
    </div>
  );

  return (
    <article className="bp-card bp-trip" aria-labelledby="bp-trip-title">
      <div className="bp-trip-photo"><img src={POPUP_IMAGES.trip} alt="" /></div>
      <div className="bp-frame" aria-hidden="true" />
      <Brand text={text.brand} />
      <p className="bp-seal" aria-label={`${t.badgeTop} ${pct}%`}>
        <small>{t.badgeTop}</small><b>{pct}%</b><small>{t.badgeBottom}</small>
      </p>

      <div className="bp-trip-body">
        <p className="bp-hand">{t.script}</p>
        <h3 id="bp-trip-title" key={id} className="bp-swap">{copy.title}</h3>
        <p className="bp-sub">{copy.desc}</p>
        {tabs}
        <p className="bp-trip-price">
          {text.from} <s>{money(tour.oldPrice, lang)}</s> <b>{money(tour.price, lang)}</b>{text.perGuest}
        </p>
        <p className="bp-code">{t.voucher} <b>{TRIP_VOUCHER.code}</b> −{kilo(TRIP_VOUCHER.amount)}</p>
        <Cta onClick={() => setBooking(true)}>{t.cta}</Cta>
      </div>

      {booking && (
        <BookingSheet text={text} title={t.formTitle} subtitle={`${copy.title} · ${copy.duration}`} onBack={() => setBooking(false)}
          fields={<>
            {tabs}
            <div className="bp-grid">
              <label><span>{f.date}</span><input type="date" min={isoDay()} value={date} onChange={(e) => setDate(e.target.value)} /></label>
              <label><span>{f.guests}</span><Stepper value={guests} onChange={setGuests} max={30} /></label>
            </div>
          </>}
          sum={[
            { label: `${money(tour.price, lang)} × ${guests}`, value: money(tour.price * guests, lang) },
            { label: `${f.voucher} ${TRIP_VOUCHER.code}`, value: "−" + money(TRIP_VOUCHER.amount, lang) },
            { label: f.total, value: money(total, lang), strong: true },
          ]}
          message={() => [
            `Tour: ${copy.title} (${copy.duration})`,
            `${f.date}: ${showDate(date, lang)}`,
            `${f.guests}: ${guests}`,
            `${f.voucher} ${TRIP_VOUCHER.code} −${kilo(TRIP_VOUCHER.amount)}`,
            `${f.total}: ${money(total, lang)}`,
          ]}
        />
      )}
    </article>
  );
}

/* ─── card 2: Homestay (curved photo, peach) ───────────────────────────────────────────────── */

function StayCard({ text, lang }: { text: BookingPopupText; lang: LangCode }) {
  const s = text.stay;
  const f = text.form;
  const [id, setId] = useState<RoomId>("double");
  const [booking, setBooking] = useState(false);
  const [checkIn, setCheckIn] = useState(isoDay(1));
  const [checkOut, setCheckOut] = useState(isoDay(1 + STAY_DEAL.nights));
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string>();
  const room = STAY_ROOMS.find((r) => r.id === id)!;
  const nights = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 864e5) || 0;
  const subtotal = Math.max(0, nights) * room.price;
  const off = nights >= STAY_DEAL.nights ? subtotal * STAY_DEAL.off : 0;
  const total = subtotal - off;

  const rooms = (
    <div className="bp-rooms" role="radiogroup" aria-label={s.formTitle}>
      {STAY_ROOMS.map((r) => (
        <button key={r.id} type="button" role="radio" aria-checked={id === r.id} className={id === r.id ? "on" : ""} onClick={() => { setId(r.id); setError(undefined); }}>
          <span>{s.rooms[r.id].short}</span><b>{kilo(r.price)}</b>
        </button>
      ))}
    </div>
  );

  return (
    <article className="bp-card bp-stay" aria-labelledby="bp-stay-title">
      <div className="bp-stay-photo">
        <img src={POPUP_IMAGES.stay} alt="" />
        <span className="bp-rating">★ {s.rating}</span>
      </div>
      <div className="bp-frame" aria-hidden="true" />
      <header className="bp-stay-head">
        <Icon name="leaf" size={22} />
        <span className="bp-brand">{text.brand}</span>
        <em>— {s.deal} {MONTH} —</em>
      </header>

      {/* Line-art palm leaves + sea wave behind the body */}
      <svg className="bp-stay-leaf" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M10 115C40 80 70 50 115 20M30 95c0-14 6-24 18-30M45 80c2-14 10-22 22-26M60 66c4-12 12-19 24-21M76 52c5-10 13-15 24-16M30 95c-12-2-20 0-26 6M45 80c-12-4-20-3-27 2M60 66c-11-5-20-5-27-1M76 52c-10-6-19-7-26-4" />
      </svg>
      <svg className="bp-stay-wave" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 30c40-18 80-18 120 0s80 18 120 0 80-18 120 0 30 10 40 6V60H0z" />
        <path d="M0 42c40-12 80-12 120 0s80 12 120 0 80-12 120 0 30 8 40 4V60H0z" />
      </svg>

      <div className="bp-stay-body">
        <h3 id="bp-stay-title">{s.title}<em>{s.script}</em></h3>
        <p className="bp-deal">
          <small>{s.stayFrom[0]}<br />{s.stayFrom[1]}</small>
          <b>−{Math.round(STAY_DEAL.off * 100)}%</b>
          <small>{s.allRooms[0]}<br />{s.allRooms[1]}</small>
        </p>
        {rooms}
        <Cta onClick={() => setBooking(true)}>{s.cta}</Cta>
      </div>

      {booking && (
        <BookingSheet text={text} title={s.formTitle} subtitle={`${s.rooms[id].name} · ≤${room.cap} ${f.guests.toLowerCase()}`}
          onBack={() => setBooking(false)} error={error}
          fields={<>
            {rooms}
            <div className="bp-grid">
              <label><span>{f.checkIn}</span>
                <input type="date" min={isoDay()} value={checkIn} onChange={(e) => {
                  const v = e.target.value;
                  setCheckIn(v); setError(undefined);
                  if (v && checkOut <= v) setCheckOut(addDays(v, 1));
                }} />
              </label>
              <label><span>{f.checkOut}</span>
                <input type="date" min={checkIn ? addDays(checkIn, 1) : isoDay(1)} value={checkOut} onChange={(e) => { setCheckOut(e.target.value); setError(undefined); }} />
              </label>
              <label className="bp-wide"><span>{f.guests}</span><Stepper value={guests} onChange={(n) => { setGuests(n); setError(undefined); }} max={10} /></label>
            </div>
          </>}
          sum={[
            { label: `${money(room.price, lang)} × ${Math.max(0, nights)} ${f.nights}`, value: money(subtotal, lang) },
            { label: f.dealLine, value: off ? "−" + money(off, lang) : "—" },
            { label: f.total, value: money(total, lang), strong: true },
          ]}
          message={() => {
            if (nights < 1) { setError(f.badDates); return null; }
            if (guests > room.cap) { setError(f.maxGuests.replace("{n}", String(room.cap))); return null; }
            return [
              `${s.rooms[id].name}`,
              `${f.checkIn}: ${showDate(checkIn, lang)} → ${f.checkOut}: ${showDate(checkOut, lang)} (${nights} ${f.nights})`,
              `${f.guests}: ${guests}`,
              `${f.total}: ${money(total, lang)}`,
            ];
          }}
        />
      )}
    </article>
  );
}

/* ─── card 3: Transfer (boarding pass) ─────────────────────────────────────────────────────── */

// Decorative barcode: fixed bar widths, laid out once
const BARS = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1].reduce<{ x: number; w: number }[]>((bars, n) => {
  const last = bars[bars.length - 1];
  return [...bars, { x: last ? last.x + last.w + 1.2 : 0, w: n * .8 }];
}, []);

function MoveCard({ text, lang }: { text: BookingPopupText; lang: LangCode }) {
  const m = text.move;
  const f = text.form;
  const [id, setId] = useState<TransferId>("airport");
  const [booking, setBooking] = useState(false);
  const [date, setDate] = useState(isoDay(1));
  const [time, setTime] = useState("09:00");
  const [guests, setGuests] = useState(2);
  const [stayGuest, setStayGuest] = useState(true);
  const svc = TRANSFERS.find((x) => x.id === id)!;
  const copy = m.services[id];
  const isFree = svc.freeable && stayGuest;
  const total = isFree ? 0 : svc.price * guests;

  const tabs = (
    <div className="bp-tabs bp-tabs-pill" role="radiogroup" aria-label={m.formTitle}>
      {TRANSFERS.map((x) => (
        <button key={x.id} type="button" role="radio" aria-checked={id === x.id} className={id === x.id ? "on" : ""} onClick={() => setId(x.id)}>
          <Icon name={x.icon} size={17} /><span>{m.services[x.id].tab}</span>
        </button>
      ))}
    </div>
  );

  return (
    <article className="bp-card bp-move" aria-labelledby="bp-move-title">
      <div className="bp-move-photo"><img src={POPUP_IMAGES.move} alt="" /></div>
      <header className="bp-move-head">
        <Brand text={text.brand} />
        <span className="bp-pass">{m.pass}</span>
      </header>
      <h3 id="bp-move-title" className="bp-move-title">{m.title}<em>{m.script}</em></h3>

      <div className="bp-route" key={id}>
        <p><b>{svc.from}</b><small>{copy.fromName}</small></p>
        <p className="bp-leg"><i><Icon name={svc.icon} size={18} /></i><small>{copy.leg}</small></p>
        <p><b>{svc.to}</b><small>{copy.toName}</small></p>
      </div>

      <div className="bp-move-body">
        {tabs}
        <dl className="bp-facts">
          <div><dt>{m.vehicle}</dt><dd>{copy.vehicle}</dd></div>
          <div><dt>{m.time}</dt><dd>{copy.time}</dd></div>
          <div><dt>{m.price}</dt><dd>{money(svc.price, lang)}</dd></div>
        </dl>
        <div className="bp-tear" aria-hidden="true" />
        <div className="bp-stub">
          <div>
            <small>{svc.freeable ? m.freeKicker : m.ferryKicker}</small>
            <b>{svc.freeable ? m.free : money(svc.price, lang)}</b>
            <span>{svc.freeable ? m.freeNote : m.ferryNote}</span>
          </div>
          <svg className="bp-barcode" viewBox="0 0 60 40" aria-hidden="true">
            {BARS.map((b, i) => <rect key={i} x={b.x} y="0" width={b.w} height="40" />)}
          </svg>
        </div>
        <Cta onClick={() => setBooking(true)}>{svc.freeable ? m.cta : m.ctaFerry}</Cta>
      </div>

      {booking && (
        <BookingSheet text={text} title={m.formTitle} subtitle={copy.name} onBack={() => setBooking(false)}
          fields={<>
            {tabs}
            <div className="bp-grid bp-grid-3">
              <label><span>{f.date}</span><input type="date" min={isoDay()} value={date} onChange={(e) => setDate(e.target.value)} /></label>
              <label><span>{f.time}</span><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
              <label><span>{f.guests}</span><Stepper value={guests} onChange={setGuests} max={30} /></label>
            </div>
            {svc.freeable && (
              <label className="bp-check"><input type="checkbox" checked={stayGuest} onChange={(e) => setStayGuest(e.target.checked)} />{f.stayGuest}</label>
            )}
          </>}
          sum={[
            { label: `${money(svc.price, lang)} × ${guests}`, value: money(svc.price * guests, lang) },
            { label: f.stayFree, value: isFree ? "−" + money(svc.price * guests, lang) : "—" },
            { label: f.total, value: isFree ? f.freeTotal : money(total, lang), strong: true },
          ]}
          message={() => [
            copy.name,
            `${f.date}: ${showDate(date, lang)} – ${time}`,
            `${f.guests}: ${guests}`,
            svc.freeable && stayGuest ? f.stayGuest : "",
            `${f.total}: ${isFree ? f.freeTotal : money(total, lang)}`,
          ].filter(Boolean)}
        />
      )}
    </article>
  );
}

/* ─── container: three cards side by side (swipe carousel on phones) + on/off launcher ─────── */

/** Is the popup switched on for this visit? (config flag, `?popup=off` turns it off) */
function popupEnabled() {
  const q = new URLSearchParams(location.search).get("popup");
  return BOOKING_POPUPS.enabled && q !== "off" && q !== "0";
}

export function BookingPopups() {
  const { lang } = useI18n();
  const text = bookingPopupText(lang);
  const [enabled] = useState(popupEnabled);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Auto-open after the delay, once per session unless ?popup is in the URL
  useEffect(() => {
    if (!enabled) return;
    const forced = new URLSearchParams(location.search).has("popup");
    if (!BOOKING_POPUPS.autoOpen && !forced) return;
    let seen = false;
    try { seen = BOOKING_POPUPS.oncePerSession && sessionStorage.getItem(BOOKING_POPUPS.storageKey) === "1"; } catch { /* storage blocked */ }
    if (seen && !forced) return;
    const timer = setTimeout(() => setOpen(true), BOOKING_POPUPS.delay);
    return () => clearTimeout(timer);
  }, [enabled]);

  const close = useCallback(() => {
    setOpen(false);
    try { sessionStorage.setItem(BOOKING_POPUPS.storageKey, "1"); } catch { /* storage blocked */ }
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => { lockScroll(false); document.removeEventListener("keydown", onKey); };
  }, [open, close]);

  // The cards are drawn at a fixed 340 × 505 size: zoom the row down when the screen is smaller than that
  const row = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = row.current;
    if (!el || !open) return;
    const fit = () => {
      const phone = innerWidth <= 760;
      const byH = (innerHeight - (phone ? 96 : 110)) / 505;
      const byW = phone ? (innerWidth - 48) / 340 : (innerWidth - 120) / (340 * 3 + 28 * 2);
      el.style.setProperty("--z", Math.max(.55, Math.min(1, byH, byW)).toFixed(3));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open]);

  // Phones: dots follow the swipe
  const onScroll = () => {
    const el = row.current;
    if (!el) return;
    const cards = [...el.children] as HTMLElement[];
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    cards.forEach((c, i) => { if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid)) best = i; });
    setActive(best);
  };
  const goTo = (i: number) => {
    const c = row.current?.children[i] as HTMLElement | undefined;
    c?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  if (!enabled) return null;

  return (
    <>
      <div
        className={"popup bp-popup" + (open ? " show" : "")}
        role="dialog" aria-modal="true" aria-label={text.carousel} aria-hidden={!open} inert={!open || undefined}
        onClick={(e) => { if (e.target === e.currentTarget || (e.target as Element).classList.contains("bp-row")) close(); }}
      >
        <button type="button" className="bp-x" onClick={close} aria-label={text.close}><Close /></button>
        <div className="bp-row" ref={row} onScroll={onScroll} data-lenis-prevent>
          {[TripCard, StayCard, MoveCard].map((Card, i) => (
            <div key={i} className="bp-slot" style={{ "--i": i } as CSSProperties}>
              <Card text={text} lang={lang} />
            </div>
          ))}
        </div>
        <div className="bp-dots" role="tablist" aria-label={text.carousel}>
          {[text.trip.script, text.stay.cta, text.move.cta].map((label, i) => (
            <button key={i} type="button" role="tab" aria-selected={active === i} aria-label={label} className={active === i ? "on" : ""} onClick={() => goTo(i)} />
          ))}
        </div>
      </div>

      {BOOKING_POPUPS.launcher && !open && (
        <button type="button" className="bp-launcher" onClick={() => setOpen(true)} aria-label={text.launcherLong}>
          <i className="d1" /><i className="d2" /><i className="d3" />
          <span className="long">{text.launcherLong}</span><span className="short">{text.launcher}</span>
        </button>
      )}
    </>
  );
}

