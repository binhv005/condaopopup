// Contact channels, payment and company details (same content as condaotrip.com.vn)
const CDT = "https://condaotrip.com.vn/";

export const PHONE_MAIN = { tel: "0947474864", label: "0947 474 864" };

export const HOTLINES = [
  { tel: "0947474864", label: "0947 474 864" },
  { tel: "0981920792", label: "0981 920 792" },
  { tel: "02543608222", label: "02543 608 222" },
];

export const LINKS = {
  zalo: "https://zalo.me/0947474864",
  whatsapp: "https://api.whatsapp.com/send/?phone=0947474864",
  messenger: "https://www.messenger.com/t/100081507560041/",
  wechat: CDT + "files/uploads/condaotravel-wechat.jpg",
  facebook: "https://www.facebook.com/www.condaotrip.com.vn",
  instagram: "https://www.instagram.com/condaotrip/",
  youtube: "https://www.youtube.com/@condaotrip",
  tiktok: "https://www.tiktok.com/@www.condaotrip.com.vn",
  tripadvisor: "https://www.tripadvisor.com/UserReviewEdit-g1024768-d24864426-Con_Dao_Trip-Con_Dao_Islands_Ba_Ria_Vung_Tau_Province.html",
  allRooms: CDT + "service/dat-phong-khach-san-resort",
  sitemap: CDT + "sitemap-design.html",
  home: CDT,
};

/** Chat apps shown in the booking panel */
export const CHAT_APPS = [
  { name: "Zalo", href: LINKS.zalo, icon: CDT + "Icon_of_Zalo.webp" },
  { name: "WhatsApp", href: LINKS.whatsapp, icon: CDT + "whatsapp_icon.webp" },
  { name: "Messenger", href: LINKS.messenger, icon: CDT + "Messenger_logo.webp" },
  { name: "WeChat", href: LINKS.wechat, icon: CDT + "wechat_icon.webp" },
];

// ---------- Footer (mirrors condaotrip.com.vn; keep exactly as is – see lessons.md) ----------
export const FOOTER_CTA_BG = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=60&w=960&auto=format";

export const QR_CODES = [
  { src: CDT + "vietinbank.svg", alt: "QR Vietinbank CONDAO TRIP", bank: "Vietinbank", owner: "CONDAO TRIP" },
  { src: CDT + "viettinbank_htc.webp", alt: "QR Vietinbank Huynh Tien Cong", bank: "Vietinbank", owner: "Huynh Tien Cong" },
  { src: CDT + "agribank.svg", alt: "QR Agribank Huynh Tien Cong", bank: "Agribank", owner: "Huynh Tien Cong" },
];

export const SOCIALS = [
  { name: "Facebook", href: LINKS.facebook, icon: CDT + "Facebook_icon.svg.webp" },
  { name: "Messenger", href: LINKS.messenger, icon: CDT + "Messenger_logo.webp" },
  { name: "Instagram", href: LINKS.instagram, icon: CDT + "Instagram_icon.webp" },
  { name: "YouTube", href: LINKS.youtube, icon: CDT + "YouTube_icon.svg.webp" },
  { name: "TikTok", href: LINKS.tiktok, icon: CDT + "tiktok-icon.webp" },
  { name: "Tripadvisor", href: LINKS.tripadvisor, icon: CDT + "tripadvisor_icon.webp" },
  { name: "Zalo", href: LINKS.zalo, icon: CDT + "Icon_of_Zalo.webp" },
  { name: "WhatsApp", href: LINKS.whatsapp, icon: CDT + "whatsapp_icon.webp" },
  { name: "WeChat", href: LINKS.wechat, icon: CDT + "wechat_icon.webp" },
];

export const PAYMENT_LOGOS = [
  { src: CDT + "visa.svg", alt: "Visa", width: 62 },
  { src: CDT + "mastercard.svg", alt: "Mastercard", width: 54 },
  { src: CDT + "jcb.svg", alt: "JCB", width: 44 },
  { src: CDT + "americanex.svg", alt: "American Express", width: 48 },
  { src: CDT + "atm.svg", alt: "ATM", width: 48 },
  { src: CDT + "cash.svg", alt: "Cash", width: 52 },
  { src: CDT + "vnpay.svg", alt: "VNPAY", width: 68 },
  { src: CDT + "onepay.svg", alt: "OnePay", width: 52 },
];

export const COMPANY = {
  logo: CDT + "cropped-logo-1.svg",
  name: ["CÔNG TY TNHH MTV", "DU LỊCH SINH THÁI VÀ MÔI TRƯỜNG CÔN ĐẢO"],
  brand: "CON DAO TRIP",
  tax: "3502434454",
  license: "77 - 0024/2022/SDL - GP LHND",
  websites: "www.condaotrip.com.vn, www.dulichsinhthaicondao.com, www.ruabiencondao.com, www.condaonationalpark.com",
  email: "tienconghuynh@gmail.com",
  copyright: "Công ty TNHH Du Lịch Côn Đảo. All rights reserved.",
};

export const BANK = {
  title: "Payment Methods for Tour Deposit",
  heading: "COMPANY BANK ACCOUNT:",
  accountName: "Account Name: DU LỊCH SINH THÁI CÔN ĐẢO",
  accountNumber: "Account Number: 118002876444",
  bankName: ["Bank Name: Vietnam Joint Stock Commercial Bank For Industry And Trade", "- Ba Ria Vung Tau Branch"],
  swift: "SWIFT Code: ICBVVNVX880",
  address: ["Bank Address: 159A Nam Ky Khoi Nghia, Phuong 3, TP. Vung Tau,", "Ba Ria - Vung Tau, Vietnam"],
};

export const LOGO = {
  white: CDT + "logo.svg",
  green: CDT + "logo_green.svg",
  favicon: CDT + "cropped-logo-1.svg",
};
