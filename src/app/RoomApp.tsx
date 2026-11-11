import { useRef } from "react";
import type { Room } from "../data/rooms";
import { useI18n } from "../i18n/I18nProvider";
import { useMotion, useSmoothScroll } from "../motion/useMotion";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { FloatContact } from "../components/FloatContact";
import { NotFound, RoomPage } from "../components/room/RoomPage";

export function RoomApp({ room }: { room: Room | undefined }) {
  const { lang } = useI18n();
  const page = useRef<HTMLDivElement>(null);
  useSmoothScroll();
  useMotion(page, [lang, room?.id]);

  return (
    <>
      <Header variant="room" />
      <div ref={page}>{room ? <RoomPage room={room} /> : <NotFound />}</div>
      <Footer />
      <FloatContact />
    </>
  );
}
