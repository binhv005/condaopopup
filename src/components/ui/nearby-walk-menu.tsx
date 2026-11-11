/**
 * Nearby Walk – Côn Đảo edition.
 * Based on "Nearby Walk", designed & built by Aakash Mehra (aakashmehra.com); the scene is redrawn for
 * ConDaoTrip: from the homestay (left, foreground) along the seafront to Pier 914, the Governor's Mansion,
 * Côn Đảo Market, Phú Hải Prison and up the hill to the Hàng Dương memorial among casuarina trees.
 *
 * Landmarks rise in one after another when the scene comes into view, walkers follow the route, and
 * hovering (or focusing, or tapping) a landmark bounces it and swaps its walking time for the
 * straight-line distance. The drawing scales with its width (viewBox 1200 × 300).
 *
 * Colours are CSS variables on the root (see THEMES): --nw-page/--nw-page2, --nw-bg/--nw-bg2, --nw-ink,
 * --nw-wall, --nw-roof, --nw-stone, --nw-hill, --nw-sea, --nw-leaf, --nw-win, --nw-sun, --nw-cloud(-line),
 * --nw-beacon, --nw-glow, --nw-route, --nw-walker, --nw-pin(-text), --nw-fg, --nw-muted, --nw-stroke, --nw-thin.
 */
import { useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Built-in drawings */
export type NearbyPlaceId = "pier" | "governor" | "market" | "prison" | "memorial";

/** A landmark on the walk. */
export type NearbyPlace = {
  /** Which built-in drawing to use. Unknown ids are skipped. */
  id: NearbyPlaceId | (string & {});
  /** Label shown above the drawing. */
  name: string;
  /** Straight-line distance in km (shown on hover). */
  km: number;
  /** Walking time in minutes (shown by default). */
  walkMinutes: number;
};

export type NearbyWalkProps = {
  places?: NearbyPlace[];
  /** Name on the pin above the homestay. The pin grows to fit it. */
  origin?: string;
  formatDistance?: (km: number) => string;
  formatWalk?: (minutes: number) => string;
  ariaLabel?: string;
  /** Small line centred above the drawing. Pass null to hide it. */
  hint?: string | null;
  /** Colour theme (controlled). Leave unset to let the dots switch it. */
  theme?: NearbyWalkTheme;
  defaultTheme?: NearbyWalkTheme;
  onThemeChange?: (theme: NearbyWalkTheme) => void;
  /** Show the theme dots under the scene. Default true. */
  showThemes?: boolean;
  /** Soft light and a short trail that follow the pointer. Mouse/pen only, off with reduced motion. */
  cursorEffect?: boolean;
  /** Highlighted landmark id (controlled), e.g. to sync with a photo list outside the scene. */
  active?: string | null;
  /** Called with the landmark id (or null) whenever the highlight changes. */
  onActiveChange?: (id: string | null) => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

// Each theme: a label, the dot colour, and the CSS variables (without the --nw- prefix).
export const THEMES = {
  // ConDaoTrip brand: tropical green lines, terracotta roofs, sand and sea
  day: {
    label: "Day",
    dot: "linear-gradient(#bfe3df, #f3d58a)",
    vars: {
      page: "#faf7f1", page2: "#f3ede1", bg: "#ffffff", bg2: "#e6f3f0",
      wall: "#ffffff", ink: "#0f3a2e", roof: "#b5561d", stone: "#efe6d2", hill: "#dbe8dc",
      sea: "#bfe3df", leaf: "#9cc7a4", win: "#eef2ef", cloud: "#ffffff", "cloud-line": "#b6c7bf",
      sun: "#f3d58a", beacon: "#f3b54a", fg: "#0f3a2e", muted: "#56695f",
      pin: "#0e823d", "pin-text": "#ffffff", walker: "#b5561d", route: "#0f3a2e", ground: "#0f3a2e",
      lamp: "#ffe3a070", lamp2: "#ffffff00", trail: "#0f3a2e70", glow: "#f3b54a00", shadow: "#0f3a2e40",
      stroke: "1.8", thin: "1.2",
    },
  },
  // Golden hour over An Hải bay
  sunset: {
    label: "Sunset",
    dot: "linear-gradient(#c9c5de, #fbc8a0)",
    vars: {
      page: "#f6e2d3", page2: "#efc9b2", bg: "#fdd4b2", bg2: "#c9c5de",
      wall: "#fffaf5", ink: "#2f2a3a", roof: "#b5561d", stone: "#f3dcc0", hill: "#c48b78",
      sea: "#e7b49b", leaf: "#a9a06a", win: "#f4e6da", cloud: "#fde4cc", "cloud-line": "#e3a985",
      sun: "#ffb547", beacon: "#f2711c", fg: "#3d2418", muted: "#74503f",
      pin: "#b5561d", "pin-text": "#fff3e0", walker: "#e0553b", route: "#c9472f", ground: "#7a4a3a",
      lamp: "#ffd08a85", lamp2: "#ffb54730", trail: "#e0553ba0", glow: "#f2711c", shadow: "#7a3b2a52",
      stroke: "1.8", thin: "1.2",
    },
  },
  // Warm windows and lamps along the seafront at night
  night: {
    label: "Night",
    dot: "#12302a",
    vars: {
      page: "#0b1a17", page2: "#0b1a17", bg: "#10241f", bg2: "#0c1c26",
      wall: "#16302a", ink: "#d8eadf", roof: "#c97b4f", stone: "#22403a", hill: "#1c3832",
      sea: "#123a40", leaf: "#2f5a48", win: "#22403a", cloud: "#1d3530", "cloud-line": "#4c6a62",
      sun: "#ffc861", beacon: "#ffc861", fg: "#eef6f1", muted: "#9db8ad",
      pin: "#ffc861", "pin-text": "#0b1a17", walker: "#ffc861", route: "#d8eadf", ground: "#d8eadf",
      lamp: "#ffd27a2a", lamp2: "#ffcf7a66", trail: "#ffc861b0", glow: "#ffc861", shadow: "#00000099",
      stroke: "1.8", thin: "1.2",
    },
  },
};
export type NearbyWalkTheme = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as NearbyWalkTheme[];
/** The theme as inline CSS variables, e.g. to colour a panel around the scene to match. */
export const nearbyWalkVars = (t: NearbyWalkTheme) =>
  Object.fromEntries(Object.entries(THEMES[t].vars).map(([k, v]) => [`--nw-${k}`, v])) as CSSProperties;

// Approximate distances from the centre of Côn Sơn town (straight line km, walking minutes)
export const DEFAULT_PLACES: NearbyPlace[] = [
  { id: "pier", name: "Cầu tàu 914", km: 0.6, walkMinutes: 8 },
  { id: "governor", name: "Dinh Chúa Đảo", km: 0.5, walkMinutes: 7 },
  { id: "market", name: "Chợ Côn Đảo", km: 0.9, walkMinutes: 12 },
  { id: "prison", name: "Nhà tù Phú Hải", km: 1.0, walkMinutes: 13 },
  { id: "memorial", name: "Nghĩa trang Hàng Dương", km: 1.8, walkMinutes: 24 },
];

const W = 1200;

// Walking route from the homestay door along the seafront and up the hill to the memorial
const ROUTE = "M100 262 C100 274 112 279 130 279 L870 279 C910 279 938 262 960 236 C986 204 1030 178 1076 174";

// Per landmark: stagger step, hit box (x y w h) and label (x y anchor)
const LAYOUT: Record<string, { i: number; hit: [number, number, number, number]; lbl: [number, number, "middle" | "end"] }> = {
  pier: { i: 1, hit: [196, 128, 142, 136], lbl: [267, 148, "middle"] },
  governor: { i: 2, hit: [348, 112, 172, 152], lbl: [434, 124, "middle"] },
  market: { i: 3, hit: [552, 128, 136, 136], lbl: [620, 146, "middle"] },
  prison: { i: 4, hit: [716, 118, 178, 146], lbl: [800, 136, "middle"] },
  memorial: { i: 5, hit: [954, 40, 200, 224], lbl: [1058, 84, "end"] },
};

const d = (i: number) => ({ "--d": `${i * 120}ms` }) as CSSProperties;
const tw = (s: number) => ({ "--tw": `${s}s` }) as CSSProperties;

// ---- Drawings (ground line at y = 262)

/** Cầu tàu 914: a long timber pier on piles over the bay, with old lamp posts */
function Pier() {
  return (
    <>
      <path className="nw-sea" d="M196 262V247Q214 241 232 247T268 247T304 247T340 247V262Z" />
      <path className="nw-thin" d="M204 254Q214 250 224 254M262 256Q272 252 282 256M300 252Q310 248 320 252" />
      {[214, 238, 262, 286, 310].map((x) => <path key={x} className="nw-line" d={`M${x} 232V262`} />)}
      <rect className="nw-wall" x="204" y="226" width="124" height="6" rx="1" />
      <path className="nw-thin" d="M204 214H328M216 214V226M240 214V226M264 214V226M288 214V226M312 214V226" />
      {[222, 314].map((x, i) => (
        <g key={x}>
          <path className="nw-line" d={`M${x} 226V188`} />
          <path className="nw-roof" d={`M${x - 5} 186H${x + 5}L${x + 2} 181H${x - 2}Z`} />
          <circle className="nw-bulb nw-tw" style={tw(i * 0.8)} cx={x} cy={190} r="2.6" />
        </g>
      ))}
      <rect className="nw-stone" x="252" y="196" width="30" height="14" rx="2" />
      <path className="nw-line" d="M258 210V214M276 210V214" />
      <text className="nw-sign" x="267" y="206.5" textAnchor="middle">914</text>
    </>
  );
}

/** Dinh Chúa Đảo: French colonial mansion, arched veranda, hipped tile roof, flag */
function Governor() {
  const xs = [372, 394, 416, 438, 460, 482];
  return (
    <>
      <rect className="nw-stone" x="352" y="252" width="164" height="10" />
      <rect className="nw-wall" x="362" y="196" width="144" height="56" />
      <path className="nw-thin" d="M362 220H506" />
      {xs.map((x, i) => (
        <rect key={`w${x}`} className={i === 2 ? "nw-lit nw-tw" : "nw-win"} style={tw(i * 0.5)} x={x} y="202" width="12" height="12" rx="1.5" />
      ))}
      {xs.map((x) => <path key={`a${x}`} className="nw-win" d={`M${x - 2} 252V236Q${x + 6} 226 ${x + 14} 236V252Z`} />)}
      <path className="nw-roof" d="M354 196L380 172H488L514 196Z" />
      <path className="nw-wall" d="M414 196L434 180L454 196Z" />
      <circle className="nw-thin" cx="434" cy="189" r="3" />
      <path className="nw-line" d="M434 180V146" />
      <path className="nw-flag" d="M434 146H454L449 151.5L454 157H434Z" />
    </>
  );
}

/** Chợ Côn Đảo: a gabled market hall with striped awnings and fruit on the stalls */
function Market() {
  return (
    <>
      <rect className="nw-wall" x="562" y="206" width="116" height="56" />
      <path className="nw-roof" d="M552 210L620 168L688 210Z" />
      <path className="nw-thin" d="M572 204L620 174L668 204" />
      <rect className="nw-stone" x="592" y="212" width="56" height="12" rx="2" />
      <path className="nw-thin" d="M600 218H640" />
      {[566, 604, 642].map((x, i) => (
        <g key={x}>
          <path className={i === 1 ? "nw-awning2" : "nw-awning"} d={`M${x} 230H${x + 32}L${x + 28} 240H${x + 4}Z`} />
          <path className="nw-thin" d={`M${x + 11} 230L${x + 10} 240M${x + 21} 230L${x + 22} 240`} />
          <rect className="nw-stone" x={x + 4} y="250" width="24" height="12" />
          {[0, 1, 2].map((k) => <circle key={k} className="nw-lit" cx={x + 10 + k * 6} cy={247} r="2.6" />)}
        </g>
      ))}
    </>
  );
}

/** Nhà tù Phú Hải: the long prison wall with its gate, cell-block roofs behind and a watchtower */
function Prison() {
  const wire = Array.from({ length: 21 }, (_, k) => `M${724 + k * 8} 209l3 -4l3 4`).join("");
  return (
    <>
      <path className="nw-stone" d="M730 214L744 198H790L800 214Z" />
      <path className="nw-stone" d="M812 214L822 198H850L858 214Z" />
      <rect className="nw-stone" x="722" y="214" width="168" height="48" />
      <path className="nw-thin" d="M722 228H784M826 228H890M722 245H784M826 245H890" />
      <path className="nw-thin" d={wire} />
      <rect className="nw-wall" x="780" y="198" width="50" height="18" />
      <path className="nw-thin" d="M788 207H822" />
      <path className="nw-door" d="M790 262V238Q805 224 820 238V262Z" />
      <path className="nw-line" d="M864 214L866 182M882 214L880 182M865 198H881" />
      <rect className="nw-wall" x="858" y="168" width="30" height="14" />
      <rect className="nw-lit nw-tw" style={tw(1.2)} x="866" y="172" width="14" height="6" />
      <path className="nw-roof" d="M852 168L873 154L894 168Z" />
    </>
  );
}

/** Nghĩa trang Hàng Dương: the memorial on the hill among casuarina ("hàng dương") trees */
function Memorial() {
  const tree = (x: number, base: number, h: number) => (
    <g key={x}>
      <path className="nw-line" d={`M${x} ${base}V${base - 8}`} />
      <path className="nw-leaf" d={`M${x} ${base - h}Q${x + 11} ${base - h * 0.45} ${x + 9} ${base - 8}H${x - 9}Q${x - 11} ${base - h * 0.45} ${x} ${base - h}Z`} />
    </g>
  );
  return (
    <>
      <path className="nw-hill" d="M900 262C970 215 1030 169 1082 172C1130 175 1170 230 1200 262Z" />
      {tree(996, 208, 46)}
      {tree(1024, 190, 54)}
      {tree(1124, 190, 52)}
      {tree(1152, 210, 44)}
      <rect className="nw-stone" x="1056" y="164" width="40" height="8" />
      <rect className="nw-stone" x="1062" y="156" width="28" height="8" />
      <path className="nw-wall" d="M1068 156L1072 76H1080L1084 156Z" />
      <path className="nw-thin" d="M1076 82V150M1071 110H1081" />
      <path className="nw-line" d="M1072 76L1076 68L1080 76" />
      <circle className="nw-ring" cx="1076" cy="64" r="3" />
      <circle className="nw-beacon" cx="1076" cy="64" r="3" />
    </>
  );
}

/** The homestay: terracotta roof, veranda with string lights, a coconut palm */
function Homestay() {
  return (
    <>
      <path className="nw-line" d="M30 262Q22 214 42 168" />
      {["M42 168Q22 156 8 168", "M42 168Q30 146 14 144", "M42 168Q50 142 70 140", "M42 168Q64 154 78 166", "M42 168Q46 150 40 134"].map((p) => (
        <path key={p} className="nw-leafline" d={p} />
      ))}
      <rect className="nw-wall" x="52" y="182" width="116" height="80" />
      <path className="nw-roof" d="M42 186L110 146L178 186Z" />
      <path className="nw-thin" d="M66 172L110 152L154 172" />
      {[64, 132].map((x, i) => (
        <rect key={x} className={i === 0 ? "nw-lit nw-tw" : "nw-win"} style={tw(0.6)} x={x} y="196" width="22" height="16" rx="2" />
      ))}
      <path className="nw-thin" d="M52 222H168M60 222V262M160 222V262" />
      <path className="nw-thin" d="M52 206Q110 218 168 206" />
      {[64, 80, 96, 112, 128, 144, 158].map((x, i) => (
        <circle key={x} className="nw-bulb nw-tw" style={tw(i * 0.35)} cx={x} cy={206 + 6 * Math.sin((Math.PI * (x - 52)) / 116)} r="2.2" />
      ))}
      <rect className="nw-door" x="87" y="230" width="26" height="32" rx="3" />
      <path className="nw-thin" d="M66 240H82V256H66ZM138 240H154V256H138Z" />
    </>
  );
}

const DRAW: Record<string, () => JSX.Element> = { pier: Pier, governor: Governor, market: Market, prison: Prison, memorial: Memorial };

/** Line-drawing walk from the homestay (left) to the Hàng Dương memorial (right), with hoverable landmarks. */
export function NearbyWalk({
  places = DEFAULT_PLACES,
  origin = "ConDaoTrip",
  formatDistance = (km) => `${km.toFixed(1)} km`,
  formatWalk = (min) => `${min} min walk`,
  ariaLabel,
  hint = "Hover a place to see how far it is",
  theme,
  defaultTheme = "day",
  onThemeChange,
  showThemes = true,
  cursorEffect = true,
  active: activeProp,
  onActiveChange,
  children,
  className,
  style,
}: NearbyWalkProps) {
  const [ownTheme, setOwnTheme] = useState(defaultTheme);
  const current = theme ?? ownTheme;
  const pick = (t: NearbyWalkTheme) => {
    if (theme === undefined) setOwnTheme(t);
    onThemeChange?.(t);
  };
  const ref = useRef<HTMLDivElement | null>(null);
  const list = places.filter((p) => DRAW[p.id]);

  // Plays when it comes into view and resets once fully out of view, so it replays.
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    setArmed(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.3) setShown(true);
        else if (!e.isIntersecting) setShown(false);
      },
      { threshold: [0, 0.3] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Hover, keyboard focus or a tap picks a landmark: it bounces and shows its distance.
  const [ownActive, setOwnActive] = useState<string | null>(null);
  const active = activeProp !== undefined ? activeProp : ownActive;
  const setActive = (next: string | null) => {
    if (activeProp === undefined) setOwnActive(next);
    onActiveChange?.(next);
  };
  const touch = useRef(false);
  const off = (id: string) => active === id && setActive(null);
  const toggle = (id: string) => setActive(active === id ? null : id);

  // The origin pin grows to fit its label, never narrower than 120.
  const pinText = useRef<SVGTextElement | null>(null);
  const [pinW, setPinW] = useState(120);
  useEffect(() => {
    const fit = () => pinText.current && setPinW(Math.max(120, Math.ceil(pinText.current.getComputedTextLength()) + 28));
    fit();
    document.fonts?.ready.then(fit);
  }, [origin]);

  // Cursor light and trail: one rAF loop writing CSS variables and transforms; sleeps when idle.
  useEffect(() => {
    const card = ref.current;
    if (!cursorEffect || !card || !matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    const dots = Array.from(card.querySelectorAll(".nw-dot")) as HTMLElement[];
    const hist: number[][] = [];
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, idle = 0, inside = false;
    const tick = () => {
      const dx = tx - x, dy = ty - y;
      x += dx * 0.2;
      y += dy * 0.2;
      hist.unshift([x, y]);
      hist.length = Math.min(hist.length, dots.length * 2);
      const [ox, oy] = hist[hist.length - 1];
      const spread = Math.hypot(x - ox, y - oy);
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
      card.style.setProperty("--nw-trail-o", String(Math.min(1, spread / 50)));
      dots.forEach((dot, k) => {
        const [px, py] = hist[Math.min(k * 2, hist.length - 1)];
        dot.style.transform = `translate3d(${px}px,${py}px,0) scale(${1 - (k / dots.length) * 0.6})`;
      });
      idle = Math.abs(dx) + Math.abs(dy) < 0.3 && spread < 0.5 ? idle + 1 : 0;
      raf = idle > 2 ? 0 : requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = card.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!inside) {
        inside = true;
        x = tx;
        y = ty;
        hist.length = 0;
        card.dataset.lamp = "";
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => {
      inside = false;
      delete card.dataset.lamp;
    };
    card.addEventListener("pointermove", move, { passive: true });
    card.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
    };
  }, [cursorEffect]);

  return (
    <section
      data-nearby-walk=""
      data-armed={armed || undefined}
      data-shown={shown || undefined}
      className={cn("flex w-full flex-col items-center justify-center gap-5 px-4 py-12 font-sans text-[var(--nw-fg)]", className)}
      style={{ ...nearbyWalkVars(current), ...style }}
    >
      <style>{CSS}</style>
      {hint && <p className="m-0 text-center text-[13.5px] leading-5 font-medium tracking-[0.01em] text-[var(--nw-muted)]">{hint}</p>}
      <div ref={ref} className="nw-card relative isolate w-full max-w-[1240px] overflow-hidden rounded-[28px] px-[2.5%] pt-6 pb-5">
        {cursorEffect && <div className="nw-fx nw-lamp" aria-hidden="true" />}
        <svg
          className="relative z-[1] block h-auto w-full overflow-visible"
          viewBox={`0 0 ${W} 300`}
          role="group"
          aria-label={ariaLabel ?? `${origin}: ${list.map((p) => p.name).join(", ")}`}
        >
          {/* sky: sun, drifting clouds, a pair of gulls */}
          <g aria-hidden="true">
            <circle className="nw-sunball" cx="560" cy="58" r="17" />
            <path className="nw-cloud nw-cloudA" d="M860 58a14 14 0 0 1 26-6a11 11 0 0 1 19 8h-45z" />
            <path className="nw-cloud nw-cloudB" d="M330 44a16 16 0 0 1 30-7a12 12 0 0 1 21 9h-51z" />
            <path className="nw-thin nw-gull" d="M466 86q5 -5 10 0q5 -5 10 0M492 74q4 -4 8 0q4 -4 8 0" />
          </g>

          {list.map((p) => {
            const { i, hit, lbl } = LAYOUT[p.id];
            const Draw = DRAW[p.id];
            const [lx, ly, anchor] = lbl;
            const on = active === p.id;
            const walk = formatWalk(p.walkMinutes);
            const dist = formatDistance(p.km);
            return (
              <g
                key={p.id}
                className="nw-spot"
                tabIndex={0}
                role="button"
                aria-label={`${p.name}, ${walk}, ${dist}`}
                aria-pressed={on}
                data-active={on || undefined}
                onPointerDown={(e) => (touch.current = e.pointerType !== "mouse")}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.id)}
                onPointerLeave={(e) => e.pointerType === "mouse" && off(p.id)}
                onClick={() => touch.current && toggle(p.id)}
                onFocus={(e) => e.currentTarget.matches(":focus-visible") && setActive(p.id)}
                onBlur={() => off(p.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle(p.id))}
              >
                <rect className="nw-hit" x={hit[0]} y={hit[1]} width={hit[2]} height={hit[3]} />
                <g className="nw-bob">
                  <g className={cn("nw-rise", p.id === "memorial" && "nw-far")} style={d(i)}>
                    <Draw />
                  </g>
                </g>
                <g className="nw-lbl" style={d(i)}>
                  <text x={lx} y={ly} textAnchor={anchor} className="nw-name">{p.name}</text>
                  <text x={lx} y={ly + 16} textAnchor={anchor} className="nw-dist nw-km">{dist}</text>
                  <text x={lx} y={ly + 16} textAnchor={anchor} className="nw-dist nw-walk">{walk}</text>
                </g>
              </g>
            );
          })}

          {/* the homestay (foreground), with a pin carrying its name */}
          <g className="nw-rise" style={d(0)}>
            <Homestay />
            <g className="nw-pin">
              <rect x={100 - pinW / 2} y="96" width={pinW} height="26" rx="13" />
              <path d="M94 122L100 130L106 122Z" />
              <text ref={pinText} x="100" y="114" textAnchor="middle">{origin}</text>
            </g>
          </g>

          <path className="nw-ground" d={`M0 262H${W}`} />
          <path className="nw-route" d={ROUTE} />
          <circle className="nw-walker" r="4" style={{ offsetPath: `path("${ROUTE}")` }} />
          <circle className="nw-walker nw-walker2" r="4" style={{ offsetPath: `path("${ROUTE}")` }} />
        </svg>
        {cursorEffect && (
          <>
            <div className="nw-fx nw-lamp2" aria-hidden="true" />
            <div className="nw-fx nw-trail" aria-hidden="true">
              {Array.from({ length: 10 }, (_, k) => (
                <span key={k} className="nw-dot" style={{ opacity: `calc(var(--nw-trail-o, 0) * ${1 - k / 10})` }} />
              ))}
            </div>
          </>
        )}
      </div>
      {showThemes && <ThemeDots value={current} onChange={pick} />}
      {children}
    </section>
  );
}

/** The theme switcher dots, usable on their own next to a controlled NearbyWalk. */
export function ThemeDots({ value, onChange, labels, className }: {
  value: NearbyWalkTheme;
  onChange: (t: NearbyWalkTheme) => void;
  /** Optional translated names per theme */
  labels?: Partial<Record<NearbyWalkTheme, string>>;
  className?: string;
}) {
  return (
    <div role="group" aria-label="Colour theme" className={cn("flex justify-center gap-2.5", className)}>
      {THEME_IDS.map((t) => {
        const name = labels?.[t] ?? THEMES[t].label;
        return (
          <button
            key={t}
            type="button"
            aria-label={name}
            aria-pressed={value === t}
            title={name}
            onClick={() => onChange(t)}
            className={cn(
              "grid size-7 cursor-pointer place-items-center rounded-full outline-none transition-shadow duration-300",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nw-ink)]",
              value === t && "shadow-[0_0_0_1.5px_var(--nw-ink)]",
            )}
          >
            <span
              className="size-4 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.18)] transition-transform duration-200 hover:scale-110"
              style={{ background: THEMES[t].dot }}
            />
          </button>
        );
      })}
    </div>
  );
}

