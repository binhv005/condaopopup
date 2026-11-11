// Homepage booking popups: three cards side by side – Hot trip (tour), Homestay (room), Transfer (car / ferry).
// Each card books on the spot: the form opens inside the card and the booking is sent to us over Zalo.
// DRAFT CONTENT – prices and photos are placeholders taken from the CD-Popup prototype; edit them here.
import type { LangCode } from "./locales";

// ─── ON / OFF ────────────────────────────────────────────────────────────────────────────────
// enabled: false  → popup is switched off completely (no auto-open, no launcher button)
// autoOpen: false → popup only opens from the launcher button
// URL overrides for testing: ?popup (force open) · ?popup=off (switch off for this visit)
export const BOOKING_POPUPS = {
  enabled: true,
  autoOpen: true,
  /** ms after page load */
  delay: 2500,
  /** true = auto-open only once per browser session */
  oncePerSession: true,
  /** small floating "Ưu đãi" button to reopen the popup after it has been closed */
  launcher: true,
  storageKey: "cdt_booking_popups_seen",
};

const IMG = "images/popups/";
export const POPUP_IMAGES = { trip: IMG + "hottrip.jpg", stay: IMG + "homestay.jpg", move: IMG + "transfer.jpg" };

export type TourId = "heritage" | "sea" | "forest";
export type RoomId = "double" | "deluxe" | "bungalow";
export type TransferId = "airport" | "port" | "ferry";

export const TRIP_TOURS: { id: TourId; icon: "heritage" | "wave" | "forest"; price: number; oldPrice: number }[] = [
  { id: "heritage", icon: "heritage", price: 690000, oldPrice: 850000 },
  { id: "sea", icon: "wave", price: 1150000, oldPrice: 1400000 },
  { id: "forest", icon: "forest", price: 490000, oldPrice: 600000 },
];
export const TRIP_VOUCHER = { code: "HOTTRIP", amount: 100000 };

export const STAY_ROOMS: { id: RoomId; price: number; cap: number }[] = [
  { id: "double", price: 950000, cap: 2 },
  { id: "deluxe", price: 1350000, cap: 3 },
  { id: "bungalow", price: 1890000, cap: 5 },
];
/** −10% on every room type from this many nights */
export const STAY_DEAL = { nights: 3, off: 0.1 };

export const TRANSFERS: {
  id: TransferId; icon: "plane" | "boat" | "ticket"; price: number;
  /** free for guests staying at least FREE_NIGHTS nights */
  freeable: boolean;
  /** boarding-pass route: from code → to code */
  from: string; to: string;
}[] = [
  { id: "airport", icon: "plane", price: 150000, freeable: true, from: "VCS", to: "HMS" },
  { id: "port", icon: "boat", price: 200000, freeable: true, from: "BĐM", to: "HMS" },
  { id: "ferry", icon: "ticket", price: 360000, freeable: false, from: "TĐE", to: "CĐO" },
];
export const FREE_NIGHTS = 2;

