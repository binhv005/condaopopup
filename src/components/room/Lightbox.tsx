import { useEffect } from "react";
import { sized } from "../../data/rooms";
import { useI18n } from "../../i18n/I18nProvider";
import { lockScroll } from "../../motion/scroll";
import { ChevronLeft, ChevronRight, Close } from "../ui/Icons";

interface LightboxProps {
  images: string[];
  /** Open photo index, or null when closed */
  index: number | null;
  name: string;
  onChange: (i: number) => void;
  onClose: () => void;
}

export function Lightbox({ images, index, name, onChange, onClose }: LightboxProps) {
  const { t } = useI18n();
  const open = index !== null;
  const i = index ?? 0;
  const go = (step: number) => onChange((i + step + images.length) % images.length);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onChange((i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onChange((i + 1) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => { lockScroll(false); document.removeEventListener("keydown", onKey); };
  }, [open, i, images.length, onChange, onClose]);

  return (
    <div className={"lightbox" + (open ? " show" : "")} id="lightbox" role="dialog" aria-modal="true" data-lenis-prevent
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button className="lb-close" aria-label={t("detail.close")} onClick={onClose}><Close /></button>
      <button className="lb-nav prev" aria-label={t("detail.prev")} onClick={() => go(-1)}><ChevronLeft /></button>
      {open && <img src={sized(images[i], 1800)} alt={name} />}
      <button className="lb-nav next" aria-label={t("detail.next")} onClick={() => go(1)}><ChevronRight /></button>
      <span className="lb-count">{open ? `${i + 1} / ${images.length}` : ""}</span>
    </div>
  );
}
