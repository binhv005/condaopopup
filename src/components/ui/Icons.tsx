import type { ReactNode, SVGProps } from "react";
import type { Amenity } from "../../data/rooms";

type P = SVGProps<SVGSVGElement>;

function Stroke({ children, sw = 2, ...rest }: P & { children: ReactNode; sw?: number }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} {...rest}>{children}</svg>;
}

export const ArrowUpRight = (p: P) => <Stroke {...p}><path d="M7 17 17 7M7 7h10v10" /></Stroke>;
export const ArrowLeft = (p: P) => <Stroke {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Stroke>;
export const ChevronDown = (p: P) => <Stroke {...p}><path d="m6 9 6 6 6-6" /></Stroke>;
export const ChevronLeft = (p: P) => <Stroke {...p}><path d="M15 18l-6-6 6-6" /></Stroke>;
export const ChevronRight = (p: P) => <Stroke {...p}><path d="M9 18l6-6-6-6" /></Stroke>;
export const Menu = (p: P) => <Stroke {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Stroke>;
export const Close = (p: P) => <Stroke {...p}><path d="M18 6 6 18M6 6l12 12" /></Stroke>;
export const Check = (p: P) => <Stroke {...p}><path d="M20 6 9 17l-5-5" /></Stroke>;
export const Clock = (p: P) => <Stroke {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Stroke>;
export const ClockBack = (p: P) => <Stroke {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l-3 2" /></Stroke>;
export const Pin = (p: P) => <Stroke {...p}><path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Stroke>;
export const Chat = (p: P) => <Stroke {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.5A8 8 0 1 1 21 12z" /></Stroke>;
export const Grid = (p: P) => (
  <Stroke {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Stroke>
);
export const Phone = (p: P) => (
  <Stroke {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </Stroke>
);
export const Shield = (p: P) => (
  <Stroke {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Stroke>
);
export const Star = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="m12 2.5 2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z" /></svg>
);
export const Quote = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
  </svg>
);

// Social marks used in the gallery (outline style)
export const ArrowRight = (p: P) => <Stroke {...p}><path d="M5 12h14M12 5l7 7-7 7" /></Stroke>;
/** "On air" waves, used as the journey badge */
export const Users = (p: P) => <Stroke sw={1.7} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></Stroke>;
export const House = (p: P) => <Stroke sw={1.7} {...p}><path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6" /></Stroke>;
/** Pair of laurel branches framing a stat icon */
export const Laurel = (p: P) => (
  <svg viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" {...p}>
    <path d="M10 3C5 7 4.5 15 9 21M38 3c5 4 5.5 12 1 18" />
    <path d="M8.2 6.5 5 5.8M6.6 10.5 3.4 10.4M6.5 14.5 3.6 15.4M7.8 18.2l-2.4 1.9M39.8 6.5l3.2-.7M41.4 10.5l3.2-.1M41.5 14.5l2.9.9M40.2 18.2l2.4 1.9" />
  </svg>
);
export const Instagram =(p: P) => <Stroke sw={1.8} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></Stroke>;
export const Facebook = (p: P) => <Stroke sw={1.8} {...p}><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" /></Stroke>;
export const Youtube = (p: P) => <Stroke sw={1.8} {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" /></Stroke>;
export const Tiktok = (p: P) => <Stroke sw={1.8} {...p}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 3 2.5 4.5 5.5 4.5" /></Stroke>;

// Room-page icon paths (rendered with a 1.7 stroke)
const LINE = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const AMENITY_PATHS: Record<Amenity, ReactNode> = {
  wifi: <><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0" /><circle cx="12" cy="19.5" r="1" /></>,
  ac: <><rect x="2" y="4" width="20" height="8" rx="2" /><path d="M6 16v2M12 16v4M18 16v2M6 9h12" /></>,
  breakfast: <><path d="M3 11h15a0 0 0 0 1 0 0 7 7 0 0 1-7 7H10a7 7 0 0 1-7-7z" /><path d="M18 12h1a3 3 0 0 1 0 6h-2M8 3v4M12 3v4" /></>,
  balcony: <path d="M3 11h18M5 11v9M19 11v9M9 11v9M15 11v9M3 20h18M8 11V5a4 4 0 0 1 8 0v6" />,
  seaview: <><path d="M2 16c2 0 2-1.5 4-1.5S8 16 10 16s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 20c2 0 2-1.5 4-1.5S8 20 10 20s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5" /><circle cx="12" cy="8" r="3" /></>,
  hotwater: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  tv: <><rect x="2" y="5" width="20" height="13" rx="2" /><path d="M8 21h8" /></>,
  pickup: <><path d="M5 17h14l-1.5-6.5A2 2 0 0 0 15.6 9H8.4a2 2 0 0 0-1.9 1.5z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /><path d="M3 13h2M19 13h2" /></>,
  garden: <path d="M12 22V12M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 15c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z" />,
  parking: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 17V7h4a3 3 0 0 1 0 6H9" /></>,
  bike: <><circle cx="5.5" cy="17" r="3.5" /><circle cx="18.5" cy="17" r="3.5" /><path d="M5.5 17 9 9h6l3.5 8M9 9 7.5 6H5M12 17l3-8" /></>,
  pool: <><path d="M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5" /><path d="M8 15V5a2 2 0 0 1 4 0M16 15V5a2 2 0 0 1 4 0M8 8h8M8 12h8" /></>,
  kitchen: <path d="M6 2v8a2 2 0 0 0 4 0V2M8 2v20M17 2c-2 0-3 3-3 6s1 4 3 4v10" />,
  bbq: <path d="M4 10h16a8 8 0 0 1-16 0zM8 18l-2 4M16 18l2 4M9 6c0-1.5 1.5-1.5 1.5-3M14 6c0-1.5 1.5-1.5 1.5-3" />,
  bathtub: <path d="M2 12h20v3a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0M6 20l-1 2M18 20l1 2" />,
  desk: <><rect x="2" y="4" width="20" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
};

export type Fact = "guests" | "area" | "bed" | "view";
const FACT_PATHS: Record<Fact, ReactNode> = {
  guests: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></>,
  area: <path d="M3 3h7M3 3v7M21 21h-7M21 21v-7M3 3l7 7M21 21l-7-7" />,
  bed: <path d="M2 18V7M2 13h20v5M22 18V13a3 3 0 0 0-3-3h-8v3M6 11.5a1.5 1.5 0 1 0 0-.01" />,
  view: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
};

export const AmenityIcon = ({ name }: { name: Amenity }) => <svg viewBox="0 0 24 24" {...LINE}>{AMENITY_PATHS[name]}</svg>;
export const FactIcon = ({ name }: { name: Fact }) => <svg viewBox="0 0 24 24" {...LINE}>{FACT_PATHS[name]}</svg>;

// House-rule icons (room page)
export const RULE_ICONS: Record<string, ReactNode> = {
  checkin: <Clock />,
  checkout: <ClockBack />,
  cancel: <Check />,
  smoking: <Stroke><path d="M3 15h14v4H3zM20 15v4M17 9c0-2 3-2 3-4" /><path d="m2 2 20 20" /></Stroke>,
  pets: <Stroke><circle cx="6" cy="10" r="2" /><circle cx="18" cy="10" r="2" /><circle cx="9" cy="5" r="2" /><circle cx="15" cy="5" r="2" /><path d="M12 12c-3 0-5 4-5 6s2 2 5 2 5 0 5-2-2-6-5-6z" /></Stroke>,
  quiet: <Stroke><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></Stroke>,
};
