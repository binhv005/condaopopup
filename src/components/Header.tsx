// Header – markup and classes mirror the original site exactly. Never restyle it (see lessons.md).
import { useEffect, useState } from "react";
import { LANGS } from "../data/locales";
import { LOGO, PHONE_MAIN } from "../data/contact";
import { useI18n, withLang } from "../i18n/I18nProvider";
import { ArrowUpRight, ChevronDown, Menu } from "./ui/Icons";

const NAV = [
  { id: "home", key: "nav.home" },
  { id: "rooms", key: "nav.rooms" },
  { id: "experiences", key: "nav.experiences" },
  { id: "amenities", key: "nav.amenities" },
  { id: "reviews", key: "nav.reviews" },
  { id: "booking", key: "nav.contact" },
];

/**
 * variant "home": transparent over the hero, turns solid after 40px, in-page links with scroll spy.
 * variant "room": white header with green logo, links back to the homepage sections.
 */
export function Header({ variant }: { variant: "home" | "room" }) {
  const { t, lang, current, setLang } = useI18n();
  const isHome = variant === "home";
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [active, setActive] = useState(isHome ? "home" : "rooms");

  // The light (white) header used on room.html never switches to the dark scrolled style
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Scroll spy for the one-page nav
  useEffect(() => {
    if (!isHome || !("IntersectionObserver" in window)) return;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) spy.observe(el); });
    return () => spy.disconnect();
  }, [isHome]);

  useEffect(() => {
    if (!langOpen) return;
    const close = () => setLangOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [langOpen]);

  const href = (id: string) => (isHome ? "#" + id : withLang("index.html#" + id, lang));

  return (
    <header className={"header" + (isHome ? "" : " light") + (scrolled ? " scrolled" : "")} id="header">
      <div className="container header-inner">
        <a href={isHome ? "https://condaotrip.com.vn/" : withLang("index.html", lang)} className="logo" aria-label="ConDaoTrip">
          <img src={isHome ? LOGO.white : LOGO.green} alt="ConDaoTrip" width={125} height={40} />
        </a>
        <nav className={"nav" + (navOpen ? " open" : "")} id="nav" onClick={(e) => { if ((e.target as HTMLElement).tagName === "A") setNavOpen(false); }}>
          {NAV.map((n) => (
            <a key={n.id} href={href(n.id)} className={active === n.id ? "active" : undefined}>{t(n.key)}</a>
          ))}
        </nav>
        <div className="header-actions">
          <div className={"lang" + (langOpen ? " open" : "")} id="lang">
            <button
              className="lang-btn" id="langBtn" aria-haspopup="listbox" aria-expanded={langOpen}
              onClick={(e) => { e.stopPropagation(); setLangOpen((o) => !o); }}
            >
              <img className="flag" id="langFlag" src={current.flag} alt="" width={22} height={16} />
              <span className="lang-code" id="langCode">{current.code.toUpperCase()}</span>
              <ChevronDown />
            </button>
            <div className="lang-menu" id="langMenu" role="listbox">
              {LANGS.map((l) => (
                <button key={l.code} role="option" aria-selected={l.code === lang} className={l.code === lang ? "active" : ""}
                  onClick={() => { setLang(l.code); setLangOpen(false); }}>
                  <img className="flag" src={l.flag} alt="" width={22} height={16} />{l.label}
                </button>
              ))}
            </div>
          </div>
          <a href={isHome ? "#booking" : "tel:" + PHONE_MAIN.tel} className="btn btn-primary btn-book">
            <span>{t("btn.book")}</span>
            <ArrowUpRight />
          </a>
          <button className="burger" id="burger" aria-label="Menu" onClick={() => setNavOpen((o) => !o)}>
            <Menu />
          </button>
        </div>
      </div>
    </header>
  );
}
