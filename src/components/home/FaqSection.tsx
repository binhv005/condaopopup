import { FAQ_IMAGE, HOME_FAQ } from "../../data/home";
import { useI18n } from "../../i18n/I18nProvider";
import { Faq } from "../ui/Faq";
import { Lines } from "../ui/Lines";

export function FaqSection() {
  const { t } = useI18n();
  return (
    <section className="section" id="faq">
      <div className="container faq-grid">
        <div className="faq-media" data-reveal-y>
          <img src={FAQ_IMAGE} alt="" loading="lazy" />
        </div>
        <div>
          <Lines className="display h-lg" text={t("home.faqTitle")} />
          <Faq items={HOME_FAQ.map((f) => ({ q: t(f.q), a: t(f.a) }))} />
        </div>
      </div>
    </section>
  );
}
