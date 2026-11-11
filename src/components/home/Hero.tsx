import { HERO } from "../../data/home";
import { roomUrl, useI18n } from "../../i18n/I18nProvider";
import { Pill } from "../ui/Pill";
import { VideoScrubHero } from "../ui/VideoScrubHero";

const asset = (path: string) => import.meta.env.BASE_URL + path;

/** Scroll-scrubbed room video: the camera walks from the bedroom out to the sea, then "Homestay" composes in */
export function Hero() {
  const { t, lang } = useI18n();
  return (
    <VideoScrubHero
      id="home"
      videoSrc={asset(HERO.video)}
      poster={asset(HERO.poster)}
      cutoutSrc={asset(HERO.cutout)}
      horizon={HERO.horizon}
      mobilePoster={asset(HERO.mobilePoster)}
      title={t("hero.title")}
      mark={HERO.mark}
      scrollHint={t("home.scroll")}
      aside={
        <>
          <a className="vhero-note" href={roomUrl(HERO.featureRoom, lang)}>
            <b>{t("hero.featureTitle")}</b>
            <span>{t("hero.featureText")}</span>
          </a>
          <Pill variant="light" small href="#booking">{t("btn.book")}</Pill>
        </>
      }
    />
  );
}
