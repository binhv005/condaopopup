import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LANG, LANGS, MESSAGES, type Lang, type LangCode } from "../data/locales";

const STORAGE_KEY = "cdt_lang";
type Vars = Record<string, string | number>;

interface I18n {
  lang: LangCode;
  current: Lang;
  setLang: (code: LangCode) => void;
  /** Translate a dot path such as "rooms.r1.name"; falls back to Vietnamese, then to the key itself */
  t: (key: string, vars?: Vars) => string;
  money: (value: number) => string;
}

const Ctx = createContext<I18n | null>(null);

function isLang(code: string | null): code is LangCode {
  return LANGS.some((l) => l.code === code);
}

function lookup(obj: unknown, path: string): string | undefined {
  let node: unknown = obj;
  for (const k of path.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[k];
  }
  return typeof node === "string" ? node : undefined;
}

function detect(): LangCode {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (isLang(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch { /* storage blocked */ }
  for (const l of navigator.languages ?? [navigator.language]) {
    const short = l.slice(0, 2).toLowerCase();
    if (isLang(short)) return short;
  }
  return DEFAULT_LANG;
}

type Translate = I18n["t"];

/** getTitle lets a page use its own <title> (e.g. the room name) instead of meta.title */
export function I18nProvider({ children, getTitle }: { children: ReactNode; getTitle?: (t: Translate) => string }) {
  const [lang, setLangState] = useState<LangCode>(detect);

  const t = useCallback((key: string, vars?: Vars) => {
    let str = lookup(MESSAGES[lang], key) ?? lookup(MESSAGES[DEFAULT_LANG], key) ?? key;
    if (vars) str = str.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] != null ? String(vars[k]) : m));
    return str;
  }, [lang]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  const money = useCallback(
    (value: number) => new Intl.NumberFormat(current.locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value),
    [current.locale],
  );

  // Keep <html lang>, meta tags, storage and the ?lang= URL param in sync
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = getTitle ? getTitle(t) : t("meta.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage blocked */ }
    try {
      const url = new URL(location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    } catch { /* file:// or sandboxed frame */ }
  }, [lang, t, getTitle]);

  const value = useMemo<I18n>(() => ({ lang, current, setLang: setLangState, t, money }), [lang, current, t, money]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Link to another page of the site that keeps the chosen language: withLang("index.html#rooms", "en") → "index.html?lang=en#rooms" */
export function withLang(href: string, lang: LangCode): string {
  const i = href.indexOf("#");
  const hash = i > -1 ? href.slice(i) : "";
  const base = i > -1 ? href.slice(0, i) : href;
  return base + (base.includes("?") ? "&" : "?") + "lang=" + lang + hash;
}

export function roomUrl(id: string, lang: LangCode): string {
  return "room.html?id=" + id + "&lang=" + lang;
}
