/**
 * Supported languages.
 *
 * Design decision: the locale is NOT part of the URL (no `/en/...`, `/pt-BR/...`).
 * The user's choice is stored in a cookie and, on the first visit, the browser's
 * `Accept-Language` header is used. This keeps the routes simple and identical
 * for every language, which is enough for an app without public, SEO-indexed pages.
 */
export const LOCALES = ["en", "pt-BR"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that stores the user's choice (same name next-intl uses by default). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Each language's name written in that language, as language pickers usually show them. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  "pt-BR": "Português (Brasil)",
};

/** Short label shown on the header button. */
export const LOCALE_SHORT_NAMES: Record<Locale, string> = {
  en: "EN",
  "pt-BR": "PT",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the best supported locale from an `Accept-Language` header
 * (e.g. "pt-BR,pt;q=0.9,en;q=0.8"). Any Portuguese variant maps to pt-BR.
 */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  const preferred = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter(({ tag, q }) => tag && q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    if (tag === "pt" || tag.startsWith("pt-")) return "pt-BR";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }
  return DEFAULT_LOCALE;
}
