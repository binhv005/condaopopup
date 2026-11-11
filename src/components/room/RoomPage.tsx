import { useCallback, useEffect, useState } from "react";
import type { Fact } from "../ui/Icons";
import { ArrowLeft, ArrowUpRight, AmenityIcon, Check, Chat, Clock, FactIcon, Phone, Pin, RULE_ICONS, Star } from "../ui/Icons";
import { ROOMS, sized, type Place, type Room } from "../../data/rooms";
import { LINKS, PHONE_MAIN } from "../../data/contact";
import { PROMO } from "../../data/home";
import { ROOM_CTA_BG, ROOM_FAQ, ROOM_RULES } from "../../data/room";
import { useI18n, withLang } from "../../i18n/I18nProvider";
import { Faq } from "../ui/Faq";
import { Lines } from "../ui/Lines";
import { Pill, external } from "../ui/Pill";
import { Price } from "../ui/Price";
import { Rail } from "../ui/Rail";
import { ReviewMarquee } from "../ui/ReviewMarquee";
import { RoomCard } from "../ui/RoomCard";
import { Lightbox } from "./Lightbox";

const PLACES: Place[] = ["beach", "center", "market", "airport"];

export function RoomPage({ room }: { room: Room }) {
  const { t, lang, current } = useI18n();
  const name = t(`rooms.${room.id}.name`);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [photo, setPhoto] = useState(0);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const facts: [Fact, string][] = [
    ["guests", t("rooms.guests", { n: room.guests })],
    ["area", t("rooms.area", { n: room.area })],
    ["bed", t(`bed.${room.bed}`)],
    ["view", t(`detail.views.${room.type}`)],
  ];
  const distance = (km: number) =>
    km < 1 ? t("detail.m", { n: Math.round(km * 1000) }) : t("detail.km", { n: km.toLocaleString(current.locale) });
  // The chapter crossing the middle of the screen picks the photo on the left (wrapping round the gallery)
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setPhoto(Number((e.target as HTMLElement).dataset.chapter) % room.gallery.length); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    document.querySelectorAll(".chapter").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [room.gallery.length]);

  // The bottom bar shows only once the booking block has scrolled up out of view (not when a photo is picked)
  const [pastBook, setPastBook] = useState(false);
  useEffect(() => {
    const el = document.querySelector(".book-inline");
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setPastBook(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Rooms of the same type first
  const similar = ROOMS.filter((r) => r.id !== room.id).sort((a, b) => Number(b.type === room.type) - Number(a.type === room.type));

  return (
      <main className="detail" id="detail">
        {/* Split screen: the photo on the left stays put and changes with the chapter being read on the right */}
        <div className="split">
          <div className="split-media">
            <div className="split-photos">
              {room.gallery.map((src, i) => (
                <button key={src} className={"split-photo" + (i === photo ? " on" : "")} onClick={() => setLightbox(i)} aria-label={t("detail.photos", { n: room.gallery.length })}>
                  <img src={sized(src, 1600)} alt={name + " – " + (i + 1)} loading={i ? "lazy" : undefined} />
                </button>
              ))}
            </div>
            <div className="split-thumbs" role="tablist" aria-label={t("detail.photosTitle")}>
              {room.gallery.map((src, i) => (
                <button key={src} role="tab" aria-selected={i === photo} className={i === photo ? "on" : undefined} onClick={() => setPhoto(i)}>
                  <img src={sized(src, 240)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            
          </div>

          <div className="split-content">
            <section className="chapter" data-chapter={0}>
              <a className="back-link" href={withLang("index.html#rooms", lang)}><ArrowLeft /><span>{t("detail.back")}</span></a>
              <div className="info-chips">
                <span className="chip-sand">{t(`rooms.filter.${room.type}`)}</span>
                <span className="chip-ocean">{t("detail.byNight")}</span>
                {room.best && <span className="chip-sunset">{t("rooms.badge")}</span>}
              </div>
              <Lines as="h1" className="split-title" text={name} />
              <div className="info-meta">
                <span className="star"><Star /><b>{room.rating.toFixed(1)}</b>&nbsp;<a href="#reviews">{t("detail.reviewsCount", { n: room.reviews })}</a></span>
                <span><Pin /><span>{t("detail.location")}</span></span>
                <span><Clock /><span>{t("detail.support")}</span></span>
              </div>
              <p className="detail-lead">{t(`rooms.${room.id}.desc`)}</p>
              <div className="book-inline">
                <div className="book-price"><small>{t("detail.priceRef")}</small><Price value={room.price} /></div>
                <small className="price-hint"><b>{PROMO.code}</b> – <span>{t("popup.hint")}</span></small>
                <ul className="book-perks">
                  {(["l1", "l2", "l3"] as const).map((k) => <li key={k}><Check strokeWidth={2.2} /><span>{t(`popup.${k}`)}</span></li>)}
                </ul>
                <div className="info-actions">
                  <Pill variant="brand" href={"tel:" + PHONE_MAIN.tel} icon={<Phone />}>{t("detail.call")}</Pill>
                  <div className="info-actions-row">
                    <a href={LINKS.zalo} {...external} className="btn-outline">{t("detail.chat")}</a>
                    <a href={LINKS.whatsapp} {...external} className="btn-outline">WhatsApp</a>
                  </div>
                </div>
                <p className="book-support"><Clock /><span>{t("booking.support")}</span></p>
              </div>
            </section>

            <section className="chapter" data-chapter={1}>
              <Lines className="display h-md" text={t("detail.about")} />
              <p>{t("detail.long")}</p>
              <table className="spec">
                <tbody>
                  {facts.map(([k, v]) => (
                    <tr key={k}><th scope="row"><FactIcon name={k} />{t(`detail.facts.${k}`)}</th><td>{v}</td></tr>
                  ))}
                  <tr><th scope="row"><Star />{t("detail.priceRef")}</th><td><Price value={room.price} /></td></tr>
                </tbody>
              </table>
            </section>

            <section className="chapter" data-chapter={2}>
              <Lines className="display h-md" text={t("detail.amenities")} />
              <ul className="spec spec-grid">
                {room.amenities.map((a) => <li key={a}><AmenityIcon name={a} /><span>{t(`detail.am.${a}`)}</span><Check className="spec-ok" strokeWidth={2.2} /></li>)}
              </ul>
            </section>

            <section className="chapter" data-chapter={3}>
              <Lines className="display h-md" text={t("detail.rules")} />
              <ul className="spec spec-list">
                {ROOM_RULES.map((r) => <li key={r}>{RULE_ICONS[r]}<span>{t(`detail.rule.${r}`)}</span></li>)}
              </ul>
            </section>

            <section className="chapter" data-chapter={4}>
              <Lines className="display h-md" text={t("detail.nearby")} />
              <table className="spec">
                <tbody>
                  {PLACES.map((k) => (
                    <tr key={k}><th scope="row"><Pin />{t(`detail.near.${k}`)}</th><td>{distance(room.distance[k])}</td></tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Price and call stay in reach once the booking block has scrolled away */}
            <div className={"split-bar" + (pastBook ? " show" : "")} aria-hidden={!pastBook || undefined}>
              <Price value={room.price} />
              <Pill variant="brand" small href={"tel:" + PHONE_MAIN.tel} icon={<Phone />} tabIndex={pastBook ? undefined : -1}>{t("detail.call")}</Pill>
            </div>
          </div>
        </div>

        <section className="section" id="reviews">
          <div className="container">
            <div className="reviews-head">
              <Lines className="display h-lg" text={t("detail.reviews")} />
            </div>
          </div>
          <ReviewMarquee />
        </section>

        <Rail
          head={
            <>
              <Lines className="display h-lg" text={t("detail.similar")} />
              <a className="link-arrow" href={withLang("index.html#rooms", lang)}><span>{t("btn.viewAll")}</span><ArrowUpRight /></a>
            </>
          }
        >
          {similar.map((r) => <RoomCard key={r.id} room={r} />)}
        </Rail>

        <section className="section">
          <div className="container faq-grid">
            <Lines className="display h-lg" text={t("detail.faq")} />
            <Faq items={ROOM_FAQ.map((i) => ({ q: t(`detail.q${i}`, { name }), a: t(`detail.a${i}`) }))} />
          </div>
        </section>

        <div className="container room-end">
          <p className="thanks">{t("detail.thanks")}</p>
          <article className="cta-card grain">
            <img src={ROOM_CTA_BG} alt="" aria-hidden="true" loading="lazy" />
            <div className="cta-card-body">
              <Lines className="display h-lg" text={t("detail.ctaTitle")} />
              <div className="cta-actions">
                <Pill variant="light" href={"tel:" + PHONE_MAIN.tel} icon={<Phone />}>{t("detail.call")}</Pill>
                <Pill variant="ghost" href={LINKS.zalo} {...external} icon={<Chat />}>{t("detail.chat")}</Pill>
              </div>
            </div>
          </article>
        </div>

        {/* Mobile sticky booking bar */}
        <div className="mobile-book" id="mobileBook">
          <div><Price value={room.price} /></div>
          <div className="mobile-book-actions">
            <a href={LINKS.zalo} {...external} className="btn btn-zalo">Zalo</a>
            <a href={"tel:" + PHONE_MAIN.tel} className="btn btn-primary"><span>{t("detail.call")}</span></a>
          </div>
        </div>

        <Lightbox images={room.gallery} index={lightbox} name={name} onChange={setLightbox} onClose={closeLightbox} />
      </main>
  );
}

export function NotFound() {
  const { t, lang } = useI18n();
  return (
    <div className="container not-found">
      <h1 className="display h-lg">{t("detail.notFound")}</h1>
      <Pill href={withLang("index.html#rooms", lang)}>{t("detail.back")}</Pill>
    </div>
  );
}
