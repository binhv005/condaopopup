import { useI18n } from "../../i18n/I18nProvider";

/** "từ 1.290.000 ₫ / đêm" – the "from" word is omitted in languages that leave it empty */
export function Price({ value }: { value: number }) {
  const { t, money } = useI18n();
  const from = t("stats.from");
  return (
    <span className="price">
      {from ? from + " " : ""}<b>{money(value)}</b> {t("stats.night")}
    </span>
  );
}
