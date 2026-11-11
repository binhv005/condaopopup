import { FEATURED_REVIEW, REVIEWS } from "../../data/reviews";
import { GUESTS_COUNT } from "../../data/home";
import { ROOMS } from "../../data/rooms";
import { useI18n } from "../../i18n/I18nProvider";
import { Lines } from "../ui/Lines";
import { Chat, House, Laurel, Star, Users } from "../ui/Icons";

const REVIEW_TOTAL = ROOMS.reduce((sum, r) => sum + r.reviews, 0);

/** Featured quote whose words fill in on scroll, a stats row, then review panels sliding sideways */
export function Reviews() {
  const { t } = useI18n();
  const id = FEATURED_REVIEW.id;
  const quote = t(`reviews.${id}.text`);
  const stats = [
    { icon: <Star />, value: "4.9", label: t("stats.rating") },
    { icon: <Users />, value: GUESTS_COUNT, label: t("about.guests") },
    { icon: <Chat />, value: String(REVIEW_TOTAL), label: t("home.reviewsCount") },
    { icon: <House />, value: "24", label: t("stats.rooms") },
  ];
  return (
    <section className="voice" id="reviews">
      <div className="container voice-inner" data-hold>
        <figure className="voice-quote">
          <span className="voice-sticker">{t(`reviews.${id}.name`)} · {t(`reviews.${id}.from`)}</span>
          <blockquote data-fill aria-label={quote}>
            {quote.split(/\s+/).map((w, i) => <span aria-hidden="true" key={i}>{w} </span>)}
          </blockquote>
        </figure>
        <ul className="voice-stats" data-hold-end>
          {stats.map((s) => (
            <li key={s.label}>
              <span className="voice-icon"><Laurel />{s.icon}</span>
              <strong>{s.value}</strong>
              <small>{s.label}</small>
            </li>
          ))}
        </ul>
      </div>
      <div className="slides">
        <div className="slides-track">
          <div className="slide slide-intro">
            <Lines className="display" text={t("reviews.title")} />
          </div>
          {REVIEWS.map((r, i) => {
            const name = t(`reviews.${r.id}.name`);
            return (
              <article className="slide" key={r.id}>
                <div className={i % 2 === 0 ? "ticket" : "ticket ticket-plain"}>
                  <div className="ticket-body">
                    <div className="ticket-top">
                      <div className="slide-stars" aria-label="5/5">{[0, 1, 2, 3, 4].map((k) => <Star key={k} />)}</div>
                      <span className="slide-n">No. {String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <p className="slide-text">{t(`reviews.${r.id}.text`)}</p>
                  </div>
                  <div className="ticket-stub">
                    <img src={r.avatar} alt={name} width={52} height={52} loading="lazy" />
                    <div><b>{name}</b><small>{t(`reviews.${r.id}.from`)}</small></div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
