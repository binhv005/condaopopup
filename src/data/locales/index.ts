import type { Messages } from "./vi";
import vi from "./vi";
import en from "./en";
import ko from "./ko";
import ja from "./ja";
import zh from "./zh";
import fr from "./fr";
import ru from "./ru";
import it from "./it";

export type { Messages };

export const LANGS = [
  { code: "vi", label: "Tiếng Việt", flag: "https://flagcdn.com/vn.svg", locale: "vi-VN" },
  { code: "en", label: "English", flag: "https://flagcdn.com/gb.svg", locale: "en-GB" },
  { code: "ko", label: "한국어", flag: "https://flagcdn.com/kr.svg", locale: "ko-KR" },
  { code: "ja", label: "日本語", flag: "https://flagcdn.com/jp.svg", locale: "ja-JP" },
  { code: "zh", label: "中文", flag: "https://flagcdn.com/cn.svg", locale: "zh-CN" },
  { code: "fr", label: "Français", flag: "https://flagcdn.com/fr.svg", locale: "fr-FR" },
  { code: "ru", label: "Русский", flag: "https://flagcdn.com/ru.svg", locale: "ru-RU" },
  { code: "it", label: "Italiano", flag: "https://flagcdn.com/it.svg", locale: "it-IT" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: LangCode = "vi";

export const MESSAGES: Record<LangCode, Messages> = { vi, en, ko, ja, zh, fr, ru, it };
