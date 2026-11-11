import { useEffect, useRef, useState } from "react";
import { NearbyWalk, ThemeDots, nearbyWalkVars, type NearbyPlace, type NearbyWalkTheme } from "@/components/ui/nearby-walk-menu";
import { useI18n } from "../../i18n/I18nProvider";
import { lockScroll } from "../../motion/scroll";
import { ArrowUpRight, Close } from "../ui/Icons";

// Approximate distances from the centre of Côn Sơn town (straight line km, walking minutes).
// Photos are placeholders from the site's own library – swap in real shots of each landmark.
const PLACES: (Omit<NearbyPlace, "name"> & { photo: string })[] = [
  { id: "pier", km: 0.6, walkMinutes: 8, photo: "images/walk/pier.webp" },
  { id: "governor", km: 0.5, walkMinutes: 7, photo: "images/walk/governor.webp" },
  { id: "market", km: 0.9, walkMinutes: 12, photo: "images/walk/market.webp" },
  { id: "prison", km: 1.0, walkMinutes: 13, photo: "images/walk/prison.webp" },
  { id: "memorial", km: 1.8, walkMinutes: 24, photo: "images/walk/memorial.webp" },
];

/** Second popup, shown after the promo box is dismissed: a walk from the homestay to the island's landmarks */
export function NearbyPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<NearbyWalkTheme>("day");
  const [active, setActive] = useState<string | null>(null);
  // The scene mounts only while open, so its entrance plays as the popup appears
  const [mounted, setMounted] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(timer);
    }
    setMounted(true);
    lockScroll(true);
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { lockScroll(false); document.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  const places = PLACES.map((p) => ({ ...p, name: t("walk.places." + p.id) }));
  const walk = (n: number) => t("walk.min", { n });
  const dist = (km: number) => t("walk.km", { n: km.toFixed(1) });

  return (
    <div className={"popup walk-popup" + (open ? " show" : "")} role="dialog" aria-modal="true" aria-labelledby="walkTitle" data-lenis-prevent>
      <div className="walk-panel" style={nearbyWalkVars(theme)}>
        <button className="popup-close" aria-label={t("walk.close")} onClick={onClose} ref={closeBtn}><Close /></button>
        <div className="walk-head">
          <p className="walk-eyebrow">{t("walk.eyebrow")}</p>
          <h3 id="walkTitle">{t("walk.title")}</h3>
          <p className="walk-sub">{t("walk.sub")}</p>
        </div>

        <div className="walk-scroll">
          {mounted && (
            <NearbyWalk
              className="walk-scene gap-0 p-0 font-[inherit]"
              origin="ConDaoTrip"
              places={places}
              theme={theme}
              hint={null}
              showThemes={false}
              active={active}
              onActiveChange={setActive}
              formatWalk={walk}
              formatDistance={dist}
            />
          )}
        </div>
        <p className="walk-swipe">{t("walk.swipe")}</p>

        {/* One photo per landmark; hovering a card highlights the drawing and vice versa */}
        <ul className="walk-photos">
          {places.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={"walk-photo" + (active === p.id ? " on" : "")}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.id)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                onFocus={() => setActive(p.id)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === p.id ? null : p.id)}
              >
                <span className="walk-photo-img">
                  <img src={p.photo} alt={t("walk.photo") + ": " + p.name} loading="lazy" />
                  <em>{t("walk.photo")}</em>
                </span>
                <b>{p.name}</b>
                <small>{active === p.id ? dist(p.km) : walk(p.walkMinutes)}</small>
              </button>
            </li>
          ))}
        </ul>

        <div className="walk-foot">
          <ThemeDots
            value={theme}
            onChange={setTheme}
            labels={{ day: t("walk.themes.day"), sunset: t("walk.themes.sunset"), night: t("walk.themes.night") }}
          />
          <p className="walk-note">{t("walk.note")}</p>
          <a href="#rooms" className="btn btn-primary" onClick={onClose}>
            <span>{t("walk.cta")}</span>
            <ArrowUpRight />
          </a>
        </div>
      </div>
    </div>
  );
}
