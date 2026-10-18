/** App locales that differ from their BCP 47 language tag */
const HTML_LANG_BY_LOCALE: Record<string, string> = { jp: 'ja' };

/**
 * Converts an app locale to a valid `<html lang>` value (BCP 47),
 * so screen readers pick the right voice: the app uses "jp", the
 * standard tag for Japanese is "ja".
 */
export const toHtmlLang = (locale: string): string =>
  HTML_LANG_BY_LOCALE[locale] ?? locale;
