// Homepage content: which photo/locale key each section uses
import type { RoomId } from "./rooms";
import { PHOTO, sized } from "./rooms";

const U = (id: string, w: number) => `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

/** Scroll-scrubbed video hero; stills come from scripts/hero-video-assets.py (paths are relative to public/) */
export const HERO = {
  video: "video/homestay-scrub.mp4",
  poster: "images/hero-video/poster.webp",
  cutout: "images/hero-video/cutout.webp",
  /** Horizon height in the last frame (printed by the script) */
  horizon: 0.4352,
  /** Phones get this still instead of the video (WebP of public/homestay-9x16-frame-dau.png) */
  mobilePoster: "images/hero-video/hero-mobile.webp",
  mark: "Homestay",
  featureRoom: "r1" as RoomId,
};

/** About grid: four photos around the centred intro (features.f1–f4) */
export const MOMENTS = [
  { image: PHOTO.coast, alt: "Côn Đảo", key: "f1" },
  { image: U("1611892440504-42a792e24d32", 900), alt: "", key: "f2" },
  { image: PHOTO.resort, alt: "", key: "f3" },
  { image: U("1540541338287-41700207dee6", 900), alt: "", key: "f4" },
] as const;

export const TRUST_AVATARS = [
  { letter: "M", color: "#0e823d" },
  { letter: "T", color: "#b5561d" },
  { letter: "H", color: "#0a4a5c" },
  { letter: "A", color: "#8a9a86" },
];
export const GUESTS_COUNT = "2.500+";

/** Fixed photo behind the room covers */
export const ROOMS_BG = sized(PHOTO.resortPool, 2000);

/** Photo behind the journeys carousel */
export const EXP_BG = U("1571003123894-1f0594d2b5d9", 2000);

/** Journeys: one card per traveller type in the drag carousel */
export const SCENARIOS: { key: "couple" | "family" | "friends" | "work"; room: RoomId }[] = [
  { key: "couple", room: "r1" },
  { key: "family", room: "r3" },
  { key: "friends", room: "r6" },
  { key: "work", room: "r5" },
];

/** Editorial amenities block: photo on the right, four amenities (amen.a1–a4) with their icons */
export const AMENITIES = {
  image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=2000&q=75&auto=format&fit=crop",
  items: [
    { key: "a1", icon: "pin" },
    { key: "a2", icon: "garden" },
    { key: "a3", icon: "pool" },
    { key: "a4", icon: "seaview" },
  ] as const,
};

export const FAQ_IMAGE = U("1520250497591-112f2f40a3f4", 1000);

/** Homepage FAQ: one homepage-specific question + three general ones from the room page */
export const HOME_FAQ = [
  { q: "home.q1", a: "home.a1" },
  { q: "detail.q2", a: "detail.a2" },
  { q: "detail.q3", a: "detail.a3" },
  { q: "detail.q4", a: "detail.a4" },
];

/** Gallery columns drift at different speeds (percent of their height) */
export const GALLERY = [
  { speed: 3, images: [U("1590490360182-c33d57733427", 700), PHOTO.coast] },
  { speed: -4, images: [U("1540541338287-41700207dee6", 700), U("1618773928121-c32242e63f39", 700)] },
  { speed: 5, images: [U("1520250497591-112f2f40a3f4", 700), U("1582719478250-c89cae4dc85b", 700)] },
  { speed: -3, images: [U("1611892440504-42a792e24d32", 700), U("1571003123894-1f0594d2b5d9", 700)] },
];

export const BOOKING_IMAGE = sized(PHOTO.seaRoom, 1400);

/** Discount code still quoted on the room pages (the homepage promo box was replaced by the hot-trip popup) */
export const PROMO = {
  code: "CONDAO15",
};
