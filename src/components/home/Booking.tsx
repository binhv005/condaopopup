import { BOOKING_IMAGE } from "../../data/home";
import { CHAT_APPS, HOTLINES, PHONE_MAIN } from "../../data/contact";
import { useI18n } from "../../i18n/I18nProvider";
import { Lines } from "../ui/Lines";
import { Pill, external } from "../ui/Pill";
import { Clock, Phone } from "../ui/Icons";

/** Booking is by direct contact only: hotline, chat apps, call button */
export function Booking() {
  const { t } = useI18n();
  return (
    <section className="section" id="booking">
      <div className="container">
        <Lines className="display start-title" text={t("booking.title")} />
        <div className="start">
          <div className="start-panel">
            <p className="lead">{t("booking.text")}</p>
            <p className="booking-support"><Clock /><span>{t("booking.support")}</span></p>
            <ContactPanel />
          </div>
          <div className="start-media">
            <div className="start-window"><img src={BOOKING_IMAGE} alt="" loading="lazy" /></div>
            <Pill variant="brand" className="start-call" href={"tel:" + PHONE_MAIN.tel} icon={<Phone />}>{t("detail.call")}</Pill>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactPanel() {
  const { t } = useI18n();
  return (
    <div className="contact-panel">
      <div className="contact-hotline grain">
        <p>{t("booking.hotline")}</p>
        {HOTLINES.map((h) => <a key={h.tel} href={"tel:" + h.tel}>{h.label}</a>)}
      </div>
      <div className="contact-apps">
        {CHAT_APPS.map((a) => (
          <a key={a.name} href={a.href} {...external}><img src={a.icon} alt="" width={28} height={28} />{a.name}</a>
        ))}
      </div>
    </div>
  );
}
