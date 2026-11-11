import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "./i18n/I18nProvider";
import { RoomApp } from "./app/RoomApp";
import { roomById } from "./data/rooms";
import "./styles/main.css";
import "./styles/room.css";

const room = roomById(new URLSearchParams(location.search).get("id"));

// Room pages use the room name as <title>
const getTitle = (t: (key: string) => string) =>
  room ? t(`rooms.${room.id}.name`) + " | ConDaoTrip Homestay" : t("detail.notFound") + " | ConDaoTrip";

document.body.classList.add("page-room");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider getTitle={getTitle}>
      <RoomApp room={room} />
    </I18nProvider>
  </StrictMode>,
);
