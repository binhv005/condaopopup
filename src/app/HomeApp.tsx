import { useRef } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { useMotion, useSmoothScroll } from "../motion/useMotion";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { FloatContact } from "../components/FloatContact";
import { Hero } from "../components/home/Hero";
import { About } from "../components/home/About";
import { Experiences } from "../components/home/Experiences";
import { Amenities } from "../components/home/Amenities";
import { Rooms } from "../components/home/Rooms";
import { Reviews } from "../components/home/Reviews";
import { FaqSection } from "../components/home/FaqSection";
import { Gallery } from "../components/home/Gallery";
import { BookingPopups } from "../components/home/BookingPopups";
import { StickyBook } from "../components/home/StickyBook";

export function HomeApp() {
  const { lang } = useI18n();
  const main = useRef<HTMLElement>(null);
  useSmoothScroll();
  useMotion(main, [lang]);

  return (
    <>
      <Header variant="home" />
      <main ref={main}>
        {/* The hero stays put at the top while About slides up over it */}
        <div className="hero-stack">
          <Hero />
          <About />
        </div>
        <Experiences />
        <Amenities />
        <Rooms />
        <Reviews />
        <FaqSection />
        <Gallery />
      </main>
      <Footer />
      <FloatContact />
      <StickyBook />
      {/* Nearby-walk popup (components/home/NearbyPopup) is switched off for now */}
      {/* Tour / homestay / transfer booking popups – switch on/off in data/booking-popups.ts (BOOKING_POPUPS.enabled) */}
      <BookingPopups />
    </>
  );
}
