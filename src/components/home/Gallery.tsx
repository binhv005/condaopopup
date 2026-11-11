import { GALLERY } from "../../data/home";
import { LINKS } from "../../data/contact";
import { useI18n } from "../../i18n/I18nProvider";
import { Lines } from "../ui/Lines";
import { Pill, external } from "../ui/Pill";
import { Facebook, Instagram, Tiktok, Youtube } from "../ui/Icons";

const SOCIAL = [
  { name: "Instagram", href: LINKS.instagram, Icon: Instagram },
  { name: "Facebook", href: LINKS.facebook, Icon: Facebook },
  { name: "YouTube", href: LINKS.youtube, Icon: Youtube },
  { name: "TikTok", href: LINKS.tiktok, Icon: Tiktok },
];

/** Four photo columns drifting at different speeds */
export function Gallery() {
  const { t } = useI18n();
  return (
    <section className="section" id="gallery">
      <div className="container">
        <div className="gallery-head">
          <Lines className="display h-lg" text={t("home.galleryTitle")} />
          <div className="gallery-social">
            {SOCIAL.map(({ name, href, Icon }) => <a key={name} href={href} {...external} aria-label={name}><Icon /></a>)}
            <Pill variant="outline" small href={LINKS.instagram} {...external}>{t("home.morePhotos")}</Pill>
          </div>
        </div>
        <div className="gallery-cols">
          {GALLERY.map((col, i) => (
            <div className="gcol" data-speed={col.speed} key={i}>
              {col.images.map((src) => <img key={src} src={src} alt="" loading="lazy" />)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
