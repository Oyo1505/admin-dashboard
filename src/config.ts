export type Locale = (typeof locales)[number];

export const locales = ['en', 'jp', 'fr'] as const;
export const defaultLocale: Locale = 'fr';
