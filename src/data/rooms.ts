// Room catalogue – names/descriptions come from locales (rooms.<id>)
const IMG = "https://images.unsplash.com/photo-";
const Q = "?w=1200&q=75&auto=format&fit=crop";
const CDT_IMG = "https://condaotrip.com.vn/assets/";

export const PHOTO = {
  bungalow: IMG + "1499793983690-e29da59ef1c2" + Q,
  woodRoom: IMG + "1611892440504-42a792e24d32" + Q,
  poolVilla: IMG + "1566073771259-6a8506099945" + Q,
  seaRoom: IMG + "1582719478250-c89cae4dc85b" + Q,
  studio: IMG + "1618773928121-c32242e63f39" + Q,
  suite: IMG + "1590490360182-c33d57733427" + Q,
  bedroom: IMG + "1505693416388-ac5ce068fe85" + Q,
  bedroom2: IMG + "1631049307264-da0ec9d70304" + Q,
  resortPool: IMG + "1520250497591-112f2f40a3f4" + Q,
  infinity: IMG + "1540541338287-41700207dee6" + Q,
  sunset: IMG + "1571003123894-1f0594d2b5d9" + Q,
  coast: CDT_IMG + "homeintro.webp",
  resort: CDT_IMG + "services/dat-phong-khach-san-resort.webp",
} as const;

/** Same photo at another width (Unsplash URLs only; other hosts are returned unchanged). */
export function sized(src: string, width: number): string {
  return src.replace("w=1200", "w=" + width);
}

export type RoomType = "sea" | "garden" | "family";
export type RoomId = "r1" | "r2" | "r3" | "r4" | "r5" | "r6";
export type Bed = "double" | "king" | "twin" | "multi";
export type Amenity =
  | "wifi" | "ac" | "breakfast" | "balcony" | "seaview" | "hotwater" | "tv" | "pickup" | "garden"
  | "parking" | "bike" | "pool" | "kitchen" | "bbq" | "bathtub" | "desk";
export type Place = "beach" | "center" | "airport" | "market";

export interface Room {
  id: RoomId;
  type: RoomType;
  price: number;
  guests: number;
  area: number;
  bed: Bed;
  rating: number;
  reviews: number;
  best?: boolean;
  gallery: string[];
  amenities: Amenity[];
  /** Distance in km */
  distance: Record<Place, number>;
}

export const ROOMS: Room[] = [
  { id: "r1", type: "sea", price: 1290000, guests: 2, area: 32, bed: "king", rating: 4.9, reviews: 230, best: true,
    gallery: [PHOTO.bungalow, PHOTO.seaRoom, PHOTO.sunset, PHOTO.coast, PHOTO.infinity],
    amenities: ["wifi", "ac", "breakfast", "balcony", "seaview", "hotwater", "tv", "pickup"],
    distance: { beach: 0.05, center: 2.5, airport: 12, market: 2.8 } },
  { id: "r2", type: "garden", price: 890000, guests: 2, area: 28, bed: "double", rating: 4.8, reviews: 186,
    gallery: [PHOTO.woodRoom, PHOTO.resortPool, PHOTO.bedroom, PHOTO.resort, PHOTO.coast],
    amenities: ["wifi", "ac", "breakfast", "garden", "hotwater", "parking", "bike", "pickup"],
    distance: { beach: 0.4, center: 1.2, airport: 13, market: 1.5 } },
  { id: "r3", type: "family", price: 2490000, guests: 6, area: 120, bed: "multi", rating: 5.0, reviews: 94, best: true,
    gallery: [PHOTO.poolVilla, PHOTO.resortPool, PHOTO.bedroom2, PHOTO.sunset, PHOTO.resort],
    amenities: ["wifi", "ac", "pool", "kitchen", "bbq", "parking", "breakfast", "pickup", "tv", "garden"],
    distance: { beach: 0.3, center: 3, airport: 11, market: 3.2 } },
  { id: "r4", type: "sea", price: 1090000, guests: 2, area: 30, bed: "king", rating: 4.8, reviews: 152,
    gallery: [PHOTO.seaRoom, PHOTO.bungalow, PHOTO.infinity, PHOTO.coast, PHOTO.bedroom],
    amenities: ["wifi", "ac", "breakfast", "balcony", "seaview", "bathtub", "tv", "hotwater"],
    distance: { beach: 0.1, center: 1.8, airport: 12, market: 2 } },
  { id: "r5", type: "garden", price: 690000, guests: 2, area: 22, bed: "double", rating: 4.7, reviews: 118,
    gallery: [PHOTO.studio, PHOTO.woodRoom, PHOTO.resortPool, PHOTO.resort, PHOTO.coast],
    amenities: ["wifi", "ac", "desk", "garden", "hotwater", "bike", "parking"],
    distance: { beach: 0.6, center: 0.8, airport: 13, market: 1 } },
  { id: "r6", type: "family", price: 1690000, guests: 4, area: 55, bed: "twin", rating: 4.9, reviews: 77,
    gallery: [PHOTO.suite, PHOTO.bedroom2, PHOTO.bedroom, PHOTO.resort, PHOTO.coast],
    amenities: ["wifi", "ac", "breakfast", "kitchen", "tv", "hotwater", "parking", "bike"],
    distance: { beach: 0.5, center: 0.5, airport: 13, market: 0.4 } },
];

/** Card thumbnail for a room */
export function roomThumb(room: Room): string {
  return sized(room.gallery[0], 900);
}

export function roomById(id: string | null): Room | undefined {
  return ROOMS.find((r) => r.id === id);
}

export const ROOM_FILTERS = ["all", "sea", "garden", "family"] as const;
export type RoomFilter = (typeof ROOM_FILTERS)[number];

