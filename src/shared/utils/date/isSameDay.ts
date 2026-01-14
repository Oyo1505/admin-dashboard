/**
 * Compares two dates to check if they are the same day (UTC comparison)
 *
 * @param date1 - First date to compare
 * @param date2 - Second date to compare (can be null/undefined)
 * @returns true if both dates are the same UTC day, false otherwise
 *
 * @example
 * ```typescript
 * const today = new Date();
 * const yesterday = new Date(Date.now() - 86400000);
 * isSameDay(today, today); // true
 * isSameDay(today, yesterday); // false
 * isSameDay(today, null); // false
 * ```
 */
export const isSameDay = (
  date1: Date,
  date2: Date | null | undefined
): boolean => {
  if (!date2) return false;

  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
};
