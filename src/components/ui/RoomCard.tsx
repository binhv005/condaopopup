import { roomUrl, useI18n } from "../../i18n/I18nProvider";
import { roomThumb, type Room } from "../../data/rooms";
import { ArrowUpRight, Star } from "./Icons";
import { Price } from "./Price";

/** Room card used in the homepage rail and in "similar rooms" */
export function RoomCard({ room }: { room: Room }) {
  const { t, lang } = useI18n();
  const url = roomUrl(room.id, lang);
  const name = t(`rooms.${room.id}.name`);
  return (
    <article className="room fade-in">
      <a className="room-img" href={url}>
        <img src={roomThumb(room)} alt={name} loading="lazy" />
        {room.best && <span className="badge">{t("rooms.badge")}</span>}
        <span className="room-rating"><Star />{room.rating.toFixed(1)}</span>
      </a>
      <div className="room-body">
        <h3><a href={url}>{name}</a></h3>
        <p>{t(`rooms.${room.id}.desc`)}</p>
        <RoomMeta room={room} />
        <div className="price-row">
          <Price value={room.price} />
          <a href={url} className="room-go">{t("btn.details")}<i><ArrowUpRight /></i></a>
        </div>
      </div>
    </article>
  );
}

export function RoomMeta({ room }: { room: Room }) {
  const { t } = useI18n();
  return (
    <div className="room-meta">
      <span>{t("rooms.guests", { n: room.guests })}</span>
      <span>{t("rooms.area", { n: room.area })}</span>
      <span>{t(`bed.${room.bed}`)}</span>
    </div>
  );
}
