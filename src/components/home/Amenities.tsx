import { AMENITIES } from "../../data/home";
import { PHONE_MAIN } from "../../data/contact";
import { useI18n } from "../../i18n/I18nProvider";
import { Lines } from "../ui/Lines";
import { Reveal } from "../ui/Reveal";
import { AmenityIcon, ArrowRight, Check, Clock, ClockBack, Pin } from "../ui/Icons";

/** Editorial "lab." layout: oversized word, sunset block with the amenities, photo with a call tag */
export function Amenities() {
  const { t } = useI18n();
  const word = t("nav.amenities").toLocaleLowerCase();
  const items = AMENITIES.items;
  return (
    <section className="lab" id="amenities">
      <div className="container lab-grid">
        <h2 className="lab-word" data-lines aria-label={word}>
          <span className="w" aria-hidden="true"><span>{word}<i>.</i></span></span>
        </h2>
        <div className="lab-lead">
          <span className="lab-num" aria-hidden="true">{String(items.length).padStart(2, "0")}</span>
          <div>
            <Lines as="h3" className="lab-title" text={t("home.amenTitle")} />
            <i className="lab-rule" aria-hidden="true"></i>
          </div>
        </div>
        <Reveal className="lab-block">
          <ul className="lab-list">
            {items.map((a) => (
              <li key={a.key}>
                <span className="lab-icon">{a.icon === "pin" ? <Pin /> : <AmenityIcon name={a.icon} />}</span>
                <div><b>{t(`amen.${a.key}.title`)}</b><small>{t(`amen.${a.key}.text`)}</small></div>
              </li>
            ))}
          </ul>
          <div className="lab-stay">
            <h3>{t("home.stayCard")}</h3>
            <ul>
              <li><Clock />{t("detail.rule.checkin")}</li>
              <li><ClockBack />{t("detail.rule.checkout")}</li>
              <li><Check />{t("detail.rule.cancel")}</li>
            </ul>
          </div>
        </Reveal>
        <figure className="lab-visual">
          <div className="lab-photo" data-reveal-y><img src={AMENITIES.image} alt="" loading="lazy" /></div>
          <a className="lab-tag" href={"tel:" + PHONE_MAIN.tel}><span>{t("detail.call")}<small>{PHONE_MAIN.label}</small></span><ArrowRight /></a>
        </figure>
        <Reveal className="lab-story">
          <span className="lab-story-label">{t("home.faqEyebrow")}</span>
          <p>{t("home.a1")}</p>
          <a href="#faq"><b>{t("home.q1")}</b><i><ArrowRight /></i></a>
        </Reveal>
      </div>
    </section>
  );
}
