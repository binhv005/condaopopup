import { LINKS, PHONE_MAIN } from "../data/contact";
import { Phone } from "./ui/Icons";

export function FloatContact() {
  return (
    <div className="float-contact">
      <a className="zalo" href={LINKS.zalo} target="_blank" rel="noopener" aria-label="Zalo">Zalo</a>
      <a className="phone" href={"tel:" + PHONE_MAIN.tel} aria-label="Hotline"><Phone /></a>
    </div>
  );
}
