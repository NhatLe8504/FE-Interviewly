import vi from "./locales/vi";
import en from "./locales/en";
import type { Locale, Translations } from "./types";

export * from "./types";
export { vi, en };

export const dictionaries: Record<Locale, Translations> = {
  vi,
  en,
};

export const defaultLocale: Locale = "vi";

export function getTranslation(locale: Locale): Translations {
  return dictionaries[locale] || dictionaries[defaultLocale];
}

export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.entries(params).reduce((acc, [key, val]) => {
    return acc.replaceAll(`{${key}}`, String(val));
  }, template);
}
