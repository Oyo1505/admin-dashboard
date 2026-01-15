export const localeDateString = (
  date: Date | string,
  locale: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(
    locale === 'fr' ? 'fr-FR' : locale === 'en' ? 'en-US' : 'ja-JP'
  );
};
  