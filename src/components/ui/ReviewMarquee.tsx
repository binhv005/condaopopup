import { useI18n } from "../../i18n/I18nProvider";
import { REVIEWS } from "../../data/reviews";
import { Quote, Star } from "./Icons";

/** Reviews sliding right to left; the row is rendered twice and the track moves -50% for a seamless loop */
export function ReviewMarquee() {
  const { t } = useI18n();
  const row = (hidden: boolean) => (
    <div className="review-row" aria-hidden={hidden || undefined}>
      {REVIEWS.map((r) => {
        const name = t(`reviews.${r.id}.name`);
        return (
          <article className="review-card" key={r.id}>
            <Quote className="review-quote" />
            <div className="review-stars">{[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}</div>
            <p className="review-text">"{t(`reviews.${r.id}.text`)}"</p>
            <div className="review-author">
              <img src={r.avatar} alt={name} width={48} height={48} loading="lazy" draggable={false} />
              <div><h3>{name}</h3><small>{t(`reviews.${r.id}.from`)}</small></div>
            </div>
          </article>
        );
      })}
    </div>
  );
  return (
    <div className="review-marquee">
      <div className="review-track">{row(false)}{row(true)}</div>
    </div>
  );
}