const vi = {
  brand: "Côn Đảo Homestay",
  close: "Đóng",
  back: "Quay lại",
  launcher: "Ưu đãi",
  launcherLong: "Ưu đãi Tour · Phòng · Xe",
  carousel: "Ưu đãi đặt nhanh",
  perGuest: "/khách",
  perNight: "/đêm",
  from: "từ",
  trip: {
    script: "Hot Trip",
    badgeTop: "Giảm",
    badgeBottom: "Hot trip",
    voucher: "Mã",
    cta: "Đặt tour",
    formTitle: "Đặt tour",
    tours: {
      heritage: { tab: "Di tích", title: "Hành trình Di sản", desc: "Nhà tù Côn Đảo · Hàng Dương · Miếu Bà", duration: "1 ngày" },
      sea: { tab: "Biển", title: "Sắc màu Đại dương", desc: "Lặn ngắm san hô, gặp rùa biển", duration: "1 ngày" },
      forest: { tab: "Rừng", title: "Đại ngàn Côn Sơn", desc: "Trekking Đầm Sen – Ông Đụng, ngắm voọc", duration: "½ ngày" },
    },
  },
  stay: {
    deal: "Ưu đãi tháng",
    rating: "4.9 · 2 phút ra biển",
    title: "Thức giấc cùng",
    script: "tiếng sóng",
    stayFrom: ["Ở từ", "3 đêm"],
    allRooms: ["Mọi hạng", "phòng"],
    cta: "Đặt phòng",
    formTitle: "Đặt phòng",
    rooms: {
      double: { short: "Phòng Đôi", name: "Phòng Đôi Hướng Biển" },
      deluxe: { short: "Deluxe", name: "Deluxe Ban Công" },
      bungalow: { short: "Bungalow", name: "Bungalow Gia Đình" },
    },
  },
  move: {
    pass: "Boarding pass",
    title: "Đến Côn Đảo",
    script: "thật nhẹ nhàng",
    vehicle: "Phương tiện",
    time: "Giờ",
    price: "Giá",
    freeKicker: "Đưa đón sân bay & cảng",
    free: "Miễn phí",
    freeNote: `cho khách lưu trú từ ${FREE_NIGHTS} đêm`,
    ferryKicker: "Vé tàu cao tốc",
    ferryNote: "Trần Đề ⇄ Côn Đảo · giữ chỗ trước",
    cta: "Đặt xe",
    ctaFerry: "Đặt vé",
    formTitle: "Đặt xe & vé tàu",
    services: {
      airport: { tab: "Sân bay", name: "Đón/tiễn sân bay Cỏ Ống", fromName: "Sân bay Cỏ Ống", toName: "Homestay", leg: "20 phút", vehicle: "Xe 7 chỗ", time: "Theo giờ bay" },
      port: { tab: "Cảng tàu", name: "Đón/tiễn cảng Bến Đầm", fromName: "Cảng Bến Đầm", toName: "Homestay", leg: "25 phút", vehicle: "Xe 7 chỗ", time: "Theo giờ tàu" },
      ferry: { tab: "Vé tàu", name: "Vé tàu Trần Đề ⇄ Côn Đảo", fromName: "Cảng Trần Đề", toName: "Côn Đảo", leg: "2,5 giờ", vehicle: "Tàu cao tốc", time: "08:00 · 13:00" },
    },
  },
  form: {
    date: "Ngày đi",
    checkIn: "Nhận phòng",
    checkOut: "Trả phòng",
    time: "Giờ đón",
    guests: "Số khách",
    name: "Họ tên",
    phone: "Số điện thoại",
    note: "Ghi chú",
    stayGuest: `Tôi ở Côn Đảo Homestay từ ${FREE_NIGHTS} đêm (miễn phí đưa đón)`,
    nights: "đêm",
    voucher: "Mã",
    dealLine: `Ưu đãi ở từ ${STAY_DEAL.nights} đêm`,
    stayFree: "Ưu đãi khách lưu trú",
    total: "Tạm tính",
    freeTotal: "Miễn phí",
    maxGuests: "Tối đa {n} khách",
    badDates: "Ngày trả phải sau ngày nhận",
    nameError: "Vui lòng nhập họ tên",
    phoneError: "Số điện thoại chưa đúng",
    submit: "Gửi qua Zalo",
    copied: "Đã sao chép yêu cầu đặt chỗ",
    copiedHint: "Zalo đã mở ở tab mới – dán (Ctrl+V / giữ để dán) vào khung chat và gửi cho chúng tôi.",
    copyFailed: "Không sao chép tự động được – hãy chép đoạn dưới rồi gửi qua Zalo.",
    copyAgain: "Sao chép lại",
    openZalo: "Mở Zalo",
    again: "Đặt thêm",
    msgHead: "Xin chào ConDaoTrip, tôi muốn đặt:",
    msgName: "Tên",
    msgPhone: "SĐT",
    msgNote: "Ghi chú",
  },
};

export type BookingPopupText = typeof vi;

