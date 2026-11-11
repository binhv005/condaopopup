import { GUESTS_COUNT, MOMENTS, TRUST_AVATARS } from "../../data/home";
import { useI18n } from "../../i18n/I18nProvider";
import { Lines } from "../ui/Lines";
import { Reveal } from "../ui/Reveal";

/** Hairline grid: intro in the middle, four photos open inside their cells */
export function About() {
  const { t } = useI18n();
  const cell = (m: (typeof MOMENTS)[number], i: number) => (
    <figure className="usp-cell usp-media" data-cell key={m.key}>
      <div className="usp-clip"><img src={m.image} alt={m.alt} loading="lazy" /></div>
      <figcaption className="usp-tag">
        <b>{String(i + 1).padStart(2, "0")} · {t(`features.${m.key}.title`)}</b>
        <span>{t(`features.${m.key}.text`)}</span>
      </figcaption>
    </figure>
  );
  return (
    <section className="usp" id="about">
      <div className="usp-grid">
        {cell(MOMENTS[0], 0)}
        <div className="usp-cell usp-center">
          <Lines className="display h-lg" text={t("about.title")} />
          <Reveal as="p" className="lead">{t("about.text")}</Reveal>
          <Reveal className="trust">
            <div className="avatars-stack">
              {TRUST_AVATARS.map((a) => <span key={a.letter} style={{ background: a.color }}>{a.letter}</span>)}
            </div>
            <div><strong>{GUESTS_COUNT}</strong><small>{t("about.guests")}</small></div>
            <div><strong>4.9 / 5</strong><small>{t("stats.rating")}</small></div>
          </Reveal>
        </div>
        {MOMENTS.slice(1).map((m, i) => cell(m, i + 1))}
      </div>
    </section>
  );
}
