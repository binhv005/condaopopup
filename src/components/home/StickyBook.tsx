import { useEffect, useRef } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { Pill } from "../ui/Pill";

// Phones: starts LIFT px above its resting spot over the hero, then sinks to the bottom as the page scrolls and stays
const LIFT = 72;

/** Booking button pinned to the bottom centre of the screen on phones (hidden on wider screens via CSS) */
export function StickyBook() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      ref.current?.style.setProperty("--lift", Math.max(0, LIFT - window.scrollY) + "px");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky-book" ref={ref}>
      <Pill variant="light" small href="#booking">{t("btn.book")}</Pill>
    </div>
  );
}