export default NearbyWalk;

// Scoped to [data-nearby-walk]; keyframes prefixed nw-. The colour variables are registered with
// @property so a theme switch crossfades every fill and stroke that uses them.
const VARS = Object.keys(THEMES.day.vars);
const NUMS = ["stroke", "thin"];
const CSS = `
${VARS.map((k) =>
  NUMS.includes(k)
    ? `@property --nw-${k}{syntax:"<number>";inherits:true;initial-value:1.8}`
    : `@property --nw-${k}{syntax:"<color>";inherits:true;initial-value:transparent}`,
).join("\n")}
[data-nearby-walk]{background:linear-gradient(var(--nw-page),var(--nw-page2))}
[data-nearby-walk]{--nw-ease:cubic-bezier(0.22,1,0.36,1);transition:${VARS.map((k) => `--nw-${k} .6s ease`).join(",")}}
[data-nearby-walk] .nw-card{background:linear-gradient(var(--nw-bg2),var(--nw-bg) 82%);box-shadow:0 0 0 1px color-mix(in srgb,var(--nw-ink) 7%,transparent),0 30px 60px -20px var(--nw-shadow)}
[data-nearby-walk] .nw-card{--mx:-999px;--my:-999px}
[data-nearby-walk] .nw-fx{display:none;position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .45s ease}
@media (hover:hover) and (prefers-reduced-motion:no-preference){[data-nearby-walk] .nw-fx{display:block}}
[data-nearby-walk] .nw-card[data-lamp] .nw-fx{opacity:1}
[data-nearby-walk] .nw-lamp{z-index:0;background:radial-gradient(220px circle at var(--mx) var(--my),var(--nw-lamp),transparent 70%)}
[data-nearby-walk] .nw-lamp2{z-index:2;mix-blend-mode:soft-light;background:radial-gradient(160px circle at var(--mx) var(--my),var(--nw-lamp2),transparent 70%)}
[data-nearby-walk] .nw-trail{z-index:2}
[data-nearby-walk] .nw-dot{position:absolute;left:-3.5px;top:-3.5px;width:7px;height:7px;border-radius:50%;background:var(--nw-trail);will-change:transform}
[data-nearby-walk] .nw-spot{cursor:pointer;outline:none}
[data-nearby-walk] .nw-hit{fill:transparent;pointer-events:all}
[data-nearby-walk] .nw-spot>:not(.nw-hit){pointer-events:none}
[data-nearby-walk] .nw-spot:focus-visible .nw-name{text-decoration:underline;text-underline-offset:3px}
[data-nearby-walk] .nw-bob{transform-box:fill-box;transform-origin:center bottom}
[data-nearby-walk] .nw-km,[data-nearby-walk] .nw-walk{transition:opacity .3s var(--nw-ease),filter .3s var(--nw-ease)}
[data-nearby-walk] .nw-km,[data-nearby-walk] .nw-spot[data-active] .nw-walk{opacity:0;filter:blur(3px)}
[data-nearby-walk] .nw-spot[data-active] .nw-km{opacity:1;filter:none}
[data-nearby-walk] .nw-spot[data-active] .nw-name{fill:var(--nw-ink)}
[data-nearby-walk] :is(.nw-line,.nw-thin,.nw-wall,.nw-stone,.nw-roof,.nw-hill,.nw-lit,.nw-win,.nw-door,.nw-ground,.nw-leaf,.nw-leafline,.nw-flag,.nw-awning,.nw-awning2,.nw-sunball){stroke:var(--nw-ink);stroke-width:var(--nw-stroke);stroke-linejoin:round;stroke-linecap:round}
[data-nearby-walk] :is(.nw-line,.nw-thin){fill:none}
[data-nearby-walk] .nw-thin{stroke-width:var(--nw-thin)}
[data-nearby-walk] .nw-wall{fill:var(--nw-wall)}
[data-nearby-walk] .nw-stone{fill:var(--nw-stone)}
[data-nearby-walk] :is(.nw-roof,.nw-door,.nw-flag,.nw-awning){fill:var(--nw-roof)}
[data-nearby-walk] .nw-awning2{fill:var(--nw-sun)}
[data-nearby-walk] .nw-hill{fill:var(--nw-hill);stroke:none}
[data-nearby-walk] .nw-sea{fill:var(--nw-sea);stroke:none}
[data-nearby-walk] .nw-leaf{fill:var(--nw-leaf)}
[data-nearby-walk] .nw-leafline{fill:none;stroke-width:calc(var(--nw-stroke) + 1.2)}
[data-nearby-walk] .nw-sunball{fill:var(--nw-sun);stroke-width:var(--nw-thin)}
[data-nearby-walk] .nw-sign{fill:var(--nw-ink);font-size:9px;font-weight:700;letter-spacing:.06em}
[data-nearby-walk] .nw-win{fill:var(--nw-win);stroke-width:var(--nw-thin)}
[data-nearby-walk] .nw-lit{fill:var(--nw-sun);stroke-width:var(--nw-thin)}
[data-nearby-walk] .nw-far{opacity:.8}
[data-nearby-walk] .nw-bulb{fill:var(--nw-sun);stroke:var(--nw-ink);stroke-width:.8}
[data-nearby-walk] .nw-ground{fill:none;stroke:var(--nw-ground);stroke-width:calc(var(--nw-stroke) + .2);stroke-dasharray:1200}
[data-nearby-walk] .nw-route{fill:none;stroke:var(--nw-route);stroke-width:1.6;stroke-linecap:round;stroke-dasharray:2 9;opacity:.55}
[data-nearby-walk] .nw-walker{display:none;fill:var(--nw-walker);stroke:var(--nw-bg);stroke-width:1.5}
@supports (offset-path:path("M0 0")){[data-nearby-walk] .nw-walker{display:block;offset-rotate:0deg}}
[data-nearby-walk] .nw-cloud{fill:var(--nw-cloud);stroke:var(--nw-cloud-line);stroke-width:1.2}
[data-nearby-walk] .nw-beacon{fill:var(--nw-beacon);stroke:var(--nw-ink);stroke-width:1;filter:drop-shadow(0 0 3px var(--nw-glow)) drop-shadow(0 0 8px var(--nw-glow))}
[data-nearby-walk] .nw-ring{fill:none;stroke:var(--nw-beacon);stroke-width:1.5;opacity:0;transform-box:fill-box;transform-origin:center}
[data-nearby-walk] .nw-pin :is(rect,path){fill:var(--nw-pin)}
[data-nearby-walk] .nw-pin text{fill:var(--nw-pin-text);font-size:14px;font-weight:700}
[data-nearby-walk] text{font-family:inherit}
[data-nearby-walk] .nw-name{fill:var(--nw-fg);font-size:14px;font-weight:600}
[data-nearby-walk] .nw-dist{fill:var(--nw-muted);font-size:12.5px}
@media (prefers-reduced-motion:no-preference){
[data-nearby-walk][data-armed]:not([data-shown]) :is(.nw-rise,.nw-lbl,.nw-route,.nw-walker){opacity:0}
[data-nearby-walk][data-armed] .nw-ground{stroke-dashoffset:1200}
[data-nearby-walk][data-shown] .nw-ground{animation:nw-draw .9s var(--nw-ease) forwards}
[data-nearby-walk][data-shown] .nw-rise{animation:nw-rise .7s var(--nw-ease) var(--d) both}
[data-nearby-walk][data-shown] .nw-far{animation-name:nw-rise-far}
[data-nearby-walk][data-shown] .nw-lbl{animation:nw-fade .5s ease calc(var(--d) + 250ms) both}
[data-nearby-walk][data-shown] .nw-route{animation:nw-fade-route .6s ease .9s both,nw-flow 2.4s linear .9s infinite}
[data-nearby-walk][data-shown] .nw-walker{animation:nw-fade .4s ease 1.2s both,nw-walk 16s linear 1.2s infinite}
[data-nearby-walk][data-shown] .nw-walker2{animation:nw-fade .4s ease 1.2s both,nw-walk 16s linear -6.8s infinite}
[data-nearby-walk] .nw-beacon{animation:nw-blink 2.4s ease-in-out infinite}
[data-nearby-walk] .nw-ring{animation:nw-pulse 2.4s ease-out infinite}
[data-nearby-walk] .nw-tw{animation:nw-twinkle 3.2s ease-in-out var(--tw,0s) infinite alternate}
[data-nearby-walk] .nw-cloudA{animation:nw-driftA 18s ease-in-out infinite alternate}
[data-nearby-walk] .nw-cloudB{animation:nw-driftB 22s ease-in-out infinite alternate}
[data-nearby-walk] .nw-gull{animation:nw-driftB 14s ease-in-out infinite alternate}
[data-nearby-walk] .nw-spot[data-active] .nw-bob{animation:nw-bounce .6s cubic-bezier(0.34,1.56,0.64,1) 1}
}
@keyframes nw-bounce{40%{transform:translateY(-10px)}}
@keyframes nw-draw{to{stroke-dashoffset:0}}
@keyframes nw-rise{from{opacity:0;transform:translateY(14px);filter:blur(4px)}}
@keyframes nw-rise-far{from{opacity:0;transform:translateY(14px);filter:blur(4px)}to{opacity:.8}}
@keyframes nw-fade{from{opacity:0}}
@keyframes nw-fade-route{from{opacity:0}to{opacity:.55}}
@keyframes nw-flow{to{stroke-dashoffset:-22}}
@keyframes nw-walk{from{offset-distance:0%}to{offset-distance:100%}}
@keyframes nw-blink{50%{opacity:.45}}
@keyframes nw-pulse{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(3)}}
@keyframes nw-twinkle{to{opacity:.55}}
@keyframes nw-driftA{to{transform:translateX(40px)}}
@keyframes nw-driftB{to{transform:translateX(-36px)}}
`;