const en: BookingPopupText = {
  brand: "Côn Đảo Homestay",
  close: "Close",
  back: "Back",
  launcher: "Deals",
  launcherLong: "Deals · Tours · Rooms · Rides",
  carousel: "Quick-book deals",
  perGuest: "/guest",
  perNight: "/night",
  from: "from",
  trip: {
    script: "Hot Trip",
    badgeTop: "Save",
    badgeBottom: "Hot trip",
    voucher: "Code",
    cta: "Book tour",
    formTitle: "Book a tour",
    tours: {
      heritage: { tab: "Heritage", title: "Heritage Journey", desc: "Côn Đảo Prison · Hàng Dương · Lady's Temple", duration: "Full day" },
      sea: { tab: "Sea", title: "Colours of the Ocean", desc: "Snorkel the reefs, meet sea turtles", duration: "Full day" },
      forest: { tab: "Forest", title: "Côn Sơn Wildwood", desc: "Đầm Sen – Ông Đụng trek, spot langurs", duration: "Half day" },
    },
  },
  stay: {
    deal: "Deal of the month",
    rating: "4.9 · 2 min to the beach",
    title: "Wake up to",
    script: "the waves",
    stayFrom: ["Stay", "3+ nights"],
    allRooms: ["All room", "types"],
    cta: "Book room",
    formTitle: "Book a room",
    rooms: {
      double: { short: "Double", name: "Sea-view Double" },
      deluxe: { short: "Deluxe", name: "Balcony Deluxe" },
      bungalow: { short: "Bungalow", name: "Family Bungalow" },
    },
  },
  move: {
    pass: "Boarding pass",
    title: "Getting to Côn Đảo",
    script: "made easy",
    vehicle: "Vehicle",
    time: "Time",
    price: "Price",
    freeKicker: "Airport & port transfer",
    free: "Free",
    freeNote: `for guests staying ${FREE_NIGHTS}+ nights`,
    ferryKicker: "Fast ferry ticket",
    ferryNote: "Trần Đề ⇄ Côn Đảo · reserve ahead",
    cta: "Book ride",
    ctaFerry: "Book ticket",
    formTitle: "Book a ride or ferry",
    services: {
      airport: { tab: "Airport", name: "Cỏ Ống airport transfer", fromName: "Cỏ Ống Airport", toName: "Homestay", leg: "20 min", vehicle: "7-seat car", time: "By your flight" },
      port: { tab: "Port", name: "Bến Đầm port transfer", fromName: "Bến Đầm Port", toName: "Homestay", leg: "25 min", vehicle: "7-seat car", time: "By your boat" },
      ferry: { tab: "Ferry", name: "Trần Đề ⇄ Côn Đảo ferry", fromName: "Trần Đề Port", toName: "Côn Đảo", leg: "2.5 h", vehicle: "Fast ferry", time: "08:00 · 13:00" },
    },
  },
  form: {
    date: "Date",
    checkIn: "Check-in",
    checkOut: "Check-out",
    time: "Pick-up time",
    guests: "Guests",
    name: "Full name",
    phone: "Phone number",
    note: "Note",
    stayGuest: `I'm staying at Côn Đảo Homestay ${FREE_NIGHTS}+ nights (free transfer)`,
    nights: "nights",
    voucher: "Code",
    dealLine: `${STAY_DEAL.nights}+ night deal`,
    stayFree: "Homestay guest perk",
    total: "Estimate",
    freeTotal: "Free",
    maxGuests: "Max {n} guests",
    badDates: "Check-out must be after check-in",
    nameError: "Please enter your name",
    phoneError: "Please check the phone number",
    submit: "Send via Zalo",
    copied: "Booking request copied",
    copiedHint: "Zalo opened in a new tab – paste (Ctrl+V / long-press) into the chat and send it to us.",
    copyFailed: "Couldn't copy automatically – copy the text below and send it via Zalo.",
    copyAgain: "Copy again",
    openZalo: "Open Zalo",
    again: "Book another",
    msgHead: "Hello ConDaoTrip, I'd like to book:",
    msgName: "Name",
    msgPhone: "Phone",
    msgNote: "Note",
  },
};

/** Vietnamese for vi, English for every other site language until they are translated */
export function bookingPopupText(lang: LangCode): BookingPopupText {
  return lang === "vi" ? vi : en;
}

/** "1.150.000đ" (vi) / "1,150,000 VND" (others) */
export function money(value: number, lang: LangCode): string {
  return lang === "vi" ? value.toLocaleString("vi-VN") + "đ" : value.toLocaleString("en-US") + " VND";
}

/** 950000 → "950K", 1350000 → "1350K" (as on the cards) */
export const kilo = (value: number) => `${Math.round(value / 1000)}K`;
